import React, { useEffect, useRef, useState } from 'react'
import { WebContainer } from '@webcontainer/api'
import { useApp } from '../stores/app.store'

interface ProcessEntry {
  id: number
  command: string
  output: string[]
  error?: string
}

const PROMPT = '~ $'

export default function TerminalApp() {
  const { state, dispatch } = useApp()
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)
  const [processes, setProcesses] = useState<ProcessEntry[]>([])
  const [currentCmd, setCurrentCmd] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const procId = useRef(0)
  const commandHistory = useRef<string[]>([])
  const historyIndex = useRef(-1)

  useEffect(() => {
    WebContainer.boot().then(setWebcontainer).catch(console.error)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [processes])

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentCmd, processes])

  const runCommand = async (cmd: string) => {
    const id = ++procId.current
    const newProc: ProcessEntry = { id, command: cmd, output: [] }
    setProcesses(prev => [...prev, newProc])
    commandHistory.current.push(cmd)
    historyIndex.current = commandHistory.current.length - 1

    if (!webcontainer) {
      setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: ['WebContainer not ready'] } : p))
      setCurrentCmd('')
      return
    }

    try {
      if (cmd.trim() === 'clear') {
        setProcesses([])
        setCurrentCmd('')
        return
      }

      if (cmd.trim() === 'echo hello') {
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: ['hello'] } : p))
        setCurrentCmd('')
        return
      }

      if (cmd.trim() === 'date') {
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: [new Date().toString()] } : p))
        setCurrentCmd('')
        return
      }

      if (cmd.trim() === 'whoami') {
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: ['vibeos'] } : p))
        setCurrentCmd('')
        return
      }

      if (cmd.trim() === 'pwd') {
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: ['/Users/vibeos'] } : p))
        setCurrentCmd('')
        return
      }

      if (cmd.trim() === 'ls') {
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: ['Desktop', 'Documents', 'Downloads', 'Projects', 'Music', 'Pictures'] } : p))
        setCurrentCmd('')
        return
      }

      if (cmd.trim().startsWith('mkdir ')) {
        const name = cmd.trim().slice(6)
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: [`Created directory: ${name}`] } : p))
        setCurrentCmd('')
        return
      }

      if (cmd.trim().startsWith('touch ')) {
        const name = cmd.trim().slice(6)
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: [`Created file: ${name}`] } : p))
        setCurrentCmd('')
        return
      }

      if (cmd.trim().startsWith('cat ')) {
        const name = cmd.trim().slice(4)
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: [`Contents of ${name}:\n(virtual file)`] } : p))
        setCurrentCmd('')
        return
      }

      if (cmd.trim().startsWith('cd ')) {
        setCurrentCmd('')
        return
      }

      if (cmd.trim() === 'help') {
        setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: [
          'Available commands:',
          '  ls            - List files',
          '  cd <dir>      - Change directory',
          '  pwd           - Print working directory',
          '  date          - Show current date/time',
          '  whoami        - Show current user',
          '  clear         - Clear terminal',
          '  echo <text>   - Print text',
          '  mkdir <name>  - Create directory',
          '  touch <name>  - Create file',
          '  help          - Show this help',
        ]} : p))
        setCurrentCmd('')
        return
      }

      // Simulate command output
      await new Promise(r => setTimeout(r, 200))
      setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: [`Command not found: ${cmd}`] } : p))
    } catch (e: any) {
      setProcesses(prev => prev.map(p => p.id === id ? { ...p, output: [e.message || String(e)] } : p))
    }
    setCurrentCmd('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') runCommand(currentCmd)
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex.current > 0) {
        historyIndex.current--
        setCurrentCmd(commandHistory.current[historyIndex.current])
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex.current < commandHistory.current.length - 1) {
        historyIndex.current++
        setCurrentCmd(commandHistory.current[historyIndex.current])
      } else {
        historyIndex.current = commandHistory.current.length
        setCurrentCmd('')
      }
    }
    if (e.key === 'c' && e.ctrlKey) {
      const id = ++procId.current
      setProcesses(prev => [...prev, { id, command: currentCmd + '^C', output: [] }])
      setCurrentCmd('')
    }
  }

  const winId = state.windows.find((w: any) => w.appId === 'terminal')?.id
  const closeBg = '#ff5f57', closeActive = '#e0443e'
  const minBg = '#febc2e', minActive = '#e0a020'
  const maxBg = '#28c840', maxActive = '#1fa832'

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'rgba(30,30,30,0.97)',
      color: '#f0f0f0',
      fontFamily: '"SF Mono", "Menlo", "Monaco", "Courier New", monospace',
      fontSize: 13,
      padding: '8px 12px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 38,
        background: 'rgba(45,45,45,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', padding: '0 12px',
        gap: 8, zIndex: 1,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => winId && dispatch({ type: 'CLOSE_WINDOW', id: winId })}
            style={{ width: 12, height: 12, borderRadius: '50%', background: closeBg, cursor: 'pointer', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          <button onClick={() => winId && dispatch({ type: 'MINIMIZE_WINDOW', id: winId })}
            style={{ width: 12, height: 12, borderRadius: '50%', background: minBg, cursor: 'pointer', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          <button onClick={() => winId && dispatch({ type: 'MAXIMIZE_WINDOW', id: winId })}
            style={{ width: 12, height: 12, borderRadius: '50%', background: maxBg, cursor: 'pointer', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        </div>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#ddd', opacity: 0.8, pointerEvents: 'none' }}>Terminal — bash</span>
        <div style={{ width: 52 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingTop: 44, paddingBottom: 8 }}>
        <div style={{ marginBottom: 8, opacity: 0.6, fontSize: 12 }}>Welcome to VibeOS Terminal (WebContainer)</div>
        {processes.map(proc => (
          <div key={proc.id} style={{ marginBottom: 4 }}>
            <div style={{ color: '#7ee787', marginBottom: 2 }}>{proc.command}</div>
            {proc.output.map((line, i) => (
              <div key={i} style={{ color: '#d4d4d4', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{line}</div>
            ))}
            {proc.error && proc.error.split('\n').map((line, i) => (
              <div key={`e${i}`} style={{ color: '#f48771', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{line}</div>
            ))}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#7ee787', whiteSpace: 'nowrap' }}>{PROMPT}</span>
          <input
            ref={inputRef}
            value={currentCmd}
            onChange={e => setCurrentCmd(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              flex: 1, background: 'transparent', color: '#f0f0f0',
              fontFamily: 'inherit', fontSize: 13, caretColor: '#7ee787',
              border: 'none', outline: 'none',
            }}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
