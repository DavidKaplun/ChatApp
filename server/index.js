import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import conversationsRoutes from './routes/conversations.js'

dotenv.config()

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/conversations', conversationsRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
