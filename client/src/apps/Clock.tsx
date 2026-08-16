import React, { useState, useRef, useEffect, useCallback } from 'react'

interface TimerState {
  elapsed: number // milliseconds
  isRunning: boolean
}

export default function ClockApp() {
  const [mode, setMode] = useState<'clock' | 'stopwatch' | 'timer' | 'alarm'>('clock')

  // Stopwatch
  const [sw, setSw] = useState<TimerState>({ elapsed: 0, isRunning: false })
  const swStartRef = useRef(0)
  const swFrameRef = useRef(0)

  const tickStopwatch = useCallback(() => {
    if (!sw.isRunning) return
    setSw(prev => {
      const now = performance.now()
      return { ...prev, elapsed: prev.elapsed + (now - swStartRef.current) }
    })
    swStartRef.current = performance.now()
    swFrameRef.current = requestAnimationFrame(tickStopwatch)
  }, [sw.isRunning])

  useEffect(() => {
    if (sw.isRunning) {
      swStartRef.current = performance.now()
      swFrameRef.current = requestAnimationFrame(tickStopwatch)
    }
    return () => cancelAnimationFrame(swFrameRef.current)
  }, [sw.isRunning, tickStopwatch])

  const startStopwatch = () => setSw({ elapsed: 0, isRunning: true })
  const toggleStopwatch = () => setSw(prev => ({ ...prev, isRunning: !prev.isRunning }))
  const resetStopwatch = () => { setSw({ elapsed: 0, isRunning: false }); cancelAnimationFrame(swFrameRef.current) }

  const formatMs = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    const centis = Math.floor((ms % 1000) / 10)
    return `${mins}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`
  }

  // Timer
  const [timerInput, setTimerInput] = useState(5 * 60) // seconds
  const [timer, setTimer] = useState<TimerState>({ elapsed: 0, isRunning: false })
  const timerFrameRef = useRef(0)

  const tickTimer = useCallback(() => {
    if (!timer.isRunning) return
    setTimer(prev => {
      const remaining = timerInput * 1000 - prev.elapsed
      if (remaining <= 0) {
        return { elapsed: timerInput * 1000, isRunning: false }
      }
      const now = performance.now()
      return { ...prev, elapsed: prev.elapsed + (now - (timer as any).__lastTick || now) }
    })
    ;(timer as any).__lastTick = performance.now()
    timerFrameRef.current = requestAnimationFrame(tickTimer)
  }, [timer.isRunning, timerInput])

  useEffect(() => {
    if (timer.isRunning) {
      timerFrameRef.current = requestAnimationFrame(tickTimer)
    }
    return () => cancelAnimationFrame(timerFrameRef.current)
  }, [timer.isRunning, tickTimer])

  const startTimer = () => setTimer({ elapsed: 0, isRunning: true })
  const toggleTimer = () => setTimer(prev => ({ ...prev, isRunning: !prev.isRunning }))
  const resetTimer = () => { setTimer({ elapsed: 0, isRunning: false }); cancelAnimationFrame(timerFrameRef.current) }
  const formatTimer = () => {
    const remaining = Math.max(0, timerInput * 1000 - timer.elapsed)
    const mins = Math.floor(remaining / 60000)
    const secs = Math.floor((remaining % 60000) / 1000)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }
  const timerProgress = Math.min(100, (timer.elapsed / (timerInput * 1000)) * 100)

  // Alarm
  const [alarmTime, setAlarmTime] = useState('07:00')
  const [alarms, setAlarms] = useState<{ id: string; time: string; enabled: boolean; label: string }[]>([])
  const [alarmFired, setAlarmFired] = useState<string | null>(null)
  const alarmCheckRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    alarmCheckRef.current = setInterval(() => {
      const now = new Date()
      const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      alarms.forEach(a => {
        if (a.enabled && a.time === current && now.getSeconds() === 0) {
          setAlarmFired(a.id)
        }
      })
    }, 1000)
    return () => { if (alarmCheckRef.current) clearInterval(alarmCheckRef.current) }
  }, [alarms])

  const addAlarm = () => {
    const alarm = { id: Date.now().toString(), time: alarmTime, enabled: true, label: 'Alarm' }
    setAlarms(prev => [...prev, alarm])
  }

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  const dismissAlarm = (id: string) => setAlarmFired(null)
  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id))
    if (alarmFired === id) setAlarmFired(null)
  }

  // World clocks
  const worldClocks = [
    { city: 'New York', zone: 'America/New_York', label: 'NY' },
    { city: 'London', zone: 'Europe/London', label: 'LON' },
    { city: 'Tokyo', zone: 'Asia/Tokyo', label: 'TKY' },
    { city: 'Sydney', zone: 'Australia/Sydney', label: 'SYD' },
  ]

  const [worldTimes, setWorldTimes] = useState<Record<string, string>>({})
  useEffect(() => {
    const tick = () => {
      const t: Record<string, string> = {}
      worldClocks.forEach(w => {
        t[w.zone] = new Date().toLocaleTimeString('en-US', { timeZone: w.zone, hour: '2-digit', minute: '2-digit', hour12: true })
      })
      setWorldTimes(t)
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  const tabs = [
    { key: 'clock', label: '世界时钟' },
    { key: 'stopwatch', label: '秒表' },
    { key: 'timer', label: '计时器' },
    { key: 'alarm', label: '闹钟' },
  ] as const

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        {tabs.map((tab, i) => (
          <button key={tab.key} onClick={() => setMode(tab.key)} style={{
            flex: 1, padding: '10px 0', border: 'none', background: mode === tab.key ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: mode === tab.key ? '#fff' : '#8e8e93', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            borderBottom: mode === tab.key ? '2px solid #007aff' : '2px solid transparent',
            transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
            animation: `tabSlide 0.25s ease-out ${i * 0.06}s both`,
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {mode === 'clock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 64, fontWeight: 200, color: '#fff', fontVariantNumeric: 'tabular-nums', animation: 'float 3s ease-in-out infinite' }}>
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              <div style={{ fontSize: 14, color: '#8e8e93', marginTop: 8 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {worldClocks.map(w => (
                <div key={w.zone} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>{w.city}</div>
                  <div style={{ fontSize: 28, fontWeight: 300, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                    {worldTimes[w.zone] || '--:--'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'stopwatch' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '40px 0' }}>
            <div style={{ fontSize: 72, fontWeight: 200, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {formatMs(sw.elapsed)}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={sw.elapsed > 0 && !sw.isRunning ? resetStopwatch : toggleStopwatch} style={{
                width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 500,
                background: sw.isRunning ? 'rgba(255,59,48,0.8)' : 'rgba(52,199,89,0.8)', color: '#fff',
                transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
                boxShadow: sw.isRunning ? '0 0 20px rgba(255,59,48,0.4)' : '0 0 20px rgba(52,199,89,0.3)',
              }}
                onMouseEnter={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'}}
                onMouseLeave={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}}
                onMouseDown={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'}}
                onMouseUp={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'}}
              >{sw.elapsed > 0 && !sw.isRunning ? '重置' : sw.isRunning ? '停止' : '开始'}</button>
              <button onClick={toggleStopwatch} style={{
                width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 500,
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), background 0.15s',
              }}
                onMouseEnter={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'}}
                onMouseLeave={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'}}
                onMouseDown={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'}}
                onMouseUp={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'}}
              >{sw.isRunning ? 'Lap' : 'Resume'}</button>
            </div>
            {sw.elapsed > 0 && (
              <div style={{ fontSize: 12, color: '#8e8e93' }}>
                {Math.floor(sw.elapsed / 60000)} 分 {Math.floor((sw.elapsed % 60000) / 1000)} 秒
              </div>
            )}
          </div>
        )}

        {mode === 'timer' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '40px 0' }}>
            {!timer.isRunning && timer.elapsed === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
                <input type="number" value={Math.floor(timerInput / 60)} onChange={e => setTimerInput(parseInt(e.target.value) * 60)}
                  style={{ width: 60, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 24, textAlign: 'center', outline: 'none' }} />
                <span style={{ fontSize: 18, color: '#8e8e93' }}>:</span>
                <input type="number" value={timerInput % 60} onChange={e => setTimerInput(Math.floor(timerInput / 60) * 60 + parseInt(e.target.value))}
                  style={{ width: 60, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 24, textAlign: 'center', outline: 'none' }} />
                <span style={{ fontSize: 12, color: '#8e8e93' }}>min sec</span>
              </div>
            )}
            <div style={{
                width: 200, height: 200, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                transition: 'border-color 0.3s ease',
              }}>
              {timer.isRunning && (
                <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} width="200" height="200">
                  <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="100" cy="100" r="94" fill="none" stroke="#ff9500" strokeWidth="4"
                    strokeDasharray={`${timerProgress * 5.9} 590`} strokeLinecap="round" />
                </svg>
              )}
              <div style={{ fontSize: 40, fontWeight: 300, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                {timer.elapsed >= timerInput * 1000 ? '时间到！' : formatTimer()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {timer.elapsed > 0 && !timer.isRunning ? (
                <button onClick={resetTimer} style={{ padding: '10px 24px', borderRadius: 24, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 14 }}>重置</button>
              ) : (
                <button onClick={toggleTimer} style={{ padding: '10px 24px', borderRadius: 24, border: 'none', background: timer.isRunning ? 'rgba(255,59,48,0.8)' : 'rgba(52,199,89,0.8)', color: '#fff', cursor: 'pointer', fontSize: 14 }}>
                  {timer.isRunning ? '暂停' : '开始'}
                </button>
              )}
            </div>
          </div>
        )}

        {mode === 'alarm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="time" value={alarmTime} onChange={e => setAlarmTime(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, outline: 'none' }} />
              <button onClick={addAlarm} style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: '#007aff', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ Add</button>
            </div>
            {alarms.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#8e8e93', fontSize: 13 }}>暂无闹钟</div>
            )}
            {alarms.map(a => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                background: a.enabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 300, color: a.enabled ? '#fff' : '#8e8e93' }}>{a.time}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93' }}>{a.label}</div>
                </div>
                <button onClick={() => toggleAlarm(a.id)} style={{
                  width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: a.enabled ? '#34c759' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'background 0.2s',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                    left: a.enabled ? 20 : 2, transition: 'left 0.2s',
                  }} />
                </button>
                <button onClick={() => deleteAlarm(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#8e8e93' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alarm fired overlay */}
      {alarmFired && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', color: '#fff', animation: 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ fontSize: 72, marginBottom: 16, animation: 'shake 0.5s ease-in-out infinite' }}>⏰</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Alarm!</div>
            <div style={{ fontSize: 16, color: '#8e8e93', marginBottom: 32 }}>It's {alarms.find(a => a.id === alarmFired)?.time || alarmTime}</div>
            <button onClick={() => dismissAlarm(alarmFired)} style={{ padding: '12px 40px', borderRadius: 28, border: 'none', background: '#ff3b30', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'transform 0.12s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s', boxShadow: '0 4px 20px rgba(255,59,48,0.5)' }}
              onMouseEnter={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)'}}
              onMouseLeave={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}}
              onMouseDown={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'}}
              onMouseUp={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)'}}
            >Dismiss</button>
          </div>
        </div>
      )}
    </div>
  )
}
