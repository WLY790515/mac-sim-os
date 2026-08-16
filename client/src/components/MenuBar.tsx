import React, { useState, useMemo } from 'react'
import { useApp } from '../stores/app.store'

interface MenuBarProps {
  apps: Array<{ id: string; name: string; icon: string }>
}

export default function MenuBar({ apps }: MenuBarProps) {
  const { state, dispatch } = useApp()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [ctrlMenuOpen, setCtrlMenuOpen] = useState(false)
  const [wallpaperPicker, setWallpaperPicker] = useState(false)

  // Live clock
  const [tick, setTick] = useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const activeApp = apps.find(a => a.id === state.menuBarActiveApp)
  const closeAllMenus = () => { setActiveMenu(null); setCtrlMenuOpen(false); setWallpaperPicker(false) }

  const openMenu = (menu: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveMenu(activeMenu === menu ? null : menu)
    setCtrlMenuOpen(false)
    setWallpaperPicker(false)
  }

  const WALLPAPERS = [
    { id: 'aurora', label: 'Aurora', color: 'linear-gradient(135deg,#1a1a2e,#533483)' },
    { id: 'ocean', label: 'Ocean', color: 'linear-gradient(135deg,#0f2027,#2c5364)' },
    { id: 'sunset', label: 'Sunset', color: 'linear-gradient(135deg,#c94b4b,#4b134f)' },
    { id: 'forest', label: 'Forest', color: 'linear-gradient(135deg,#134e5e,#71b28a)' },
    { id: 'dawn', label: 'Dawn', color: 'linear-gradient(135deg,#3a1c71,#ffaf7b)' },
    { id: 'midnight', label: 'Midnight', color: 'linear-gradient(160deg,#0d1117,#21262d)' },
    { id: 'lava', label: 'Lava', color: 'linear-gradient(135deg,#200122,#6f0000)' },
    { id: 'auroraLight', label: 'Light Aurora', color: 'linear-gradient(135deg,#e0c3fc,#8ec5fc)' },
  ]

  const wifiBars = state.wifiOn
    ? <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM2.5 7.5c1.5-2 3.5-3 5.5-3s4 1 5.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M.5 5C3 2 5.5 1 8 1s5 1 7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
    : <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ opacity: 0.4 }}><path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM2.5 7.5c1.5-2 3.5-3 5.5-3s4 1 5.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 2"/><path d="M.5 5C3 2 5.5 1 8 1s5 1 7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 2" opacity="0.3"/></svg>

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
        <button onClick={() => { setCtrlMenuOpen(!ctrlMenuOpen); setActiveMenu(null); setWallpaperPicker(false) }} style={btnStyle}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>🍎</span>
        </button>

        {/* Active app name */}
        <button onClick={(e) => openMenu('app', e)} style={{ ...btnStyle, fontWeight: 600 }}>
          {activeApp?.name || 'Finder'}
        </button>

        {/* App menus */}
        {['文件', '编辑', '视图', '前往', '窗口', '帮助'].map(item => (
          <button key={item} onClick={(e) => openMenu(item, e)} style={btnStyle}>{item}</button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Status icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
          {/* WiFi */}
          <button onClick={() => dispatch({ type: 'SET_WIFI', on: !state.wifiOn })} style={{ ...btnStyle, padding: '0 3px' }} title={state.wifiOn ? 'Wi-Fi On' : 'Wi-Fi Off'}>
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
          width: 210, background: 'rgba(30,30,30,0.92)',
          backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 0 10px 10px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', padding: '4px 0',
        }} onClick={closeAllMenus}>
          <div style={{ padding: '5px 14px', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>System</div>
          {[
            { label: 'About This Mac', action: () => { const a = apps.find(x => x.id === 'about'); if (a) dispatch({ type: 'OPEN_WINDOW', app: a }); setCtrlMenuOpen(false) }},
            { type: 'divider' as const },
            { label: state.wifiOn ? '📶 Wi-Fi: Connected' : '📴 Wi-Fi: Off', action: () => dispatch({ type: 'SET_WIFI', on: !state.wifiOn }) },
            { label: `🔋 Battery: ${state.battery}%`, action: () => {} },
            { type: 'divider' as const },
            { label: state.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode', action: () => dispatch({ type: 'TOGGLE_THEME' }) },
            { label: state.glassEnabled ? '🔮 Glass: On' : '💎 Glass: Off', action: () => dispatch({ type: 'SET_GLASS', enabled: !state.glassEnabled }) },
            { type: 'divider' as const },
            { label: 'Wallpapers…', action: () => { setWallpaperPicker(true); setCtrlMenuOpen(false) } },
          ].map((item, i) => item.type === 'divider'
            ? <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '3px 0' }} />
            : <button key={i} onClick={item.action} style={menuBtnStyle}>{item.label}</button>
          )}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '3px 0' }} />
          <button onClick={() => { localStorage.clear(); location.reload() }} style={{ ...menuBtnStyle, color: '#ff6b6b' }}>Restart System…</button>
        </div>
      )}

      {/* Wallpaper picker submenu */}
      {wallpaperPicker && (
        <div style={{
          position: 'fixed', top: 35, left: 210, zIndex: 10001,
          width: 280, background: 'rgba(30,30,30,0.94)',
          backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', padding: 12,
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Wallpapers</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {WALLPAPERS.map(wp => (
              <button key={wp.id} onClick={() => { dispatch({ type: 'SET_WALLPAPER', wallpaper: wp.id }); setWallpaperPicker(false) }}
                style={{
                  background: wp.color, borderRadius: 8, height: 56, border: state.wallpaper === wp.id ? '2px solid #007aff' : '2px solid transparent',
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                }}>
                {state.wallpaper === wp.id && <div style={{ position: 'absolute', bottom: 3, right: 4, fontSize: 10, color: '#fff' }}>✓</div>}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <input id="custom-wp-url" placeholder="Custom image URL…"
              style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 11, outline: 'none' }} />
            <button onClick={() => {
              const url = (document.getElementById('custom-wp-url') as HTMLInputElement)?.value.trim()
              if (url) { dispatch({ type: 'SET_WALLPAPER', wallpaper: `url(${url})` }); setWallpaperPicker(false) }
            }} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#007aff', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Apply</button>
          </div>
        </div>
      )}

      {/* App menus */}
      {activeMenu && activeMenu !== 'app' && (
        <div style={{
          position: 'fixed', top: 35,
          left: activeMenu === '文件' ? 68 : activeMenu === '编辑' ? 106 : activeMenu === '视图' ? 138 : activeMenu === '前往' ? 170 : activeMenu === '窗口' ? 202 : 238,
          zIndex: 10001, width: 200,
          background: 'rgba(30,30,30,0.92)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '4px 0',
        }} onClick={closeAllMenus}>
          {getMenuItems(activeMenu).map((item, i) =>
            item.type === 'divider'
              ? <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '3px 0' }} />
              : <button key={i} onClick={() => { item.action?.(); closeAllMenus() }} style={menuBtnStyle}>{item.label}{item.shortcut ? <span style={{ float: 'right', opacity: 0.4, fontSize: 11 }}>{item.shortcut}</span> : ''}</button>
          )}
        </div>
      )}

      {ctrlMenuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }} onClick={closeAllMenus} />}
    </>
  )
}

function getMenuItems(menu: string) {
  switch (menu) {
    case '文件':
      return [
        { label: 'New Window', shortcut: '⌘N', action: () => {} },
        { type: 'divider' as const },
        { label: 'Close Window', shortcut: '⌘W', action: () => {} },
      ]
    case '编辑':
      return [
        { label: 'Undo', shortcut: '⌘Z', action: () => {} },
        { label: 'Redo', shortcut: '⇧⌘Z', action: () => {} },
        { type: 'divider' as const },
        { label: 'Cut', shortcut: '⌘X', action: () => {} },
        { label: 'Copy', shortcut: '⌘C', action: () => {} },
        { label: 'Paste', shortcut: '⌘V', action: () => {} },
        { label: 'Select All', shortcut: '⌘A', action: () => {} },
      ]
    case '视图':
      return [
        { label: 'as Icons', action: () => {} },
        { label: 'as List', action: () => {} },
        { label: 'as Columns', action: () => {} },
        { type: 'divider' as const },
        { label: 'Show Path Bar', action: () => {} },
        { label: 'Show Status Bar', action: () => {} },
      ]
    case '前往':
      return [
        { label: 'Home', shortcut: '⌘⇧H', action: () => {} },
        { label: 'Desktop', shortcut: '⌘D', action: () => {} },
        { label: 'Documents', shortcut: '⌘⇧O', action: () => {} },
        { label: 'Downloads', shortcut: '⌘⇧J', action: () => {} },
        { type: 'divider' as const },
        { label: 'Applications', shortcut: '⌘⇧A', action: () => {} },
      ]
    case '窗口':
      return [
        { label: 'Minimize', shortcut: '⌘M', action: () => {} },
        { label: 'Zoom', shortcut: '⌘Z', action: () => {} },
        { type: 'divider' as const },
        { label: 'Bring All to Front', shortcut: '⌘`', action: () => {} },
      ]
    case '帮助':
      return [
        { label: 'mac-sim-os Help', action: () => {} },
        { type: 'divider' as const },
        { label: 'Keyboard Shortcuts', shortcut: '⌘?', action: () => {} },
      ]
    default: return []
  }
}

const btnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'default',
  color: '#fff', padding: '2px 8px', borderRadius: 4,
  fontSize: 13, display: 'flex', alignItems: 'center', gap: 4,
}

const menuBtnStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '4px 14px', border: 'none',
  background: 'transparent', textAlign: 'left', fontSize: 13, color: '#fff',
  cursor: 'default', borderRadius: 4,
}
