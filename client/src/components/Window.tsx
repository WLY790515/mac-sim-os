import React, { useRef } from 'react'
import type { WindowState } from '../types'

interface WindowProps {
  window: WindowState
  isActive: boolean
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onMove: (x: number, y: number) => void
  onResize: (width: number, height: number) => void
  appId: string
  component: React.ComponentType<any>
}

export default function Window({ window: win, isActive, onFocus, onClose, onMinimize, onMaximize, onMove, onResize, appId, component: AppComponent }: WindowProps) {
  // Refs to always have the latest values without making effect depend on them
  const onMoveRef = useRef(onMove)
  const onResizeRef = useRef(onResize)
  const onFocusRef = useRef(onFocus)
  const onCloseRef = useRef(onClose)
  const onMinimizeRef = useRef(onMinimize)
  const onMaximizeRef = useRef(onMaximize)
  React.useEffect(() => { onMoveRef.current = onMove }, [onMove])
  React.useEffect(() => { onResizeRef.current = onResize }, [onResize])
  React.useEffect(() => { onFocusRef.current = onFocus }, [onFocus])
  React.useEffect(() => { onCloseRef.current = onClose }, [onClose])
  React.useEffect(() => { onMinimizeRef.current = onMinimize }, [onMinimize])
  React.useEffect(() => { onMaximizeRef.current = onMaximize }, [onMaximize])

  // Single drag/resize effect that never re-registers
  React.useEffect(() => {
    const dragInfo = { active: false, startX: 0, startY: 0, origX: 0, origY: 0 }
    const resizeInfo = { active: false, startX: 0, startY: 0, origW: 0, origH: 0 }

    function onDocMouseMove(e: MouseEvent) {
      if (dragInfo.active) {
        onMoveRef.current(dragInfo.origX + (e.clientX - dragInfo.startX), Math.max(0, dragInfo.origY + (e.clientY - dragInfo.startY)))
      }
      if (resizeInfo.active) {
        onResizeRef.current(
          Math.max(300, resizeInfo.origW + (e.clientX - resizeInfo.startX)),
          Math.max(200, resizeInfo.origH + (e.clientY - resizeInfo.startY)),
        )
      }
    }
    function onDocMouseUp() {
      dragInfo.active = false
      resizeInfo.active = false
    }
    document.addEventListener('mousemove', onDocMouseMove)
    document.addEventListener('mouseup', onDocMouseUp)
    return () => {
      document.removeEventListener('mousemove', onDocMouseMove)
      document.removeEventListener('mouseup', onDocMouseUp)
    }
  }, [])

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return
    onFocusRef.current()
    dragInfoRef.current = { active: true, startX: e.clientX, startY: e.clientY, origX: win.x, origY: win.y }
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    resizeInfoRef.current = { active: true, startX: e.clientX, startY: e.clientY, origW: win.width, origH: win.height }
  }

  const dragInfoRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 })
  const resizeInfoRef = useRef({ active: false, startX: 0, startY: 0, origW: 0, origH: 0 })

  const closeBg = '#ff5f57', closeActive = '#e0443e'
  const minBg = '#febc2e', minActive = '#e0a020'
  const maxBg = '#28c840', maxActive = '#1fa832'

  function TrafficLights() {
    const [pressed, setPressed] = React.useState<string | null>(null)
    const btn = (bg: string, active: string, name: string, action: () => void): React.CSSProperties => ({
      width: 12, height: 12, borderRadius: '50%', background: pressed === name ? active : bg,
      cursor: 'pointer', border: 'none', padding: 0, transition: 'background 0.05s',
      boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    })
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btn(closeBg, closeActive, 'c', () => onCloseRef.current())}
          onMouseDown={e => { e.stopPropagation(); setPressed('c') }} onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)} />
        <button style={btn(minBg, minActive, 'm', () => onMinimizeRef.current())}
          onMouseDown={e => { e.stopPropagation(); setPressed('m') }} onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)} />
        <button style={btn(maxBg, maxActive, 'x', () => onMaximizeRef.current())}
          onMouseDown={e => { e.stopPropagation(); setPressed('x') }} onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)} />
      </div>
    )
  }

  if (win.isMaximized) {
    return (
      <div style={{ position: 'absolute', top: 25, left: 0, width: '100vw', height: 'calc(100vh - 25px - 80px)', background: '#fff', borderRadius: 0, boxShadow: '0 0 0 1px rgba(0,0,0,0.1)', zIndex: win.zIndex, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div onMouseDown={handleTitleBarMouseDown} style={{ height: 38, background: isActive ? '#ececed' : '#d1d1d6', display: 'flex', alignItems: 'center', padding: '0 12px', cursor: 'default', flexShrink: 0, userSelect: 'none', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <TrafficLights />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#1d1d1f', opacity: 0.8, pointerEvents: 'none' }}>{win.title}</span>
          <div style={{ width: 52 }} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}><AppComponent /></div>
      </div>
    )
  }

  return (
    <div onMouseDown={onFocusRef.current} style={{ position: 'absolute', left: win.x, top: win.y, width: win.width, height: win.height, background: '#fff', borderRadius: 12, boxShadow: isActive ? '0 24px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)' : '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)', zIndex: win.zIndex, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,0.08)', animation: 'windowOpen 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      <div onMouseDown={handleTitleBarMouseDown} style={{ height: 38, background: isActive ? '#ececed' : '#d1d1d6', display: 'flex', alignItems: 'center', padding: '0 12px', cursor: 'grab', flexShrink: 0, userSelect: 'none', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <TrafficLights />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#1d1d1f', opacity: 0.8, pointerEvents: 'none' }}>{win.title}</span>
        <div style={{ width: 52 }} />
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}><AppComponent /></div>
      <div onMouseDown={handleResizeMouseDown} style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, cursor: 'nwse-resize' }} />
      <style>{`@keyframes windowOpen{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
