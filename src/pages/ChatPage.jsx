import { useState } from 'react'
import styles from './ChatPage.module.css'

const CONVERSATIONS = [
  { id: 1, initials: 'MR', name: 'Maya Rodriguez', lastMsg: 'sounds good, talk later',       time: '2:14', color: '#7B6CF6' },
  { id: 2, initials: 'JT', name: 'Jordan Tate',    lastMsg: 'did you see the new build?',    time: '1:02', color: '#43B589' },
  { id: 3, initials: 'SK', name: 'Sam Klein',       lastMsg: 'thanks for the help yesterd...', time: 'Mon',  color: '#E06B5A' },
  { id: 4, initials: 'AL', name: 'Alex Lin',        lastMsg: "let me know when you're free", time: 'Sun',  color: '#D95F8A' },
  { id: 5, initials: 'DK', name: 'Dana Kim',        lastMsg: 'happy birthday!!',              time: 'Sat',  color: '#E09040' },
]

const MESSAGES = [
  { id: 1, text: 'hey, are you around later for that quick sync?', sent: false },
  { id: 2, text: 'should only take 15 min',                        sent: false },
  { id: 3, text: 'yeah for sure, give me 20 min',                  sent: true  },
  { id: 4, text: 'finishing up something',                         sent: true  },
  { id: 5, text: 'sounds good, talk later',                        sent: false },
]

export default function ChatPage() {
  const [activeId, setActiveId] = useState(1)
  const [message, setMessage] = useState('')
  const active = CONVERSATIONS.find(c => c.id === activeId)

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Messages</h2>
          </div>
          <div className={styles.searchWrap}>
            <input className={styles.searchInput} type="text" placeholder="Search" />
          </div>

          <ul className={styles.convList}>
            {CONVERSATIONS.map(conv => (
              <li
                key={conv.id}
                className={`${styles.convItem} ${conv.id === activeId ? styles.convItemActive : ''}`}
                onClick={() => setActiveId(conv.id)}
              >
                <div className={styles.avatar} style={{ backgroundColor: conv.color }}>
                  {conv.initials}
                </div>
                <div className={styles.convInfo}>
                  <span className={styles.convName}>{conv.name}</span>
                  <span className={styles.convPreview}>{conv.lastMsg}</span>
                </div>
                <span className={styles.convTime}>{conv.time}</span>
              </li>
            ))}
          </ul>

          <div className={styles.userProfile}>
            <div className={styles.avatar} style={{ backgroundColor: '#5b52e7' }}>DV</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>David</span>
              <span className={styles.userSub}>Settings</span>
            </div>
            <button className={styles.settingsBtn} aria-label="Settings">
              <GearIcon />
            </button>
          </div>
        </aside>

        {/* ── Chat area ── */}
        <div className={styles.chatArea}>
          <header className={styles.chatHeader}>
            <div className={styles.avatar} style={{ backgroundColor: active.color }}>{active.initials}</div>
            <span className={styles.chatHeaderName}>{active.name}</span>
            <div className={styles.chatHeaderIcons}>
              <button className={styles.iconBtn} aria-label="Voice call"><PhoneIcon /></button>
              <button className={styles.iconBtn} aria-label="Video call"><VideoIcon /></button>
            </div>
          </header>

          <div className={styles.messages}>
            <span className={styles.dateSep}>Today 1:58 PM</span>
            {MESSAGES.map(msg => (
              <div
                key={msg.id}
                className={`${styles.bubble} ${msg.sent ? styles.bubbleSent : styles.bubbleReceived}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className={styles.inputArea}>
            <input
              className={styles.msgInput}
              type="text"
              placeholder="Message"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button className={styles.sendBtn} aria-label="Send">
              <SendIcon />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>
  )
}
