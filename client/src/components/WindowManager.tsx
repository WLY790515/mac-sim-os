import React, { useCallback, useState, useMemo } from 'react'
import Window from './Window'
import { useApp } from '../stores/app.store'
import { useAppRegistry } from '../contexts/AppRegistry.context'
import { iconRectsRef } from './iconRefs'
import MissionControl from './MissionControl'

export default function WindowManager() {
  const { state, dispatch } = useApp()
  const { apps } = useAppRegistry()
  const { windows, activeWindowId } = state
  const [missionControlOpen, setMissionControlOpen] = useState(false)

  const focusHandler = useCallback((id: string) => () => {
    dispatch({ type: 'FOCUS_WINDOW', id })
  }, [dispatch])

  const closeHandler = useCallback((id: string) => () => {
    dispatch({ type: 'CLOSE_WINDOW', id })
  }, [dispatch])

  const minimizeHandler = useCallback((id: string) => () => {
    dispatch({ type: 'MINIMIZE_WINDOW', id })
  }, [dispatch])

  const maximizeHandler = useCallback((id: string) => () => {
    dispatch({ type: 'MAXIMIZE_WINDOW', id })
  }, [dispatch])

  const moveHandler = useCallback((id: string) => (x: number, y: number) => {
    dispatch({ type: 'UPDATE_WINDOW', id, updates: { x, y } })
  }, [dispatch])

  const resizeHandler = useCallback((id: string) => (width: number, height: number) => {
    dispatch({ type: 'UPDATE_WINDOW', id, updates: { width, height } })
  }, [dispatch])

  const snapHandler = useCallback((id: string) => (side: string) => {
    dispatch({ type: 'SNAP_WINDOW', id, side })
  }, [dispatch])

  const getDockIconRect = useCallback((appId: string) => {
    return iconRectsRef.current.get(appId) ?? null
  }, [])

  const mcWindows = useMemo(() =>
    windows.filter(w => !w.isMinimized).map(win => {
      const app = apps.find(a => a.id === win.appId)
      return {
        id: win.id,
        appId: win.appId,
        title: app?.name || win.appId,
        appIcon: app?.icon || '📱',
        x: win.x, y: win.y,
        width: win.width, height: win.height,
      }
    }),
    [windows, apps]
  )

  if (windows.length === 0 && !missionControlOpen) return null

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {windows
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(win => {
            const app = apps.find(a => a.id === win.appId)
            if (!app) return null
            return (
              <Window
                key={win.appId}
                window={win}
                isActive={win.id === activeWindowId}
                appId={win.appId}
                component={app.component}
                onFocus={focusHandler(win.id)}
                onClose={closeHandler(win.id)}
                onMinimize={minimizeHandler(win.id)}
                onMaximize={maximizeHandler(win.id)}
                onMove={moveHandler(win.id)}
                onResize={resizeHandler(win.id)}
                onSnap={snapHandler(win.id)}
                getDockIconRect={() => getDockIconRect(win.appId)}
              />
            )
          })}
      </div>

      {/* Mission Control button */}
      <button
        onClick={() => setMissionControlOpen(true)}
        style={{
          position: 'fixed', top: 8, right: 8, zIndex: 9000,
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Mission Control (F9)"
      >
        ⊞
      </button>

      {missionControlOpen && mcWindows.length > 0 && (
        <MissionControl
          windows={mcWindows}
          onWindowClick={(id) => {
            dispatch({ type: 'FOCUS_WINDOW', id })
            setMissionControlOpen(false)
          }}
          onCloseWindow={(id) => {
            dispatch({ type: 'CLOSE_WINDOW', id })
            setMissionControlOpen(false)
          }}
          onDismiss={() => setMissionControlOpen(false)}
        />
      )}
    </>
  )
}
