import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  const [page, setPage] = useState('login')

  if (page === 'register') return <RegisterPage onNavigateToLogin={() => setPage('login')} onNavigateToChat={() => setPage('chat')} />
  if (page === 'chat')     return <ChatPage />

  return <LoginPage onNavigateToRegister={() => setPage('register')} onNavigateToChat={() => setPage('chat')} />
}
