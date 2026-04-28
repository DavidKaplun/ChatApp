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

export default router
