import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import type { WindowState, AppDefinition, DesktopFile, ThemeMode } from '../types'

interface Action {
  type: string
  [key: string]: any
}

interface State {
  windows: WindowState[]
  activeWindowId: string | null
  desktopFiles: DesktopFile[]
  theme: ThemeMode
  menuBarActiveApp: string | null
  wallpaper: string
}

let zCounter = 100

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const existing = state.windows.find((w: WindowState) => w.appId === action.app.id && !w.isMinimized)
      if (existing) return { ...state, activeWindowId: existing.id }
      const app = action.app
      const defSize = app.defaultSize || { width: 800, height: 520 }
      const w = window.innerWidth
      const h = window.innerHeight
      const defPos = app.defaultPosition || { x: Math.max(40, (w - defSize.width) / 2 + state.windows.length * 28), y: Math.max(50, (h - defSize.height) / 2 + state.windows.length * 28) }
      const newZ = ++zCounter
      const id = `win-${Date.now()}-${Math.random().toString(36).slice(2)}`
      return {
        ...state,
        windows: [...state.windows, {
          id, appId: app.id, title: app.name,
          x: defPos.x, y: defPos.y, width: defSize.width, height: defSize.height,
          isMinimized: false, isMaximized: false, zIndex: newZ,
        }],
        activeWindowId: id,
      }
    }
    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter((w: WindowState) => w.id !== action.id),
        activeWindowId: state.activeWindowId === action.id ? (state.windows.find((w: WindowState) => w.id !== action.id)?.id ?? null) : state.activeWindowId,
      }
    case 'FOCUS_WINDOW': {
      const newZ = ++zCounter
      return {
        ...state,
        windows: state.windows.map((w: WindowState) => w.id === action.id ? { ...w, zIndex: newZ } : w),
        activeWindowId: action.id,
      }
    }
    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w: WindowState) => w.id === action.id ? { ...w, isMinimized: true } : w),
        activeWindowId: state.activeWindowId === action.id ? null : state.activeWindowId,
      }
    case 'MAXIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w: WindowState) => {
          if (w.id !== action.id) return w
          if (w.isMaximized) {
            return { ...w, isMaximized: false, x: w.wasPosition?.x ?? w.x, y: w.wasPosition?.y ?? w.y, width: w.wasPosition?.width ?? w.width, height: w.wasPosition?.height ?? w.height }
          }
          return { ...w, isMaximized: true, wasPosition: { x: w.x, y: w.y, width: w.width, height: w.height }, x: 0, y: 25, width: window.innerWidth, height: window.innerHeight - 25 - 80 }
        }),
      }
    case 'UPDATE_WINDOW':
      return { ...state, windows: state.windows.map((w: WindowState) => w.id === action.id ? { ...w, ...action.updates } : w) }
    case 'SET_FILES': return { ...state, desktopFiles: action.files }
    case 'TOGGLE_THEME': return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' }
    case 'SET_THEME': return { ...state, theme: action.theme }
    case 'SET_MENU_BAR_APP': return { ...state, menuBarActiveApp: action.appId }
    default: return state
  }
}

const initState: State = { windows: [], activeWindowId: null, desktopFiles: [], theme: 'light', menuBarActiveApp: null, wallpaper: 'aurora' }

const AppContext = createContext<{ state: State; dispatch: React.Dispatch<Action> }>({ state: initState, dispatch: () => {} })

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
