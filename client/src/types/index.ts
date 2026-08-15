export interface WindowState {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  wasPosition?: { x: number; y: number; width: number; height: number }
}

export interface AppDefinition {
  id: string
  name: string
  icon: string
  defaultSize?: { width: number; height: number }
  defaultPosition?: { x: number; y: number }
  component: React.ComponentType<any>
}

export interface DesktopFile {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  modifiedAt?: Date
  extension?: string
  children?: DesktopFile[]
  parentId?: string
  content?: string
}

export interface DockItem {
  id: string
  name: string
  icon: string
  isOpen: boolean
  isRunning: boolean
}

export interface MenuBarState {
  currentTime: Date
  wifi: boolean
  bluetooth: boolean
  battery: number
  volume: number
  spotlightOpen: boolean
  notificationCenterOpen: boolean
  controlCenterOpen: boolean
}

export type ThemeMode = 'light' | 'dark'
