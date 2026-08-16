import { useEffect } from 'react'
import { useApp } from '../stores/app.store'

export default function KeyboardShortcuts() {
  const { state, dispatch } = useApp()

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs (except Cmd combos)
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const meta = e.metaKey || e.ctrlKey
      if (!meta) return

      switch (e.key.toLowerCase()) {
        case 'w': {
          const id = state.activeWindowId
          if (id) dispatch({ type: 'CLOSE_WINDOW', id })
          e.preventDefault()
          break
        }
        case 'm': {
          const id = state.activeWindowId
          if (id) dispatch({ type: 'MINIMIZE_WINDOW', id })
          e.preventDefault()
          break
        }
        case 'q': {
          const activeAppId = state.windows.find(w => w.id === state.activeWindowId)?.appId
          if (activeAppId) {
            state.windows.filter(w => w.appId === activeAppId).forEach(w => {
              dispatch({ type: 'CLOSE_WINDOW', id: w.id })
            })
          } else {
            state.windows.forEach(w => dispatch({ type: 'CLOSE_WINDOW', id: w.id }))
          }
          e.preventDefault()
          break
        }
        case 'd': {
          dispatch({ type: 'FOCUS_WINDOW', id: '__desktop__' })
          e.preventDefault()
          break
        }
        case 'f': {
          const id = state.activeWindowId
          if (id) dispatch({ type: 'SNAP_WINDOW', id, side: 'fullscreen' })
          e.preventDefault()
          break
        }
        case 'arrowleft': {
          const id = state.activeWindowId
          if (id) dispatch({ type: 'SNAP_WINDOW', id, side: 'left' })
          e.preventDefault()
          break
        }
        case 'arrowright': {
          const id = state.activeWindowId
          if (id) dispatch({ type: 'SNAP_WINDOW', id, side: 'right' })
          e.preventDefault()
          break
        }
        case 'arrowup': {
          const id = state.activeWindowId
          if (id) dispatch({ type: 'SNAP_WINDOW', id, side: 'top' })
          e.preventDefault()
          break
        }
        case 'arrowdown': {
          const id = state.activeWindowId
          if (id) dispatch({ type: 'SNAP_WINDOW', id, side: 'bottom' })
          e.preventDefault()
          break
        }
      }
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [state, dispatch])

  return null
}
