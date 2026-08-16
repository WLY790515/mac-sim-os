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
  const [screenAlpha, setScreenAlpha] = useState(1)
  const timerRef = useRef(0)
  const phaseRef = useRef<Phase>('booting')

  const getPhase = () => phaseRef.current

  useEffect(() => {
    phaseRef.current = 'booting'
    setPhase('booting')
    setProgress(0)
    setLogoPos({ x: 0, y: 0 })
    setLogoScale(1)
    setGlowIntensity(0)
    setScreenAlpha(1)

    const startTime = Date.now()
    const BOOT_DURATION = 2600

    timerRef.current = window.setInterval(() => {
      if (getPhase() !== 'booting') return
      const elapsed = Date.now() - startTime
      const p = Math.min(100, (elapsed / BOOT_DURATION) * 100)
      setProgress(p)

      if (p >= 100) {
        clearInterval(timerRef.current)
        launchPhase()
      }
    }, 16)

    return () => clearInterval(timerRef.current)
  }, [])

  function launchPhase() {
    phaseRef.current = 'launch'
    setPhase('launch')

    const W = window.innerWidth
    const H = window.innerHeight
    // Target: top-left wall area (~8% from left, ~12% from top)
    const targetX = -W * 0.38
    const targetY = -H * 0.22
    const startTime = Date.now()
    const DURATION = 1100

    function frame(now: number) {
      if (getPhase() !== 'launch') return
      const t = Math.min(1, (now - startTime) / DURATION)
      // Elastic ease out for dramatic fly
      const ease = t === 1 ? 1 : Math.pow(2, -10 * t) * Math.cos((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1
      const easedT = t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2

      setLogoPos({
        x: targetX * easedT,
        y: targetY * easedT - Math.sin(easedT * Math.PI) * 80, // arc
      })
      setLogoScale(0.5 + 0.5 * (1 - easedT)) // shrinks as it flies to wall

      if (t < 1) {
        requestAnimationFrame(frame)
      } else {
        revealPhase()
      }
    }
    requestAnimationFrame(frame)
  }

  function revealPhase() {
    phaseRef.current = 'reveal'
    setPhase('reveal')

    const startTime = Date.now()
    const DURATION = 1600

    function frame(now: number) {
      if (getPhase() !== 'reveal') return
      const t = Math.min(1, (now - startTime) / DURATION)
      // Quint ease out
      const ease = 1 - Math.pow(1 - t, 5)

      // Glow peaks then settles
      const glow = t < 0.25
        ? ease * 4
        : Math.max(0, 4 * (1 - (t - 0.25) / 0.75))
      setGlowIntensity(glow)

      // Screen fades from black to transparent
      setScreenAlpha(Math.max(0, 1 - ease))

      if (t < 1) {
        requestAnimationFrame(frame)
      } else {
        setTimeout(onComplete, 400)
      }
    }
    requestAnimationFrame(frame)
  }

  const applePath = "M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-23.1-113.2-82.7-112.7-156.5zM245.3 41.3c22.6-27.9 37.9-66.6 33.7-105.4-32.4 2.1-71.4 21.6-94.8 49-20.9 24.3-38.4 64-33.3 101.3 36.2 2.8 70.2-16.8 94.4-44.9z"

  const isBoot = phase === 'booting'
  const isLaunch = phase === 'launch'
  const isReveal = phase === 'reveal'

  return (
    <>
      {/* Black overlay that fades out on reveal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#000',
        opacity: screenAlpha,
        pointerEvents: screenAlpha <= 0 ? 'none' : 'all',
        transition: isReveal ? 'none' : undefined,
      }} />

      {/* Boot content — sits above the black overlay via a separate layer */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        pointerEvents: 'none',
      }}>
        {/* Glow layers (only during reveal) */}
        {isReveal && glowIntensity > 0 && (
          <>
            {/* Warm center glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,200,100,${glowIntensity * 0.1}) 0%, rgba(255,160,60,${glowIntensity * 0.05}) 50%, transparent 75%)`,
            }} />
            {/* Corner illumination */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `
                radial-gradient(ellipse 55% 35% at 0% 0%, rgba(255,220,150,${glowIntensity * 0.18}) 0%, transparent 55%),
                radial-gradient(ellipse 55% 35% at 100% 0%, rgba(255,220,150,${glowIntensity * 0.18}) 0%, transparent 55%),
                radial-gradient(ellipse 55% 35% at 0% 100%, rgba(255,220,150,${glowIntensity * 0.14}) 0%, transparent 55%),
                radial-gradient(ellipse 55% 35% at 100% 100%, rgba(255,220,150,${glowIntensity * 0.14}) 0%, transparent 55%)
              `,
            }} />
            {/* Radiating sunburst rays */}
            <div style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: `${150 + glowIntensity * 500}px`,
              height: `${150 + glowIntensity * 500}px`,
              transform: 'translate(-50%, -50%)',
              background: `conic-gradient(from 0deg through 360deg,
                transparent 0deg, rgba(255,215,130,${glowIntensity * 0.07}) 8deg, transparent 16deg,
                rgba(255,210,120,${glowIntensity * 0.05}) 36deg, transparent 44deg,
                rgba(255,215,130,${glowIntensity * 0.07}) 72deg, transparent 80deg,
                rgba(255,210,120,${glowIntensity * 0.05}) 108deg, transparent 116deg,
                rgba(255,215,130,${glowIntensity * 0.07}) 144deg, transparent 152deg,
                rgba(255,210,120,${glowIntensity * 0.05}) 180deg, transparent 188deg,
                rgba(255,215,130,${glowIntensity * 0.07}) 216deg, transparent 224deg,
                rgba(255,210,120,${glowIntensity * 0.05}) 252deg, transparent 260deg,
                rgba(255,215,130,${glowIntensity * 0.07}) 288deg, transparent 296deg,
                rgba(255,210,120,${glowIntensity * 0.05}) 324deg, transparent 332deg
              )`,
              animation: `bootBurst ${1.5 + glowIntensity * 0.3}s linear infinite`,
            }} />
            {/* Soft halo around logo position */}
            <div style={{
              position: 'absolute',
              left: 'calc(50% + 80px)', top: 'calc(50% - 50px)',
              width: `${120 + glowIntensity * 200}px`,
              height: `${120 + glowIntensity * 200}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,220,150,${glowIntensity * 0.25}) 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
            }} />
          </>
        )}

        {/* Apple logo container */}
        <div style={{
          position: 'relative',
          transform: `translate(${logoPos.x}px, ${logoPos.y}px) scale(${logoScale})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36,
        }}>
          {/* Logo */}
          <svg
            width={isLaunch ? 72 : 60}
            height={isLaunch ? 72 : 60}
            viewBox="0 0 384 512"
            fill={isReveal ? `rgba(255,245,230,${Math.min(1, glowIntensity * 0.9)})` : '#fff'}
            style={{
              filter: isReveal
                ? `drop-shadow(0 0 ${glowIntensity * 50}px rgba(255,200,80,${glowIntensity * 0.9})) drop-shadow(0 0 ${glowIntensity * 100}px rgba(255,140,40,${glowIntensity * 0.5}))`
                : 'drop-shadow(0 0 16px rgba(255,255,255,0.2))',
            }}
          >
            <path d={applePath} />
          </svg>

          {/* Progress bar */}
          {isBoot && (
            <div style={{
              width: 180, height: 3,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 2, overflow: 'hidden',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
            }}>
              <div style={{
                width: `${progress}%`, height: '100%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.7), #fff)',
                borderRadius: 2,
                boxShadow: '0 0 8px rgba(255,255,255,0.4)',
                transition: 'width 0.08s linear',
              }} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bootBurst {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </>
  )
}
