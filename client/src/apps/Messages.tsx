import React, { useState, useRef, useEffect } from 'react'
import { useData } from '../lib/datastore'

interface Message {
  id: string
  text: string
  sent: boolean
  time: string
}

interface Conversation {
  id: string
  contact: string
  avatar: string
  messages: Message[]
  unread: number
  lastTime: string
}

const CONTACTS = [
  { id: '1', contact: '陈小红', avatar: '👩‍💼' },
  { id: '2', contact: '王大明', avatar: '👨‍💻' },
  { id: '3', contact: '李美丽', avatar: '👩‍🎨' },
  { id: '4', contact: '张伟', avatar: '🧑‍🔬' },
  { id: '5', contact: '刘芳', avatar: '👩‍🏫' },
  { id: '6', contact: '赵强', avatar: '👨‍🍳' },
]

const AUTO_REPLIES = [
  "太棒了！😄",
  "我看看，稍后回复你。",
  "听起来不错！",
  "能把详细信息发我吗？",
  "哈哈，真有趣 😂",
  "我也正这么想呢！",
  "有空联系你。",
  "好的，马上处理！🚀",
  "感谢告知！",
  "没关系。",
]

export default function MessagesApp() {
  const ds = useData<Conversation>('messages')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [inputText, setInputText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ds.load().then(() => {
      let convs = ds.current as Conversation[]
      if (convs.length === 0) {
        convs = CONTACTS.map(c => ({
          id: c.id, contact: c.contact, avatar: c.avatar,
          messages: [], unread: 0, lastTime: 'Now',
        }))
        ds.set(convs)
      }
      setConversations(ds.current as Conversation[])
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations])

  const selected = conversations.find(c => c.id === selectedId)
  const filtered = conversations.filter(c =>
    c.contact.toLowerCase().includes(search.toLowerCase())
  )

  const sendMessage = () => {
    if (!inputText.trim() || !selectedId) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const msg: Message = { id: Date.now().toString(), text: inputText.trim(), sent: true, time: timeStr }

    const updated = conversations.map(c => {
      if (c.id === selectedId) {
        const newMsgs = [...c.messages, msg]
        return { ...c, messages: newMsgs, lastTime: timeStr }
      }
      return c
    })
    ds.set(updated as Conversation[])
    setConversations(updated)
    setInputText('')

    // Auto-reply after 1-2 seconds
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        sent: false,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      }
      setConversations(prev => prev.map(c => {
        if (c.id === selectedId) {
          const msgs = [...c.messages, reply]
          return { ...c, messages: msgs, lastTime: reply.time }
        }
        return c
      }))
    }, 1000 + Math.random() * 1000)
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fff', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Messages</div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索对话"
              style={{ width: '100%', padding: '6px 10px 6px 32px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', fontSize: 13, outline: 'none' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelectedId(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                background: selectedId === c.id ? 'rgba(0,122,255,0.1)' : 'transparent',
                borderLeft: selectedId === c.id ? '3px solid #007aff' : '3px solid transparent',
              }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {c.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{c.contact}</span>
                  <span style={{ fontSize: 11, color: '#86868b' }}>{c.lastTime}</span>
                </div>
                <div style={{ fontSize: 12, color: '#86868b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages yet'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {selected ? (
          <>
            <div style={{ height: 56, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {selected.avatar}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>{selected.contact}</div>
                <div style={{ fontSize: 11, color: '#34c759' }}>Online</div>
              </div>
              <div style={{ flex: 1 }} />
              <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', fontSize: 14 }}>📞</button>
              <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', fontSize: 14 }}>📹</button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selected.messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#86868b', fontSize: 13 }}>
                  No messages yet.<br />Start the conversation!
                </div>
              )}
              {selected.messages.map((m, i) => (
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
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', fontSize: 16 }}>📎</button>
              <div style={{ flex: 1, position: 'relative' }}>
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="iMessage"
                  style={{ width: '100%', padding: '8px 14px', borderRadius: 20, border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(0,0,0,0.04)', fontSize: 14, outline: 'none' }} />
              </div>
              <button onClick={sendMessage} style={{ width: 36, height: 36, borderRadius: '50%', background: '#007aff', border: 'none', cursor: 'pointer', fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86868b' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#1d1d1f', marginBottom: 8 }}>No Conversation Selected</div>
            <div style={{ fontSize: 13 }}>Select a contact to start messaging</div>
          </div>
        )}
      </div>
    </div>
  )
}
