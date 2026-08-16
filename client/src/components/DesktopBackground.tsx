import React, { useEffect, useRef } from 'react'

export default function DesktopBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
    }}>
      {/* Subtle aurora-like light streaks */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 90% 50% at 20% 20%, rgba(59,130,246,0.15) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 50%),
          radial-gradient(ellipse 40% 30% at 60% 30%, rgba(236,72,153,0.08) 0%, transparent 40%)
        `,
      }} />
      {/* Soft light rays from top-left */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
      }} />
    </div>
  )
}
