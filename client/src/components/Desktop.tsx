import React, { useMemo, useEffect } from 'react'
import { useAppRegistry } from '../contexts/AppRegistry.context'
import { useApp } from '../stores/app.store'
import MenuBar from './MenuBar'
import Dock from './Dock'
import WindowManager from './WindowManager'
import DesktopBackground from './DesktopBackground'
import Spotlight from './Spotlight'
import DesktopIcons from './DesktopIcons'
import SetupWizard from './SetupWizard'
import type { AppDefinition } from '../types'

interface DesktopProps {
  welcomeKey?: string
  apps?: AppDefinition[]
}

export default function Desktop({ welcomeKey, apps }: DesktopProps) {
  const registry = useAppRegistry()
  const _apps = apps ?? registry.apps
  const { dispatch } = useApp()

  const dockApps = useMemo(() => _apps, [_apps])

  // Auto-open About window on first visit (only if setup is done)
  useEffect(() => {
    if (!welcomeKey) return
    const setupDone = localStorage.getItem('macsimos-setup-done') === 'true'
    if (!setupDone) return
    const dismissed = localStorage.getItem(welcomeKey) === 'true'
    if (dismissed) return
    const aboutApp = _apps.find(a => a.id === 'about')
    if (aboutApp) {
      dispatch({ type: 'OPEN_WINDOW', app: aboutApp })
      localStorage.setItem(welcomeKey, 'true')
    }
  }, [welcomeKey, _apps, dispatch])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', userSelect: 'none' }}>
      <DesktopBackground />
      <DesktopIcons apps={_apps} />
      <MenuBar apps={_apps} />
      <WindowManager />
      <Dock apps={dockApps} />
      <Spotlight apps={_apps} />
      <SetupWizard apps={_apps} onComplete={() => {}} />
    </div>
  )
}
