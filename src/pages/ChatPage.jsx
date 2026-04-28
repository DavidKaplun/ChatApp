import { useState, useEffect } from 'react'
import styles from './ChatPage.module.css'
import CallPanel from './CallPanel'

const AVATAR_COLORS = ['#a89fd8', '#43B589', '#E06B5A', '#D95F8A', '#E09040', '#5b52e7', '#2196F3']

function colorFromId(id)       { return AVATAR_COLORS[id % AVATAR_COLORS.length] }
function initialsFromName(name) { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }

function fmtTime(iso) {
  if (!iso) return ''
  const d   = new Date(iso)
  const now = new Date()
  const ms  = now - d
  if (ms < 86_400_000)  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  if (ms < 604_800_000) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const CALL_VIEWS = ['outgoing-call', 'incoming-call', 'audio-call', 'video-call']

export default function ChatPage({ user }) {
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv]       = useState(null)
  const [messages, setMessages]           = useState([])
  const [message, setMessage]             = useState('')
  const [view, setView]                   = useState('none')
  const [displayName, setDisplayName]     = useState(user?.display_name || '')
  const [searchQuery, setSearchQuery]     = useState('')
  const [searchResults, setSearchResults] = useState(null)

  const isCallView  = CALL_VIEWS.includes(view)
  const isSearching = searchQuery.trim().length > 0

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    if (!isSearching) { setSearchResults(null); return }
    const t = setTimeout(() => doSearch(searchQuery.trim()), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  async function authFetch(path, opts = {}) {
    const token = localStorage.getItem('token')
    return fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers },
    })
  }

  async function fetchConversations() {
    try {
      const res = await authFetch('/api/conversations')
      if (res.ok) setConversations(await res.json())
    } catch {}
  }

  async function openConversation(conv) {
    setActiveConv(conv)
    setView('chat')
    setSearchQuery('')
    try {
      const res = await authFetch(`/api/conversations/${conv.id}/messages`)
      if (res.ok) setMessages(await res.json())
    } catch {}
  }

  async function doSearch(q) {
    try {
      const res = await authFetch(`/api/users/search?q=${encodeURIComponent(q)}`)
      if (res.ok) setSearchResults(await res.json())
    } catch {}
  }

  function endCall() { setView('chat') }

  const callContact = activeConv ? {
    name:     activeConv.display_name,
    initials: initialsFromName(activeConv.display_name),
    color:    colorFromId(activeConv.other_user_id),
  } : null

  const noSearchResults = searchResults &&
    searchResults.conversations.length === 0 &&
    searchResults.others.length === 0

  const showEmptyState = !isCallView && (
    view === 'none' ||
    view === 'search-empty' ||
    (isSearching && view !== 'settings')
  )

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

          {isSearching ? (
            <div className={styles.searchResults}>
              {noSearchResults && <p className={styles.noResults}>No users found</p>}
              {searchResults?.conversations.length > 0 && (
                <>
                  <span className={styles.searchSection}>YOUR CONVERSATIONS</span>
                  {searchResults.conversations.map(u => (
                    <div
                      key={u.id}
                      className={`${styles.convItem} ${activeConv?.other_user_id === u.id ? styles.convItemActive : ''}`}
                      onClick={() => openConversation({ id: u.conversation_id, other_user_id: u.id, display_name: u.display_name, username: u.username })}
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
              {conversations.map(conv => (
                <li
                  key={conv.id}
                  className={`${styles.convItem} ${activeConv?.id === conv.id && view === 'chat' ? styles.convItemActive : ''}`}
                  onClick={() => openConversation(conv)}
                >
                  <div className={styles.avatar} style={{ backgroundColor: colorFromId(conv.other_user_id) }}>
                    {initialsFromName(conv.display_name)}
                  </div>
                  <div className={styles.convInfo}>
                    <span className={styles.convName}>{conv.display_name}</span>
                    <span className={styles.convPreview}>{conv.last_message || 'No messages yet'}</span>
                  </div>
                  <span className={styles.convTime}>{fmtTime(conv.last_message_at)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className={`${styles.userProfile} ${view === 'settings' ? styles.userProfileActive : ''}`}>
            <div className={styles.avatar} style={{ backgroundColor: '#5b52e7' }}>
              {initialsFromName(user?.display_name || 'U')}
            </div>
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
        {isCallView && callContact && (
          <CallPanel
            view={view}
            contact={callContact}
            onEnd={endCall}
            onAccept={() => setView('audio-call')}
          />
        )}

        {/* ── Empty / search state ── */}
        {showEmptyState && (
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
              <div className={styles.settingsAvatar} style={{ backgroundColor: '#5b52e7' }}>
                {initialsFromName(user?.display_name || 'U')}
              </div>
              <span className={styles.settingsUsername}>@{user?.username || ''}</span>
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
        {view === 'chat' && !isSearching && activeConv && (
          <div className={styles.chatArea}>
            <header className={styles.chatHeader}>
              <div className={styles.avatar} style={{ backgroundColor: colorFromId(activeConv.other_user_id) }}>
                {initialsFromName(activeConv.display_name)}
              </div>
              <span className={styles.chatHeaderName}>{activeConv.display_name}</span>
              <div className={styles.chatHeaderIcons}>
                <button className={styles.iconBtn} onClick={() => setView('outgoing-call')}><PhoneIcon /></button>
                <button className={styles.iconBtn} onClick={() => setView('video-call')}><VideoIcon /></button>
              </div>
            </header>
            <div className={styles.messages}>
              {messages.length === 0 && (
                <span className={styles.dateSep}>No messages yet. Say hello!</span>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.bubble} ${msg.sender_id === user?.id ? styles.bubbleSent : styles.bubbleReceived}`}
                >
                  {msg.content}
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
