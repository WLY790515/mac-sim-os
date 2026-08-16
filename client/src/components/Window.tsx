import React, { useRef, useCallback, useEffect } from 'react'
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
  const onMoveRef = useRef(onMove)
  const onResizeRef = useRef(onResize)
  const onFocusRef = useRef(onFocus)
  const onCloseRef = useRef(onClose)
  const onMinimizeRef = useRef(onMinimize)
  const onMaximizeRef = useRef(onMaximize)
  const dragInfoRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 })
  const resizeInfoRef = useRef({ active: false, startX: 0, startY: 0, origW: 0, origH: 0 })

  // Keep refs fresh without triggering effect re-runs
  useEffect(() => { onMoveRef.current = onMove }, [onMove])
  useEffect(() => { onResizeRef.current = onResize }, [onResize])
  useEffect(() => { onFocusRef.current = onFocus }, [onFocus])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  useEffect(() => { onMinimizeRef.current = onMinimize }, [onMinimize])
  useEffect(() => { onMaximizeRef.current = onMaximize }, [onMaximize])

  // Single drag/resize handler — registered once, never re-registered
  useEffect(() => {
    function onDocMouseMove(e: MouseEvent) {
      if (dragInfoRef.current.active) {
        const d = dragInfoRef.current
        onMoveRef.current(d.origX + (e.clientX - d.startX), Math.max(0, d.origY + (e.clientY - d.startY)))
      }
      if (resizeInfoRef.current.active) {
        const r = resizeInfoRef.current
        onResizeRef.current(
          Math.max(300, r.origW + (e.clientX - r.startX)),
          Math.max(200, r.origH + (e.clientY - r.startY)),
        )
      }
    }
    function onDocMouseUp() {
      dragInfoRef.current.active = false
      resizeInfoRef.current.active = false
    }
    document.addEventListener('mousemove', onDocMouseMove)
    document.addEventListener('mouseup', onDocMouseUp)
    return () => {
      document.removeEventListener('mousemove', onDocMouseMove)
      document.removeEventListener('mouseup', onDocMouseUp)
    }
  }, [])

  const handleTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.closest('button')) return
    onFocusRef.current()
    dragInfoRef.current = { active: true, startX: e.clientX, startY: e.clientY, origX: win.x, origY: win.y }
  }, [win.x, win.y])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    resizeInfoRef.current = { active: true, startX: e.clientX, startY: e.clientY, origW: win.width, origH: win.height }
  }, [win.width, win.height])

  const closeBg = '#ff5f57', closeActive = '#e0443e'
  const minBg = '#febc2e', minActive = '#e0a020'
  const maxBg = '#28c840', maxActive = '#1fa832'

  function TrafficLights() {
    const [pressed, setPressed] = React.useState<string | null>(null)
    const btnStyle = (bg: string, active: string): React.CSSProperties => ({
      width: 12, height: 12, borderRadius: '50%',
      background: pressed ? active : bg,
      cursor: 'pointer', border: 'none', padding: 0,
      transition: 'background 0.08s',
      boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 0, lineHeight: 1, pointerEvents: 'auto',
    })
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button
          style={btnStyle(closeBg, closeActive)}
          onMouseDown={e => { e.stopPropagation(); setPressed('c'); onCloseRef.current() }}
          onMouseUp={() => setPressed(null)}
          onMouseLeave={() => setPressed(null)}
        />
        <button
          style={btnStyle(minBg, minActive)}
          onMouseDown={e => { e.stopPropagation(); setPressed('m'); onMinimizeRef.current() }}
          onMouseUp={() => setPressed(null)}
          onMouseLeave={() => setPressed(null)}
        />
        <button
          style={btnStyle(maxBg, maxActive)}
          onMouseDown={e => { e.stopPropagation(); setPressed('x'); onMaximizeRef.current() }}
          onMouseUp={() => setPressed(null)}
          onMouseLeave={() => setPressed(null)}
        />
      </div>
    )
  }

  const titleBar = (
    <div
      onMouseDown={handleTitleBarMouseDown}
      style={{
        height: 38,
        background: isActive ? '#ececed' : '#d1d1d6',
        display: 'flex', alignItems: 'center', padding: '0 12px',
        cursor: 'grab', flexShrink: 0, userSelect: 'none',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <TrafficLights />
      <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#1d1d1f', opacity: 0.8, pointerEvents: 'none' }}>{win.title}</span>
      <div style={{ width: 52 }} />
    </div>
  )

  if (win.isMaximized) {
    return (
      <div style={{ position: 'absolute', top: 25, left: 0, width: '100vw', height: 'calc(100vh - 25px - 80px)', background: '#fff', borderRadius: 0, boxShadow: '0 0 0 1px rgba(0,0,0,0.1)', zIndex: win.zIndex, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {titleBar}
        <div style={{ flex: 1, overflow: 'hidden' }}><AppComponent /></div>
      </div>
    )
  }

  return (
    <div
      onMouseDown={onFocusRef.current}
      style={{
        position: 'absolute', left: win.x, top: win.y,
        width: win.width, height: win.height,
        background: '#fff', borderRadius: 12,
        boxShadow: isActive
          ? '0 24px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)'
          : '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        zIndex: win.zIndex, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(0,0,0,0.08)',
        animation: 'windowOpen 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {titleBar}
      <div style={{ flex: 1, overflow: 'auto' }}><AppComponent /></div>
      <div
        onMouseDown={handleResizeMouseDown}
        style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, cursor: 'nwse-resize' }}
      />
      <style>{`@keyframes windowOpen{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
