import React, { useRef, useCallback, useLayoutEffect, useEffect, useState } from 'react'
import type { WindowState } from '../types'

interface AnimationState {
  fromX: number; fromY: number; fromW: number; fromH: number
  toX: number; toY: number; toW: number; toH: number
  elapsed: number
  isMinimizing: boolean
  isMaximizing: boolean
  isClosing: boolean
  fromOpacity: number
  toOpacity: number
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
  onSnap?: (side: 'left' | 'right' | 'top' | 'bottom' | 'fullscreen') => void
  appId: string
  component: React.ComponentType<any>
  getDockIconRect?: () => DOMRect | null
}

export default function Window({
  window: win, isActive, onFocus, onClose, onMinimize, onMaximize,
  onMove, onResize, onSnap, appId, component: AppComponent, getDockIconRect,
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

  const wasMinimizedRef = useRef(win.isMinimized)
  const wasMaximizedRef = useRef(win.isMaximized)
  const lastAnimTypeRef = useRef<string | null>(null)
  const closeRef = useRef<(() => void) | null>(null)
  const isAnimatingMaxRef = useRef(false)
  const [titleBarHue, setTitleBarHue] = useState(0)

  useLayoutEffect(() => { onMoveRef.current = onMove }, [onMove])
  useLayoutEffect(() => { onResizeRef.current = onResize }, [onResize])
  useLayoutEffect(() => { onFocusRef.current = onFocus }, [onFocus])
  useLayoutEffect(() => { onCloseRef.current = onClose }, [onClose])
  useLayoutEffect(() => { onMinimizeRef.current = onMinimize }, [onMinimize])
  useLayoutEffect(() => { onMaximizeRef.current = onMaximize }, [onMaximize])
  useLayoutEffect(() => { getDockIconRectRef.current = getDockIconRect }, [getDockIconRect])

  useLayoutEffect(() => { wasMinimizedRef.current = win.isMinimized }, [win.isMinimized])
  useLayoutEffect(() => { wasMaximizedRef.current = win.isMaximized }, [win.isMaximized])

  // Title bar color shift on focus change
  useEffect(() => {
    const t = setTimeout(() => setTitleBarHue(isActive ? 1 : 0), 10)
    return () => clearTimeout(t)
  }, [isActive])

  useEffect(() => {
    function onDocMouseMove(e: MouseEvent) {
      if (dragInfoRef.current.active) {
        const d = dragInfoRef.current
        let nx = d.origX + (e.clientX - d.startX)
        let ny = Math.max(0, d.origY + (e.clientY - d.startY))
        if (e.clientX < 8) onSnap?.('left')
        else if (e.clientX > window.innerWidth - 8) onSnap?.('right')
        else if (ny < 4) onSnap?.('top')
        else if (ny > window.innerHeight - 96) onSnap?.('bottom')
        onMoveRef.current(nx, ny)
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
  }, [onSnap])

  // ── animation engine ───────────────────────────────────────────────
  const ANIM_MS = 480
  const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
  const easeInCubic = (t: number): number => t * t * t
  const easeOutBack = (t: number): number => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) }
  const easeInOutQuart = (t: number): number => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2

  const animRef = useRef<AnimationState | null>(null)
  const rafRef = useRef<number>(0)
  const renderRef = useRef({ x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1 })
  const [renderPos, setRenderPos] = useState(() => ({
    x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1,
  }))
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => { setIsFocused(isActive) }, [isActive])

  const finishAnim = useCallback((a: AnimationState) => {
    cancelAnimationFrame(rafRef.current)
    animRef.current = null
    lastAnimTypeRef.current = null
    const r = renderRef.current
    if (a?.isMinimizing) {
      r.opacity = 0
    } else if (a?.isClosing) {
      r.opacity = 0
      onCloseRef.current()
    } else {
      onMoveRef.current(r.x, r.y)
      onResizeRef.current(r.w, r.h)
      r.opacity = 1
    }
    isAnimatingMaxRef.current = false
    setRenderPos({ ...r })
  }, [])

  const tick = useCallback(() => {
    const a = animRef.current
    if (!a) return
    const now = performance.now()
    const rawT = Math.min(1, (now - a.elapsed) / ANIM_MS)
    const easedT = a.isMinimizing ? easeInCubic(rawT) : a.isClosing ? easeInOutQuart(rawT) : easeOutCubic(rawT)

    const curOpacity = a.fromOpacity !== undefined
      ? a.fromOpacity + (a.toOpacity - a.fromOpacity) * easedT
      : 1

    const cur = {
      x: a.fromX + (a.toX - a.fromX) * easedT,
      y: a.fromY + (a.toY - a.fromY) * easedT,
      w: a.fromW + (a.toW - a.fromW) * easedT,
      h: a.fromH + (a.toH - a.fromH) * easedT,
      opacity: curOpacity,
    }
    renderRef.current = cur
    setRenderPos(cur)
    if (rawT >= 1) {
      finishAnim(a)
    } else {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [finishAnim])

  const startAnim = useCallback((a: AnimationState) => {
    cancelAnimationFrame(rafRef.current)
    animRef.current = a
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  // ── Close animation ────────────────────────────────────────────────
  useLayoutEffect(() => {
    closeRef.current = () => {
      if (animRef.current || win.isMinimized) return
      const cx = win.x + win.width / 2
      const cy = win.y + win.height / 2
      const a: AnimationState = {
        fromX: win.x, fromY: win.y, fromW: win.width, fromH: win.height,
        toX: cx - 1, toY: cy - 1, toW: 2, toH: 2,
        elapsed: performance.now(),
        isMinimizing: false,
        isMaximizing: false,
        isClosing: true,
        fromOpacity: 1,
        toOpacity: 0,
      }
      renderRef.current = { x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1 }
      setRenderPos({ x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1 })
      startAnim(a)
    }
  }, [win.x, win.y, win.width, win.height, startAnim])

  // ── Open animation (spring-like overshoot) ─────────────────────────
  useLayoutEffect(() => {
    if (animRef.current) return
    if (win.isMinimized) return
    const animKey = `open:${win.id}`
    if (lastAnimTypeRef.current === animKey) return
    lastAnimTypeRef.current = animKey

    const rect = getDockIconRectRef.current?.()
    const dockX = rect ? rect.left + rect.width / 2 - win.width / 2 : win.x
    const dockY = window.innerHeight - 80 - win.height
    const a: AnimationState = {
      fromX: dockX, fromY: dockY, fromW: 0, fromH: 0,
      toX: win.x, toY: win.y, toW: win.width, toH: win.height,
      elapsed: performance.now(),
      isMinimizing: false,
      isMaximizing: false,
      isClosing: false,
      fromOpacity: 0,
      toOpacity: 1,
    }
    renderRef.current = { x: dockX, y: dockY, w: 0, h: 0, opacity: 0 }
    setRenderPos({ x: dockX, y: dockY, w: 0, h: 0, opacity: 0 })
    startAnim(a)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.id, win.isMinimized])

  // ── Minimize animation ─────────────────────────────────────────────
  useLayoutEffect(() => {
    if (animRef.current || !win.isMinimized || wasMinimizedRef.current) return
    const animKey = `min:${win.id}`
    if (lastAnimTypeRef.current === animKey) return
    lastAnimTypeRef.current = animKey

    const rect = getDockIconRectRef.current?.()
    const targetX = rect ? rect.left : win.x
    const targetY = rect ? rect.top : win.y
    const targetW = rect ? Math.max(rect.width, 44) : 44
    const targetH = rect ? Math.max(rect.height, 50) : 50
    const a: AnimationState = {
      fromX: win.x, fromY: win.y, fromW: win.width, fromH: win.height,
      toX: targetX, toY: targetY, toW: targetW, toH: targetH,
      elapsed: performance.now(),
      isMinimizing: true,
      isMaximizing: false,
      isClosing: false,
      fromOpacity: 1,
      toOpacity: 0.3,
    }
    renderRef.current = { x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1 }
    setRenderPos({ x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1 })
    startAnim(a)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.isMinimized])

  // ── Maximize animation ─────────────────────────────────────────────
  useLayoutEffect(() => {
    if (animRef.current || !win.isMaximized || wasMaximizedRef.current) return
    const animKey = `max:${win.id}`
    if (lastAnimTypeRef.current === animKey) return
    lastAnimTypeRef.current = animKey
    isAnimatingMaxRef.current = true

    const a: AnimationState = {
      fromX: win.x, fromY: win.y, fromW: win.width, fromH: win.height,
      toX: 0, toY: 25, toW: window.innerWidth, toH: window.innerHeight - 25 - 80,
      elapsed: performance.now(),
      isMinimizing: false,
      isMaximizing: true,
      isClosing: false,
      fromOpacity: 1,
      toOpacity: 1,
    }
    renderRef.current = { x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1 }
    setRenderPos({ x: win.x, y: win.y, w: win.width, h: win.height, opacity: 1 })
    startAnim(a)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.isMaximized])

  // ── Restore animation (maximized → original) ───────────────────────
  useLayoutEffect(() => {
    if (animRef.current) return
    if (win.isMaximized) return
    if (!wasMaximizedRef.current) return
    if (isAnimatingMaxRef.current) return
    const animKey = `restore:${win.id}`
    if (lastAnimTypeRef.current === animKey) return
    lastAnimTypeRef.current = animKey

    const a: AnimationState = {
      fromX: 0, fromY: 25, fromW: window.innerWidth, fromH: window.innerHeight - 25 - 80,
      toX: win.wasPosition?.x ?? win.x, toY: win.wasPosition?.y ?? win.y,
      toW: win.wasPosition?.width ?? win.width, toH: win.wasPosition?.height ?? win.height,
      elapsed: performance.now(),
      isMinimizing: false,
      isMaximizing: false,
      isClosing: false,
      fromOpacity: 1,
      toOpacity: 1,
    }
    renderRef.current = { x: 0, y: 25, w: window.innerWidth, h: window.innerHeight - 25 - 80, opacity: 1 }
    setRenderPos({ x: 0, y: 25, w: window.innerWidth, h: window.innerHeight - 25 - 80, opacity: 1 })
    startAnim(a)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.isMaximized])

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

  // Active window subtle glow pulse
  const glowPulse = isActive ? (Math.sin(Date.now() / 800) * 0.5 + 0.5) : 0

  const closeBg = '#ff5f57', closeActive = '#e0443e'
  const minBg = '#febc2e', minActive = '#e0a020'
  const maxBg = '#28c840', maxActive = '#1fa832'

  function TrafficLights() {
    const [pressed, setPressed] = useState<string | null>(null)
    const btnStyle = (bg: string, active: string, scale: number): React.CSSProperties => ({
      width: 12, height: 12, borderRadius: '50%',
      background: pressed ? active : bg,
      cursor: 'pointer', border: 'none', padding: 0,
      transition: 'background 0.1s ease, transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
      boxShadow: pressed ? 'inset 0 1px 3px rgba(0,0,0,0.3)' : 'inset 0 0.5px 1px rgba(255,255,255,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 0, lineHeight: 1, pointerEvents: 'auto',
      transform: `scale(${scale})`,
    })
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button
          style={btnStyle(closeBg, closeActive, pressed === 'c' ? 0.85 : 1)}
          onMouseDown={e => { e.stopPropagation(); setPressed('c'); closeRef.current?.() }}
          onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)}
        />
        <button
          style={btnStyle(minBg, minActive, pressed === 'm' ? 0.85 : 1)}
          onMouseDown={e => { e.stopPropagation(); setPressed('m'); onMinimizeRef.current() }}
          onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)}
        />
        <button
          style={btnStyle(maxBg, maxActive, pressed === 'x' ? 0.85 : 1)}
          onMouseDown={e => { e.stopPropagation(); setPressed('x'); onMaximizeRef.current() }}
          onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)}
        />
      </div>
    )
  }

  const titleBarBg = isActive
    ? `hsl(${220 + titleBarHue * 2}, 10%, ${93 + titleBarHue * 2}%)`
    : '#d1d1d6'

  const titleBar = (
    <div
      onMouseDown={handleTitleBarMouseDown}
      style={{
        height: 38,
        background: titleBarBg,
        display: 'flex', alignItems: 'center', padding: '0 12px',
        cursor: 'grab', flexShrink: 0, userSelect: 'none',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        transition: 'background 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle shine line on title bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: isActive ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' : 'transparent',
        transition: 'background 0.3s ease',
      }} />
      <TrafficLights />
      <span style={{
        flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500,
        color: isActive ? '#1d1d1f' : '#6e6e73',
        opacity: isActive ? 0.9 : 0.7,
        pointerEvents: 'none',
        transition: 'color 0.2s ease, opacity 0.2s ease',
      }}>{win.title}</span>
      <div style={{ width: 52 }} />
    </div>
  )

  const baseBoxShadow = isActive
    ? `0 0 0 1px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.14), 0 0 ${12 + glowPulse * 8}px rgba(0,122,255,${0.06 + glowPulse * 0.04})`
    : '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)'

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: dispX, top: dispY,
    width: dispW, height: dispH,
    opacity: dispOpacity,
    zIndex: win.zIndex, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(0,0,0,0.12)',
    pointerEvents: isAnimating ? 'none' : 'auto',
    boxShadow: baseBoxShadow,
    transition: isActive ? 'box-shadow 0.3s ease' : 'none',
  }

  if (win.isMinimized && !isAnimating) return null

  if (win.isMaximized && !isAnimating && !isAnimatingMaxRef.current) {
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
