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
  const [helpOpen, setHelpOpen] = useState(false)

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
          <svg width="14" height="17" viewBox="0 0 384 512" fill="white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-23.1-113.2-82.7-112.7-156.5zM245.3 41.3c22.6-27.9 37.9-66.6 33.7-105.4-32.4 2.1-71.4 21.6-94.8 49-20.9 24.3-38.4 64-33.3 101.3 36.2 2.8 70.2-16.8 94.4-44.9z"/></svg>
        </button>

        {/* Active app name */}
        <button onClick={(e) => openMenu('app', e)} style={{ ...btnStyle, fontWeight: 600 }}>
          {activeApp?.name || '访达'}
        </button>

        {/* App menus */}
        {['文件', '编辑', '视图', '前往', '窗口', '帮助'].map(item => (
          <button key={item} onClick={(e) => openMenu(item, e)} style={btnStyle}>{item}</button>
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
            : <button key={i} onClick={item.action} style={menuBtnStyle}>{item.label}</button>
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
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>壁纸</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {WALLPAPERS.map(wp => (
              <button key={wp.id} onClick={() => { dispatch({ type: 'SET_WALLPAPER', wallpaper: wp.id }); setWallpaperPicker(false) }}
                style={{
                  background: wp.color, borderRadius: 8, height: 56, border: state.wallpaper === wp.id ? '2px solid #007aff' : '2px solid transparent',
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                }}>
                {state.wallpaper === wp.id && <div style={{ position: 'absolute', bottom: 3, right: 4, fontSize: 10, color: '#fff' }}>✓</div>}
                <div style={{ position: 'absolute', bottom: 3, left: 4, fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>{wp.label}</div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <input id="custom-wp-url" placeholder="自定义图片 URL…"
              style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 11, outline: 'none' }} />
            <button onClick={() => {
              const url = (document.getElementById('custom-wp-url') as HTMLInputElement)?.value.trim()
              if (url) { dispatch({ type: 'SET_WALLPAPER', wallpaper: `url(${url})` }); setWallpaperPicker(false) }
            }} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#007aff', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>应用</button>
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
          {getMenuItems(activeMenu, apps, dispatch, state, setHelpOpen).map((item, i) =>
            item.type === 'divider'
              ? <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '3px 0' }} />
              : <button key={i} onClick={() => { item.action?.(); closeAllMenus() }} style={menuBtnStyle}>{item.label}{item.shortcut ? <span style={{ float: 'right', opacity: 0.4, fontSize: 11 }}>{item.shortcut}</span> : ''}</button>
          )}
        </div>
      )}

      {/* Help menu overlay */}
      {helpOpen && (
        <div style={{
          position: 'fixed', top: 35, left: 240, zIndex: 10001, width: 420,
          background: 'rgba(30,30,30,0.94)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', padding: 0, overflow: 'hidden',
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <svg width="36" height="44" viewBox="0 0 384 512" fill="white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-23.1-113.2-82.7-112.7-156.5zM245.3 41.3c22.6-27.9 37.9-66.6 33.7-105.4-32.4 2.1-71.4 21.6-94.8 49-20.9 24.3-38.4 64-33.3 101.3 36.2 2.8 70.2-16.8 94.4-44.9z"/></svg>
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

function getMenuItems(menu: string, apps: Array<{id:string;name:string;icon:string}>, dispatch: any, state: any, setHelpOpen: React.Dispatch<React.SetStateAction<boolean>>) {
  switch (menu) {
    case '文件':
      return [
        { label: '新建窗口', shortcut: '⌘N', action: () => { const f = apps.find(a => a.id === 'finder'); if (f) dispatch({ type: 'OPEN_WINDOW', app: f }) }},
        { type: 'divider' as const },
        { label: '关闭窗口', shortcut: '⌘W', action: () => { if (state.activeWindowId) dispatch({ type: 'CLOSE_WINDOW', id: state.activeWindowId }) }},
      ]
    case '编辑':
      return [
        { label: '撤销', shortcut: '⌘Z', action: () => { document.execCommand('undo') }},
        { label: '重做', shortcut: '⇧⌘Z', action: () => { document.execCommand('redo') }},
        { type: 'divider' as const },
        { label: '剪切', shortcut: '⌘X', action: () => { document.execCommand('cut') }},
        { label: '复制', shortcut: '⌘C', action: () => { document.execCommand('copy') }},
        { label: '粘贴', shortcut: '⌘V', action: () => { document.execCommand('paste') }},
        { label: '全选', shortcut: '⌘A', action: () => { document.execCommand('selectAll') }},
      ]
    case '视图':
      return [
        { label: '图标视图', action: () => {} },
        { label: '列表视图', action: () => {} },
        { label: '分栏视图', action: () => {} },
        { type: 'divider' as const },
        { label: '显示路径栏', action: () => {} },
        { label: '显示状态栏', action: () => {} },
      ]
    case '前往':
      return [
        { label: '主目录', shortcut: '⌘⇧H', action: () => {} },
        { label: '桌面', shortcut: '⌘D', action: () => {} },
        { label: '文稿', shortcut: '⌘⇧O', action: () => {} },
        { label: '下载', shortcut: '⌘⇧J', action: () => {} },
        { type: 'divider' as const },
        { label: '应用程序', shortcut: '⌘⇧A', action: () => { const f = apps.find(a => a.id === 'finder'); if (f) dispatch({ type: 'OPEN_WINDOW', app: f }) }},
      ]
    case '窗口':
      return [
        { label: '最小化', shortcut: '⌘M', action: () => { if (state.activeWindowId) dispatch({ type: 'MINIMIZE_WINDOW', id: state.activeWindowId }) }},
        { label: '缩放', shortcut: '⌘Z', action: () => {} },
        { type: 'divider' as const },
        { label: '全部前置', shortcut: '⌘`', action: () => {
          const windows = state.windows.filter((w: any) => !w.isMinimized)
          if (windows.length > 1) {
            const active = windows.find((w: any) => w.id === state.activeWindowId)
            if (active) {
              windows.forEach((w: any, i: number) => {
                dispatch({ type: 'SET_Z_INDEX', id: w.id, zIndex: 100 + i })
              })
            }
          }
        }},
      ]
    case '帮助':
      return [
        { label: 'mac-sim-os 帮助', action: () => setHelpOpen(true) },
        { type: 'divider' as const },
        { label: '键盘快捷键', shortcut: '⌘?', action: () => setHelpOpen(true) },
        { type: 'divider' as const },
        { label: '加入 QQ 频道', action: () => window.open('https://pd.qq.com/s/fk41xxrg8?b=9', '_blank') },
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
