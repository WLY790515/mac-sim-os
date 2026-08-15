import React, { useState, useRef, useCallback } from 'react'
import { useApp } from '../stores/app.store'
import { useAppRegistry } from '../contexts/AppRegistry.context'
import type { AppDefinition } from '../types'

interface DesktopIconsProps {
  apps: AppDefinition[]
}

const DRAG_THRESHOLD = 4

export default function DesktopIcons({ apps }: DesktopIconsProps) {
  const { dispatch } = useApp()
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragData = useRef({
    startX: 0, startY: 0, origX: 0, origY: 0,
    moved: false, appId: null as string | null,
  })
  const iconRefs = useRef<Record<string, HTMLDivElement>>({})

  const getColumn = (i: number) => Math.floor(i / 8)
  const getRow = (i: number) => i % 8

  const getDefaultPosition = (index: number) => {
    const col = getColumn(index)
    const row = getRow(index)
    const startX = window.innerWidth - 80 - col * 80
    const startY = 60 + row * 80
    return { x: startX, y: startY }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent, app: AppDefinition) => {
    e.preventDefault()
    const id = app.id
    const idx = apps.indexOf(app)
    const currentPos = positions[id] || getDefaultPosition(idx)
    dragData.current = {
      startX: e.clientX, startY: e.clientY,
      origX: currentPos.x, origY: currentPos.y,
      moved: false, appId: id,
    }
    setDraggingId(id)
  }, [positions, apps])

  React.useEffect(() => {
    if (!draggingId) return
    const data = dragData.current

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - data.startX
      const dy = e.clientY - data.startY
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        data.moved = true
      }
      setPositions(prev => ({
        ...prev,
        [data.appId!]: {
          x: data.origX + dx,
          y: Math.max(40, data.origY + dy),
        },
      }))
    }

    const handleMouseUp = () => {
      // If not dragged, treat as click — open the app
      if (!data.moved && data.appId) {
        const app = apps.find(a => a.id === data.appId)
        if (app) dispatch({ type: 'OPEN_WINDOW', app })
      }
      setDraggingId(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingId, apps, dispatch])

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 96,
      zIndex: 1, pointerEvents: 'none',
    }}>
      {apps.map((app, index) => {
        const pos = positions[app.id] || getDefaultPosition(index)
        return (
          <div
            key={app.id}
            ref={el => { if (el) { iconRefs.current[app.id] = el; el.setAttribute('data-grid-pos', `${getColumn(index)},${getRow(index)}`); } }}
            onMouseDown={e => handleMouseDown(e, app)}
            style={{
              position: 'absolute',
              left: pos.x, top: pos.y,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 8px', borderRadius: 8,
              cursor: draggingId === app.id ? 'grabbing' : 'grab',
              pointerEvents: 'auto',
              transition: draggingId === app.id ? 'none' : 'left 0.2s ease, top 0.2s ease',
              userSelect: 'none',
              opacity: draggingId && draggingId !== app.id ? 0.4 : 1,
            }}
          >
            <img
              src={app.icon} alt={app.name}
              style={{
                width: 52, height: 52, borderRadius: 12,
                display: 'block', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                pointerEvents: 'none',
              }}
              onError={(e) => {
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
                const parent = img.parentElement
                if (parent) parent.innerHTML = `<div style="width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.3);pointer-events:none">${app.name[0]}</div>`
              }}
            />
            <span style={{
              fontSize: 11, color: '#fff', textAlign: 'center',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)', lineHeight: 1.2,
              maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}>{app.name}</span>
          </div>
        )
      })}
    </div>
  )
}
