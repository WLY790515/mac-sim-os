import React from 'react'

export default function AboutApp() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f5f7', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Hero section */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '32px 36px',
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
          flexShrink: 0,
        }}>
          <svg width="48" height="60" viewBox="0 0 384 512" fill="white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-23.1-113.2-82.7-112.7-156.5zM245.3 41.3c22.6-27.9 37.9-66.6 33.7-105.4-32.4 2.1-71.4 21.6-94.8 49-20.9 24.3-38.4 64-33.3 101.3 36.2 2.8 70.2-16.8 94.4-44.9z"/></svg>
        </div>
        <div style={{ color: '#fff' }}>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>mac-sim-os</div>
          <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>A macOS Simulator in Your Browser</div>
          <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>Version 1.0.0 · Built with React + TypeScript</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 36px' }}>
        {/* Author */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Author</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>W</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>WLY790515</div>
              <div style={{ fontSize: 12, color: '#86868b' }}>Full-stack developer · Open source enthusiast</div>
            </div>
          </div>
        </div>

        {/* Project */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>About the Project</div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#1d1d1f', margin: 0 }}>
              A full macOS simulation running entirely in the browser. Features a working desktop with windows,
              a Dock, menu bar, and 19 built-in applications including Terminal with real filesystem commands,
              a persistent file system via IndexedDB, and smooth animations.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {['React 18', 'TypeScript 5', 'IndexedDB', 'Vite 5', 'Electron'].map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,122,255,0.08)', color: '#007aff', fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Features</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: '🪟', text: 'macOS-style windows & animations' },
              { icon: '📁', text: 'IndexedDB virtual filesystem' },
              { icon: '⌘', text: 'Multi-tab terminal with real FS commands' },
              { icon: '🖥️', text: 'Mission Control overview' },
              { icon: '⌨️', text: 'Keyboard shortcuts (Cmd+W/M/Q/D/F)' },
              { icon: '🎨', text: '8 gradient wallpapers + custom URLs' },
              { icon: '📱', text: '19 built-in applications' },
              { icon: '🚀', text: 'GitHub Pages & Railway deployable' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', borderRadius: 10, border: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: 16 }}>{f.icon}</span>
                <span style={{ fontSize: 12, color: '#1d1d1f' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'GitHub Repository', url: 'https://github.com/WLY790515/mac-sim-os', icon: '📦' },
              { label: 'Live Demo (GitHub Pages)', url: 'https://wly790515.github.io/mac-sim-os/', icon: '🌐' },
              { label: 'Preview Page', url: 'https://wly790515.github.io/mac-sim-os/preview.html', icon: '👁️' },
              { label: 'Report Issues / Feature Requests', url: 'https://github.com/WLY790515/mac-sim-os/issues', icon: '🐛' },
            ].map(link => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: '#fff', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)',
                  textDecoration: 'none', color: '#1d1d1f', cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#007aff'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(0,122,255,0.15)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,0,0,0.06)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: 18 }}>{link.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{link.label}</div>
                  <div style={{ fontSize: 11, color: '#86868b', marginTop: 1 }}>{link.url}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Star */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#86868b', marginBottom: 10 }}>If you enjoy mac-sim-os, give it a star on GitHub!</div>
          <a href="https://github.com/WLY790515/mac-sim-os" target="_blank" rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px',
              borderRadius: 20, background: 'linear-gradient(135deg,#667eea,#764ba2)',
              color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(102,126,234,0.35)',
            }}>
            ⭐ Star on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
