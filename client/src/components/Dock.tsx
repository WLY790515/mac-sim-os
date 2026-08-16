import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../stores/app.store'
import type { AppDefinition, WindowState } from '../types'
import { iconRectsRef } from './iconRefs'

interface DockProps {
  apps: AppDefinition[]
}

const DOCK_HEIGHT = 70
const BASE_ICON_SIZE = 44
const MAX_SCALE = 1.6
const MAGNIFICATION_RANGE = 90
const TRANSITION_MS = 200
const HIDDEN_KEY = 'macsimos-dock-hidden'

function getHiddenApps(): string[] {
  try {
    const data = localStorage.getItem(HIDDEN_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function setHiddenApps(hidden: string[]) {
  try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden)) } catch {}
}

function iconPath(name: string): string {
  return `/icons/${name}`
}

export default function Dock({ apps }: DockProps) {
  const { state, dispatch } = useApp()
  const [mouseX, setMouseX] = useState<number | null>(null)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; appId: string } | null>(null)
  const [ctxMenuVisible, setCtxMenuVisible] = useState(false)
  const [clickedId, setClickedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const iconCenters = useRef<number[]>([])
  const hiddenRef = useRef<string[]>(getHiddenApps())
  const [glassEnabled, setGlassEnabled] = useState(state.glassEnabled)

  useEffect(() => { setGlassEnabled(state.glassEnabled) }, [state.glassEnabled])

  const visibleApps = apps.filter(a => !hiddenRef.current.includes(a.id))

  const measureIcons = useCallback(() => {
    const centers: number[] = []
    const container = containerRef.current
    if (!container) return centers
    const containerRect = container.getBoundingClientRect()
    iconRectsRef.current.clear()

    visibleApps.forEach((app, i) => {
      const el = iconRefs.current.get(app.id)
      if (el) {
        const r = el.getBoundingClientRect()
        iconRectsRef.current.set(app.id, r)
        centers.push(r.left + r.width / 2 - containerRect.left)
      } else {
        centers.push(-1)
      }
    })

    const trashEl = iconRefs.current.get('trash')
    if (trashEl) {
      const tr = trashEl.getBoundingClientRect()
      iconRectsRef.current.set('trash', tr)
      centers.push(tr.left + tr.width / 2 - containerRect.left)
    } else {
      centers.push(-1)
    }

    iconCenters.current = centers
  }, [visibleApps])

  useEffect(() => {
    measureIcons()
    window.addEventListener('resize', measureIcons)
    const t = setTimeout(measureIcons, 300)
    return () => {
      window.removeEventListener('resize', measureIcons)
      clearTimeout(t)
    }
  }, [measureIcons])

  const totalItems = visibleApps.length + 1

  const hasRightApps = visibleApps.length > 0

  const getScale = useCallback((itemIndex: number): number => {
    if (mouseX === null || iconCenters.current.length === 0) return 1
    const centerX = iconCenters.current[itemIndex]
    if (centerX < 0) return 1
    const distance = Math.abs(mouseX - centerX)
    if (distance > MAGNIFICATION_RANGE) return 1
    // Smoother gaussian with sharper peak
    const gauss = Math.exp(-(distance * distance) / (2 * (MAGNIFICATION_RANGE * 0.35) ** 2))
    return 1 + (MAX_SCALE - 1) * gauss
  }, [mouseX])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMouseX(e.clientX - rect.left)
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseX(null)
    setHoveredId(null)
    setCtxMenu(null)
    setCtxMenuVisible(false)
  }, [])

  const handleDockClick = useCallback((app: AppDefinition) => {
    // Click bounce effect
    setClickedId(app.id)
    setTimeout(() => setClickedId(null), 200)

    const appWindows = state.windows.filter((w: WindowState) => w.appId === app.id)
    if (appWindows.length === 0) {
      dispatch({ type: 'OPEN_WINDOW', app })
    } else {
      const minimized = appWindows.every((w: WindowState) => w.isMinimized)
      if (minimized) {
        dispatch({ type: 'OPEN_WINDOW', app })
      } else {
        const maxZ = Math.max(...appWindows.map((w: WindowState) => w.zIndex))
        const active = appWindows.find((w: WindowState) => w.zIndex === maxZ)
        if (active) dispatch({ type: 'MINIMIZE_WINDOW', id: active.id })
      }
    }
  }, [dispatch, state.windows])

  const handleTrashClick = useCallback(() => {
    setClickedId('trash')
    setTimeout(() => setClickedId(null), 200)
    dispatch({ type: 'TOGGLE_TRASH' })
  }, [dispatch])

  const handleIconContextMenu = useCallback((e: React.MouseEvent, app: AppDefinition) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    setCtxMenu({ x: rect.left, y: rect.bottom + 4, appId: app.id })
    setCtxMenuVisible(true)
  }, [])

  useEffect(() => {
    const click = () => { setCtxMenu(null); setCtxMenuVisible(false) }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [])

  const toggleHidden = useCallback((appId: string) => {
    const next = hiddenRef.current.includes(appId)
      ? hiddenRef.current.filter(id => id !== appId)
      : [...hiddenRef.current, appId]
    hiddenRef.current = next
    setHiddenApps(next)
    setCtxMenu(null)
    setCtxMenuVisible(false)
    if (hiddenRef.current.includes(appId)) {
      state.windows.filter((w: WindowState) => w.appId === appId).forEach((w: WindowState) => {
        dispatch({ type: 'CLOSE_WINDOW', id: w.id })
      })
    }
  }, [state.windows, dispatch])

  const ctxApp = ctxMenu ? apps.find(a => a.id === ctxMenu.appId) : null

  return (
    <>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          height: DOCK_HEIGHT,
          background: glassEnabled
            ? 'rgba(255,255,255,0.18)'
            : 'rgba(255,255,255,0.35)',
          backdropFilter: glassEnabled ? 'blur(32px) saturate(250%)' : 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: glassEnabled ? 'blur(32px) saturate(250%)' : 'blur(24px) saturate(200%)',
          border: glassEnabled
            ? '1px solid rgba(255,255,255,0.28)'
            : '1px solid rgba(255,255,255,0.4)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 3,
          zIndex: 9998,
          boxShadow: '0 10px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
          padding: '6px 6px 4px',
          transition: 'background 0.3s ease, border 0.3s ease',
        }}
      >
        {visibleApps.map((app, index) => {
          const scale = getScale(index)
          const isMagnified = scale > 1.05
          const isActive = state.windows.some((w: WindowState) => w.appId === app.id && !w.isMinimized)
          const isClicked = clickedId === app.id
          const isHovered = hoveredId === app.id
          return (
            <div
              key={app.id}
              ref={(el) => { if (el) iconRefs.current.set(app.id, el) }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, position: 'relative' }}
              onMouseEnter={() => setHoveredId(app.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Active indicator with pulse */}
              {isActive && (
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.85)',
                  marginBottom: 2, flexShrink: 0,
                  boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                  animation: 'dockPulse 2s ease-in-out infinite',
                }} />
              )}
              <button
                onClick={() => handleDockClick(app)}
                onContextMenu={(e) => handleIconContextMenu(e, app)}
                style={{
                  display: 'block',
                  transform: `scale(${scale}${isClicked ? ', 0.9' : ''})`,
                  transformOrigin: 'bottom center',
                  transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  padding: 0,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                }}
              >
                <img src={app.icon} alt={app.name} style={{
                  width: BASE_ICON_SIZE,
                  height: BASE_ICON_SIZE,
                  borderRadius: isMagnified ? 14 : 12,
                  display: 'block',
                  filter: isMagnified
                    ? 'drop-shadow(0 8px 24px rgba(0,0,0,0.5)) brightness(1.05)'
                    : isHovered
                      ? 'drop-shadow(0 4px 14px rgba(0,0,0,0.3))'
                      : 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                  transition: 'filter 0.25s ease, border-radius 0.2s ease, transform 0.15s ease',
                  transform: isClicked ? 'scale(0.92)' : 'scale(1)',
                }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.style.display = 'none'
                    const parent = img.parentElement
                    if (parent) parent.innerHTML = `<div style="width:${BASE_ICON_SIZE}px;height:${BASE_ICON_SIZE}px;border-radius:12px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${app.name[0]}</div>`
                  }}
                />
              </button>
            </div>
          )
        })}
        {hasRightApps && (
          <div style={{
            width: 1, height: DOCK_HEIGHT - 20,
            background: 'rgba(0,0,0,0.2)', margin: '0 6px 6px', borderRadius: 1, flexShrink: 0,
            transition: 'background 0.3s ease',
          }} />
        )}
        <div
          ref={(el) => { if (el) iconRectsRef.current.set('trash', el.getBoundingClientRect()) }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}
          onClick={handleTrashClick}
          onMouseEnter={() => setHoveredId('trash')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div style={{
            transform: `scale(${getScale(visibleApps.length)})`,
            transformOrigin: 'bottom center',
            transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
          }}>
            <img src={iconPath('trash')} alt="Trash" style={{
              width: BASE_ICON_SIZE,
              height: BASE_ICON_SIZE,
              borderRadius: 12,
              display: 'block',
              filter: hoveredId === 'trash'
                ? 'drop-shadow(0 4px 14px rgba(0,0,0,0.3))'
                : 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
              transition: 'filter 0.25s ease, transform 0.15s ease',
              transform: clickedId === 'trash' ? 'scale(0.9)' : 'scale(1)',
            }}
              onError={(e) => {
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
                const parent = img.parentElement
                if (parent) parent.innerHTML = `<div style="width:${BASE_ICON_SIZE}px;height:${BASE_ICON_SIZE}px;border-radius:12px;background:linear-gradient(135deg,#555,#333);display:flex;align-items:center;justify-content:center;color:white;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🗑</div>`
              }}
            />
          </div>
        </div>
      </div>

      {/* Context menu with slide-in animation */}
      {ctxMenu && ctxApp && (
        <div
          style={{
            position: 'fixed',
            left: ctxMenu.x,
            top: ctxMenu.y,
            zIndex: 99999,
            background: 'rgba(30,30,30,0.92)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '4px 0',
            minWidth: 180,
            animation: ctxMenuVisible ? 'ctxMenuSlideIn 0.15s ease-out' : 'none',
          }}
          onClick={() => { setCtxMenu(null); setCtxMenuVisible(false) }}
        >
          <div style={{
            padding: '6px 12px 6px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            marginBottom: 2,
            animation: ctxMenuVisible ? 'ctxMenuItemFade 0.12s ease-out' : 'none',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{ctxApp.name}</span>
          </div>
          <button onClick={() => { handleDockClick(ctxApp); setCtxMenu(null) }}
            style={menuBtnStyle}>
            {state.windows.some((w: WindowState) => w.appId === ctxApp.id && !w.isMinimized) ? '🗕 最小化' : '🗖 打开'}
          </button>
          <button onClick={() => toggleHidden(ctxApp.id)}
            style={{ ...menuBtnStyle, color: hiddenRef.current.includes(ctxApp.id) ? '#ff6b6b' : '#fff' }}>
            {hiddenRef.current.includes(ctxApp.id) ? '👁️ 显示在 Dock' : '🚫 从 Dock 隐藏'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes dockPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes ctxMenuSlideIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ctxMenuItemFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}

const menuBtnStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '5px 12px', border: 'none', background: 'transparent',
  textAlign: 'left', fontSize: 12, color: '#fff', cursor: 'pointer', borderRadius: 4,
  transition: 'background 0.1s ease',
}
