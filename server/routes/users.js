import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/search', requireAuth, async (req, res) => {
  try {
    const q = req.query.q?.trim()
    if (!q) return res.json({ conversations: [], others: [] })

    const { rows } = await pool.query(`
      SELECT u.id, u.username, u.display_name, c.id AS conversation_id
      FROM users u
      LEFT JOIN conversations c
        ON (c.user1_id = $1 AND c.user2_id = u.id)
        OR (c.user2_id = $1 AND c.user1_id = u.id)
      WHERE u.id != $1
        AND (u.username ILIKE $2 OR u.display_name ILIKE $2)
      ORDER BY c.id IS NULL, u.display_name
    `, [req.user.id, `%${q}%`])

    res.json({
      conversations: rows.filter(r => r.conversation_id),
      others:        rows.filter(r => !r.conversation_id),
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
