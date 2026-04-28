import { useEffect, useState } from 'react'
import styles from './CallPanel.module.css'

export default function CallPanel({ view, contact, onEnd, onAccept }) {
  const [seconds, setSeconds] = useState(0)
  const [micMuted, setMicMuted] = useState(false)
  const [camOff, setCamOff]     = useState(false)

  useEffect(() => {
    if (view !== 'audio-call' && view !== 'video-call') { setSeconds(0); return }
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [view])

  function fmt(s) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  }

  /* ── VIDEO CALL ── */
  if (view === 'video-call') {
    return (
      <div className={styles.panel}>
        <div className={styles.videoTopLeft}>
          <span className={styles.videoName}>{contact.name}</span>
          <span className={styles.videoTimer}>{fmt(seconds)}</span>
        </div>
        <span className={styles.hdBadge}>HD</span>
        <div className={styles.selfView}>
          <div className={styles.selfAvatar} style={{ backgroundColor: '#43B589' }}>DV</div>
        </div>
        <div className={styles.videoAvatar} style={{ backgroundColor: contact.color }}>
          {contact.initials}
        </div>
        <div className={styles.controls}>
          <button className={`${styles.ctrlBtn} ${micMuted ? styles.ctrlBtnOn : ''}`} onClick={() => setMicMuted(m => !m)}>
            <MicIcon />
          </button>
          <button className={`${styles.ctrlBtn} ${camOff ? styles.ctrlBtnOn : ''}`} onClick={() => setCamOff(c => !c)}>
            <CamIcon />
          </button>
          <button className={styles.ctrlBtn}>
            <SwitchIcon />
          </button>
          <button className={styles.endBtn} onClick={onEnd}>
            <EndIcon />
          </button>
        </div>
      </div>
    )
  }

  /* ── INCOMING CALL ── */
  if (view === 'incoming-call') {
    return (
      <div className={styles.panel}>
        <span className={styles.callLabel}>Incoming voice call</span>
        <div className={styles.ringOuter}>
          <div className={styles.ringInner}>
            <div className={styles.centerAvatar} style={{ backgroundColor: contact.color }}>
              {contact.initials}
            </div>
          </div>
        </div>
        <span className={styles.callerName}>{contact.name}</span>
        <span className={styles.callerSub}>is calling...</span>
        <div className={styles.incomingBtns}>
          <div className={styles.btnGroup}>
            <button className={styles.declineBtn} onClick={onEnd}><EndIcon /></button>
            <span className={styles.btnLabel}>Decline</span>
          </div>
          <div className={styles.btnGroup}>
            <button className={styles.acceptBtn} onClick={onAccept}><PhoneIcon /></button>
            <span className={styles.btnLabel}>Accept</span>
          </div>
        </div>
      </div>
    )
  }

  /* ── OUTGOING CALL ── */
  if (view === 'outgoing-call') {
    return (
      <div className={styles.panel}>
        <span className={styles.callLabel}>Voice call</span>
        <div className={styles.centerAvatar} style={{ backgroundColor: contact.color }}>
          {contact.initials}
        </div>
        <span className={styles.callerName}>{contact.name}</span>
        <span className={styles.callingText}>Calling...</span>
        <div className={styles.btnGroup}>
          <button className={styles.endBtn} onClick={onEnd}><EndIcon /></button>
          <span className={styles.btnLabel}>Cancel</span>
        </div>
      </div>
    )
  }

  /* ── AUDIO CALL ── */
  if (view === 'audio-call') {
    return (
      <div className={styles.panel}>
        <span className={styles.callLabel}>Voice call</span>
        <div className={styles.centerAvatar} style={{ backgroundColor: contact.color }}>
          {contact.initials}
        </div>
        <span className={styles.callerName}>{contact.name}</span>
        <span className={styles.timerText}>{fmt(seconds)}</span>
        <div className={styles.controls}>
          <button className={`${styles.ctrlBtn} ${micMuted ? styles.ctrlBtnOn : ''}`} onClick={() => setMicMuted(m => !m)}>
            <MicIcon />
          </button>
          <button className={styles.ctrlBtn}><SpeakerIcon /></button>
          <button className={styles.ctrlBtn}><CamIcon /></button>
          <button className={styles.endBtn} onClick={onEnd}><EndIcon /></button>
        </div>
      </div>
    )
  }

  return null
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  )
}
function CamIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  )
}
function SwitchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <polyline points="23 20 23 14 17 14"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  )
}
function SpeakerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  )
}
function EndIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
      <g transform="rotate(135, 12, 12)">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
      </g>
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}
