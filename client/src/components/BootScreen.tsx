import React, { useEffect, useState, useRef } from 'react'

interface BootScreenProps {
  onComplete: () => void
}

type Phase = 'booting' | 'launch' | 'reveal'

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>('booting')
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [logoPos, setLogoPos] = useState({ x: 0, y: 0 })
  const [logoScale, setLogoScale] = useState(1)
  const [opacity, setOpacity] = useState(1)
  const timerRef = useRef(0)
  const rafRef = useRef(0)
  const phaseRef = useRef<Phase>('booting')

  const getPhase = () => phaseRef.current

  useEffect(() => {
    phaseRef.current = 'booting'
    setPhase('booting')
    setProgress(0)
    setLogoPos({ x: 0, y: 0 })
    setLogoScale(1)
    setGlowIntensity(0)
    setOpacity(1)

    // Phase 1: Booting — progress bar fills over 3.2s, then hold 0.5s before launching
    const BOOT_DURATION = 3200
    const HOLD_BEFORE_LAUNCH = 500
    const startTime = Date.now()

    timerRef.current = window.setInterval(() => {
      if (getPhase() !== 'booting') return
      const elapsed = Date.now() - startTime
      const p = Math.min(100, (elapsed / BOOT_DURATION) * 100)
      setProgress(p)

      if (p >= 100 && elapsed >= BOOT_DURATION + HOLD_BEFORE_LAUNCH) {
        clearInterval(timerRef.current)
        launchPhase()
      }
    }, 16)

    return () => {
      clearInterval(timerRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  function launchPhase() {
    phaseRef.current = 'launch'
    setPhase('launch')

    const W = window.innerWidth
    const H = window.innerHeight
    // Logo flies from center to upper-left corner (the "wall")
    const targetX = -W * 0.42
    const targetY = -H * 0.28
    const LAUNCH_DUR = 1000
    const t0 = Date.now()

    function frame(now: number) {
      if (getPhase() !== 'launch') return
      const t = Math.min(1, (now - t0) / LAUNCH_DUR)
      // Smooth ease-in-out
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

      setLogoPos({
        x: targetX * e,
        y: targetY * e - Math.sin(e * Math.PI) * 50,
      })
      setLogoScale(1 - e * 0.4) // shrinks slightly as it reaches wall

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        revealPhase()
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  function revealPhase() {
    phaseRef.current = 'reveal'
    setPhase('reveal')

    const REVEAL_DUR = 1400
    const t0 = Date.now()

    function frame(now: number) {
      if (getPhase() !== 'reveal') return
      const t = Math.min(1, (now - t0) / REVEAL_DUR)
      const ease = 1 - Math.pow(1 - t, 5)

      // Glow peaks early then fades
      const glow = t < 0.2
        ? ease * 5
        : Math.max(0, 5 * (1 - (t - 0.2) / 0.8))
      setGlowIntensity(glow)

      // Fade out the black screen
      setOpacity(Math.max(0, 1 - ease))

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        setTimeout(onComplete, 300)
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  const applePath = "M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-23.1-113.2-82.7-112.7-156.5zM245.3 41.3c22.6-27.9 37.9-66.6 33.7-105.4-32.4 2.1-71.4 21.6-94.8 49-20.9 24.3-38.4 64-33.3 101.3 36.2 2.8 70.2-16.8 94.4-44.9z"

  const isBoot = phase === 'booting'
  const isLaunch = phase === 'launch'
  const isReveal = phase === 'reveal'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#000',
        opacity,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: opacity <= 0 ? 'none' : 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Glow layers — only active during reveal */}
      {isReveal && glowIntensity > 0 && (
        <>
          {/* Warm center bloom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,200,100,${glowIntensity * 0.08}) 0%, rgba(255,150,50,${glowIntensity * 0.04}) 50%, transparent 75%)`,
          }} />
          {/* Corner light spill */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(ellipse 55% 35% at 0% 0%, rgba(255,220,150,${glowIntensity * 0.16}) 0%, transparent 55%),
              radial-gradient(ellipse 55% 35% at 100% 0%, rgba(255,220,150,${glowIntensity * 0.16}) 0%, transparent 55%),
              radial-gradient(ellipse 55% 35% at 0% 100%, rgba(255,220,150,${glowIntensity * 0.12}) 0%, transparent 55%),
              radial-gradient(ellipse 55% 35% at 100% 100%, rgba(255,220,150,${glowIntensity * 0.12}) 0%, transparent 55%)
            `,
          }} />
          {/* Rotating sunburst rays */}
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            width: `${150 + glowIntensity * 500}px`,
            height: `${150 + glowIntensity * 500}px`,
            transform: 'translate(-50%, -50%)',
            background: `conic-gradient(from 0deg through 360deg,
              transparent 0deg, rgba(255,215,130,${glowIntensity * 0.06}) 8deg, transparent 16deg,
              rgba(255,210,120,${glowIntensity * 0.04}) 36deg, transparent 44deg,
              rgba(255,215,130,${glowIntensity * 0.06}) 72deg, transparent 80deg,
              rgba(255,210,120,${glowIntensity * 0.04}) 108deg, transparent 116deg,
              rgba(255,215,130,${glowIntensity * 0.06}) 144deg, transparent 152deg,
              rgba(255,210,120,${glowIntensity * 0.04}) 180deg, transparent 188deg,
              rgba(255,215,130,${glowIntensity * 0.06}) 216deg, transparent 224deg,
              rgba(255,210,120,${glowIntensity * 0.04}) 252deg, transparent 260deg,
              rgba(255,215,130,${glowIntensity * 0.06}) 288deg, transparent 296deg,
              rgba(255,210,120,${glowIntensity * 0.04}) 324deg, transparent 332deg
            )`,
            animation: `bootBurst ${1.5 + glowIntensity * 0.3}s linear infinite`,
          }} />
          {/* Halo around logo wall position */}
          <div style={{
            position: 'absolute',
            left: 'calc(50% + 70px)', top: 'calc(50% - 40px)',
            width: `${100 + glowIntensity * 180}px`,
            height: `${100 + glowIntensity * 180}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,220,150,${glowIntensity * 0.2}) 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
          }} />
        </>
      )}

      {/* Logo + progress */}
      <div style={{
        position: 'relative',
        transform: `translate(${logoPos.x}px, ${logoPos.y}px) scale(${logoScale})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>
        {/* Apple logo */}
        <svg
          width={isLaunch ? 64 : 56}
          height={isLaunch ? 64 : 56}
          viewBox="0 0 384 512"
          fill={isReveal ? `rgba(255,245,230,${Math.min(1, glowIntensity * 0.85)})` : '#fff'}
          style={{
            filter: isReveal
              ? `drop-shadow(0 0 ${glowIntensity * 45}px rgba(255,200,80,${glowIntensity * 0.85})) drop-shadow(0 0 ${glowIntensity * 90}px rgba(255,140,40,${glowIntensity * 0.4}))`
              : 'drop-shadow(0 0 12px rgba(255,255,255,0.12))',
          }}
        >
          <path d={applePath} />
        </svg>

        {/* Progress bar — visible only during boot */}
        {isBoot && (
          <div style={{
            width: 200, height: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2, overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.6), #fff)',
              borderRadius: 2,
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              transition: 'width 0.1s linear',
            }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes bootBurst {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
