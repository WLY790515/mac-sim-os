import React, { useState } from 'react'

const photos = [
  { id: 1, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', title: 'Mountains', date: 'Aug 10, 2026', album: 'Travel' },
  { id: 2, src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80', title: 'Forest Path', date: 'Aug 8, 2026', album: 'Nature' },
  { id: 3, src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80', title: 'Sunlight', date: 'Aug 5, 2026', album: 'Nature' },
  { id: 4, src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', title: 'Beach', date: 'Jul 28, 2026', album: 'Travel' },
  { id: 5, src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', title: 'Night Sky', date: 'Jul 20, 2026', album: 'Astrophotography' },
  { id: 6, src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80', title: 'Lake', date: 'Jul 15, 2026', album: 'Travel' },
  { id: 7, src: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=80', title: 'Waterfall', date: 'Jul 10, 2026', album: 'Nature' },
  { id: 8, src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=80', title: 'Meadow', date: 'Jul 5, 2026', album: 'Nature' },
  { id: 9, src: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400&q=80', title: 'Northern Lights', date: 'Jun 28, 2026', album: 'Astrophotography' },
  { id: 10, src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80', title: 'Sunbeam', date: 'Jun 20, 2026', album: 'Nature' },
  { id: 11, src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&q=80', title: 'Woodland', date: 'Jun 15, 2026', album: 'Travel' },
  { id: 12, src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80', title: 'Misty Valley', date: 'Jun 10, 2026', album: 'Nature' },
]

const albums = ['All Photos', 'Travel', 'Nature', 'Astrophotography', 'Favorites', 'Screenshots']

export default function PhotosApp() {
  const [selectedAlbum, setSelectedAlbum] = useState('All Photos')
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null)

  const filtered = selectedAlbum === 'All Photos'
    ? photos
    : photos.filter(p => p.album === selectedAlbum)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#000', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 180, background: 'rgba(30,30,30,0.95)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '12px 0', overflow: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '4px 14px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Library</div>
        {albums.map(album => (
          <div key={album} onClick={() => setSelectedAlbum(album)}
            style={{ padding: '5px 14px', fontSize: 13, cursor: 'pointer', color: selectedAlbum === album ? '#007aff' : '#aaa',
              background: selectedAlbum === album ? 'rgba(0,122,255,0.15)' : 'transparent', borderRadius: 6, margin: '1px 4px', fontWeight: selectedAlbum === album ? 600 : 400 }}>
            {album}
          </div>
        ))}
        <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '12px 14px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Favorites</div>
        <div style={{ padding: '5px 14px', fontSize: 13, cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>❤️</span> Liked Photos
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{selectedAlbum}</div>
          <div style={{ fontSize: 12, color: '#86868b' }}>{filtered.length} items</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 3 }}>
            {filtered.map(photo => (
              <div key={photo.id} onClick={() => setSelectedPhoto(photo)}
                style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 4, cursor: 'pointer', position: 'relative' }}>
                <img src={photo.src} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 6px 4px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                  <div style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>{photo.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {selectedPhoto && (
        <div onClick={() => setSelectedPhoto(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '80vw', maxHeight: '80vh', position: 'relative' }}>
            <img src={selectedPhoto.src} alt={selectedPhoto.title} style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', bottom: -40, left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedPhoto.title}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{selectedPhoto.date} · {selectedPhoto.album}</div>
            </div>
            <button onClick={() => setSelectedPhoto(null)} style={{ position: 'absolute', top: -12, right: -12, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
