import React, { useState } from 'react'

interface Email {
  id: number
  from: string
  avatar: string
  subject: string
  preview: string
  time: string
  unread?: boolean
  starred?: boolean
  folder: string
  date: string
  body: string
}

const emails: Email[] = [
  { id: 1, from: 'Apple', avatar: '🍎', subject: 'Your Apple ID was used to sign in', preview: 'Your Apple ID was used to sign in to iCloud...', time: '10:30 AM', unread: true, folder: 'inbox', date: 'Today', body: 'Your Apple ID (user@icloud.com) was used to sign in to iCloud.\n\nDate: Today at 10:30 AM\nDevice: Mac\nLocation: San Francisco, CA\n\nIf you did not sign in, please change your Apple ID password immediately.' },
  { id: 2, from: 'Sarah Chen', avatar: '👩‍💼', subject: 'Lunch tomorrow?', preview: 'Hey! Want to grab lunch at the new sushi place?', time: '9:15 AM', unread: true, folder: 'inbox', date: 'Today', body: 'Hey!\n\nWant to grab lunch at the new sushi place downtown tomorrow around noon? I heard they have great ramen too.\n\nLet me know if you are free!\n\nSarah' },
  { id: 3, from: 'GitHub', avatar: '🐙', subject: '[mac-sim-os] Pull request #42 merged', preview: 'Merge pull request #42 from feature/calculator...', time: 'Yesterday', starred: true, folder: 'inbox', date: 'Yesterday', body: 'Merge pull request #42 from feature/calculator\n\nFix calculator overflow bug\n\nCommit: abc1234\nAuthor: mac-sim-os-dev\n\nPull request successfully merged!' },
  { id: 4, from: 'Netflix', avatar: '🎬', subject: 'New arrivals you might like', preview: 'Check out the latest shows and movies...', time: 'Yesterday', folder: 'promotions', date: 'Yesterday', body: 'New on Netflix this week:\n\n• The Crown - Season 6\n• Stranger Things - Final Season\n• New documentaries\n\nHappy watching! 🎬' },
  { id: 5, from: 'David Kim', avatar: '🧑‍🔬', subject: 'Project update', preview: 'Here is the latest progress report...', time: 'Mon', folder: 'inbox', date: 'Monday', body: 'Hi team,\n\nHere is the latest project update:\n\n- Phase 1 complete\n- Phase 2 in progress (80%)\n- Testing scheduled for next week\n\nLet me know if you have questions.\n\nDavid' },
  { id: 6, from: 'Apple Music', avatar: '🎵', subject: 'Your weekly mix is ready', preview: 'Discover new music curated just for you...', time: 'Sun', folder: 'promotions', date: 'Sunday', body: 'Your Weekly Mix is ready!\n\nFeaturing:\n• New releases from your favorite artists\n• Hidden gems you will love\n• Personalized recommendations\n\nListen now on Apple Music.' },
]

const folders = [
  { id: 'inbox', name: 'Inbox', icon: '📥', count: 2 },
  { id: 'starred', name: 'Starred', icon: '⭐', count: 0 },
  { id: 'sent', name: 'Sent', icon: '📤', count: 0 },
  { id: 'drafts', name: 'Drafts', icon: '✏️', count: 1 },
  { id: 'trash', name: 'Trash', icon: '🗑️', count: 0 },
  { id: 'spam', name: 'Spam', icon: '🚫', count: 0 },
  { id: 'promotions', name: 'Promotions', icon: '🏷️', count: 1 },
]

export default function MailApp() {
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = emails.filter(e => {
    if (selectedFolder === 'starred') return e.starred
    if (e.folder !== selectedFolder) return false
    if (search) return e.subject.toLowerCase().includes(search.toLowerCase()) || e.from.toLowerCase().includes(search.toLowerCase())
    return true
  }).sort((a, b) => a.id - b.id)

  const selected = emails.find(e => e.id === selectedId)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fff', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Folders sidebar */}
      <div style={{ width: 160, background: 'rgba(0,0,0,0.04)', borderRight: '1px solid rgba(0,0,0,0.08)', padding: '12px 0', overflow: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '4px 14px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Folders</div>
        {folders.map(f => (
          <div key={f.id} onClick={() => { setSelectedFolder(f.id); setSelectedId(null); }}
            style={{ padding: '5px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              background: selectedFolder === f.id ? 'rgba(0,122,255,0.15)' : 'transparent', borderRadius: selectedFolder === f.id ? 6 : 4, margin: '1px 4px',
              color: selectedFolder === f.id ? '#007aff' : '#1d1d1f', fontWeight: selectedFolder === f.id ? 600 : 400 }}>
            <span>{f.icon}</span>
            <span style={{ flex: 1 }}>{f.name}</span>
            {f.count > 0 && (
              <span style={{ background: '#ff3b30', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px' }}>{f.count}</span>
            )}
          </div>
        ))}
      </div>

      {/* Email list */}
      <div style={{ width: 280, borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
              style={{ width: '100%', padding: '6px 10px 6px 32px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: 13, outline: 'none' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map(e => (
            <div key={e.id} onClick={() => setSelectedId(e.id)}
              style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
                background: selectedId === e.id ? 'rgba(0,122,255,0.1)' : e.unread ? 'rgba(0,122,255,0.04)' : 'transparent',
                borderLeft: selectedId === e.id ? '3px solid #007aff' : '3px solid transparent',
                transition: 'background 0.1s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: e.unread ? 700 : 500, color: e.unread ? '#1d1d1f' : '#444' }}>{e.from}</span>
                <span style={{ fontSize: 11, color: '#86868b' }}>{e.time}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: e.unread ? 600 : 400, color: e.unread ? '#1d1d1f' : '#444', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</div>
              <div style={{ fontSize: 11, color: '#86868b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.preview}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: '#86868b', fontSize: 13 }}>No messages</div>
          )}
        </div>
      </div>

      {/* Email content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {selected ? (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{selected.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>{selected.subject}</div>
                <div style={{ fontSize: 13, color: '#444', marginTop: 2 }}>
                  <span style={{ fontWeight: 500 }}>{selected.from}</span>
                  <span style={{ color: '#86868b', marginLeft: 6 }}>&lt;{selected.from.toLowerCase().replace(/\s/g, '.')}@example.com&gt;</span>
                </div>
                <div style={{ fontSize: 11, color: '#86868b', marginTop: 2 }}>{selected.date} · {selected.time}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}>↩ Reply</button>
                <button style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}>↪ Forward</button>
              </div>
            </div>
            <div style={{ flex: 1, padding: '20px 24px', overflow: 'auto', fontSize: 14, lineHeight: 1.7, color: '#333', whiteSpace: 'pre-wrap' }}>{selected.body}</div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868b', fontSize: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div>Select a message to read</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
