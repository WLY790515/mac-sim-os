import React, { useState, useEffect, useRef } from 'react'

type Phase = 'logo-in' | 'progress' | 'glow' | 'fade-out'

const MIN_BOOT_MS = 3000  // 强制最低播放时长

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('logo-in')
  const [progress, setProgress] = useState(0)
  const [bgHue, setBgHue] = useState(240)
  const logoRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const bootStartTimeRef = useRef<number>(performance.now())

  // Background color cycle
  useEffect(() => {
    const id = setInterval(() => setBgHue(h => (h + 0.15) % 360), 50)
    return () => clearInterval(id)
  }, [])

  // Phase 1: Logo entrance (0-800ms)
  useEffect(() => {
    if (phase !== 'logo-in') return
    const t = setTimeout(() => setPhase('progress'), 800)
    return () => clearTimeout(t)
  }, [phase])

  // Phase 2: Progress bar (800-4000ms)
  useEffect(() => {
    if (phase !== 'progress') return
    const targets = [5, 12, 20, 30, 40, 52, 63, 72, 80, 87, 92, 96, 99, 100]
    targets.forEach((v, i) => setTimeout(() => setProgress(v), i * 220))
    const t = setTimeout(() => setPhase('glow'), targets.length * 220 + 300)
    return () => clearTimeout(t)
  }, [phase])

  // Phase 3: Glow flash (4000-4900ms)
  useEffect(() => {
    if (phase !== 'glow') return
    const t = setTimeout(() => setPhase('fade-out'), 900)
    return () => clearTimeout(t)
  }, [phase])

  // Phase 4: Fade out (4900-5400ms)
  useEffect(() => {
    if (phase !== 'fade-out') return
    // 强制最低 3 秒，计算还需等待多久
    const elapsed = performance.now() - bootStartTimeRef.current
    const remaining = Math.max(0, MIN_BOOT_MS - elapsed)
    const t = setTimeout(() => onComplete(), 500 + remaining)
    return () => clearTimeout(t)
  }, [phase, onComplete])

  const isDone = phase === 'fade-out'

  return (
    <div
      ref={logoRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: isDone
          ? 'transparent'
          : `radial-gradient(ellipse at 50% 45%, hsl(${bgHue}, 25%, 10%) 0%, #000 75%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: isDone ? 0 : 1,
        pointerEvents: isDone ? 'none' : 'auto',
        transition: 'opacity 0.5s ease',
        overflow: 'hidden',
      }}>
      {/* Ripple glow behind Apple logo */}
      {(phase === 'glow' || phase === 'fade-out') && (
        <>
          <div style={{
            position: 'absolute', width: 0, height: 0, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(200,220,255,0.1) 25%, transparent 55%)',
            animation: 'bootGlow 0.9s ease-out forwards',
          }} />
          <div style={{
            position: 'absolute', width: 0, height: 0, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(180,200,255,0.2) 0%, transparent 50%)',
            animation: 'bootGlow2 0.9s ease-out 0.12s forwards',
          }} />
        </>
      )}

      {/* Apple Logo */}
      <div style={{
        transform: phase === 'logo-in'
          ? 'scale(0.3) translateY(20px)'
          : 'scale(1) translateY(0)',
        opacity: phase === 'logo-in' ? 0 : 1,
        transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
        filter: 'brightness(0) invert(1)',
        zIndex: 2,
        marginBottom: phase === 'progress' || phase === 'glow' ? 32 : 0,
      }}>
        <img src="/icons/apple-logo.svg" alt="" style={{ width: 64, height: 80, objectFit: 'contain' }} />
      </div>

      {/* macOS version text */}
      {phase !== 'logo-in' && (
        <div style={{
          fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.6)',
          letterSpacing: 3, marginTop: 12,
          opacity: phase === 'progress' || phase === 'glow' ? 1 : 0,
          transition: 'opacity 0.5s ease',
          zIndex: 2,
        }}>
          mac-sim-os
        </div>
      )}

      {/* Progress bar */}
      {(phase === 'progress' || phase === 'glow') && (
        <div style={{ marginTop: 28, zIndex: 2, opacity: phase === 'glow' ? 0 : 1, transition: 'opacity 0.4s ease' }}>
          <div style={{
            width: 200, height: 3,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2, overflow: 'hidden',
          }}>
            <div ref={progressRef} style={{
              width: `${progress}%`, height: '100%',
              background: progress >= 100 ? '#34c759' : '#fff',
              borderRadius: 2,
              transition: 'width 0.06s linear, background 0.3s ease',
              boxShadow: '0 0 10px rgba(255,255,255,0.3)',
              position: 'relative', overflow: 'hidden',
            }}>
              {progress < 100 && (
                <div style={{
                  position: 'absolute', top: 0, left: '-40%', width: '40%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                  animation: 'bootShimmer 1s ease-in-out infinite',
                }} />
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bootShimmer { 0% { left: -40%; } 100% { left: 140%; } }
        @keyframes bootGlow { 0% { width: 0; height: 0; opacity: 1; } 100% { width: 200vmax; height: 200vmax; opacity: 0; } }
        @keyframes bootGlow2 { 0% { width: 0; height: 0; opacity: 0.6; } 100% { width: 150vmax; height: 150vmax; opacity: 0; } }
      `}</style>
    </div>
  )
}
