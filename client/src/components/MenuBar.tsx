import React, { useState, useRef, useCallback } from 'react'
import { useApp } from '../stores/app.store'
import type { AppDefinition, MenuItem } from '../types'

interface MenuBarProps {
  apps: AppDefinition[]
}

export default function MenuBar({ apps }: MenuBarProps) {
  const { state, dispatch } = useApp()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [ctrlMenuOpen, setCtrlMenuOpen] = useState(false)
  const [wallpaperPicker, setWallpaperPicker] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  // Refs to track each menu button's position
  const menuBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const setMenuBtnRef = useCallback((label: string, el: HTMLButtonElement | null) => {
    if (el) menuBtnRefs.current.set(label, el)
    else menuBtnRefs.current.delete(label)
  }, [])

  // Live clock
  const [tick, setTick] = useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateStr = new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })

  const activeApp = apps.find(a => a.id === state.menuBarActiveApp)
  const closeAllMenus = () => { setActiveMenu(null); setCtrlMenuOpen(false); setWallpaperPicker(false); setHelpOpen(false) }

  const openMenu = (menu: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveMenu(activeMenu === menu ? null : menu)
    setCtrlMenuOpen(false)
    setWallpaperPicker(false)
    setHelpOpen(false)
  }

  const WALLPAPERS = [
    { id: 'aurora', label: '极光', color: 'linear-gradient(135deg,#1a1a2e,#533483)' },
    { id: 'ocean', label: '海洋', color: 'linear-gradient(135deg,#0f2027,#2c5364)' },
    { id: 'sunset', label: '日落', color: 'linear-gradient(135deg,#c94b4b,#4b134f)' },
    { id: 'forest', label: '森林', color: 'linear-gradient(135deg,#134e5e,#71b28a)' },
    { id: 'dawn', label: '黎明', color: 'linear-gradient(135deg,#3a1c71,#ffaf7b)' },
    { id: 'midnight', label: '午夜', color: 'linear-gradient(160deg,#0d1117,#21262d)' },
    { id: 'lava', label: '熔岩', color: 'linear-gradient(135deg,#200122,#6f0000)' },
    { id: 'auroraLight', label: '淡极光', color: 'linear-gradient(135deg,#e0c3fc,#8ec5fc)' },
  ]

  const wifiBars = state.wifiOn
    ? <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM2.5 7.5c1.5-2 3.5-3 5.5-3s4 1 5.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M.5 5C3 2 5.5 1 8 1s5 1 7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    : <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ opacity: 0.4 }}><path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM2.5 7.5c1.5-2 3.5-3 5.5-3s4 1 5.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 2"/><path d="M.5 5C3 2 5.5 1 8 1s5 1 7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 2" opacity="0.3"/></svg>

  const isDivider = (item: MenuItem): item is { type: 'divider' } => 'type' in item && item.type === 'divider'

  // Build a default action handler that dispatches common operations
  const defaultAction = (item: MenuItem): (() => void) | undefined => {
    if (isDivider(item)) return undefined
    if (item.action) return item.action
    const label = item.label
    const sw = item.shortcut ?? ''
    const activeWin = state.windows.find((w: any) => w.id === state.activeWindowId)
    const onClose = () => { if (state.activeWindowId) dispatch({ type: 'CLOSE_WINDOW', id: state.activeWindowId }) }
    const onMinimize = () => { if (state.activeWindowId) dispatch({ type: 'MINIMIZE_WINDOW', id: state.activeWindowId }) }
    const onZoom = () => { if (state.activeWindowId) dispatch({ type: 'MAXIMIZE_WINDOW', id: state.activeWindowId }) }
    const onFocusAll = () => {
      const wins = state.windows.filter((w: any) => !w.isMinimized)
      if (wins.length > 1) {
        wins.forEach((w: any, i: number) => dispatch({ type: 'SET_Z_INDEX', id: w.id, zIndex: 100 + i }))
      }
    }
    const openFinder = () => {
      const f = apps.find(a => a.id === 'finder')
      if (f) dispatch({ type: 'OPEN_WINDOW', app: f })
    }
    const openSettings = () => {
      const s = apps.find(a => a.id === 'settings')
      if (s) dispatch({ type: 'OPEN_WINDOW', app: s })
    }
    if (label.includes('关闭') || label.includes('退出') || label === 'Quit') {
      if (label.includes('强制')) return undefined // handled in system menu
      if (sw.includes('Q') || label.includes('退出')) return closeAllMenus // quit app
      return onClose
    }
    if (label.includes('最小化')) return onMinimize
    if (label.includes('缩放') || label.includes('最大化')) return onZoom
    if (label.includes('前置全部')) return onFocusAll
    if (label.includes('新建') || label.includes('新窗口')) return openFinder
    if (label.includes('设置') || label.includes('偏好')) return openSettings
    if (label.includes('关于')) return () => {
      const a = apps.find(x => x.id === 'about')
      if (a) { dispatch({ type: 'OPEN_WINDOW', app: a }); closeAllMenus() }
    }
    if (label.includes('全屏') || label.includes('进入全屏')) return onZoom
    if (label.includes('帮助') || label.includes('键盘快捷键')) return () => setHelpOpen(true)
    if (label.includes('隐藏')) return closeAllMenus
    if (label.includes('复制')) return () => document.execCommand('copy')
    if (label.includes('剪切')) return () => document.execCommand('cut')
    if (label.includes('粘贴')) return () => document.execCommand('paste')
    if (label.includes('撤销')) return () => document.execCommand('undo')
    if (label.includes('重做')) return () => document.execCommand('redo')
    if (label.includes('全选')) return () => document.execCommand('selectAll')
    if (label.includes('查找')) return () => {}
    // Terminal-specific actions
    if (activeApp?.id === 'terminal') {
      if (label.includes('清屏')) return () => dispatch({ type: 'SET_TERMINAL_ACTION', action: 'clear' })
      if (label.includes('新建标签页') || label.includes('新建窗口')) {
        const t = apps.find(a => a.id === 'terminal')
        if (t) dispatch({ type: 'OPEN_WINDOW', app: t })
        return () => {}
      }
      if (label.includes('关闭标签页') || label.includes('关闭窗口')) return onClose
    }
    return undefined
  }

  return (
    <>
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 35,
          background: state.glassEnabled ? 'rgba(30,30,30,0.50)' : 'rgba(30,30,30,0.88)',
          backdropFilter: state.glassEnabled ? 'blur(32px) saturate(220%)' : 'blur(14px)',
          WebkitBackdropFilter: state.glassEnabled ? 'blur(32px) saturate(220%)' : 'blur(14px)',
          borderBottom: state.glassEnabled ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', zIndex: 10000,
          padding: '0 8px', fontSize: 13, color: '#fff',
        }}>
        {/* Apple logo → System menu */}
        <button onClick={() => { setCtrlMenuOpen(!ctrlMenuOpen); setActiveMenu(null); setWallpaperPicker(false); setHelpOpen(false) }} style={btnStyle}>
          <svg width="14" height="17" viewBox="0 0 170 170" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.61-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.268 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.004-7.08-9.119-15.29-12.35-24.65-3.471-10.11-5.211-19.9-5.211-29.38 0-10.867 2.346-20.223 7.045-28.04 3.687-6.303 8.601-11.275 14.756-14.92 6.145-3.63 12.805-5.47 19.964-5.52 3.912 0 9.048 1.21 15.422 3.61 6.364 2.41 10.45 3.62 12.24 3.62 1.346 0 5.886-1.4 13.592-4.2 7.262-2.62 13.396-3.71 18.414-3.27 13.609 1.1 23.822 6.46 30.632 16.12-12.18 7.39-18.22 17.78-18.12 31.17.09 10.41 3.89 19.07 11.39 25.96 3.39 3.17 7.19 5.63 11.41 7.39-.91 2.64-1.88 5.17-2.89 7.59zM119.11 7.24c0 8.22-3.01 15.9-8.99 23.02-7.08 8.42-15.66 13.27-24.77 12.49-11.12-.21 1.04-16.17 1.04-16.17 0-8.22 2.93-15.88 8.73-22.94 7.06-8.57 15.7-13.49 24.73-12.89 11.27.26-1.54 14.14 1.54 14.14h-7.28z"/>
          </svg>
        </button>

        {/* Active app name */}
        <button onClick={(e) => openMenu('app', e)} style={{ ...btnStyle, fontWeight: 600 }}>
          {activeApp?.name || '访达'}
        </button>

        {/* Dynamic app menus from activeApp.menus */}
        {activeApp?.menus?.map(menu => (
          <button
            key={menu.label}
            ref={el => setMenuBtnRef(menu.label, el)}
            onClick={(e) => openMenu(menu.label, e)}
            style={btnStyle}
          >{menu.label}</button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Status icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
          {/* WiFi */}
          <button onClick={() => dispatch({ type: 'SET_WIFI', on: !state.wifiOn })} style={{ ...btnStyle, padding: '0 3px' }} title={state.wifiOn ? 'Wi-Fi 已连接' : 'Wi-Fi 未连接'}>
            <span style={{ color: state.wifiOn ? '#fff' : '#666' }}>{wifiBars}</span>
          </button>

          {/* Battery */}
          <svg width="24" height="12" viewBox="0 0 28 14" fill="none" style={{ opacity: 0.9 }}>
            <rect x="0.5" y="0.5" width="23" height="13" rx="3" stroke="rgba(255,255,255,0.35)" />
            <rect x="2" y="2" width={Math.round(state.battery / 100 * 19)} height="10" rx="1.5" fill={state.battery > 50 ? '#34c759' : state.battery > 20 ? '#ff9500' : '#ff3b30'} />
            <rect x="24" y="4" width="2" height="6" rx="1" fill="rgba(255,255,255,0.35)" />
          </svg>

          <span style={{ fontSize: 12, opacity: 0.8 }}>{timeStr}</span>
          <span style={{ fontSize: 11, opacity: 0.55 }}>{dateStr}</span>
        </div>
      </div>

      {/* Apple system menu */}
      {ctrlMenuOpen && (
        <div style={{
          position: 'fixed', top: 35, left: 0, zIndex: 10001,
          width: 220, background: 'rgba(30,30,30,0.92)',
          backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 0 10px 10px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', padding: '4px 0',
          animation: 'dropEnter 0.15s ease-out',
        }} onClick={closeAllMenus}>
          <div style={{ padding: '5px 14px', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>系统</div>
          {[
            { label: '关于本机', action: () => { const a = apps.find(x => x.id === 'about'); if (a) dispatch({ type: 'OPEN_WINDOW', app: a }); setCtrlMenuOpen(false) }},
            { type: 'divider' as const },
            { label: state.wifiOn ? '📶 Wi-Fi：已连接' : '📴 Wi-Fi：已关闭', action: () => dispatch({ type: 'SET_WIFI', on: !state.wifiOn }) },
            { label: `🔋 电量：${state.battery}%`, action: () => {} },
            { type: 'divider' as const },
            { label: state.darkMode ? '☀️ 浅色模式' : '🌙 深色模式', action: () => dispatch({ type: 'TOGGLE_THEME' }) },
            { label: state.glassEnabled ? '🔮 玻璃效果：开' : '💎 玻璃效果：关', action: () => dispatch({ type: 'SET_GLASS', enabled: !state.glassEnabled }) },
            { type: 'divider' as const },
            { label: '壁纸…', action: () => { setWallpaperPicker(true); setCtrlMenuOpen(false) } },
            { type: 'divider' as const },
            { label: '强制退出…', action: () => {
              const ids = apps.map(a => a.id)
              ids.forEach(id => { if (id !== 'finder' && id !== 'settings' && id !== 'about') {
                state.windows.filter((w: any) => w.appId === id).forEach((w: any) => dispatch({ type: 'CLOSE_WINDOW', id: w.id }))
              }})
              setCtrlMenuOpen(false)
            }},
          ].map((item, i) => item.type === 'divider'
            ? <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '3px 0' }} />
            : <button key={i} onClick={item.action} style={{ ...menuBtnStyle, animation: `menuStagger 0.1s ease-out ${i * 0.03}s both` }}>{item.label}</button>
          )}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '3px 0' }} />
          <button onClick={() => { localStorage.clear(); location.reload() }} style={{ ...menuBtnStyle, color: '#ff6b6b' }}>重新启动系统…</button>
        </div>
      )}

      {/* Wallpaper picker submenu */}
      {wallpaperPicker && (
        <div style={{
          position: 'fixed', top: 35, left: 220, zIndex: 10001,
          width: 280, background: 'rgba(30,30,30,0.94)',
          backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', padding: 12,
          animation: 'dropEnter 0.15s ease-out',
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>壁纸</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {WALLPAPERS.map((wp, i) => (
              <button key={wp.id} onClick={() => { dispatch({ type: 'SET_WALLPAPER', wallpaper: wp.id }); setWallpaperPicker(false) }}
                style={{
                  background: wp.color, borderRadius: 8, height: 56, border: state.wallpaper === wp.id ? '2px solid #007aff' : '2px solid transparent',
                  cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s',
                  animation: `menuStagger 0.12s ease-out ${i * 0.04}s both`,
                }}
                onMouseEnter={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'}}
                onMouseLeave={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}}
              >
                {state.wallpaper === wp.id && <div style={{ position: 'absolute', bottom: 3, right: 4, fontSize: 10, color: '#fff', animation: 'saveCheck 0.3s ease-out' }}>✓</div>}
                <div style={{ position: 'absolute', bottom: 3, left: 4, fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>{wp.label}</div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <input id="custom-wp-url" placeholder="自定义图片 URL…"
              style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 11, outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => {(e.target as HTMLInputElement).style.borderColor = 'rgba(0,122,255,0.6)'}}
              onBlur={e => {(e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.15)'}}
            />
            <button onClick={() => {
              const url = (document.getElementById('custom-wp-url') as HTMLInputElement)?.value.trim()
              if (url) { dispatch({ type: 'SET_WALLPAPER', wallpaper: `url(${url})` }); setWallpaperPicker(false) }
            }} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#007aff', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600, transition: 'transform 0.12s cubic-bezier(0.34,1.56,0.64,1), background 0.15s', animation: 'menuStagger 0.12s ease-out 0.28s both' }}
              onMouseEnter={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'}}
              onMouseLeave={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}}
              onMouseDown={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'}}
              onMouseUp={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'}}
            >应用</button>
          </div>
        </div>
      )}

      {/* Dynamic app menu dropdown */}
      {activeMenu && activeMenu !== 'app' && (() => {
        const menuDef = activeApp?.menus?.find(m => m.label === activeMenu)
        if (!menuDef) return null
        const btn = menuBtnRefs.current.get(activeMenu)
        const rect = btn?.getBoundingClientRect()
        const left = rect ? rect.left : 68
        return (
          <div style={{
            position: 'fixed', top: 35, left, zIndex: 10001,
            minWidth: 200, background: 'rgba(30,30,30,0.92)',
            backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '4px 0',
            animation: 'dropEnter 0.15s ease-out',
          }} onClick={closeAllMenus}>
            {menuDef.items.map((item, i) => {
              const action = defaultAction(item)
              if (isDivider(item)) return <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '3px 0' }} />
              if (!action) return null
              return <button key={i} onClick={() => { action(); closeAllMenus() }} style={{ ...menuBtnStyle, animation: `menuStagger 0.1s ease-out ${i * 0.03}s both` }}>
                      {item.label}
                      {item.shortcut ? <span style={{ float: 'right', opacity: 0.4, fontSize: 11 }}>{item.shortcut}</span> : ''}
                    </button>
            })}
          </div>
        )
      })()}

      {/* Help menu overlay */}
      {helpOpen && (
        <div style={{
          position: 'fixed', top: 35, left: 240, zIndex: 10001, width: 420,
          background: 'rgba(30,30,30,0.94)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', padding: 0, overflow: 'hidden',
          animation: 'dropEnter 0.2s ease-out',
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <img src="/icons/apple-logo.svg" alt="" style={{ width: 36, height: 44, objectFit: 'contain', flexShrink: 0, filter: 'brightness(0) invert(1)' }}/>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>mac-sim-os</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Version 1.0.0 · 浏览器端 macOS 模拟器</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 16 }}>
              mac-sim-os 是一款在浏览器中运行的 macOS 模拟器，使用 React + TypeScript + IndexedDB 构建。
              所有数据存储在本地，无需服务器，支持文件系统、终端命令、多窗口管理等功能。
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontWeight: 600 }}>作者</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>W</div>
              <div>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>WLY790515</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>全栈开发者 · 开源爱好者</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontWeight: 600 }}>技术栈</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {['React', 'TypeScript', 'IndexedDB', 'Vite', 'localStorage'].map(t => (
                <span key={t} style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontWeight: 600 }}>快捷键</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 2 }}>
              <div><span style={{ opacity: 0.4 }}>⌘N</span> 新建窗口　　<span style={{ opacity: 0.4 }}>⌘W</span> 关闭窗口</div>
              <div><span style={{ opacity: 0.4 }}>⌘Z</span> 撤销　　<span style={{ opacity: 0.4 }}>⇧⌘Z</span> 重做</div>
              <div><span style={{ opacity: 0.4 }}>⌘M</span> 最小化　　<span style={{ opacity: 0.4 }}>⌘`</span> 全部前置</div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>© 2025 WLY790515 · 本项目仅供学习研究使用</div>
          </div>
        </div>
      )}

      {ctrlMenuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }} onClick={closeAllMenus} />}
      {activeMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }} onClick={closeAllMenus} />}
      {helpOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }} onClick={() => setHelpOpen(false)} />}
    </>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'default',
  color: '#fff', padding: '2px 8px', borderRadius: 4,
  fontSize: 13, display: 'flex', alignItems: 'center', gap: 4,
}

const menuBtnStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '4px 14px', border: 'none',
  background: 'transparent', textAlign: 'left', fontSize: 13, color: '#fff',
  cursor: 'default', borderRadius: 4, transition: 'background 0.1s ease',
}
