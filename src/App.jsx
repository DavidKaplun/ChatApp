import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)

  function goToChat(user) {
    setUser(user)
    setPage('chat')
  }

  if (page === 'register') return <RegisterPage onNavigateToLogin={() => setPage('login')} onNavigateToChat={goToChat} />
  if (page === 'chat')     return <ChatPage user={user} />

  return <LoginPage onNavigateToRegister={() => setPage('register')} onNavigateToChat={goToChat} />
}
