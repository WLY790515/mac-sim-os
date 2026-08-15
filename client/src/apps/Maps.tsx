import React, { useState } from 'react'

const locations = [
  { id: 1, name: 'Apple Park', address: '1 Apple Park Way, Cupertino, CA', lat: 37.33, lng: -122.0, type: 'Landmark' },
  { id: 2, name: 'Golden Gate Bridge', address: 'Golden Gate Bridge, San Francisco, CA', lat: 37.82, lng: -122.48, type: 'Landmark' },
  { id: 3, name: 'Fisherman\'s Wharf', address: 'Fishermans Wharf, San Francisco, CA', lat: 37.81, lng: -122.42, type: 'Tourist' },
  { id: 4, name: 'Alcatraz Island', address: 'Alcatraz Island, San Francisco, CA', lat: 37.83, lng: -122.42, type: 'Historic' },
  { id: 5, name: 'Sunset District', address: 'Sunset District, San Francisco, CA', lat: 37.75, lng: -122.49, type: 'Neighborhood' },
  { id: 6, name: 'Mission District', address: 'Mission District, San Francisco, CA', lat: 37.76, lng: -122.42, type: 'Neighborhood' },
  { id: 7, name: 'Napa Valley', address: 'Napa Valley, CA', lat: 38.30, lng: -122.28, type: 'Region' },
  { id: 8, name: 'Santa Clara', address: 'Santa Clara, CA', lat: 37.35, lng: -121.95, type: 'City' },
]

export default function MapsApp() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map')

  const filtered = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.address.toLowerCase().includes(search.toLowerCase())
  )

  const selected = locations.find(l => l.id === selectedId)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#e8e8e8', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 260, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Search</div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search maps"
              style={{ width: '100%', padding: '8px 10px 8px 34px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(0,0,0,0.04)', fontSize: 14, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <button onClick={() => setMapMode('map')} style={{ flex: 1, padding: '5px 0', borderRadius: 8, fontSize: 12, background: mapMode === 'map' ? '#007aff' : 'rgba(0,0,0,0.06)', color: mapMode === 'map' ? '#fff' : '#444', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Map</button>
            <button onClick={() => setMapMode('satellite')} style={{ flex: 1, padding: '5px 0', borderRadius: 8, fontSize: 12, background: mapMode === 'satellite' ? '#007aff' : 'rgba(0,0,0,0.06)', color: mapMode === 'satellite' ? '#fff' : '#444', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Satellite</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '8px 14px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Results</div>
          {filtered.map(loc => (
            <div key={loc.id} onClick={() => setSelectedId(loc.id)}
              style={{ padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer',
                background: selectedId === loc.id ? 'rgba(0,122,255,0.1)' : 'transparent',
                borderLeft: selectedId === loc.id ? '3px solid #007aff' : '3px solid transparent', transition: 'background 0.1s' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>{loc.name}</div>
              <div style={{ fontSize: 11, color: '#86868b', marginTop: 2 }}>{loc.address}</div>
              <div style={{ fontSize: 10, color: '#007aff', marginTop: 2 }}>{loc.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: mapMode === 'satellite' ? '#1a3a1a' : '#e8f4e8' }}>
        {/* Stylized map */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            {/* Background */}
            <rect width="800" height="600" fill={mapMode === 'satellite' ? '#1a3a1a' : '#d4e8c2'} />
            {/* Water */}
            <ellipse cx="400" cy="300" rx="300" ry="200" fill={mapMode === 'satellite' ? '#0a2a4a' : '#a8d8ea'} opacity="0.8" />
            {/* Roads */}
            <line x1="0" y1="300" x2="800" y2="300" stroke={mapMode === 'satellite' ? '#2a4a2a' : '#c8c8a8'} strokeWidth="3" />
            <line x1="400" y1="0" x2="400" y2="600" stroke={mapMode === 'satellite' ? '#2a4a2a' : '#c8c8a8'} strokeWidth="3" />
            <line x1="100" y1="100" x2="700" y2="500" stroke={mapMode === 'satellite' ? '#2a4a2a' : '#d8d8b8'} strokeWidth="2" />
            <line x1="700" y1="100" x2="100" y2="500" stroke={mapMode === 'satellite' ? '#2a4a2a' : '#d8d8b8'} strokeWidth="2" />
            {/* Parks */}
            <ellipse cx="250" cy="200" rx="60" ry="40" fill={mapMode === 'satellite' ? '#1a4a1a' : '#8fd48f'} opacity="0.7" />
            <ellipse cx="600" cy="450" rx="80" ry="50" fill={mapMode === 'satellite' ? '#1a4a1a' : '#8fd48f'} opacity="0.7" />
            {/* Buildings */}
            <rect x="350" y="250" width="100" height="80" rx="4" fill={mapMode === 'satellite' ? '#3a5a3a' : '#e8e8d8'} opacity="0.8" />
            <rect x="380" y="220" width="60" height="40" rx="2" fill={mapMode === 'satellite' ? '#4a6a4a' : '#f0f0e0'} opacity="0.9" />
            {/* Markers */}
            {locations.map((loc, i) => {
              const x = 150 + (i % 4) * 160 + Math.sin(i) * 40
              const y = 120 + Math.floor(i / 4) * 200 + Math.cos(i) * 30
              return (
                <g key={loc.id} onClick={() => setSelectedId(loc.id)} style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r={selectedId === loc.id ? 12 : 8} fill={selectedId === loc.id ? '#ff3b30' : '#007aff'} opacity="0.9" />
                  <circle cx={x} cy={y} r={selectedId === loc.id ? 18 : 12} fill={selectedId === loc.id ? '#ff3b30' : '#007aff'} opacity="0.2" />
                </g>
              )
            })}
          </svg>
        </div>

        {/* Selected location panel */}
        {selected && (
          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, maxWidth: 400, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f' }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: '#86868b', marginTop: 4 }}>{selected.address}</div>
                <div style={{ fontSize: 12, color: '#007aff', marginTop: 4 }}>{selected.type}</div>
              </div>
              <button onClick={() => setSelectedId(null)} style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: '#007aff', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🧭 Directions</button>
              <button style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.06)', color: '#444', border: 'none', fontSize: 13, cursor: 'pointer' }}>⭐ Save</button>
              <button style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.06)', color: '#444', border: 'none', fontSize: 13, cursor: 'pointer' }}>Share</button>
            </div>
          </div>
        )}

        {/* Zoom controls */}
        <div style={{ position: 'absolute', right: 16, bottom: 200, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          <button style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        </div>
      </div>
    </div>
  )
}
