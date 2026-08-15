import React, { useEffect, useMemo, useState } from 'react'
import { useApp } from '../stores/app.store'
import { useAppRegistry } from '../contexts/AppRegistry.context'

export default function Spotlight({ apps }: { apps: import('../types').AppDefinition[] }) {
  const { dispatch } = useApp()
  const { apps: allApps } = useAppRegistry()
  const [query, setQuery] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  const results = useMemo(() => {
    if (!query.trim()) return allApps
    return allApps.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
  }, [query, allApps])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
        e.preventDefault()
        setIsVisible(v => {
          if (!v) setQuery('')
          return !v
        })
      }
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, allApps])

  if (!isVisible) return null

  return (
    <div
      onClick={() => setIsVisible(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '15vh', animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 560, background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 14, border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden', animation: 'slideUp 0.15s ease',
        }}
      >
        {/* Search input */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, opacity: 0.4 }}>🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              placeholder="Search apps..."
              style={{
                flex: 1, fontSize: 16, border: 'none', outline: 'none',
                background: 'transparent', color: '#1d1d1f',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}
            />
          </div>
        </div>
        {/* Results */}
        <div style={{ maxHeight: 360, overflow: 'auto', padding: '8px 0' }}>
          {results.map(app => (
            <div
              key={app.id}
              onClick={() => {
                dispatch({ type: 'OPEN_WINDOW', app })
                setIsVisible(false)
                setQuery('')
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,122,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <img src={app.icon} alt={app.name} style={{ width: 36, height: 36, borderRadius: 8 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>{app.name}</span>
            </div>
          ))}
          {results.length === 0 && (
            <div style={{ padding: '16px 14px', textAlign: 'center', color: '#86868b', fontSize: 14 }}>No results found</div>
          )}
        </div>
        <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 11, color: '#86868b', display: 'flex', justifyContent: 'space-between' }}>
          <span>↑↓ Navigate · Enter Open · Esc Close</span>
          <span>{results.length} items</span>
        </div>
      </div>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}
