import React, { useEffect, useState, useCallback } from 'react'
import { useApp } from '../stores/app.store'
import { useAppRegistry } from '../contexts/AppRegistry.context'

export default function MenuBar({ apps }: { apps: import('../types').AppDefinition[] }) {
  const { state, dispatch } = useApp()
  const { apps: allApps } = useAppRegistry()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = useCallback((d: Date) => {
    return d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }, [])

  // Show app name only when there's an active window
  const activeWindow = state.windows.find(w => w.id === state.activeWindowId)
  const activeAppName = activeWindow ? allApps.find(a => a.id === activeWindow.appId)?.name : null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 25, zIndex: 9999,
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.3)',
      display: 'flex', alignItems: 'center',
      padding: '0 10px',
      fontSize: 13,
    }}>
      {/* Apple logo + app name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 12, borderRight: '1px solid rgba(0,0,0,0.15)' }}>
        <svg width="14" height="14" viewBox="0 0 384 512" fill="#1d1d1f">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-23.1-113.2-82.7-112.7-156.5zM245.3 41.3c22.6-27.9 37.9-66.6 33.7-105.4-32.4 2.1-71.4 21.6-94.8 49-20.9 24.3-38.4 64-33.3 101.3 36.2 2.8 70.2-16.8 94.4-44.9z"/>
        </svg>
        {activeAppName && <span style={{ fontWeight: 600, opacity: 0.95 }}>{activeAppName}</span>}
      </div>

      {/* Menu items */}
      {activeAppName && ['文件', '编辑', '视图', '前往', '窗口', '帮助'].map(item => (
        <span key={item} style={{
          marginLeft: 16, cursor: 'default', opacity: 0.8,
          padding: '2px 6px', borderRadius: 4,
        }}>{item}</span>
      ))}

      {/* Right side */}
      <div style={{ flex: 1 }} />

      {/* Status icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 4 }}>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ opacity: 0.8 }}>
          <path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM2.5 7.5c1.5-2 3.5-3 5.5-3s4 1 5.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M.5 5C3 2 5.5 1 8 1s5 1 7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
        </svg>
        {/* Volume */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ opacity: 0.8 }}>
          <path d="M2 4.5V7.5M4 3v6l3-2.5 3 2.5V3L8 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 4c1 1 1 3 0 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        </svg>
        {/* Battery */}
        <svg width="22" height="12" viewBox="0 0 22 12" fill="none" style={{ opacity: 0.8 }}>
          <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="currentColor" strokeWidth="1"/>
          <rect x="2" y="2" width="12" height="8" rx="1.5" fill="currentColor" opacity="0.7"/>
          <path d="M21 4v4a2 2 0 000-4z" fill="currentColor" opacity="0.5"/>
        </svg>
      </div>

      {/* Clock */}
      <span style={{ marginLeft: 8, opacity: 0.85, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(time)}
      </span>
    </div>
  )
}
