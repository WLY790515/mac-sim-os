import React, { useCallback } from 'react'
import Window from './Window'
import { useApp } from '../stores/app.store'
import { useAppRegistry } from '../contexts/AppRegistry.context'
import { iconRectsRef } from './iconRefs'

export default function WindowManager() {
  const { state, dispatch } = useApp()
  const { apps } = useAppRegistry()
  const { windows, activeWindowId } = state

  // Hooks must be called unconditionally at the top level
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

  const getDockIconRect = useCallback((appId: string) => {
    return iconRectsRef.current.get(appId) ?? null
  }, [])

  if (windows.length === 0) return null

  return (
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
              getDockIconRect={() => getDockIconRect(win.appId)}
            />
          )
        })}
    </div>
  )
}
