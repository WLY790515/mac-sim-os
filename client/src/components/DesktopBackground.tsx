import React from 'react'
import { useApp } from '../stores/app.store'

type WallpaperId = 'aurora' | 'ocean' | 'sunset' | 'forest' | 'dawn' | 'midnight' | 'lava' | 'auroraLight'

const WALLPAPERS: Record<WallpaperId, { grad: string }> = {
  aurora:    { grad: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)' },
  ocean:     { grad: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  sunset:    { grad: 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)' },
  forest:    { grad: 'linear-gradient(135deg, #134e5e 0%, #71b28a 100%)' },
  dawn:      { grad: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)' },
  midnight:  { grad: 'linear-gradient(160deg, #0d1117 0%, #161b22 40%, #21262d 100%)' },
  lava:      { grad: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)' },
  auroraLight: { grad: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
}

export default function DesktopBackground() {
  const { state } = useApp()
  const wallpaper = state.wallpaper ?? 'aurora'
  const isGradient = !wallpaper.startsWith('url(')

  if (isGradient) {
    const g = WALLPAPERS[wallpaper as WallpaperId] || WALLPAPERS.aurora
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: g.grad, backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        {(wallpaper !== 'midnight' && wallpaper !== 'lava' && wallpaper !== 'ocean') && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(ellipse 90% 50% at 20% 20%, rgba(59,130,246,0.15) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 50%),
              radial-gradient(ellipse 40% 30% at 60% 30%, rgba(236,72,153,0.08) 0%, transparent 40%)
            `,
          }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 50%)' }} />
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: wallpaper, backgroundSize: 'cover', backgroundPosition: 'center',
    }} />
  )
}
