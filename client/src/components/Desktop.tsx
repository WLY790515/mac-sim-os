import React, { useMemo, useEffect } from 'react'
import { useAppRegistry } from '../contexts/AppRegistry.context'
import { useApp } from '../stores/app.store'
import MenuBar from './MenuBar'
import Dock from './Dock'
import WindowManager from './WindowManager'
import DesktopBackground from './DesktopBackground'
import Spotlight from './Spotlight'
import DesktopIcons from './DesktopIcons'

interface DesktopProps {
  welcomeKey?: string
}

export default function Desktop({ welcomeKey }: DesktopProps) {
  const { apps } = useAppRegistry()
  const { dispatch } = useApp()

  const dockApps = useMemo(() => apps, [apps])

  // Auto-open About window on first visit
  useEffect(() => {
    if (!welcomeKey) return
    const dismissed = localStorage.getItem(welcomeKey) === 'true'
    if (dismissed) return
    const aboutApp = apps.find(a => a.id === 'about')
    if (aboutApp) {
      dispatch({ type: 'OPEN_WINDOW', app: aboutApp })
      localStorage.setItem(welcomeKey, 'true')
    }
  }, [welcomeKey, apps, dispatch])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', userSelect: 'none' }}>
      <DesktopBackground />
      <DesktopIcons apps={apps} />
      <MenuBar apps={apps} />
      <WindowManager />
      <Dock apps={dockApps} />
      <Spotlight apps={apps} />
    </div>
  )
}
