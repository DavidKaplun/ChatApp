import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id,
        u.id          AS other_user_id,
        u.username,
        u.display_name,
        m.content     AS last_message,
        m.sent_at     AS last_message_at
      FROM conversations c
      JOIN users u
        ON u.id = CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END
      LEFT JOIN LATERAL (
        SELECT content, sent_at FROM messages
        WHERE conversation_id = c.id
        ORDER BY sent_at DESC
        LIMIT 1
      ) m ON true
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY m.sent_at DESC NULLS LAST
    `, [req.user.id])
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { other_user_id } = req.body
    if (!other_user_id) return res.status(400).json({ error: 'other_user_id required' })
    if (Number(other_user_id) === req.user.id) return res.status(400).json({ error: 'Cannot chat with yourself' })

    const u1 = Math.min(req.user.id, other_user_id)
    const u2 = Math.max(req.user.id, other_user_id)

    const { rows } = await pool.query(`
      INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2)
      ON CONFLICT ON CONSTRAINT unique_pair DO UPDATE SET user1_id = EXCLUDED.user1_id
      RETURNING id
    `, [u1, u2])

    const { rows: userRows } = await pool.query(
      'SELECT id, username, display_name FROM users WHERE id = $1',
      [other_user_id]
    )
    const other = userRows[0]

    res.json({ id: rows[0].id, other_user_id: other.id, username: other.username, display_name: other.display_name, last_message: null, last_message_at: null })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    const { rows: conv } = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [req.params.id, req.user.id]
    )
    if (!conv.length) return res.status(403).json({ error: 'Forbidden' })

    const { rows } = await pool.query(
      'SELECT id, sender_id, content, sent_at FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
      [req.params.id]
    )
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/:id/messages', requireAuth, async (req, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' })

    const { rows: conv } = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [req.params.id, req.user.id]
    )
    if (!conv.length) return res.status(403).json({ error: 'Forbidden' })

    const { rows } = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id, sender_id, content, sent_at',
      [req.params.id, req.user.id, content.trim()]
    )
    res.status(201).json(rows[0])
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
