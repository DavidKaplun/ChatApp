import { useState } from 'react'
import styles from './LoginPage.module.css'

export default function RegisterPage({ onNavigateToLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // backend wired up later
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <ChatIcon />
        </div>

        <h1 className={styles.heading}>Create your account</h1>
        <p className={styles.subheading}>Pick a username to get started</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button className={styles.button} type="submit">
            Create account
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <a href="#" className={styles.link} onClick={(e) => { e.preventDefault(); onNavigateToLogin() }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

function ChatIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
