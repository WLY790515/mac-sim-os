import React, { useState, useRef, useEffect } from 'react'
import { useData } from '../lib/datastore'

interface Email {
  id: string
  from: string
  fromEmail: string
  subject: string
  body: string
  date: string
  read: boolean
  starred: boolean
  folder: 'inbox' | 'sent' | 'drafts'
}

interface ComposeState {
  to: string
  subject: string
  body: string
}

const SIMULATED_INCOMING = [
  { from: 'Sarah Chen', email: 'sarah@example.com', subject: 'Meeting at 3pm', body: 'Hey! Just a reminder about our meeting at 3pm today. See you there!', date: '2:30 PM' },
  { from: 'Mike Johnson', email: 'mike@example.com', subject: 'Project update', body: 'I have pushed the latest changes to the repo. Can you review when you get a chance?', date: '1:15 PM' },
  { from: 'Lisa Park', email: 'lisa@example.com', subject: 'Design files', body: 'Here are the updated design files for the new feature. Let me know what you think!', date: 'Yesterday' },
  { from: 'Newsletter', email: 'news@daily.com', subject: 'Daily Tech News', body: 'Today in tech: AI breakthroughs, new gadget releases, and more. Read the full story on our website.', date: 'Yesterday' },
  { from: 'David Kim', email: 'david@example.com', subject: 'Lunch tomorrow?', body: 'Want to try that new Italian place downtown? I heard they have great pasta.', date: 'Monday' },
]

export default function MailApp() {
  const ds = useData<Email>('emails')
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'drafts'>('inbox')
  const [search, setSearch] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [compose, setCompose] = useState<ComposeState>({ to: '', subject: '', body: '' })
  const [refreshing, setRefreshing] = useState(false)
  const emailContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ds.load().then(() => {
      let all = ds.current as Email[]
      if (all.length === 0) {
        all = SIMULATED_INCOMING.map((e, i) => ({
          id: (i + 1).toString(), from: e.from, fromEmail: e.email,
          subject: e.subject, body: e.body, date: e.date,
          read: false, starred: false, folder: 'inbox' as const,
        }))
        ds.set(all)
      }
      setEmails(all)
    })
  }, [])

  const filtered = emails
    .filter(e => e.folder === folder)
    .filter(e =>
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.from.toLowerCase().includes(search.toLowerCase()) ||
      e.body.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date))

  const selected = emails.find(e => e.id === selectedId)

  const markRead = (id: string) => {
    const updated = emails.map(e => e.id === id ? { ...e, read: true } : e)
    ds.set(updated as Email[])
    setEmails(updated)
  }

  const toggleStar = (id: string) => {
    const updated = emails.map(e => e.id === id ? { ...e, starred: !e.starred } : e)
    ds.set(updated as Email[])
    setEmails(updated)
  }

  const openEmail = (id: string) => {
    setSelectedId(id)
    markRead(id)
    setTimeout(() => emailContentRef.current?.scrollTo(0, 0), 50)
  }

  const sendEmail = () => {
    if (!compose.to.trim() || !compose.subject.trim()) return
    const now = new Date()
    const newEmail: Email = {
      id: Date.now().toString(),
      from: 'You', fromEmail: 'me@macsimos.local',
      subject: compose.subject, body: compose.body,
      date: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      read: true, starred: false, folder: 'sent',
    }
    ds.add(newEmail)
    setCompose({ to: '', subject: '', body: '' })
    setShowCompose(false)
    setFolder('sent')
  }

  const deleteEmail = (id: string) => {
    ds.del(id)
    setEmails(ds.current as Email[])
    if (selectedId === id) setSelectedId(null)
  }

  const inboxCount = emails.filter(e => e.folder === 'inbox' && !e.read).length

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f5f5f7', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 180, background: 'rgba(0,0,0,0.03)', borderRight: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>Mail</span>
          <button onClick={() => setShowCompose(true)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
        </div>
        <div style={{ padding: '0 8px' }}>
          {[
            { key: 'inbox', label: 'Inbox', badge: inboxCount },
            { key: 'sent', label: 'Sent' },
            { key: 'drafts', label: 'Drafts' },
          ].map(f => (
            <div key={f.key} onClick={() => setFolder(f.key as typeof folder)}
              style={{
                padding: '7px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                background: folder === f.key ? 'rgba(0,122,255,0.12)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
              <span style={{ fontSize: 12, fontWeight: folder === f.key ? 600 : 400, color: folder === f.key ? '#007aff' : '#1d1d1f' }}>{f.label}</span>
              {f.badge !== undefined && f.badge > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#007aff', color: '#fff', borderRadius: 10, padding: '1px 6px' }}>{f.badge}</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: '8px 14px', fontSize: 11, color: '#86868b' }}>
          <button onClick={() => { setRefreshing(true); setTimeout(() => { setRefreshing(false); }, 1000) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007aff', fontSize: 11, padding: 0 }}>
            {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Email list */}
      <div style={{ width: 280, borderRight: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search emails..."
            style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', fontSize: 12, outline: 'none' }} />
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#86868b', fontSize: 12 }}>No emails{search ? ' matching search' : ''}</div>
          )}
          {filtered.map(email => (
            <div key={email.id} onClick={() => openEmail(email.id)}
              style={{
                padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer',
                background: !email.read ? 'rgba(0,122,255,0.04)' : 'transparent',
                borderLeft: !email.read ? '3px solid #007aff' : '3px solid transparent',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: !email.read ? 700 : 500, color: '#1d1d1f' }}>{email.from}</span>
                <span style={{ fontSize: 10, color: '#86868b' }}>{email.date}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: !email.read ? 600 : 400, color: '#1d1d1f', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.subject}</div>
              <div style={{ fontSize: 10, color: '#86868b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.body.slice(0, 50)}...</div>
            </div>
          ))}
        </div>
      </div>

      {/* Email content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selected ? (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#007aff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                {selected.from[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>{selected.subject}</div>
                <div style={{ fontSize: 11, color: '#86868b' }}>From: {selected.from} ({selected.fromEmail}) · {selected.date}</div>
              </div>
              <button onClick={() => toggleStar(selected.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>{selected.starred ? '⭐' : '☆'}</button>
              <button onClick={() => deleteEmail(selected.id)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', cursor: 'pointer', fontSize: 12 }}>Delete</button>
              <button onClick={() => { setCompose({ to: selected.fromEmail, subject: 'Re: ' + selected.subject, body: '' }); setShowCompose(true) }} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Reply</button>
            </div>
            <div ref={emailContentRef} style={{ flex: 1, overflow: 'auto', padding: 24 }}>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: '#1d1d1f', whiteSpace: 'pre-wrap' }}>{selected.body}</div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86868b' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#1d1d1f', marginBottom: 8 }}>No Message Selected</div>
            <div style={{ fontSize: 13 }}>Select an email to read</div>
          </div>
        )}
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.currentTarget === e.target) setShowCompose(false) }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 480, maxWidth: '90vw', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>{compose.to ? 'Reply' : 'New Message'}</div>
              <button onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#86868b' }}>✕</button>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', marginBottom: 4 }}>To</div>
              <input value={compose.to} onChange={e => setCompose(p => ({ ...p, to: e.target.value }))} placeholder="recipient@example.com"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', marginBottom: 4 }}>Subject</div>
              <input value={compose.subject} onChange={e => setCompose(p => ({ ...p, subject: e.target.value }))} placeholder="Subject"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', marginBottom: 4 }}>Message</div>
              <textarea value={compose.body} onChange={e => setCompose(p => ({ ...p, body: e.target.value }))} placeholder="Write your message..." rows={8}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCompose(false)} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#f5f5f7', cursor: 'pointer', fontSize: 13 }}>Discard</button>
              <button onClick={sendEmail} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: '#007aff', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
