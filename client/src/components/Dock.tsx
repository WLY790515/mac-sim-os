import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useApp } from '../stores/app.store'
import { useAppRegistry } from '../contexts/AppRegistry.context'
import type { AppDefinition, WindowState } from '../types'

interface DockProps {
  apps: AppDefinition[]
}

const DOCK_HEIGHT = 72
const BASE_ICON_SIZE = 44
const MAX_SCALE = 1.8
const MAGNIFICATION_RANGE = 120
const TRANSITION_MS = 120

export default function Dock({ apps }: DockProps) {
  const { state, dispatch } = useApp()
  const [mouseX, setMouseX] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const iconCenters = useRef<number[]>([])

  const measureIcons = useCallback(() => {
    const centers: number[] = []
    const container = containerRef.current
    if (!container) return centers
    const containerRect = container.getBoundingClientRect()
    apps.forEach((app) => {
      const el = iconRefs.current.get(app.id)
      if (el) {
        const r = el.getBoundingClientRect()
        centers.push(r.left + r.width / 2 - containerRect.left)
      } else {
        centers.push(-1)
      }
    })
    const trashEl = iconRefs.current.get('trash')
    if (trashEl) {
      const tr = trashEl.getBoundingClientRect()
      centers.push(tr.left + tr.width / 2 - containerRect.left)
    } else {
      centers.push(-1)
    }
    iconCenters.current = centers
  }, [apps])

  useEffect(() => {
    measureIcons()
    window.addEventListener('resize', measureIcons)
    const t = setTimeout(measureIcons, 200)
    return () => {
      window.removeEventListener('resize', measureIcons)
      clearTimeout(t)
    }
  }, [measureIcons])

  const getScale = useCallback((iconIndex: number): number => {
    if (mouseX === null || iconCenters.current.length === 0) return 1
    const centerX = iconCenters.current[iconIndex]
    if (centerX < 0) return 1
    const distance = Math.abs(mouseX - centerX)
    if (distance > MAGNIFICATION_RANGE) return 1
    const gauss = Math.exp(-(distance * distance) / (2 * (MAGNIFICATION_RANGE * 0.38) ** 2))
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
  }, [])

  const isOpen = useCallback((appId: string) => {
    return state.windows.some((w: WindowState) => w.appId === appId && !w.isMinimized)
  }, [state.windows])

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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        height: DOCK_HEIGHT,
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 1,
        zIndex: 9998,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: '6px 3px 4px',
      }}
    >
      {apps.map((app, index) => {
        const scale = getScale(index)
        const isMagnified = scale > 1.05
        return (
          <div
            key={app.id}
            ref={(el) => { if (el) iconRefs.current.set(app.id, el) }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <button
              onClick={() => handleDockClick(app)}
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
                borderRadius: 10,
                display: 'block',
                filter: isMagnified
                  ? 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))'
                  : 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))',
                transition: 'filter 0.2s ease',
              }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  img.style.display = 'none'
                  const parent = img.parentElement
                  if (parent) parent.innerHTML = `<div style="width:${BASE_ICON_SIZE}px;height:${BASE_ICON_SIZE}px;border-radius:10px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:white;font-size:20px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${app.name[0]}</div>`
                }}
              />
            </button>
          </div>
        )
      })}
      <div style={{ width: 1, height: DOCK_HEIGHT - 20, background: 'rgba(0,0,0,0.15)', margin: '0 4px 4px', borderRadius: 1, flexShrink: 0 }} />
      <div
        ref={(el) => { if (el) iconRefs.current.set('trash', el) }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{
          transform: `scale(${getScale(apps.length)})`,
          transformOrigin: 'bottom center',
          transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
          cursor: 'pointer',
        }}>
          <img src="/icons/trash.png" alt="Trash" style={{
            width: BASE_ICON_SIZE,
            height: BASE_ICON_SIZE,
            borderRadius: 10,
            display: 'block',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))',
          }} />
        </div>
      </div>
    </div>
  )
}
