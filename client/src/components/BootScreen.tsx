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
        <svg width="60" height="74" viewBox="0 0 384 512" fill="white">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-23.1-113.2-82.7-112.7-156.5zM245.3 41.3c22.6-27.9 37.9-66.6 33.7-105.4-32.4 2.1-71.4 21.6-94.8 49-20.9 24.3-38.4 64-33.3 101.3 36.2 2.8 70.2-16.8 94.4-44.9z"/>
        </svg>
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
