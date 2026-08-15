import React from 'react'
import type { AppDefinition } from './types'
import Desktop from './components/Desktop'
import { AppRegistryProvider } from './contexts/AppRegistry.context'
import { AppProvider } from './stores/app.store'

interface AppProps {
  apps: AppDefinition[]
}

export default function App({ apps }: AppProps) {
  return (
    <AppProvider>
      <AppRegistryProvider value={{ apps }}>
        <Desktop />
        {/* Shared SVG filters to avoid duplicate ID issues when multiple clocks are open */}
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
