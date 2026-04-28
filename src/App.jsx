import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  const [page, setPage] = useState('login')

  if (page === 'register') {
    return <RegisterPage onNavigateToLogin={() => setPage('login')} />
  }

  return <LoginPage onNavigateToRegister={() => setPage('register')} />
}
