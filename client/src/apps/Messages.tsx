import React, { useState } from 'react'

interface Message {
  id: number
  contact: string
  avatar: string
  lastMsg: string
  time: string
  unread?: number
  online?: boolean
}

const contacts: Message[] = [
  { id: 1, contact: 'Sarah Chen', avatar: '👩‍💼', lastMsg: 'See you at 3pm! 🎉', time: '2:34 PM', unread: 2, online: true },
  { id: 2, contact: 'Mike Johnson', avatar: '👨‍💻', lastMsg: 'Can you send the files?', time: '1:15 PM' },
  { id: 3, contact: 'Lisa Park', avatar: '👩‍🎨', lastMsg: 'The design looks amazing!', time: 'Yesterday', unread: 1 },
  { id: 4, contact: 'David Kim', avatar: '🧑‍🔬', lastMsg: 'Let me check and get back to you', time: 'Yesterday' },
  { id: 5, contact: 'Emma Wilson', avatar: '👩‍🏫', lastMsg: 'Thanks for the help! 😊', time: 'Tue' },
  { id: 6, contact: 'Alex Rivera', avatar: '👨‍🍳', lastMsg: 'Restaurant review is up!', time: 'Mon' },
  { id: 7, contact: 'Jordan Lee', avatar: '🧑‍🎤', lastMsg: 'Concert tickets secured 🎵', time: 'Mon', online: true },
  { id: 8, contact: 'Taylor Swift', avatar: '👩‍🎤', lastMsg: 'New album drops Friday!', time: 'Sun' },
]

const chatMessages: Record<number, { text: string; sent: boolean; time: string }[]> = {
  1: [
    { text: 'Hey! Are we still on for lunch?', sent: false, time: '2:10 PM' },
    { text: 'Yes! Love to grab sushi?', sent: true, time: '2:12 PM' },
    { text: 'Perfect! I know a great place 🍣', sent: false, time: '2:15 PM' },
    { text: 'See you at 3pm! 🎉', sent: false, time: '2:34 PM' },
  ],
  2: [
    { text: 'Hey Mike, can you help with the code review?', sent: false, time: '12:30 PM' },
    { text: 'Sure! Send me the PR link', sent: true, time: '12:32 PM' },
    { text: 'Just pushed it to main branch', sent: true, time: '12:35 PM' },
    { text: 'Can you send the files?', sent: false, time: '1:15 PM' },
  ],
}

export default function MessagesApp() {
  const [selectedId, setSelectedId] = useState<number>(1)
  const [search, setSearch] = useState('')
  const [inputText, setInputText] = useState('')

  const filtered = contacts.filter(c =>
    c.contact.toLowerCase().includes(search.toLowerCase())
  )

  const selected = contacts.find(c => c.id === selectedId) || contacts[0]
  const msgs = chatMessages[selectedId] || []

  const handleSend = () => {
    if (!inputText.trim()) return
    // In a real app, this would add to state
    setInputText('')
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fff', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Messages</div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
              style={{ width: '100%', padding: '6px 10px 6px 32px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', fontSize: 13, outline: 'none' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelectedId(c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                background: selectedId === c.id ? 'rgba(0,122,255,0.1)' : 'transparent',
                borderLeft: selectedId === c.id ? '3px solid #007aff' : '3px solid transparent',
                transition: 'background 0.1s' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {c.avatar}
                </div>
                {c.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#34c759', border: '2px solid #fff' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{c.contact}</span>
                  <span style={{ fontSize: 11, color: '#86868b' }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12, color: '#86868b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMsg}</div>
              </div>
              {c.unread && c.unread > 0 && (
                <div style={{ minWidth: 20, height: 20, borderRadius: 10, background: '#007aff', color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  {c.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ height: 56, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            {selected.avatar}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>{selected.contact}</div>
            <div style={{ fontSize: 11, color: selected.online ? '#34c759' : '#86868b' }}>{selected.online ? 'Online' : 'Last seen recently'}</div>
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📞</button>
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📹</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.sent ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '8px 14px', borderRadius: m.sent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.sent ? 'linear-gradient(135deg,#007aff,#005ec4)' : 'rgba(0,0,0,0.08)',
                color: m.sent ? '#fff' : '#1d1d1f', fontSize: 14, lineHeight: 1.4,
              }}>
                {m.text}
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: m.sent ? 'right' : 'left' }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', fontSize: 16 }}>📎</button>
          <div style={{ flex: 1, position: 'relative' }}>
            <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="iMessage"
              style={{ width: '100%', padding: '8px 14px', borderRadius: 20, border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(0,0,0,0.04)', fontSize: 14, outline: 'none' }} />
          </div>
          <button onClick={handleSend} style={{ width: 36, height: 36, borderRadius: '50%', background: '#007aff', border: 'none', cursor: 'pointer', fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
        </div>
      </div>
    </div>
  )
}
