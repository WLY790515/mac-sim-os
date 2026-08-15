import React, { useState, useRef, useEffect } from 'react'

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number // seconds
  cover: string
}

const TRACKS: Track[] = [
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: 243, cover: '🌃' },
  { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, cover: '✨' },
  { id: '3', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: 354, cover: '👑' },
  { id: '4', title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: 230, cover: '⭐' },
  { id: '5', title: 'Take On Me', artist: 'a-ha', album: 'Hunting High and Low', duration: 225, cover: '🎸' },
  { id: '6', title: 'Don\'t Stop Me Now', artist: 'Queen', album: 'Jazz', duration: 209, cover: '🚀' },
  { id: '7', title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', duration: 482, cover: '🪜' },
  { id: '8', title: 'Imagine', artist: 'John Lennon', album: 'Imagine', duration: 183, cover: '🕊️' },
]

export default function MusicApp() {
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(75)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= currentTrack.duration) {
            handleNext()
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, currentTrack])

  const handleNext = () => {
    const idx = TRACKS.indexOf(currentTrack)
    const next = shuffle
      ? TRACKS[Math.floor(Math.random() * TRACKS.length)]
      : TRACKS[(idx + 1) % TRACKS.length]
    setCurrentTrack(next)
    setProgress(0)
  }

  const handlePrev = () => {
    const idx = TRACKS.indexOf(currentTrack)
    setCurrentTrack(TRACKS[(idx - 1 + TRACKS.length) % TRACKS.length])
    setProgress(0)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🎵</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Music</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#8e8e93' }}>
          <span style={{ color: '#fff', cursor: 'pointer' }}>Library</span>
          <span style={{ cursor: 'pointer' }}>Browse</span>
          <span style={{ cursor: 'pointer' }}>Radio</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Track list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 12px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 12, paddingLeft: 8 }}>All Songs</div>
          {TRACKS.map((track, i) => (
            <div key={track.id} onClick={() => { setCurrentTrack(track); setProgress(0); setIsPlaying(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                borderRadius: 8, cursor: 'pointer',
                background: currentTrack.id === track.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}>
              <span style={{ fontSize: 12, color: '#8e8e93', width: 20 }}>{currentTrack.id === track.id && isPlaying ? '🔊' : String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 20 }}>{track.cover}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: currentTrack.id === track.id ? '#ff2d55' : '#fff' }}>{track.title}</div>
                <div style={{ fontSize: 12, color: '#8e8e93' }}>{track.artist}</div>
              </div>
              <span style={{ fontSize: 12, color: '#8e8e93' }}>{track.album}</span>
              <span style={{ fontSize: 12, color: '#8e8e93' }}>{formatTime(track.duration)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Player bar */}
      <div style={{
        background: 'rgba(30,30,30,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 16px 14px',
      }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#8e8e93', width: 32 }}>{formatTime(progress)}</span>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, cursor: 'pointer' }}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              setProgress(Math.floor(pct * currentTrack.duration))
            }}>
            <div style={{ width: `${(progress / currentTrack.duration) * 100}%`, height: '100%', background: '#ff2d55', borderRadius: 2, transition: 'width 0.3s linear' }} />
          </div>
          <span style={{ fontSize: 11, color: '#8e8e93', width: 32, textAlign: 'right' }}>{formatTime(currentTrack.duration)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Track info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
            <span style={{ fontSize: 28 }}>{currentTrack.cover}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{currentTrack.title}</div>
              <div style={{ fontSize: 11, color: '#8e8e93' }}>{currentTrack.artist}</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center' }}>
            <button onClick={() => setShuffle(!shuffle)} style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: shuffle ? '#ff2d55' : '#8e8e93', padding: 4 }}>{'⇄'}</button>
            <button onClick={handlePrev} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}>{'⏮'}</button>
            <button onClick={() => setIsPlaying(!isPlaying)} style={{
              width: 36, height: 36, borderRadius: '50%', background: '#ff2d55',
              border: 'none', cursor: 'pointer', fontSize: 16, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{isPlaying ? '⏸' : '▶'}</button>
            <button onClick={handleNext} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}>{'⏭'}</button>
            <button onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')} style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: repeat !== 'off' ? '#ff2d55' : '#8e8e93', padding: 4 }}>{'↺'}</button>
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 100 }}>
            <span style={{ fontSize: 12, color: '#8e8e93' }}>🔈</span>
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2, cursor: 'pointer' }}
              onClick={e => setVolume(Math.round(((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth) * 100))}>
              <div style={{ width: `${volume}%`, height: '100%', background: '#8e8e93', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 12, color: '#8e8e93' }}>🔊</span>
          </div>
        </div>
      </div>
    </div>
  )
}
