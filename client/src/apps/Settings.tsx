import React, { useState } from 'react'

type SettingItem = { icon: string; label: string; key: string; default: boolean | string | null; sub?: string }

const SETTINGS: { group: string; items: SettingItem[] }[] = [
  { group: 'Preferences', items: [
    { icon: '✈️', label: 'Airplane Mode', key: 'airplane', default: false },
    { icon: '📶', label: 'Wi-Fi', key: 'wifi', default: true, sub: 'VibeOS-Network' },
    { icon: '🔵', label: 'Bluetooth', key: 'bluetooth', default: true, sub: 'On' },
    { icon: '📡', label: 'Cellular', key: 'cellular', default: false },
  ]},
  { group: 'General', items: [
    { icon: '🌙', label: 'Dark Mode', key: 'darkMode', default: false },
    { icon: '🔔', label: 'Notifications', key: 'notifications', default: true },
    { icon: '🔊', label: 'Sounds & Haptics', key: 'sounds', default: true },
    { icon: '🔍', label: 'Spotlight', key: 'spotlight', default: true },
  ]},
  { group: 'Appearance', items: [
    { icon: '🎨', label: 'Appearance', key: 'appearance', default: 'light' },
    { icon: '🖥️', label: 'Display', key: 'display', default: true },
    { icon: '🔒', label: 'Screen Time', key: 'screenTime', default: false },
  ]},
  { group: 'System', items: [
    { icon: 'ℹ️', label: 'About', key: 'about', default: null },
    { icon: '⚙️', label: 'Software Update', key: 'update', default: null },
    { icon: '💾', label: 'Storage', key: 'storage', default: null },
  ]},
]

type SettingKey = string

export default function SettingsApp() {
  const [settings, setSettings] = useState<Record<SettingKey, any>>({
    airplane: false, wifi: true, bluetooth: true, cellular: false,
    darkMode: false, notifications: true, sounds: true, spotlight: true,
    appearance: 'light', display: true, screenTime: false,
    about: null, update: null, storage: null,
  })
  const [search, setSearch] = useState('')

  const toggle = (key: SettingKey) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filtered = SETTINGS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.items.length > 0)

  return (
    <div style={{ width: '100%', height: '100%', background: '#f5f5f7', display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column',
        padding: '12px 0',
      }}>
        <div style={{ padding: '4px 12px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 8, padding: '4px 8px' }}>
            <span style={{ fontSize: 12, opacity: 0.5 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" style={{ flex: 1, fontSize: 12, color: '#1d1d1f', background: 'transparent' }} />
          </div>
        </div>
        {/* User profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 600 }}>V</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>VibeOS User</div>
            <div style={{ fontSize: 11, color: '#86868b' }}>Apple ID</div>
          </div>
        </div>
        {/* Settings list */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {SETTINGS.map(group => (
            <div key={group.group}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '10px 12px 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{group.group}</div>
              {group.items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()) || search === '').map(item => (
                <div key={item.key} style={{ padding: '6px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 6, margin: '1px 4px' }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {typeof item.default === 'boolean' && (
                    <div onClick={e => { e.stopPropagation(); toggle(item.key); }}
                      style={{ width: 36, height: 20, borderRadius: 10, background: settings[item.key] ? '#30d158' : '#e5e5ea', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: settings[item.key] ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                  )}
                  {item.sub && <span style={{ fontSize: 11, color: '#86868b' }}>{item.sub as string}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', marginBottom: 16 }}>Settings</div>

        {/* Wi-Fi detail */}
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📶</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Wi-Fi</div>
                <div style={{ fontSize: 12, color: '#86868b' }}>{settings.wifi ? 'mac-sim-os-Network · Connected' : 'Wi-Fi is off'}</div>
              </div>
            </div>
            <div onClick={() => toggle('wifi')} style={{ width: 44, height: 24, borderRadius: 12, background: settings.wifi ? '#30d158' : '#e5e5ea', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: settings.wifi ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
          {settings.wifi && (
            <div style={{ padding: '8px 16px' }}>
              {[{ name: 'VibeOS-Network', security: 'WPA2', signal: 'Strong' }, { name: 'Guest-WiFi', security: 'Open', signal: 'Weak' }, { name: 'CoffeeShop_5G', security: 'WPA3', signal: 'Medium' }].map(net => (
                <div key={net.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>📶 {net.name}</div>
                    <div style={{ fontSize: 11, color: '#86868b' }}>{net.security} · {net.signal}</div>
                  </div>
                  {net.name === 'VibeOS-Network' && <span style={{ color: '#007aff', fontSize: 16 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* General settings */}
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>General</div>
          {[
            { icon: '🌙', label: 'Dark Mode', key: 'darkMode' },
            { icon: '🔔', label: 'Notifications', key: 'notifications' },
            { icon: '🔊', label: 'Sounds & Haptics', key: 'sounds' },
            { icon: '🔍', label: 'Spotlight', key: 'spotlight' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 13 }}>{item.label}</span>
              </div>
              <div onClick={() => toggle(item.key)} style={{ width: 40, height: 22, borderRadius: 11, background: settings[item.key] ? '#30d158' : '#e5e5ea', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: settings[item.key] ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', fontSize: 12, color: '#86868b' }}>
          <div style={{ fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>mac-sim-os 1.0.0 (Simulator)</div>
          <div>macOS Sequoia Design Language · React + TypeScript</div>
          <div>WebContainer Terminal · Virtual Filesystem</div>
        </div>
      </div>
    </div>
  )
}
