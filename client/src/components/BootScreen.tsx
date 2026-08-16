import React, { useState, useEffect } from 'react'
import { useApp } from '../stores/app.store'

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const { state } = useApp()
  const [progress, setProgress] = useState(0)
  const [showDesktop, setShowDesktop] = useState(false)

  useEffect(() => {
    // Animate progress bar 0→100%
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Slow down as it approaches 100
        const remaining = 100 - prev
        const step = Math.max(1, Math.floor(remaining * 0.04))
        return Math.min(100, prev + step)
      })
    }, 60)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      // Brief pause then fade out
      const t = setTimeout(() => setShowDesktop(true), 400)
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
      background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.5s ease',
      opacity: progress >= 100 ? 0 : 1,
      pointerEvents: progress >= 100 ? 'none' : 'auto',
    }}>
      {/* Apple Logo */}
      <div style={{ marginBottom: 48 }}>
        <img src="/icons/apple-logo.svg" alt="" style={{ width: 60, height: 74, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}/>
      </div>

      {/* Progress bar */}
      <div style={{ width: 200, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: '#fff', borderRadius: 2,
          transition: 'width 0.1s linear',
        }} />
      </div>
    </div>
  )
}
