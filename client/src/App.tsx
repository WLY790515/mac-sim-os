import React, { useState, useEffect } from 'react'
import type { AppDefinition } from './types'
import Desktop from './components/Desktop'
import BootScreen from './components/BootScreen'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import { AppRegistryProvider } from './contexts/AppRegistry.context'
import { AppProvider } from './stores/app.store'
import { FS } from './lib/filesystem'

interface AppProps {
  apps: AppDefinition[]
}

export default function App({ apps }: AppProps) {
  const [bootDone, setBootDone] = useState(false)

  useEffect(() => {
    FS.init().catch(console.error)
  }, [])

  return (
    <AppProvider>
      <AppRegistryProvider value={{ apps }}>
        {!bootDone && <BootScreen onComplete={() => setBootDone(true)} />}
        <Desktop />
        <KeyboardShortcuts />
        <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <filter id="clock-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
          </defs>
        </svg>
      </AppRegistryProvider>
    </AppProvider>
  )
}
