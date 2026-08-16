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
  glassEnabled: boolean
  wifiOn: boolean
  battery: number
  darkMode: boolean
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
    case 'SNAP_WINDOW': {
      const { id, side } = action
      const W = window.innerWidth, H = window.innerHeight
      const SNAP = 10
      const was = state.windows.find((w: WindowState) => w.id === id)
      if (!was || was.isMaximized) return state
      let x = was.x, y = was.y, w = was.width, h = was.height
      const snap = (threshold: number) => (val: number) => val < threshold
      switch (side) {
        case 'left':   x = 0;            w = W / 2; break
        case 'right':  x = W / 2;        w = W / 2; break
        case 'top':    y = 25;           h = (H - 25 - 80) / 2; break
        case 'bottom': y = 25 + (H - 25 - 80) / 2; h = (H - 25 - 80) / 2; break
        case 'fullscreen':
          x = 0; y = 25; w = W; h = H - 25 - 80; break
      }
      return {
        ...state,
        windows: state.windows.map((win: WindowState) =>
          win.id === id
            ? { ...win, x, y, width: w, height: h, wasPosition: { x: was.x, y: was.y, width: was.width, height: was.height }, isMaximized: false }
            : win,
        ),
      }
    }
    case 'SET_FILES': return { ...state, desktopFiles: action.files }
    case 'TOGGLE_THEME': return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' }
    case 'SET_THEME': return { ...state, theme: action.theme }
    case 'SET_WALLPAPER': return { ...state, wallpaper: action.wallpaper }
    case 'SET_GLASS': return { ...state, glassEnabled: action.enabled }
    case 'SET_WIFI': return { ...state, wifiOn: action.on }
    case 'SET_BATTERY': return { ...state, battery: action.level }
    case 'SET_DARK_MODE': return { ...state, darkMode: action.on }
    case 'SET_MENU_BAR_APP': return { ...state, menuBarActiveApp: action.appId }
    default: return state
  }
}

const initState: State = { windows: [], activeWindowId: null, desktopFiles: [], theme: 'light', menuBarActiveApp: null, wallpaper: 'aurora', glassEnabled: true, wifiOn: true, battery: 87, darkMode: true }

const AppContext = createContext<{ state: State; dispatch: React.Dispatch<Action> }>({ state: initState, dispatch: () => {} })

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
