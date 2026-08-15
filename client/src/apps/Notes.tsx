import React, { useState, useEffect } from 'react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  color: string
}

const COLORS = ['#ffd60a', '#ff9f0a', '#30d158', '#007aff', '#bf5af2', '#ff375f', '#65CEED', '#ffffff']

const INITIAL_NOTES: Note[] = [
  { id: '1', title: 'Welcome to VibeOS', content: 'This is your first note.\n\nYou can edit it or create new ones!', createdAt: new Date(), updatedAt: new Date(), color: '#ffd60a' },
  { id: '2', title: 'Shopping List', content: '- Milk\n- Eggs\n- Bread\n- Coffee', createdAt: new Date(), updatedAt: new Date(), color: '#65CEED' },
  { id: '3', title: 'Ideas', content: 'Build a cool app with VibeOS\nTry the Terminal with WebContainers', createdAt: new Date(), updatedAt: new Date(), color: '#30d158' },
]

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES)
  const [selectedId, setSelectedId] = useState<string | null>('1')
  const [search, setSearch] = useState('')

  const selected = notes.find(n => n.id === selectedId)

  const filtered = search.length > 0
    ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    : notes

  const createNote = () => {
    const id = `note-${Date.now()}`
    const newNote: Note = { id, title: 'New Note', content: '', createdAt: new Date(), updatedAt: new Date(), color: COLORS[Math.floor(Math.random() * COLORS.length)] }
    setNotes(prev => [newNote, ...prev])
    setSelectedId(id)
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n))
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f5f5f7' }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column',
      }}>
        {/* Search */}
        <div style={{ padding: '8px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 8, padding: '4px 8px' }}>
            <span style={{ fontSize: 12, opacity: 0.5 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" style={{ flex: 1, fontSize: 12, color: '#1d1d1f', background: 'transparent' }} />
          </div>
        </div>
        {/* New button */}
        <div style={{ padding: '4px 10px 8px' }}>
          <button onClick={createNote} style={{
            width: '100%', padding: '6px 0', borderRadius: 8, fontSize: 12, fontWeight: 500,
            background: '#007aff', color: '#fff', border: 'none', cursor: 'pointer',
          }}>+ New Note</button>
        </div>
        {/* Note list */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map(note => (
            <div key={note.id} onClick={() => setSelectedId(note.id)}
              style={{
                padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.05)',
                background: selectedId === note.id ? 'rgba(0,122,255,0.1)' : 'transparent',
                borderRadius: selectedId === note.id ? 6 : 0, margin: '0 4px',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: note.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title || 'Untitled'}</span>
              </div>
              <div style={{ fontSize: 11, color: '#86868b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {note.content.split('\n')[0] || 'No content'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {selected ? (
          <>
            {/* Color picker */}
            <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#86868b', marginRight: 4 }}>Color:</span>
              {COLORS.map(c => (
                <button key={c} onClick={() => updateNote(selected.id, { color: c })} style={{
                  width: 18, height: 18, borderRadius: '50%', background: c,
                  border: selected.color === c ? '2px solid #007aff' : '1px solid rgba(0,0,0,0.15)',
                  cursor: 'pointer', padding: 0,
                }} />
              ))}
              <button onClick={() => deleteNote(selected.id)} style={{ marginLeft: 'auto', fontSize: 11, color: '#ff3b30', background: 'transparent', border: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
            {/* Title */}
            <input value={selected.title} onChange={e => updateNote(selected.id, { title: e.target.value })}
              style={{ padding: '10px 16px 6px', fontSize: 18, fontWeight: 600, color: '#1d1d1f', borderBottom: '1px solid rgba(0,0,0,0.06)', width: '100%' }}
            />
            {/* Content */}
            <textarea value={selected.content} onChange={e => updateNote(selected.id, { content: e.target.value })}
              style={{ flex: 1, padding: '12px 16px', fontSize: 14, color: '#333', resize: 'none', lineHeight: 1.6, fontFamily: '-apple-system, sans-serif' }}
            />
            <div style={{ height: 20, background: 'rgba(0,0,0,0.03)', borderTop: '1px solid rgba(0,0,0,0.06)', padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 11, color: '#86868b' }}>
              {selected.content.length} characters
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86868b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 15, marginBottom: 4 }}>No Note Selected</div>
            <div style={{ fontSize: 13, opacity: 0.6 }}>Select a note or create a new one</div>
          </div>
        )}
      </div>
    </div>
  )
}
