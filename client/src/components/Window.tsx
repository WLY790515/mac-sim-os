import React, { useRef, useCallback, useEffect, useState } from 'react'
import type { WindowState } from '../types'

interface AnimationState {
  fromX: number; fromY: number; fromW: number; fromH: number
  toX: number; toY: number; toW: number; toH: number
  elapsed: number
  isMinimizing: boolean   // true = sucking into dock, false = exploding from dock
  isMaximizing: boolean   // true = expanding to fill screen
}

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
  getDockIconRect?: () => DOMRect | null
}

export default function Window({
  window: win, isActive, onFocus, onClose, onMinimize, onMaximize,
  onMove, onResize, appId, component: AppComponent, getDockIconRect,
}: WindowProps) {
  const onMoveRef = useRef(onMove)
  const onResizeRef = useRef(onResize)
  const onFocusRef = useRef(onFocus)
  const onCloseRef = useRef(onClose)
  const onMinimizeRef = useRef(onMinimize)
  const onMaximizeRef = useRef(onMaximize)
  const getDockIconRectRef = useRef(getDockIconRect)
  const dragInfoRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 })
  const resizeInfoRef = useRef({ active: false, startX: 0, startY: 0, origW: 0, origH: 0 })

  useEffect(() => { onMoveRef.current = onMove }, [onMove])
  useEffect(() => { onResizeRef.current = onResize }, [onResize])
  useEffect(() => { onFocusRef.current = onFocus }, [onFocus])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  useEffect(() => { onMinimizeRef.current = onMinimize }, [onMinimize])
  useEffect(() => { onMaximizeRef.current = onMaximize }, [onMaximize])
  useEffect(() => { getDockIconRectRef.current = getDockIconRect }, [getDockIconRect])

  // Single drag/resize handler
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

  // ── Black hole animation engine ───────────────────────────────────
  const ANIM_MS = 420
  const animRef = useRef<AnimationState | null>(null)
  const rafRef = useRef<number>(0)
  const renderRef = useRef({ x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1 })
  const [renderPos, setRenderPos] = useState({ x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1 })

  const finishAnim = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    const a = animRef.current
    animRef.current = null
    const r = renderRef.current
    if (a?.isMinimizing) {
      r.opacity = 0
    } else {
      onMoveRef.current(r.x, r.y)
      onResizeRef.current(r.w, r.h)
      r.opacity = 1
    }
    setRenderPos({ ...r })
  }, [])

  // Spring-like "black hole" easing:
  // - Opening/Expanding (out): easeOutBack — explosive start, slight overshoot then settle
  // - Closing/Sucking (in): easeInBack — accelerates into the vortex
  // Formula: easeOutBack(t) = 1 + 2.70158*(t-1)^3 + 1.70158*(t-1)^2
  //          easeInBack(t)  = t^3 - 1.70158*t^2 + 0.70158*t^3
  const easeOutBack = (t: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }

  const easeInBack = (t: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return c3 * t * t * t - c1 * t * t
  }

  const tick = useCallback(() => {
    const a = animRef.current
    if (!a) return
    const now = performance.now()
    const rawT = Math.min(1, (now - a.elapsed) / ANIM_MS)

    // Choose easing based on animation direction
    // OUT (opening/maximizing): explosive burst from origin
    // IN (minimizing/restoring): gravitational suction toward target
    const easedT = a.isMinimizing ? easeInBack(rawT) : easeOutBack(rawT)

    // Scale factor: 0→1 for open, 1→0 for minimize
    const scale = a.isMinimizing
      ? 1 - easedT
      : easedT

    // Position interpolation
    const cur = {
      x: a.fromX + (a.toX - a.fromX) * easedT,
      y: a.fromY + (a.toY - a.fromY) * easedT,
      w: a.fromW + (a.toW - a.fromW) * scale,
      h: a.fromH + (a.toH - a.fromH) * scale,
      opacity: a.isMinimizing ? (1 - easedT * easedT) : 1,
    }
    renderRef.current = cur
    setRenderPos(cur)

    if (rawT >= 1) {
      finishAnim()
    } else {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [finishAnim])

  const startAnim = useCallback((a: AnimationState) => {
    cancelAnimationFrame(rafRef.current)
    animRef.current = a
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  // ── Trigger animations ─────────────────────────────────────────────
  useEffect(() => {
    if (animRef.current || win.isMinimized) return
    const rect = getDockIconRectRef.current?.()
    const dockX = rect ? rect.left + rect.width / 2 - win.width / 2 : win.x
    const dockY = rect ? rect.top + rect.height / 2 - win.height / 2 : win.y
    startAnim({
      fromX: dockX, fromY: dockY, fromW: 0, fromH: 0,
      toX: win.x, toY: win.y, toW: win.width, toH: win.height,
      elapsed: performance.now(),
      isMinimizing: false,
      isMaximizing: false,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.id])

  useEffect(() => {
    if (animRef.current || !win.isMinimized) return
    const rect = getDockIconRectRef.current?.()
    const targetX = rect ? rect.left : win.x
    const targetY = rect ? rect.top + rect.height : win.y
    const targetW = rect ? Math.max(rect.width, 44) : 44
    const targetH = rect ? Math.max(rect.height, 10) : 10
    startAnim({
      fromX: win.x, fromY: win.y, fromW: win.width, fromH: win.height,
      toX: targetX, toY: targetY, toW: targetW, toH: targetH,
      elapsed: performance.now(),
      isMinimizing: true,
      isMaximizing: false,
    })
  }, [win.isMinimized])

  useEffect(() => {
    if (animRef.current) return
    if (win.isMaximized) {
      startAnim({
        fromX: win.x, fromY: win.y, fromW: win.width, fromH: win.height,
        toX: 0, toY: 25, toW: window.innerWidth, toH: window.innerHeight - 25 - 80,
        elapsed: performance.now(),
        isMinimizing: false,
        isMaximizing: true,
      })
    } else if (win.wasPosition) {
      startAnim({
        fromX: 0, fromY: 25, fromW: window.innerWidth, fromH: window.innerHeight - 25 - 80,
        toX: win.wasPosition.x, toY: win.wasPosition.y,
        toW: win.wasPosition.width, toH: win.wasPosition.height,
        elapsed: performance.now(),
        isMinimizing: true,
        isMaximizing: false,
      })
    }
  }, [win.isMaximized, win.wasPosition])

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

  // ── Display values ─────────────────────────────────────────────────
  const isAnimating = !!animRef.current
  const dispX = isAnimating ? renderPos.x : win.x
  const dispY = isAnimating ? renderPos.y : win.y
  const dispW = isAnimating ? Math.max(1, renderPos.w) : win.width
  const dispH = isAnimating ? Math.max(1, renderPos.h) : win.height
  const dispOpacity = isAnimating ? renderPos.opacity : 1

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
          onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)}
        />
        <button
          style={btnStyle(minBg, minActive)}
          onMouseDown={e => { e.stopPropagation(); setPressed('m'); onMinimizeRef.current() }}
          onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)}
        />
        <button
          style={btnStyle(maxBg, maxActive)}
          onMouseDown={e => { e.stopPropagation(); setPressed('x'); onMaximizeRef.current() }}
          onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)}
        />
      </div>
    )
  }

  const titleBar = (
    <div
      onMouseDown={handleTitleBarMouseDown}
      style={{
        height: 38, background: isActive ? '#ececed' : '#d1d1d6',
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

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: dispX, top: dispY,
    width: dispW, height: dispH,
    opacity: dispOpacity,
    boxShadow: isActive
      ? '0 24px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)'
      : '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    zIndex: win.zIndex, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(0,0,0,0.08)',
    pointerEvents: isAnimating ? 'none' : 'auto',
  }

  if (win.isMinimized && !isAnimating) return null

  if (win.isMaximized && !isAnimating) {
    return (
      <div style={{ ...baseStyle, borderRadius: 0, left: 0, top: 25, width: '100vw', height: `calc(100vh - 25px - 80px)` }} onMouseDown={onFocusRef.current}>
        {titleBar}
        <div style={{ flex: 1, overflow: 'hidden' }}><AppComponent /></div>
      </div>
    )
  }

  return (
    <div style={{ ...baseStyle, borderRadius: 12 }} onMouseDown={onFocusRef.current}>
      {titleBar}
      <div style={{ flex: 1, overflow: 'auto' }}><AppComponent /></div>
      <div
        onMouseDown={handleResizeMouseDown}
        style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, cursor: 'nwse-resize' }}
      />
    </div>
  )
}
