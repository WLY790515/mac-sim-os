/**
 * mac-sim-os Plugin SDK
 *
 * 插件开发者通过此模块获取类型提示，构建产物不包含此文件。
 * 安装方式：npm install @macsimos/plugin-sdk --save-dev
 */

// ─── 系统状态类型（与主仓库 types/index.ts 保持一致）────────────────────────

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

export type ThemeMode = 'light' | 'dark'

export interface State {
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
  terminalAction: string | null
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

// ─── 文件系统接口（fs 权限）───────────────────────────────────────────────

export interface TerminalFS {
  init(): Promise<void>
  getAll(): Promise<any[]>
  getChildren(parentId: string): Promise<any[]>
  get(id: string): Promise<any | undefined>
  create(item: any): Promise<any>
  update(id: string, patch: any): Promise<void>
  remove(id: string): Promise<void>
  move(id: string, newParentId: string): Promise<void>
  search(query: string): Promise<any[]>
  readFile(id: string): Promise<string | null>
  writeFile(id: string, content: string): Promise<void>
  addFileToFolder(parentId: string, name: string, content?: string): Promise<any>
  addFolder(parentId: string, name: string): Promise<any>
  formatSize(bytes: number): string
  formatDate(ts: number): string
}

// ─── 持久化存储接口（storage 权限）────────────────────────────────────────

export interface PluginStorage {
  get<T = unknown>(key: string): Promise<T | null>
  set<T = unknown>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

// ─── 剪贴板接口（clipboard 权限）──────────────────────────────────────────

export interface ClipboardAPI {
  read(): Promise<string>
  write(text: string): Promise<void>
}

// ─── 通知接口 ────────────────────────────────────────────────────────────

export type NotifyType = 'info' | 'success' | 'error'

export interface NotifyFn {
  (message: string, type?: NotifyType): void
}

// ─── 插件运行时接口 ──────────────────────────────────────────────────────

export interface PluginRuntime {
  /**  dispatch 系统 action（打开/关闭窗口等） */
  dispatch: (action: AppAction) => void
  /** 当前系统状态快照 */
  state: State
  /** 虚拟文件系统（需 'fs' 权限） */
  fs: TerminalFS | undefined
  /** 插件命名空间存储（需 'storage' 权限） */
  storage: PluginStorage | undefined
  /** 剪贴板（需 'clipboard' 权限） */
  clipboard: ClipboardAPI | undefined
  /** 网络请求（需 'network' 权限） */
  fetch: typeof window.fetch | undefined
  /** 系统通知 */
  notify: NotifyFn
}

// ─── 插件组件 Props ──────────────────────────────────────────────────────

export interface PluginProps {
  runtime: PluginRuntime
}

// ─── Action 类型（精简版，供 dispatch 使用）─────────────────────────────

export type AppAction =
  | { type: 'OPEN_WINDOW'; app: AppDefinition }
  | { type: 'CLOSE_WINDOW'; id: string }
  | { type: 'MINIMIZE_WINDOW'; id: string }
  | { type: 'MAXIMIZE_WINDOW'; id: string }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'SET_THEME'; theme: ThemeMode }
  | { type: 'SET_WALLPAPER'; wallpaper: string }
  | { type: 'TOGGLE_TRASH' }
  | { type: 'SET_TERMINAL_ACTION'; action: string | null }

export interface AppDefinition {
  id: string
  name: string
  icon: string
  defaultSize?: { width: number; height: number }
  defaultPosition?: { x: number; y: number }
  component: React.ComponentType<PluginProps>
  menus?: AppMenu[]
}

export type MenuItem =
  | { label: string; shortcut?: string; action?: () => void; divider?: boolean; submenu?: MenuItem[] }
  | { type: 'divider' }

export interface AppMenu {
  label: string
  items: MenuItem[]
}

// ─── 插件 Manifest 类型 ──────────────────────────────────────────────────

export interface PluginManifest {
  /** 唯一标识，小写英文 + 连字符 */
  id: string
  /** 显示名称 */
  name: string
  /** 图标 URL（PNG/SVG，建议 128×128） */
  icon: string
  /** 打包后 ESM 文件 URL */
  component: string
  /** 窗口默认尺寸 */
  defaultSize?: { width: number; height: number }
  /** 窗口默认位置 */
  defaultPosition?: { x: number; y: number }
  /** 菜单栏配置 */
  menus?: AppMenu[]
  /** semver 版本 */
  version?: string
  /** 作者 */
  author?: string
  /** 开源协议 */
  license?: string
  /** 插件描述 */
  description?: string
  /** 声明的系统权限 */
  permissions?: ('fs' | 'storage' | 'clipboard' | 'network')[]
  /** 依赖的其他插件 id */
  dependencies?: string[]
}

// ─── 应用商店插件条目（registry.json）────────────────────────────────────

export interface PluginRegistryEntry {
  /** 插件 id */
  id: string
  /** GitHub 仓库名（不含 owner），如 mac-sim-os-plugin-my-plugin */
  repo: string
  /** 分支名 */
  branch: string
  /** 添加日期 */
  addedAt: string
}

// ─── 全局运行时注入（开发时使用，生产环境由系统注入）──────────────────────

declare global {
  interface Window {
    __pluginRuntime__?: PluginRuntime
  }
}

// ─── 开发辅助：从 window 获取 runtime（仅开发阶段）───────────────────────

export function getDevRuntime(): PluginRuntime | undefined {
  return typeof window !== 'undefined' ? window.__pluginRuntime__ : undefined
}
