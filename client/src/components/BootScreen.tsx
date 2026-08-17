import React, { useState, useEffect, useRef } from 'react'

type Phase = 'boot' | 'fly' | 'glow' | 'done'

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>('boot')
  const [bgShift, setBgShift] = useState(0)
  const glowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const id = setInterval(() => setBgShift(p => (p + 0.3) % 360), 50)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const targets = [5, 10, 16, 22, 29, 36, 43, 51, 59, 67, 74, 81, 87, 92, 96, 100]
    targets.forEach((val, i) => setTimeout(() => setProgress(val), i * 200))
  }, [])

  useEffect(() => {
    if (progress >= 100 && phase === 'boot') {
      const t = setTimeout(() => setPhase('fly'), 400)
      return () => clearTimeout(t)
    }
  }, [progress, phase])

  useEffect(() => {
    if (phase === 'fly') {
      glowTimerRef.current = setTimeout(() => setPhase('glow'), 700)
      return () => { if (glowTimerRef.current) clearTimeout(glowTimerRef.current) }
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'glow') {
      doneTimerRef.current = setTimeout(() => {
        setPhase('done')
        onComplete()
      }, 900)
      return () => { if (doneTimerRef.current) clearTimeout(doneTimerRef.current) }
    }
  }, [phase, onComplete])

  const isDone = phase === 'done'
  if (isDone) return null

  const isGlow = phase === 'glow'
  const logoTransform = (phase === 'fly' || phase === 'glow') ? 'translate(24px, 24px) scale(0.35)' : 'translate(0, 0) scale(1)'
  const logoOpacity = phase === 'glow' ? 0.7 : 1
  const progressContentHidden = phase === 'glow'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: isGlow ? '#000' : `radial-gradient(ellipse at 50% 50%, hsl(${bgShift}, 15%, 8%) 0%, #000 70%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: isDone ? 0 : 1,
      pointerEvents: isDone ? 'none' : 'auto',
      overflow: 'hidden',
      transition: 'opacity 0.5s ease',
    }}>
      {isGlow && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 0, height: 0, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 30%, transparent 60%)',
            animation: 'bootGlow 0.9s ease-out forwards',
            boxShadow: '0 0 120px 60px rgba(255,255,255,0.12)',
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 0, height: 0, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,220,255,0.15) 0%, transparent 50%)',
            animation: 'bootGlow2 0.9s ease-out 0.15s forwards',
          }} />
        </>
      )}

      <div style={{
        position: 'absolute', top: 0, left: 0,
        transform: logoTransform,
        opacity: logoOpacity,
        transition: phase === 'fly'
          ? 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease'
          : phase === 'glow'
            ? 'transform 0.1s ease, opacity 0.4s ease'
            : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
        filter: 'brightness(0) invert(1)',
        zIndex: 2,
      }}>
        <img src="/icons/apple-logo.svg" alt="" style={{ width: 60, height: 74, objectFit: 'contain' }}/>
      </div>

      {!progressContentHidden && (phase === 'boot' || phase === 'fly') && (
        <div style={{
          opacity: phase === 'fly' ? 0 : 1,
          transition: 'opacity 0.4s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{
            width: 220, height: 4,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 2, overflow: 'hidden',
            boxShadow: progress >= 100 ? '0 0 12px rgba(52,199,89,0.4)' : 'none',
            transition: 'box-shadow 0.4s ease',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: progress >= 100 ? '#34c759' : '#fff',
              borderRadius: 2,
              transition: 'width 0.08s linear, background 0.3s ease',
              boxShadow: '0 0 8px rgba(255,255,255,0.4)',
              position: 'relative', overflow: 'hidden',
            }}>
              {progress < 100 && (
                <div style={{
                  position: 'absolute', top: 0, left: '-40%', width: '40%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  animation: 'bootShimmer 1.2s ease-in-out infinite',
                }} />
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bootShimmer { 0% { left: -40%; } 100% { left: 140%; } }
        @keyframes bootGlow { 0% { width: 0; height: 0; opacity: 1; } 100% { width: 250vmax; height: 250vmax; opacity: 0; } }
        @keyframes bootGlow2 { 0% { width: 0; height: 0; opacity: 0.8; } 100% { width: 180vmax; height: 180vmax; opacity: 0; } }
      `}</style>
    </div>
  )
}
