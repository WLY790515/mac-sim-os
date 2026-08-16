import React, { useState, useEffect, useRef, useCallback } from 'react'

interface WindowInfo {
  id: string
  appId: string
  title: string
  appIcon: string
  x: number
  y: number
  width: number
  height: number
}

interface MissionControlProps {
  windows: WindowInfo[]
  onWindowClick: (id: string) => void
  onCloseWindow: (id: string) => void
  onDismiss: () => void
}

export default function MissionControl({ windows, onWindowClick, onCloseWindow, onDismiss }: MissionControlProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({})
  const animRef = useRef(0)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onDismiss])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (overlayRef.current === e.target) onDismiss()
  }, [onDismiss])

  useEffect(() => {
    cancelAnimationFrame(animRef.current)
    let progress = 0
    const W = window.innerWidth - 80
    const H = window.innerHeight - 140
    const cols = Math.max(1, Math.ceil(Math.sqrt(windows.length * W / H)))
    const cellW = W / cols
    const cellH = H / Math.ceil(windows.length / cols)

    const startPositions = windows.map(w => ({ x: w.x, y: w.y }))
    const targetPositions = windows.map((_, i) => ({
      x: (i % cols) * cellW,
      y: Math.floor(i / cols) * cellH,
    }))

    const animateIn = () => {
      progress += 0.05
      if (progress >= 1) { setOffsets({}); return }
      const ease = 1 - Math.pow(1 - progress, 3)
      const posMap: Record<string, { x: number; y: number }> = {}
      windows.forEach((w, i) => {
        posMap[w.id] = {
          x: startPositions[i].x + (targetPositions[i].x - startPositions[i].x) * ease,
          y: startPositions[i].y + (targetPositions[i].y - startPositions[i].y) * ease,
        }
      })
      setOffsets(posMap)
      animRef.current = requestAnimationFrame(animateIn)
    }
    animRef.current = requestAnimationFrame(animateIn)
    return () => cancelAnimationFrame(animRef.current)
  }, [windows])

  const dismiss = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    let progress = 0
    const startOff = { ...offsets }

    const animateOut = () => {
      progress += 0.07
      if (progress >= 1) { onDismiss(); return }
      const ease = 1 - Math.pow(1 - progress, 3)
      const posMap: Record<string, { x: number; y: number }> = {}
      windows.forEach(w => {
        const start = startOff[w.id] || { x: w.x, y: w.y }
        posMap[w.id] = {
          x: start.x + (w.x - start.x) * (1 - ease),
          y: start.y + (w.y - start.y) * (1 - ease),
        }
      })
      setOffsets(posMap)
      animRef.current = requestAnimationFrame(animateOut)
    }
    animRef.current = requestAnimationFrame(animateOut)
  }, [windows, offsets, onDismiss])

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column',
      padding: '56px 32px 96px',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 16, textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        任务控制中心
      </div>
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start', overflow: 'auto' }}>
        {windows.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>
            暂无打开的窗口
          </div>
        ) : windows.map((win, i) => {
          const offset = offsets[win.id]
          const isFull = win.width >= window.innerWidth - 20
          const scale = Math.min(0.32, isFull ? 280 / win.width : 200 / win.width)
          const sw = win.width * scale
          const sh = win.height * scale
          const sx = offset ? offset.x * scale + 20 : win.x * scale + 20
          const sy = offset ? offset.y * scale + 16 : win.y * scale + 16

          return (
            <div
              key={win.id}
              onClick={() => onWindowClick(win.id)}
              style={{
                position: 'absolute',
                left: sx, top: sy,
                width: sw, height: sh,
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 40px rgba(0,0,0,0.7)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.4)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.5)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              <div style={{ height: 20, background: 'rgba(45,45,45,0.95)', display: 'flex', alignItems: 'center', padding: '0 6px', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ flex: 1, textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {win.title}
                </span>
              </div>
              <div style={{
                flex: 1, background: win.appId === 'terminal' ? '#1e1e1e' : '#f5f5f7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18 }}>{win.appIcon}</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>{win.title}</div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Mini dock */}
        <div style={{
          position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(30,30,30,0.92)', backdropFilter: 'blur(20px)',
          borderRadius: 14, padding: '5px 10px', display: 'flex', gap: 3,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {windows.map(w => (
            <div key={w.id} title={w.title} onClick={() => onWindowClick(w.id)}
              style={{ fontSize: 20, cursor: 'pointer', padding: '3px 5px', borderRadius: 5 }}>
              {w.appIcon}
            </div>
          ))}
          <button onClick={dismiss} style={{
            fontSize: 14, background: 'rgba(255,255,255,0.08)', border: 'none',
            cursor: 'pointer', padding: '3px 8px', borderRadius: 6, color: '#fff', marginLeft: 4,
          }}>✕</button>
        </div>
      </div>
    </div>
  )
}
