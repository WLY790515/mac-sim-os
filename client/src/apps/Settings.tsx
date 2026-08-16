import React, { useState } from 'react'
import { useApp } from '../stores/app.store'

const WALLPAPERS = [
  { id: 'aurora', name: 'Aurora', grad: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)' },
  { id: 'ocean',  name: 'Ocean',  grad: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { id: 'sunset', name: 'Sunset', grad: 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)' },
  { id: 'forest', name: 'Forest', grad: 'linear-gradient(135deg, #134e5e 0%, #71b28a 100%)' },
  { id: 'dawn',   name: 'Dawn',   grad: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)' },
  { id: 'midnight', name: 'Midnight', grad: 'linear-gradient(160deg, #0d1117 0%, #161b22 40%, #21262d 100%)' },
  { id: 'lava',   name: 'Lava',   grad: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)' },
  { id: 'auroraLight', name: 'Dawn Light', grad: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
]

type Section = 'wallpaper' | 'wifi' | 'bluetooth' | 'sound' | 'general' | 'about'

interface NavItem {
  id: Section
  icon: string
  label: string
}

const NAV: NavItem[] = [
  { id: 'wallpaper', icon: '🖼️', label: 'Wallpaper' },
  { id: 'general',   icon: '⚙️', label: 'General' },
  { id: 'wifi',      icon: '📶', label: 'Wi-Fi' },
  { id: 'bluetooth', icon: '🔵', label: 'Bluetooth' },
  { id: 'sound',     icon: '🔊', label: 'Sound' },
  { id: 'about',     icon: 'ℹ️', label: 'About' },
]

export default function SettingsApp() {
  const { state, dispatch } = useApp()
  const [section, setSection] = useState<Section>('wallpaper')
  const [darkMode, setDarkMode] = useState(state.theme === 'dark')
  const [customUrl, setCustomUrl] = useState('')

  const toggle = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn() }

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <div
      onClick={onClick}
      style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#30d158' : '#e5e5ea', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  )

  const Row = ({ icon, label, sub, right }: { icon: string; label: string; sub?: string; right?: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#86868b', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )

  const WallpaperView = () => (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Select Wallpaper</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {WALLPAPERS.map(wp => (
          <div key={wp.id} onClick={() => dispatch({ type: 'SET_WALLPAPER', wallpaper: wp.id })} style={{ cursor: 'pointer' }}>
            <div style={{ height: 72, borderRadius: 10, background: wp.grad, border: state.wallpaper === wp.id ? '2px solid #007aff' : '2px solid transparent', transition: 'border-color 0.2s', boxShadow: state.wallpaper === wp.id ? '0 0 0 3px rgba(0,122,255,0.2)' : 'none', position: 'relative' }} />
            <div style={{ fontSize: 11, color: '#1d1d1f', marginTop: 4, textAlign: 'center', fontWeight: state.wallpaper === wp.id ? 600 : 400 }}>{wp.name}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Custom Image URL</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.15)', fontSize: 12, outline: 'none', background: '#fff' }}
          />
          <button
            onClick={() => { if (customUrl.trim()) dispatch({ type: 'SET_WALLPAPER', wallpaper: `url("${customUrl.trim()}")` }) }}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#007aff', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
          >Apply</button>
        </div>
      </div>
    </div>
  )

  const GeneralView = () => (
    <div>
      <Row icon="🌙" label="Dark Mode" sub={darkMode ? 'On' : 'Off'} right={<Toggle on={darkMode} onClick={() => { const next = !darkMode; setDarkMode(next); dispatch({ type: 'SET_THEME', theme: next ? 'dark' : 'light' }) }} />} />
      <Row icon="🔔" label="Notifications" sub="Allow notifications from apps" right={<Toggle on={true} onClick={() => {}} />} />
      <Row icon="🔍" label="Spotlight" sub="Press Cmd+Space to search" right={<Toggle on={true} onClick={() => {}} />} />
      <Row icon="🖥️" label="Mission Control" sub="Swipe up with three or four fingers" right={<Toggle on={true} onClick={() => {}} />} />
    </div>
  )

  const WifiView = () => (
    <div>
      <Row icon="📶" label="Wi-Fi" sub="mac-sim-os-Network · Connected" right={<Toggle on={true} onClick={() => {}} />} />
      <div style={{ margin: '0 16px 12px', padding: '8px 12px', background: 'rgba(0,122,255,0.08)', borderRadius: 8, fontSize: 12, color: '#007aff' }}>✓ Connected to mac-sim-os-Network</div>
      {[
        { name: 'mac-sim-os-Network', security: 'WPA2', signal: 'Strong', connected: true },
        { name: 'Guest-WiFi', security: 'Open', signal: 'Weak', connected: false },
        { name: 'CoffeeShop_5G', security: 'WPA3', signal: 'Medium', connected: false },
      ].map(net => (
        <Row key={net.name} icon="📶" label={net.name} sub={`${net.security} · ${net.signal}`} right={net.connected ? <span style={{ color: '#007aff', fontSize: 16 }}>✓</span> : undefined} />
      ))}
    </div>
  )

  const BluetoothView = () => (
    <div>
      <Row icon="🔵" label="Bluetooth" sub="On" right={<Toggle on={true} onClick={() => {}} />} />
      <div style={{ margin: '0 16px 12px', padding: '8px 12px', background: 'rgba(0,0,0,0.04)', borderRadius: 8, fontSize: 12, color: '#86868b' }}>No devices paired</div>
      {[
        { name: 'MacBook Pro', icon: '💻', connected: false },
        { name: 'AirPods Pro', icon: '🎧', connected: false },
        { name: 'Apple Watch', icon: '⌚', connected: false },
      ].map(dev => (
        <Row key={dev.name} icon={dev.icon} label={dev.name} sub={dev.connected ? 'Connected' : 'Not connected'} right={<span style={{ fontSize: 11, color: '#007aff', cursor: 'pointer' }}>Connect</span>} />
      ))}
    </div>
  )

  const SoundView = () => {
    const [vol, setVol] = useState(70)
    return (
      <div>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>🔈</span>
            <input type="range" min="0" max="100" value={vol} onChange={e => setVol(Number(e.target.value))} style={{ flex: 1, accentColor: '#007aff' }} />
            <span style={{ fontSize: 12, color: '#86868b', width: 32 }}>{vol}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 16 }}>🔊</span>
            <input type="range" min="0" max="100" defaultValue="50" style={{ flex: 1, accentColor: '#007aff' }} />
            <span style={{ fontSize: 12, color: '#86868b', width: 32 }}>50%</span>
          </div>
        </div>
        <Row icon="🔕" label="Play sound on startup" right={<Toggle on={true} onClick={() => {}} />} />
        <Row icon="🔔" label="Alert sound" sub="Breeze" right={<span style={{ fontSize: 11, color: '#007aff', cursor: 'pointer' }}>Choose…</span>} />
      </div>
    )
  }

  const AboutView = () => (
    <div style={{ padding: '0 16px' }}>
      <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#667eea,#764ba2)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 20px rgba(102,126,234,0.4)' }}>🍎</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f' }}>mac-sim-os</div>
        <div style={{ fontSize: 13, color: '#86868b', marginTop: 4 }}>Version 1.0.0</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Row icon="💻" label="Mac-sim-os Simulator" />
        <Row icon="🖥️" label="Display" sub="2560 × 1600 (Retina)" />
        <Row icon="🧠" label="Memory" sub="16 GB" />
        <Row icon="💾" label="Storage" sub="512 GB SSD" />
        <Row icon="🔧" label="Processor" sub="Apple M2 Pro" />
      </div>
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff', borderRadius: 12, fontSize: 12, color: '#86868b', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>mac-sim-os 1.0.0 (Simulator)</div>
        <div>macOS Sequoia Design Language · React + TypeScript</div>
        <div>WebContainer Terminal · Virtual Filesystem</div>
        <div style={{ marginTop: 8, color: '#007aff', cursor: 'pointer' }}>Check for Updates →</div>
      </div>
    </div>
  )

  const SECTIONS: Record<Section, () => React.ReactNode> = {
    wallpaper: WallpaperView,
    general:   GeneralView,
    wifi:      WifiView,
    bluetooth: BluetoothView,
    sound:     SoundView,
    about:     AboutView,
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#f5f5f7', display: 'flex', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* User profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 600 }}>M</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>mac-sim-os User</div>
            <div style={{ fontSize: 11, color: '#86868b' }}>Apple ID</div>
          </div>
        </div>
        {/* Nav */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {NAV.map(item => (
            <div
              key={item.id}
              onClick={() => setSection(item.id)}
              style={{
                padding: '7px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                background: section === item.id ? 'rgba(0,122,255,0.12)' : 'transparent',
                color: section === item.id ? '#007aff' : '#1d1d1f',
                borderRadius: 6, margin: '1px 4px', fontWeight: section === item.id ? 500 : 400,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', marginBottom: 20 }}>{NAV.find(n => n.id === section)?.icon} {NAV.find(n => n.id === section)?.label}</div>
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: 560 }}>
          {SECTIONS[section]()}
        </div>
      </div>
    </div>
  )
}
