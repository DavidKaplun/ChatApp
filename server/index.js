import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import conversationsRoutes from './routes/conversations.js'

dotenv.config()

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/conversations', conversationsRoutes)

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: true } })

const userSockets = new Map() // userId -> socketId

io.on('connection', socket => {
  socket.on('register', userId => {
    userSockets.set(Number(userId), socket.id)
  })

  socket.on('call-user', ({ targetUserId, offer, callerId, callerName, callType }) => {
    const targetSocketId = userSockets.get(Number(targetUserId))
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming-call', { offer, callerId, callerName, callerSocketId: socket.id, callType })
    }
  })

  socket.on('accept-call', ({ callerSocketId, answer }) => {
    io.to(callerSocketId).emit('call-accepted', { answer, calleeSocketId: socket.id })
  })

  socket.on('reject-call', ({ callerSocketId }) => {
    io.to(callerSocketId).emit('call-rejected')
  })

  socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('ice-candidate', { candidate })
  })

  socket.on('end-call', ({ targetSocketId }) => {
    io.to(targetSocketId).emit('call-ended')
  })

  socket.on('disconnect', () => {
    for (const [uid, sid] of userSockets) {
      if (sid === socket.id) { userSockets.delete(uid); break }
    }
  })
})

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
