import React, { useMemo } from 'react'
import { useAppRegistry } from '../contexts/AppRegistry.context'
import MenuBar from './MenuBar'
import Dock from './Dock'
import WindowManager from './WindowManager'
import DesktopBackground from './DesktopBackground'
import Spotlight from './Spotlight'
import DesktopIcons from './DesktopIcons'

export default function Desktop() {
  const { apps } = useAppRegistry()

  const dockApps = useMemo(() => apps, [apps])

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
