import React, { useState, useRef, useEffect } from 'react'
import { useData } from '../lib/datastore'

interface Contact {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  company: string
  notes: string
  favorite: boolean
  color: string
}

const COLORS = ['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#5856d6', '#ff2d55', '#00c7be']

export default function ContactsApp() {
  const ds = useData<Contact>('contacts')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editIdx, setEditIdx] = useState(0) // 0=first, 1=last, etc.
  const [editVal, setEditVal] = useState('')

  const emptyContact: Contact = {
    id: '', firstName: '', lastName: '', phone: '', email: '', company: '', notes: '', favorite: false, color: COLORS[0],
  }
  const [form, setForm] = useState(emptyContact)

  useEffect(() => {
    ds.load().then(() => {
      setContacts(ds.current.sort((a, b) => a.firstName.localeCompare(b.firstName)))
    })
  }, [])

  const filtered = contacts.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  const selected = contacts.find(c => c.id === selectedId)

  const openAdd = () => {
    setForm({ ...emptyContact, id: Date.now().toString(), color: COLORS[Math.floor(Math.random() * COLORS.length)] })
    setEditIdx(0)
    setEditVal('')
    setShowAdd(true)
  }

  const saveContact = () => {
    if (!form.firstName.trim()) return
    ds.add(form)
    setContacts(ds.current.sort((a, b) => a.firstName.localeCompare(b.firstName)))
    setSelectedId(form.id)
    setShowAdd(false)
  }

  const updateField = (field: keyof Contact, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const deleteContact = (id: string) => {
    ds.del(id)
    setContacts(ds.current.sort((a, b) => a.firstName.localeCompare(b.firstName)))
    if (selectedId === id) setSelectedId(null)
  }

  const fields: { key: keyof Contact; label: string; placeholder: string }[] = [
    { key: 'firstName', label: 'First Name', placeholder: 'John' },
    { key: 'lastName', label: 'Last Name', placeholder: 'Appleseed' },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000' },
    { key: 'email', label: 'Email', placeholder: 'john@apple.com' },
    { key: 'company', label: 'Company', placeholder: 'Apple' },
    { key: 'notes', label: 'Notes', placeholder: 'Preferences, reminders...' },
  ]

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f5f5f7', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Left sidebar */}
      <div style={{ width: 200, background: 'rgba(0,0,0,0.03)', borderRight: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>通讯录</span>
          <button onClick={openAdd} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
        <div style={{ padding: '0 8px 8px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
            style={{ width: '100%', padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: 12, outline: 'none' }} />
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelectedId(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer',
                background: selectedId === c.id ? 'rgba(0,122,255,0.1)' : 'transparent',
              }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14, fontWeight: 600, flexShrink: 0,
              }}>{c.firstName[0]}{c.lastName[0]}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.firstName} {c.lastName}
                </div>
                <div style={{ fontSize: 10, color: '#86868b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company || c.email}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: '#86868b', fontSize: 11 }}>
              {contacts.length === 0 ? 'No contacts yet.\nClick + to add one.' : 'No matches'}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selected ? (
          <>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 18, fontWeight: 600,
              }}>{selected.firstName[0]}{selected.lastName[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f' }}>{selected.firstName} {selected.lastName}</div>
                <div style={{ fontSize: 12, color: '#86868b' }}>{selected.company || 'No company'}</div>
              </div>
              <button onClick={() => deleteContact(selected.id)} style={{ padding: '4px 12px', borderRadius: 8, border: 'none', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', cursor: 'pointer', fontSize: 12 }}>Delete</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              {[
                { icon: '📧', label: 'Email', value: selected.email || '—' },
                { icon: '📱', label: 'Phone', value: selected.phone || '—' },
                { icon: '🏢', label: '公司', value: selected.company || '—' },
                { icon: '📝', label: '备注', value: selected.notes || '—' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 16, width: 24 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, color: '#1d1d1f' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86868b' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>👤</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#1d1d1f', marginBottom: 8 }}>No Contact Selected</div>
            <div style={{ fontSize: 13 }}>Select a contact or create a new one</div>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.currentTarget === e.target) setShowAdd(false) }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 380, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 16 }}>新建联系人</div>
            {fields.map((f, i) => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', marginBottom: 4 }}>{f.label}</div>
                <input value={(form as any)[f.key]} onChange={e => updateField(f.key, e.target.value)} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', marginBottom: 6 }}>Color</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => updateField('color', c)} style={{
                    width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: form.color === c ? '3px solid #1d1d1f' : '2px solid transparent',
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#f5f5f7', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={saveContact} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', background: '#007aff', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
