import React, { useState, useEffect } from 'react'

const NOW = new Date()
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']
const TODAY = NOW.getDate()
const CURRENT_MONTH = NOW.getMonth()
const CURRENT_YEAR = NOW.getFullYear()
const FIRST_DAY = new Date(CURRENT_YEAR, CURRENT_MONTH, 1).getDay()
const DAYS_IN_MONTH = new Date(CURRENT_YEAR, CURRENT_MONTH + 1, 0).getDate()
const PREV_MONTH_DAYS = new Date(CURRENT_YEAR, CURRENT_MONTH, 0).getDate()

const events = [
  { day: 3, title: 'Team Sync', color: '#007aff' },
  { day: 7, title: 'Lunch w/ Sarah', color: '#34c759' },
  { day: 12, title: 'Project Deadline', color: '#ff3b30' },
  { day: 15, title: 'Dentist Appt', color: '#af52de' },
  { day: 20, title: 'Birthday Party', color: '#ff9500' },
  { day: 25, title: 'Tax Due', color: '#ff3b30' },
]

export default function CalendarApp() {
  const [selectedDay, setSelectedDay] = useState<number | null>(TODAY)
  const [view, setView] = useState<'month' | 'year'>('month')

  const getEventsForDay = (day: number) => events.filter(e => e.day === day)

  const days = []
  for (let i = 0; i < FIRST_DAY; i++) {
    days.push({ day: PREV_MONTH_DAYS - FIRST_DAY + i + 1, month: 'prev', key: `prev-${i}` })
  }
  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    days.push({ day: d, month: 'current', key: `curr-${d}` })
  }
  const remaining = (7 - ((FIRST_DAY + DAYS_IN_MONTH) % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, month: 'next', key: `next-${i}` })
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f5f7', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f' }}>
              {MONTHS[CURRENT_MONTH]} {CURRENT_YEAR}
            </div>
            <div style={{ fontSize: 12, color: '#86868b', marginTop: 2 }}>
              {DAYS[new Date().getDay()]}, {MONTHS[new Date().getMonth()]} {new Date().getDate()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setView('month')} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, background: view === 'month' ? 'rgba(0,122,255,0.15)' : 'transparent', color: view === 'month' ? '#007aff' : '#666', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Month</button>
            <button onClick={() => setView('year')} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, background: view === 'year' ? 'rgba(0,122,255,0.15)' : 'transparent', color: view === 'year' ? '#007aff' : '#666', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Year</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Calendar Grid */}
        <div style={{ flex: 1, padding: '12px 16px', overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#86868b', padding: '4px 0', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {days.map(({ day, month, key }) => {
              const isToday = month === 'current' && day === TODAY
              const isSelected = isToday || (month === 'current' && day === selectedDay)
              const dayEvents = month === 'current' ? getEventsForDay(day) : []
              return (
                <div
                  key={key}
                  onClick={() => month === 'current' && setSelectedDay(day)}
                  style={{
                    minHeight: 44, padding: '4px 6px', borderRadius: 8, cursor: month === 'current' ? 'pointer' : 'default',
                    background: isToday ? 'rgba(0,122,255,0.12)' : isSelected ? 'rgba(0,122,255,0.08)' : 'transparent',
                    border: isToday ? '1.5px solid #007aff' : '1.5px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{
                    fontSize: 13, fontWeight: isToday ? 700 : 400,
                    color: month === 'current' ? (isToday ? '#007aff' : '#1d1d1f') : '#ccc',
                  }}>{day}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: ev.color }} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Events sidebar */}
        <div style={{ width: 200, background: 'rgba(255,255,255,0.6)', borderLeft: '1px solid rgba(0,0,0,0.08)', padding: '12px', overflow: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#86868b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {MONTHS[CURRENT_MONTH]} {selectedDay ?? TODAY}
          </div>
          {(() => {
            const dayEvents = selectedDay ? getEventsForDay(selectedDay) : []
            if (dayEvents.length === 0 && selectedDay === TODAY) {
              return <div style={{ fontSize: 12, color: '#86868b', padding: '8px 0' }}>No events today</div>
            }
            return dayEvents.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < dayEvents.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <div style={{ width: 3, height: 32, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: '#86868b' }}>All day</div>
                </div>
              </div>
            ))
          })()}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Upcoming</div>
            {events.filter(e => e.day > TODAY).slice(0, 5).map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                <div style={{ width: 3, height: 24, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1d1d1f' }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: '#86868b' }}>{MONTHS[CURRENT_MONTH].slice(0, 3)} {ev.day}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
