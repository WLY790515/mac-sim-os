import React, { useState } from 'react'

interface Contact {
  id: number
  name: string
  phone: string
  email: string
  company: string
  avatar: string
  favorite?: boolean
}

const contacts: Contact[] = [
  { id: 1, name: 'Aaron Brooks', phone: '(408) 555-0101', email: 'aaron@apple.com', company: 'Apple', avatar: '👨‍💻', favorite: true },
  { id: 2, name: 'Bella Chen', phone: '(415) 555-0102', email: 'bella@design.co', company: 'Design Co', avatar: '👩‍🎨', favorite: true },
  { id: 3, name: 'Carlos Rivera', phone: '(510) 555-0103', email: 'carlos@tech.io', company: 'TechIO', avatar: '👨‍🔬' },
  { id: 4, name: 'Diana Prince', phone: '(650) 555-0104', email: 'diana@startup.com', company: 'Startup Inc', avatar: '👩‍💼', favorite: true },
  { id: 5, name: 'Edward Kim', phone: '(408) 555-0105', email: 'edward@dev.io', company: 'Dev.io', avatar: '🧑‍💻' },
  { id: 6, name: 'Fiona Green', phone: '(415) 555-0106', email: 'fiona@art.co', company: 'Art Studio', avatar: '👩‍🎤' },
  { id: 7, name: 'George Liu', phone: '(510) 555-0107', email: 'george@data.ai', company: 'Data AI', avatar: '👨‍🏫' },
  { id: 8, name: 'Hannah Park', phone: '(650) 555-0108', email: 'hannah@finance.com', company: 'Finance Corp', avatar: '👩‍💼' },
  { id: 9, name: 'Ivan Torres', phone: '(408) 555-0109', email: 'ivan@music.io', company: 'Music IO', avatar: '🧑‍🎤' },
  { id: 10, name: 'Julia Wang', phone: '(415) 555-0110', email: 'julia@health.co', company: 'Health Co', avatar: '👩‍⚕️' },
]

export default function ContactsApp() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [groupBy, setGroupBy] = useState<'letter' | 'name'>('letter')

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = groupBy === 'letter'
    ? filtered.reduce<Record<string, Contact[]>>((acc, c) => {
        const letter = c.name[0].toUpperCase()
        if (!acc[letter]) acc[letter] = []
        acc[letter].push(c)
        return acc
      }, {})
    : { 'All': filtered }

  const selected = contacts.find(c => c.id === selectedId)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#fff', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Contact list */}
      <div style={{ width: 260, borderRight: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
              style={{ width: '100%', padding: '6px 10px 6px 32px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: 13, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <button onClick={() => setGroupBy('letter')} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: groupBy === 'letter' ? 'rgba(0,122,255,0.15)' : 'transparent', color: groupBy === 'letter' ? '#007aff' : '#666', border: 'none', cursor: 'pointer' }}>A-Z</button>
            <button onClick={() => setGroupBy('name')} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: groupBy === 'name' ? 'rgba(0,122,255,0.15)' : 'transparent', color: groupBy === 'name' ? '#007aff' : '#666', border: 'none', cursor: 'pointer' }}>Name</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {Object.entries(grouped).map(([letter, items]) => (
            <div key={letter}>
              {groupBy === 'letter' && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#86868b', padding: '6px 14px 4px', background: 'rgba(0,0,0,0.03)', textTransform: 'uppercase' }}>{letter}</div>
              )}
              {items.map(c => (
                <div key={c.id} onClick={() => setSelectedId(c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer',
                    background: selectedId === c.id ? 'rgba(0,122,255,0.1)' : 'transparent',
                    transition: 'background 0.1s' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{c.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#86868b' }}>{c.company}</div>
                  </div>
                  {c.favorite && <span style={{ fontSize: 12 }}>⭐</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'auto' }}>
        {selected ? (
          <>
            <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 12px' }}>{selected.avatar}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f' }}>{selected.name}</div>
              <div style={{ fontSize: 14, color: '#86868b', marginTop: 4 }}>{selected.company}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button style={{ padding: '6px 16px', borderRadius: 20, background: '#34c759', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>📞 Call</button>
                <button style={{ padding: '6px 16px', borderRadius: 20, background: '#007aff', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>💬 Message</button>
                <button style={{ padding: '6px 16px', borderRadius: 20, background: '#ff3b30', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>📹 FaceTime</button>
              </div>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Info</div>
              {[
                { label: 'Phone', value: selected.phone, icon: '📱' },
                { label: 'Email', value: selected.email, icon: '📧' },
                { label: 'Company', value: selected.company, icon: '🏢' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#86868b' }}>{item.label}</div>
                    <div style={{ fontSize: 14, color: '#1d1d1f' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868b', fontSize: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📒</div>
              <div>Select a contact</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
