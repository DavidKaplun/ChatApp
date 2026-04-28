import { useState, useEffect } from 'react'
import styles from './ChatPage.module.css'
import CallPanel from './CallPanel'

const CONVERSATIONS = [
  { id: 1, initials: 'MR', name: 'Maya Rodriguez', lastMsg: 'sounds good, talk later',        time: '2:14', color: '#a89fd8' },
  { id: 2, initials: 'JT', name: 'Jordan Tate',    lastMsg: 'did you see the new build?',     time: '1:02', color: '#43B589' },
  { id: 3, initials: 'SK', name: 'Sam Klein',       lastMsg: 'thanks for the help yesterd...', time: 'Mon',  color: '#E06B5A' },
  { id: 4, initials: 'AL', name: 'Alex Lin',        lastMsg: "let me know when you're free",  time: 'Sun',  color: '#D95F8A' },
  { id: 5, initials: 'DK', name: 'Dana Kim',        lastMsg: 'happy birthday!!',               time: 'Sat',  color: '#E09040' },
]

const MESSAGES = [
  { id: 1, text: 'hey, are you around later for that quick sync?', sent: false },
  { id: 2, text: 'should only take 15 min',                        sent: false },
  { id: 3, text: 'yeah for sure, give me 20 min',                  sent: true  },
  { id: 4, text: 'finishing up something',                         sent: true  },
  { id: 5, text: 'sounds good, talk later',                        sent: false },
]

const CALL_VIEWS = ['outgoing-call', 'incoming-call', 'audio-call', 'video-call']
const AVATAR_COLORS = ['#a89fd8', '#43B589', '#E06B5A', '#D95F8A', '#E09040', '#5b52e7', '#2196F3']

function colorFromId(id)   { return AVATAR_COLORS[id % AVATAR_COLORS.length] }
function initialsFromName(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function ChatPage({ user }) {
  const [activeId, setActiveId]       = useState(1)
  const [message, setMessage]         = useState('')
  const [view, setView]               = useState('chat')
  const [displayName, setDisplayName] = useState(user?.display_name || 'David')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  const active     = CONVERSATIONS.find(c => c.id === activeId)
  const isCallView = CALL_VIEWS.includes(view)
  const isSearching = searchQuery.trim().length > 0

  useEffect(() => {
    if (!isSearching) { setSearchResults(null); return }
    const t = setTimeout(() => doSearch(searchQuery.trim()), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  async function doSearch(q) {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setSearchResults(await res.json())
    } catch {}
  }

  function openChat(id) { setActiveId(id); setView('chat'); setSearchQuery('') }
  function endCall()    { setView('chat') }

  const noSearchResults = searchResults && searchResults.conversations.length === 0 && searchResults.others.length === 0

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Messages</h2>
          </div>
          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* ── Search results ── */}
          {isSearching ? (
            <div className={styles.searchResults}>
              {noSearchResults && (
                <p className={styles.noResults}>No users found</p>
              )}
              {searchResults?.conversations.length > 0 && (
                <>
                  <span className={styles.searchSection}>YOUR CONVERSATIONS</span>
                  {searchResults.conversations.map(u => (
                    <div
                      key={u.id}
                      className={styles.convItem}
                      onClick={() => openChat(u.id)}
                    >
                      <div className={styles.avatar} style={{ backgroundColor: colorFromId(u.id) }}>
                        {initialsFromName(u.display_name)}
                      </div>
                      <div className={styles.convInfo}>
                        <span className={styles.convName}>{u.display_name}</span>
                        <span className={styles.convPreview}>@{u.username}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {searchResults?.others.length > 0 && (
                <>
                  <span className={styles.searchSection}>OTHER PEOPLE</span>
                  {searchResults.others.map(u => (
                    <div
                      key={u.id}
                      className={styles.convItem}
                      onClick={() => setView('search-empty')}
                    >
                      <div className={styles.avatar} style={{ backgroundColor: colorFromId(u.id) }}>
                        {initialsFromName(u.display_name)}
                      </div>
                      <div className={styles.convInfo}>
                        <span className={styles.convName}>{u.display_name}</span>
                        <span className={styles.convPreview}>@{u.username}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <ul className={styles.convList}>
              {CONVERSATIONS.map(conv => (
                <li
                  key={conv.id}
                  className={`${styles.convItem} ${conv.id === activeId && view === 'chat' ? styles.convItemActive : ''}`}
                  onClick={() => openChat(conv.id)}
                >
                  <div className={styles.avatar} style={{ backgroundColor: conv.color }}>{conv.initials}</div>
                  <div className={styles.convInfo}>
                    <span className={styles.convName}>{conv.name}</span>
                    <span className={styles.convPreview}>{conv.lastMsg}</span>
                  </div>
                  <span className={styles.convTime}>{conv.time}</span>
                </li>
              ))}
            </ul>
          )}

          <div className={`${styles.userProfile} ${view === 'settings' ? styles.userProfileActive : ''}`}>
            <div className={styles.avatar} style={{ backgroundColor: '#5b52e7' }}>DV</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userSub}>Settings</span>
            </div>
            <button className={styles.settingsBtn} aria-label="Settings" onClick={() => setView('settings')}>
              <GearIcon />
            </button>
          </div>
        </aside>

        {/* ── Call panels ── */}
        {isCallView && (
          <CallPanel
            view={view}
            contact={active}
            onEnd={endCall}
            onAccept={() => setView('audio-call')}
          />
        )}

        {/* ── Search empty state ── */}
        {(view === 'search-empty' || (isSearching && view !== 'settings' && !isCallView)) && (
          <div className={styles.chatArea}>
            <div className={styles.searchEmptyState}>
              <div className={styles.searchEmptyIcon}><SearchBigIcon /></div>
              <span className={styles.searchEmptyTitle}>Search to start chatting</span>
              <span className={styles.searchEmptySub}>Find anyone by name or username and send them a message.</span>
            </div>
          </div>
        )}

        {/* ── Settings ── */}
        {view === 'settings' && !isSearching && (
          <div className={styles.chatArea}>
            <header className={styles.chatHeader}>
              <span className={styles.chatHeaderName}>Settings</span>
            </header>
            <div className={styles.settingsBody}>
              <div className={styles.settingsAvatar} style={{ backgroundColor: '#5b52e7' }}>DV</div>
              <span className={styles.settingsUsername}>@{user?.username || 'davidv'}</span>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Display name</label>
                <input className={styles.settingsInput} type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                <span className={styles.settingsHint}>This is how others will see you in chats.</span>
              </div>
              <button className={styles.saveBtn}>Save changes</button>
              <div className={styles.settingsDivider} />
              <button className={styles.signOutBtn}>Sign out</button>
            </div>
          </div>
        )}

        {/* ── Chat ── */}
        {view === 'chat' && !isSearching && (
          <div className={styles.chatArea}>
            <header className={styles.chatHeader}>
              <div className={styles.avatar} style={{ backgroundColor: active.color }}>{active.initials}</div>
              <span className={styles.chatHeaderName}>{active.name}</span>
              <div className={styles.chatHeaderIcons}>
                <button className={styles.iconBtn} onClick={() => setView('outgoing-call')}><PhoneIcon /></button>
                <button className={styles.iconBtn} onClick={() => setView('video-call')}><VideoIcon /></button>
              </div>
            </header>
            <div className={styles.messages}>
              <span className={styles.dateSep}>Today 1:58 PM</span>
              {MESSAGES.map(msg => (
                <div key={msg.id} className={`${styles.bubble} ${msg.sent ? styles.bubbleSent : styles.bubbleReceived}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className={styles.inputArea}>
              <input className={styles.msgInput} type="text" placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
              <button className={styles.sendBtn}><SendIcon /></button>
            </div>
          </div>
        )}

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
function SearchBigIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aaaaaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
