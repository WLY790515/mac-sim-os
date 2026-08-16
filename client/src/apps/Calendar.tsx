import React, { useState, useRef, useEffect } from 'react'
import { useData } from '../lib/datastore'

interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string
  color: string
  description?: string
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']
const EVENT_COLORS = ['#007aff','#34c759','#ff9500','#ff3b30','#af52de','#5856d6','#ff2d55','#00c7be']

export default function CalendarApp() {
  const ds = useData<CalendarEvent>('calendar-events')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newColor, setNewColor] = useState(EVENT_COLORS[0])
  const [newDesc, setNewDesc] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ds.load().then(() => setEvents(ds.current))
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const todayStr = new Date().toISOString().slice(0, 10)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr)

  const handleAddEvent = () => {
    if (!newTitle.trim() || !selectedDate) return
    const ev: CalendarEvent = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      date: selectedDate,
      time: newTime || undefined,
      color: newColor,
      description: newDesc.trim() || undefined,
    }
    ds.add(ev)
    setEvents(ds.current)
    setNewTitle('')
    setNewTime('')
    setNewDesc('')
    setShowAdd(false)
  }

  const deleteEvent = (id: string) => {
    ds.del(id)
    setEvents(ds.current)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (overlayRef.current && overlayRef.current === e.target) setShowAdd(false)
  }

  const calendarCells = []
  for (let i = 0; i < firstDay; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f5f5f7', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Main calendar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', minWidth: 180 }}>{MONTHS[month]} {year}</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={prevMonth} style={btnStyle}>◀</button>
            <button onClick={goToday} style={btnStyle}>Today</button>
            <button onClick={nextMonth} style={btnStyle}>▶</button>
          </div>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#86868b', textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', overflow: 'auto' }}>
          {calendarCells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} style={{ minHeight: 100, borderBottom: '1px solid rgba(0,0,0,0.04)', borderRight: '1px solid rgba(0,0,0,0.04)' }} />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEvents = getEventsForDate(dateStr)
            const isToday = dateStr === todayStr
            return (
              <div key={dateStr} onClick={() => { setSelectedDate(dateStr); setShowAdd(true) }}
                style={{
                  minHeight: 100, padding: 6, borderBottom: '1px solid rgba(0,0,0,0.04)', borderRight: '1px solid rgba(0,0,0,0.04)',
                  cursor: 'pointer', background: isToday ? 'rgba(0,122,255,0.04)' : 'transparent',
                  transition: 'background 0.1s',
                }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: isToday ? 700 : 400, color: isToday ? '#007aff' : '#1d1d1f',
                  background: isToday ? 'rgba(0,122,255,0.1)' : 'transparent',
                }}>{day}</div>
                {dayEvents.slice(0, 3).map(ev => (
                  <div key={ev.id} onClick={e => { e.stopPropagation(); deleteEvent(ev.id) }}
                    style={{
                      fontSize: 10, padding: '2px 5px', borderRadius: 4, marginTop: 2,
                      background: ev.color + '22', color: ev.color, borderLeft: `2px solid ${ev.color}`,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer',
                    }}>
                    {ev.time && <span style={{ fontWeight: 600 }}>{ev.time}</span>} {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div style={{ fontSize: 10, color: '#86868b', marginTop: 2 }}>+{dayEvents.length - 3} 更多</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event panel (right sidebar) */}
      <div style={{ width: 260, background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>
            {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select a date'}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
          {selectedDate && getEventsForDate(selectedDate).map(ev => (
            <div key={ev.id} style={{
              padding: 10, borderRadius: 10, marginBottom: 6, background: ev.color + '18', borderLeft: `3px solid ${ev.color}`, cursor: 'pointer',
            }} onClick={() => deleteEvent(ev.id)}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{ev.title}</div>
              {ev.time && <div style={{ fontSize: 11, color: '#86868b', marginTop: 2 }}>🕐 {ev.time}</div>}
              {ev.description && <div style={{ fontSize: 11, color: '#6e6e73', marginTop: 4 }}>{ev.description}</div>}
              <div style={{ fontSize: 10, color: ev.color, marginTop: 4 }}>Click to delete</div>
            </div>
          ))}
          {!selectedDate && (
            <div style={{ textAlign: 'center', padding: 32, color: '#86868b', fontSize: 12 }}>Click a date to view events</div>
          )}
          {selectedDate && getEventsForDate(selectedDate).length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: '#86868b', fontSize: 12 }}>No events<br /><button onClick={() => setShowAdd(true)} style={{ color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, marginTop: 8 }}>+ Add event</button></div>
          )}
        </div>
        {selectedDate && (
          <div style={{ padding: 10, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <button onClick={() => setShowAdd(true)} style={{
              width: '100%', padding: '8px 0', borderRadius: 10, border: 'none',
              background: '#007aff', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>＋ 添加事件</button>
          </div>
        )}
      </div>

      {/* Add event modal */}
      {showAdd && selectedDate && (
        <div ref={overlayRef} onClick={handleOverlayClick} style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24, width: 340,
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 16 }}>新建事件</div>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="事件标题" autoFocus
              style={inputStyle} />
            <input value={newTime} onChange={e => setNewTime(e.target.value)} type="time" placeholder="时间"
              style={{ ...inputStyle, marginTop: 8 }} />
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="描述（可选）" rows={2}
              style={{ ...inputStyle, marginTop: 8, resize: 'none' }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {EVENT_COLORS.map(c => (
                <div key={c} onClick={() => setNewColor(c)} style={{
                  width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: newColor === c ? '3px solid #1d1d1f' : '2px solid transparent',
                }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#86868b', marginTop: 6 }}>已选择：{new Date(selectedDate + 'T00:00:00').toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: '#f5f5f7', cursor: 'pointer', fontSize: 13 }}>取消</button>
              <button onClick={handleAddEvent} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', background: '#007aff', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', cursor: 'pointer', fontSize: 12,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
