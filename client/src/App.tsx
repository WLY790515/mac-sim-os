import React, { useState, useEffect } from 'react'
import type { AppDefinition } from './types'
import Desktop from './components/Desktop'
import BootScreen from './components/BootScreen'
import SetupWizard from './components/SetupWizard'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import { AppRegistryProvider } from './contexts/AppRegistry.context'
import { AppProvider } from './stores/app.store'
import { FS } from './lib/filesystem'

const WELCOME_KEY = 'macsimos-welcome-dismissed'
const SETUP_KEY = 'macsimos-setup-done'

interface AppProps {
  apps: AppDefinition[]
}

export default function App({ apps }: AppProps) {
  const [bootDone, setBootDone] = useState(false)
  const [setupDone] = useState(() => localStorage.getItem(SETUP_KEY) === 'true')

  useEffect(() => {
    FS.init().then(() => setBootDone(true)).catch(() => setBootDone(true))
  }, [])

  const handleSetupComplete = () => {
    localStorage.setItem(SETUP_KEY, 'true')
  }

  return (
    <AppProvider>
      <AppRegistryProvider value={{ apps }}>
        {!bootDone && <BootScreen onComplete={() => setBootDone(true)} />}
        {bootDone && !setupDone && <SetupWizard apps={apps} onComplete={handleSetupComplete} />}
        {bootDone && <Desktop welcomeKey={WELCOME_KEY} />}
        <KeyboardShortcuts />
        <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <filter id="clock-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
          </defs>
        </svg>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
          @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
          @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
          @keyframes ripple { 0% { transform: scale(0); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }
          @keyframes shake { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } }
          @keyframes glowPulse { 0%,100% { box-shadow: 0 0 8px rgba(0,122,255,0.15); } 50% { box-shadow: 0 0 20px rgba(0,122,255,0.35); } }
          @keyframes progressBar { 0% { width: 0%; } 100% { width: 100%; } }
          @keyframes rowSlideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes bubbleIn { from { opacity: 0; transform: translateY(8px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes tabSlide { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes cellPop { 0% { transform: scale(0.85); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
          @keyframes saveCheck { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
          @keyframes loadingBar { 0% { width: 0%; } 60% { width: 70%; } 100% { width: 100%; } }
          @keyframes navGlow { 0%,100% { box-shadow: 0 0 0 rgba(0,122,255,0); } 50% { box-shadow: 0 0 12px rgba(0,122,255,0.3); } }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
          @keyframes iconHover { 0% { transform: translateY(0); } 100% { transform: translateY(-3px); } }
          @keyframes deskFade { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
          @keyframes menuStagger { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes tickPulse { 0%,100% { transform: rotate(var(--sec-rot)); } 50% { transform: rotate(calc(var(--sec-rot) + 1deg)); } }
          @keyframes hourHand { from { transform: rotate(var(--hour-rot)); } to { transform: rotate(var(--hour-rot)); } }
          @keyframes timerRing { 0% { stroke-dashoffset: var(--circumference); } 100% { stroke-dashoffset: var(--target-offset); } }
          @keyframes vinylSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes skeletonPulse { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          @keyframes dropEnter { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes toastIn { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes toastOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(8px); } }
          @keyframes deskIconBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes focusRing { 0%,100% { border-color: rgba(0,122,255,0.2); } 50% { border-color: rgba(0,122,255,0.6); } }
          @keyframes alarmFlash { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
          @keyframes typingDot { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-4px); } }
        `}</style>
      </AppRegistryProvider>
    </AppProvider>
  )
}
