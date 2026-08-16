import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../stores/app.store'
import { useAppRegistry } from '../contexts/AppRegistry.context'
import type { AppDefinition, WindowState } from '../types'
import { iconRectsRef } from './iconRefs'

interface DockProps {
  apps: AppDefinition[]
}

const DOCK_HEIGHT = 70
const BASE_ICON_SIZE = 44
const MAX_SCALE = 1.6
const MAGNIFICATION_RANGE = 90
const TRANSITION_MS = 150
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
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const iconCenters = useRef<number[]>([])
  const hiddenRef = useRef<string[]>(getHiddenApps())

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

  // Hide separator if nothing on right side
  const hasRightApps = visibleApps.length > 0
  const trashIndex = visibleApps.length

  const getScale = useCallback((iconIndex: number): number => {
    if (mouseX === null || iconCenters.current.length === 0) return 1
    const centerX = iconCenters.current[iconIndex]
    if (centerX < 0) return 1
    const distance = Math.abs(mouseX - centerX)
    if (distance > MAGNIFICATION_RANGE) return 1
    const gauss = Math.exp(-(distance * distance) / (2 * (MAGNIFICATION_RANGE * 0.4) ** 2))
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
    setCtxMenu(null)
  }, [])

  const handleDockClick = useCallback((app: AppDefinition) => {
    const appWindows = state.windows.filter((w: WindowState) => w.appId === app.id)
    if (appWindows.length === 0) {
      dispatch({ type: 'OPEN_WINDOW', app })
    } else {
      const minimized = appWindows.every((w: WindowState) => w.isMinimized)
      if (minimized) {
        dispatch({ type: 'OPEN_WINDOW', app })
      } else {
        const active = appWindows.find((w: WindowState) => w.zIndex === Math.max(...appWindows.map((ww: WindowState) => ww.zIndex)))
        if (active) dispatch({ type: 'MINIMIZE_WINDOW', id: active.id })
      }
    }
  }, [dispatch, state.windows])

  const handleTrashClick = useCallback(() => {
    dispatch({ type: 'TOGGLE_TRASH' })
  }, [dispatch])

  // Right-click handler
  const handleIconContextMenu = useCallback((e: React.MouseEvent, app: AppDefinition) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    setCtxMenu({ x: rect.left, y: rect.bottom + 4, appId: app.id })
  }, [])

  useEffect(() => {
    const click = () => setCtxMenu(null)
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
    // Also close the window if it's hidden
    if (hiddenRef.current.includes(appId)) {
      // Remove all windows of this app
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
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 3,
          zIndex: 9998,
          boxShadow: '0 10px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
          padding: '6px 6px 4px',
        }}
      >
        {visibleApps.map((app, index) => {
          const scale = getScale(index)
          const isMagnified = scale > 1.05
          const isActive = state.windows.some((w: WindowState) => w.appId === app.id && !w.isMinimized)
          const dotIndex = index + (isActive ? 1 : 0)
          return (
            <div
              key={app.id}
              ref={(el) => { if (el) iconRefs.current.set(app.id, el) }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, position: 'relative' }}
            >
              {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', marginBottom: 2, flexShrink: 0 }} />}
              <button
                onClick={() => handleDockClick(app)}
                onContextMenu={(e) => handleIconContextMenu(e, app)}
                style={{
                  display: 'block',
                  transform: `scale(${scale})`,
                  transformOrigin: 'bottom center',
                  transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  padding: 0,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
              >
                <img src={app.icon} alt={app.name} style={{
                  width: BASE_ICON_SIZE,
                  height: BASE_ICON_SIZE,
                  borderRadius: 12,
                  display: 'block',
                  filter: isMagnified
                    ? 'drop-shadow(0 6px 20px rgba(0,0,0,0.45))'
                    : 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                  transition: 'filter 0.2s ease',
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
          <div style={{ width: 1, height: DOCK_HEIGHT - 20, background: 'rgba(0,0,0,0.2)', margin: '0 6px 6px', borderRadius: 1, flexShrink: 0 }} />
        )}
        <div
          ref={(el) => { if (el) iconRectsRef.current.set('trash', el.getBoundingClientRect()) }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}
          onClick={handleTrashClick}
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
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
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

      {/* Context menu */}
      {ctxMenu && ctxApp && (
        <div
          style={{
            position: 'fixed',
            left: ctxMenu.x,
            top: ctxMenu.y,
            zIndex: 99999,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '4px 0',
            minWidth: 180,
          }}
          onClick={() => setCtxMenu(null)}
        >
          <div style={{ padding: '4px 12px 6px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f' }}>{ctxApp.name}</span>
          </div>
          <button onClick={() => handleDockClick(ctxApp)}
            style={menuBtnStyle}>
            {state.windows.some(w => w.appId === ctxApp.id && !w.isMinimized) ? '🗕 Minimize' : '🗖 Open'}
          </button>
          <button onClick={() => toggleHidden(ctxApp.id)}
            style={{ ...menuBtnStyle, color: hiddenRef.current.includes(ctxApp.id) ? '#ff3b30' : '#1d1d1f' }}>
            {hiddenRef.current.includes(ctxApp.id) ? '👁️ Show in Dock' : '🚫 Hide from Dock'}
          </button>
        </div>
      )}
    </>
  )
}

const menuBtnStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '6px 12px', border: 'none', background: 'transparent',
  textAlign: 'left', fontSize: 12, color: '#1d1d1f', cursor: 'pointer',
}
