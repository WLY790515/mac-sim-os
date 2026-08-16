import React, { useState, useEffect } from 'react'
import { useApp } from '../stores/app.store'

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const { state } = useApp()
  const [progress, setProgress] = useState(0)
  const [showDesktop, setShowDesktop] = useState(false)
  const [logoScale, setLogoScale] = useState(0.92)
  const [barGlow, setBarGlow] = useState(false)
  const [bgShift, setBgShift] = useState(0)

  // Logo pulse on mount
  useEffect(() => {
    const t1 = setTimeout(() => setLogoScale(1.0), 200)
    const t2 = setTimeout(() => setLogoScale(0.97), 900)
    const t3 = setTimeout(() => setLogoScale(1.0), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  // Background subtle shift
  useEffect(() => {
    const id = setInterval(() => setBgShift(p => (p + 0.3) % 360), 50)
    return () => clearInterval(id)
  }, [])

  // Progress bar shimmer
  useEffect(() => {
    const id = setInterval(() => setBarGlow(p => !p), 600)
    return () => clearInterval(id)
  }, [])

  // Animate progress bar 0→100% — slower pace (~4.5s total)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        const remaining = 100 - prev
        // Decelerating curve: slow down significantly near the end
        const step = Math.max(1, Math.floor(remaining * 0.025))
        return Math.min(100, prev + step)
      })
    }, 45)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => setShowDesktop(true), 600)
      return () => clearTimeout(t)
    }
  }, [progress])

  useEffect(() => {
    if (progress >= 100) onComplete()
  }, [progress, onComplete])

  if (showDesktop) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: `radial-gradient(ellipse at 50% 50%, hsl(${bgShift}, 15%, 8%) 0%, #000 70%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: progress >= 100 ? 0 : 1,
      pointerEvents: progress >= 100 ? 'none' : 'auto',
      overflow: 'hidden',
    }}>
      {/* Subtle radial glow behind logo */}
      <div style={{
        position: 'absolute',
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
        opacity: progress >= 100 ? 0 : 1,
      }} />

      {/* Apple Logo with pulse scale */}
      <div style={{
        marginBottom: 48,
        transform: `scale(${logoScale})`,
        filter: 'brightness(0) invert(1)',
        opacity: progress >= 100 ? 0 : 1,
        transition: 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <img src="/icons/apple-logo.svg" alt="" style={{ width: 60, height: 74, objectFit: 'contain' }}/>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 220, height: 4,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: 2,
        overflow: 'hidden',
        opacity: progress >= 100 ? 0 : 1,
        boxShadow: barGlow ? '0 0 12px rgba(255,255,255,0.15)' : 'none',
        transition: 'box-shadow 0.6s ease, opacity 0.4s ease',
      }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: progress >= 100 ? '#34c759' : '#fff',
          borderRadius: 2,
          transition: 'width 0.08s linear, background 0.3s ease',
          boxShadow: '0 0 8px rgba(255,255,255,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Shimmer on bar */}
          {progress < 100 && (
            <div style={{
              position: 'absolute', top: 0, left: '-40%', width: '40%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: 'bootShimmer 1.2s ease-in-out infinite',
            }} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes bootShimmer {
          0% { left: -40%; }
          100% { left: 140%; }
        }
      `}</style>
    </div>
  )
}
