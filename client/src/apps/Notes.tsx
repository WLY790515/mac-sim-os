import React, { useState, useRef, useEffect } from 'react'
import { useData } from '../lib/datastore'
import { FS, getFileIcon } from '../lib/filesystem'

interface Note {
  id: string
  title: string
  content: string
  color: string
  createdAt: number
  updatedAt: number
}

const COLORS = ['#ffffff', '#fff3b0', '#b0f2b0', '#b0d4f2', '#f2b0f2', '#ffe4b0', '#ffb0b0', '#e0e0e0']

export default function NotesApp() {
  const ds = useData<Note>('notes')
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    ds.load().then(() => setNotes(ds.current))
  }, [])

  const selected = notes.find(n => n.id === selectedId)

  const createNote = (color = COLORS[0]) => {
    const note: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    ds.add(note)
    setNotes(ds.current)
    setSelectedId(note.id)
    setEditing(true)
  }

  const updateNote = (patch: Partial<Note>) => {
    if (!selected) return
    ds.update(selected.id, { ...patch, updatedAt: Date.now() })
    setNotes(ds.current)
  }

  const deleteNote = (id: string) => {
    ds.del(id)
    setNotes(ds.current)
    if (selectedId === id) setSelectedId(null)
  }

  const handleContentKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget as HTMLTextAreaElement
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const val = ta.value
      ta.value = val.substring(0, start) + '  ' + val.substring(end)
      ta.selectionStart = ta.selectionEnd = start + 2
      updateNote({ content: ta.value })
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f5f5f7', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: 'rgba(0,0,0,0.03)', borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>Notes</span>
          <button onClick={() => createNote()} style={{
            width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)',
            background: '#fff', cursor: 'pointer', fontSize: 16, color: '#007aff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '4px 8px' }}>
          {notes.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#86868b', fontSize: 12 }}>
              No notes yet.<br />Click + to create one.
            </div>
          )}
          {notes.map(note => (
            <div key={note.id} onClick={() => { setSelectedId(note.id); setEditing(false) }}
              style={{
                padding: '8px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                background: selectedId === note.id ? 'rgba(0,122,255,0.1)' : 'transparent',
                borderLeft: selectedId === note.id ? '3px solid #007aff' : '3px solid transparent',
              }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {note.title || 'Untitled'}
              </div>
              <div style={{ fontSize: 11, color: '#86868b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {note.content.replace(/\n/g, ' ').slice(0, 40)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 11, color: '#86868b' }}>
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selected ? (
          <>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
              <input value={selected.title} onChange={e => updateNote({ title: e.target.value })} placeholder="Title"
                onFocus={() => setEditing(true)}
                style={{ flex: 1, fontSize: 15, fontWeight: 600, border: 'none', background: 'transparent', outline: 'none', color: '#1d1d1f' }} />
              <select value={selected.color} onChange={e => updateNote({ color: e.target.value })}
                style={{ width: 28, height: 28, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, cursor: 'pointer', background: selected.color, fontSize: 10, padding: 2 }} />
              <button onClick={() => deleteNote(selected.id)}
                style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', cursor: 'pointer', fontSize: 12 }}>Delete</button>
            </div>
            <textarea ref={contentRef} value={selected.content}
              onChange={e => updateNote({ content: e.target.value })} onKeyDown={handleContentKeydown}
              placeholder="Start typing..."
              style={{
                flex: 1, padding: 16, border: 'none', outline: 'none', resize: 'none',
                fontSize: 14, lineHeight: 1.7, fontFamily: 'inherit', color: '#1d1d1f',
                background: selected.color === '#ffffff' ? '#fff' : selected.color,
              }} />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86868b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#1d1d1f', marginBottom: 8 }}>No note selected</div>
            <div style={{ fontSize: 13, marginBottom: 24 }}>Select a note or create a new one</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.slice(0, 4).map(c => (
                <button key={c} onClick={() => createNote(c)} style={{
                  width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
                  background: c, cursor: 'pointer', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>+</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
