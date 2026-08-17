import React, { useState, useCallback, useEffect } from 'react'
import { useApp } from '../stores/app.store'
import TerminalTab from '../components/TerminalTab'

interface Tab {
  id: number
  cwd: string
}

export default function TerminalApp() {
  const { state, dispatch } = useApp()
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, cwd: '/Users/mac-sim-os' }])
  const [activeTabId, setActiveTabId] = useState(1)
  const nextId = useCallback(() => Date.now() + Math.random(), [])

  const terminalWinId = state.windows.find((w: any) => w.appId === 'terminal')?.id

  // Listen for terminal menu commands
  useEffect(() => {
    if (!state.terminalAction) return
    if (state.terminalAction === 'clear') {
      setTabs(prev => prev.map(t => ({ ...t })))
      // Re-render all active tabs with empty lines by finding the active tab component ref
      // Actually we need to clear the lines of the active tab
      // Since we can't directly access TerminalTab, we'll clear by updating cwd to trigger re-mount
      // A better approach: dispatch a custom event
      window.dispatchEvent(new CustomEvent('terminal-clear'))
    }
    dispatch({ type: 'SET_TERMINAL_ACTION', action: null })
  }, [state.terminalAction, dispatch])

  const handleTrafficLight = useCallback((action: 'close' | 'minimize' | 'maximize') => {
    if (!terminalWinId) return
    if (action === 'close') dispatch({ type: 'CLOSE_WINDOW', id: terminalWinId })
    else if (action === 'minimize') dispatch({ type: 'MINIMIZE_WINDOW', id: terminalWinId })
    else if (action === 'maximize') dispatch({ type: 'MAXIMIZE_WINDOW', id: terminalWinId })
  }, [terminalWinId, dispatch])

  const addTab = useCallback(() => {
    const id = nextId()
    setTabs(prev => [...prev, { id, cwd: '/Users/mac-sim-os' }])
    setActiveTabId(id)
  }, [nextId])

  const closeTab = useCallback((id: number) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id)
      if (next.length === 0) {
        const newId = nextId()
        setActiveTabId(newId)
        return [{ id: newId, cwd: '/Users/mac-sim-os' }]
      }
      if (activeTabId === id) {
        const idx = prev.findIndex(t => t.id === id)
        setActiveTabId(next[Math.min(idx, next.length - 1)].id)
      }
      return next
    })
  }, [activeTabId, nextId])

  const updateCwd = useCallback((tabId: number, cwd: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, cwd } : t))
  }, [])

  const activeTab = tabs.find(t => t.id === activeTabId)!

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflow: 'hidden' }}>
      {/* Tab bar */}
      <div style={{
        height: 36,
        background: 'rgba(45,45,45,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'stretch',
        flexShrink: 0,
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0 }}>
          <div
            onClick={() => handleTrafficLight('close')}
            style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', cursor: 'pointer' }}
            title="关闭"
          />
          <div
            onClick={() => handleTrafficLight('minimize')}
            style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', cursor: 'pointer' }}
            title="最小化"
          />
          <div
            onClick={() => handleTrafficLight('maximize')}
            style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', cursor: 'pointer' }}
            title="最大化"
          />
        </div>

        {/* Tabs */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                height: '100%',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontSize: 12,
                color: tab.id === activeTabId ? '#f0f0f0' : 'rgba(200,200,200,0.5)',
                background: tab.id === activeTabId ? '#2d2d2d' : 'transparent',
                borderBottom: tab.id === activeTabId ? '2px solid #007acc' : '2px solid transparent',
                flexShrink: 0,
                fontFamily: '"SF Mono", "Menlo", monospace',
              }}>
              <span>⌘</span>
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                bash — {tab.cwd.replace('/Users/mac-sim-os', '~')}
              </span>
              <span
                onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
                style={{ opacity: 0.4, fontSize: 14, lineHeight: 1, cursor: 'pointer', marginLeft: 2 }}>
                ×
              </span>
            </div>
          ))}
        </div>

        {/* New tab button */}
        <button
          onClick={addTab}
          style={{
            height: 28, width: 28, borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
            border: 'none', color: '#aaa', fontSize: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 8px', flexShrink: 0,
          }}>
          +
        </button>
      </div>

      {/* Terminal content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TerminalTab
          key={activeTab.id}
          tabId={activeTab.id}
          cwd={activeTab.cwd}
          onCwdChange={(cwd) => updateCwd(activeTab.id, cwd)}
          onExit={() => closeTab(activeTab.id)}
        />
      </div>
    </div>
  )
}
