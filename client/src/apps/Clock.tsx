import React, { useState, useEffect, useRef } from 'react'

interface ClockFaceProps {
  size: number
  isDark?: boolean
  time: Date
}

function AnalogClock({ size, isDark, time }: ClockFaceProps) {
  const hours = time.getHours() % 12
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()
  const ms = time.getMilliseconds()

  const secAngle = (seconds + ms / 1000) * 6
  const minAngle = (minutes + seconds / 60) * 6
  const hourAngle = (hours + minutes / 60) * 30

  const cx = size / 2, cy = size / 2, r = size / 2 - 8
  const color = isDark ? '#e5e5ea' : '#1d1d1f'
  const accent = '#ff3b30'

  const tickMark = (i: number) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    const isHour = i % 3 === 0
    const len = isHour ? 12 : 5
    const thick = isHour ? 2.5 : 1
    return {
      x1: cx + (r - len) * Math.cos(angle),
      y1: cy + (r - len) * Math.sin(angle),
      x2: cx + r * Math.cos(angle),
      y2: cy + r * Math.sin(angle),
      thick,
    }
  }

  const numberPos = (n: number) => {
    const angle = (n * 30 - 90) * (Math.PI / 180)
    const nr = r - 28
    return { x: cx + nr * Math.cos(angle), y: cy + nr * Math.sin(angle) }
  }

  const handEnd = (angle: number, lenRatio: number) => {
    const rad = (angle - 90) * Math.PI / 180
    return { ex: cx + r * lenRatio * Math.cos(rad), ey: cy + r * lenRatio * Math.sin(rad) }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 4} fill={isDark ? '#1c1c1e' : '#fff'} stroke={isDark ? '#38383a' : '#e5e5ea'} strokeWidth="1.5" filter="url(#clock-shadow)" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={isDark ? '#38383a' : '#e5e5ea'} strokeWidth="0.5" />
      {Array.from({ length: 60 }, (_, i) => {
        const t = tickMark(i)
        return <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={color} strokeWidth={t.thick} strokeLinecap="round" opacity={i % 5 === 0 ? 1 : 0.4} />
      })}
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => {
        const p = numberPos(n)
        return <text key={n} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size * 0.06} fontWeight={n % 3 === 0 ? 600 : 400} fontFamily="-apple-system, sans-serif">{n}</text>
      })}
      {(() => { const h = handEnd(hourAngle, 0.5); return <line x1={cx} y1={cy} x2={h.ex} y2={h.ey} stroke={color} strokeWidth="4" strokeLinecap="round" /> })()}
      {(() => { const m = handEnd(minAngle, 0.72); return <line x1={cx} y1={cy} x2={m.ex} y2={m.ey} stroke={color} strokeWidth="2.5" strokeLinecap="round" /> })()}
      {(() => { const s = handEnd(secAngle, 0.82); return <><line x1={cx - (s.ex - cx) * 0.15} y1={cy - (s.ey - cy) * 0.15} x2={s.ex} y2={s.ey} stroke={accent} strokeWidth="1.2" strokeLinecap="round" /><circle cx={cx} cy={cy} r="3" fill={accent} /></> })()}
      <circle cx={cx} cy={cy} r="4" fill={accent} />
    </svg>
  )
}

export default function ClockApp() {
  const [time, setTime] = useState(new Date())
  const rafRef = useRef<number>(0)
  const [tab, setTab] = useState<'clock' | 'world' | 'alarm' | 'stopwatch'>('clock')
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [swRunning, setSwRunning] = useState(false)
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Smooth analog clock: 60fps via requestAnimationFrame
  useEffect(() => {
    const tick = () => {
      setTime(new Date())
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Stopwatch timer
  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => setStopwatchTime(p => p + 10), 10)
    } else if (swRef.current) {
      clearInterval(swRef.current)
      swRef.current = null
    }
    return () => { if (swRef.current) clearInterval(swRef.current) }
  }, [swRunning])

  const formatTime = (d: Date) => {
    const h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    const centis = Math.floor((ms % 1000) / 10)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`
  }

  const tabs = [
    { id: 'clock' as const, label: 'World Clock', icon: '🌍' },
    { id: 'world' as const, label: 'World', icon: '🕐' },
    { id: 'alarm' as const, label: 'Alarm', icon: '⏰' },
    { id: 'stopwatch' as const, label: 'Stopwatch', icon: '⏱️' },
  ]

  const worldZones = [
    { city: 'New York', tz: 'America/New_York', offset: -4 },
    { city: 'London', tz: 'Europe/London', offset: 1 },
    { city: 'Tokyo', tz: 'Asia/Tokyo', offset: 9 },
    { city: 'Sydney', tz: 'Australia/Sydney', offset: 10 },
  ]

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 0', fontSize: 12, color: tab === t.id ? '#007aff' : '#8e8e93',
            background: 'transparent', border: 'none', borderBottom: tab === t.id ? '2px solid #007aff' : '2px solid transparent',
            cursor: 'pointer', fontFamily: '-apple-system, sans-serif',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {tab === 'clock' && (
          <>
            <AnalogClock size={200} isDark time={time} />
            <div style={{ marginTop: 16, fontSize: 42, fontWeight: 200, color: '#fff', letterSpacing: -1 }}>{formatTime(time)}</div>
            <div style={{ fontSize: 14, color: '#8e8e93', marginTop: 4 }}>
              {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </>
        )}
        {tab === 'world' && (
          <div style={{ width: '100%', maxWidth: 300 }}>
            {worldZones.map(z => {
              const zTime = new Date(time.toLocaleString('en-US', { timeZone: z.tz }))
              const h = zTime.getHours(), m = String(zTime.getMinutes()).padStart(2, '0')
              const ampm = h >= 12 ? 'PM' : 'AM'
              const h12 = h % 12 || 12
              const isNight = h < 6 || h >= 20
              return (
                <div key={z.city} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#fff', fontSize: 17 }}>{z.city}</span>
                  <span style={{ color: isNight ? '#8e8e93' : '#007aff', fontSize: 17, fontWeight: 300 }}>{h12}:{m} {ampm}</span>
                </div>
              )
            })}
          </div>
        )}
        {tab === 'alarm' && (
          <div style={{ textAlign: 'center', color: '#8e8e93' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⏰</div>
            <div style={{ fontSize: 15 }}>No alarms set</div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.6 }}>Tap + to add an alarm</div>
          </div>
        )}
        {tab === 'stopwatch' && (
          <>
            <div style={{ fontSize: 48, fontWeight: 200, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: -1 }}>
              {formatStopwatch(stopwatchTime)}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              <button onClick={() => { setStopwatchTime(0); setSwRunning(false); }} style={{
                width: 72, height: 72, borderRadius: '50%', background: '#3a3a3c', color: '#fff',
                border: 'none', fontSize: 14, cursor: 'pointer', fontFamily: '-apple-system, sans-serif',
              }}>Reset</button>
              <button onClick={() => setSwRunning(!swRunning)} style={{
                width: 72, height: 72, borderRadius: '50%', background: swRunning ? '#ff3b30' : '#30d158', color: '#fff',
                border: 'none', fontSize: 14, cursor: 'pointer', fontFamily: '-apple-system, sans-serif',
              }}>{swRunning ? 'Stop' : 'Start'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
