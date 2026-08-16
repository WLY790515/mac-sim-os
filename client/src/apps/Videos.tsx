import React, { useState } from 'react'

const movies = [
  { id: 1, title: 'The Last Frontier', year: 2026, duration: '2h 15m', rating: 'PG-13', genre: 'Action', poster: 'https://picsum.photos/seed/apple-movies1/300/450' },
  { id: 2, title: 'Ocean Deep', year: 2025, duration: '1h 58m', rating: 'PG', genre: 'Documentary', poster: 'https://picsum.photos/seed/apple-movies2/300/450' },
  { id: 3, title: 'Mountain Echo', year: 2026, duration: '2h 32m', rating: 'R', genre: 'Drama', poster: 'https://picsum.photos/seed/apple-movies3/300/450' },
  { id: 4, title: 'Digital Dreams', year: 2025, duration: '1h 45m', rating: 'PG-13', genre: 'Sci-Fi', poster: 'https://picsum.photos/seed/apple-movies4/300/450' },
  { id: 5, title: 'Golden Hour', year: 2026, duration: '2h 05m', rating: 'PG', genre: 'Romance', poster: 'https://picsum.photos/seed/apple-movies5/300/450' },
  { id: 6, title: 'Night City', year: 2025, duration: '1h 52m', rating: 'R', genre: 'Thriller', poster: 'https://picsum.photos/seed/apple-movies6/300/450' },
]

export default function VideosApp() {
  const [selectedMovie, setSelectedMovie] = useState<typeof movies[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#1c1c1e', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#fff' }}>
      {/* Sidebar */}
      <div style={{ width: 180, background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '12px 0', overflow: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '4px 14px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Library</div>
        {['Movies', 'TV Shows', 'Watch List', 'Recently Added'].map(item => (
          <div key={item} style={{ padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: item === 'Movies' ? '#007aff' : '#aaa',
            background: item === 'Movies' ? 'rgba(0,122,255,0.15)' : 'transparent', borderRadius: 6, margin: '1px 4px', fontWeight: item === 'Movies' ? 600 : 400 }}>
            {item}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Movies</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}>All</button>
            <button style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}>Favorites</button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {movies.map(movie => (
              <div key={movie.id} onClick={() => setSelectedMovie(movie)} style={{ cursor: 'pointer' }}>
                <div style={{ aspectRatio: '2/3', overflow: 'hidden', borderRadius: 10, marginBottom: 8, position: 'relative' }}>
                  <img src={movie.poster} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                    <span style={{ fontSize: 32, opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>▶️</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{movie.title}</div>
                <div style={{ fontSize: 11, color: '#86868b' }}>{movie.year} · {movie.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player modal */}
      {selectedMovie && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <img src={selectedMovie.poster} alt={selectedMovie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
            <button onClick={() => { setIsPlaying(!isPlaying); }} style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              {isPlaying ? '⏸' : '▶️'}
            </button>
            <button onClick={() => setSelectedMovie(null)} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}
                onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setProgress((e.clientX - rect.left) / rect.width * 100); }}>
                <div style={{ width: `${progress}%`, height: '100%', borderRadius: 2, background: '#007aff', transition: 'width 0.1s' }} />
              </div>
              <span style={{ fontSize: 12, color: '#86868b', minWidth: 80 }}>{Math.floor(progress * 1.27)}:{String(Math.floor((progress * 76.2) % 60)).padStart(2, '0')} / 2:15</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedMovie.title}</div>
                <div style={{ fontSize: 12, color: '#86868b', marginTop: 2 }}>{selectedMovie.year} · {selectedMovie.duration} · {selectedMovie.rating} · {selectedMovie.genre}</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>⏮</button>
                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>⏭</button>
                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>🔊</button>
                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>⛶</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
