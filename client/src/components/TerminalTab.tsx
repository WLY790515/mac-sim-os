import React, { useState, useRef, useEffect, useCallback } from 'react'
import { executeCommand, type TermLine } from '../lib/terminal'

const DEFAULT_PATH = '/Users/mac-sim-os'

interface TerminalTabProps {
  tabId: number
  cwd: string
  onCwdChange: (newCwd: string) => void
  onExit: () => void
}

export default function TerminalTab({ tabId, cwd, onCwdChange, onExit }: TerminalTabProps) {
  const [lines, setLines] = useState<TermLine[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const procId = useRef(0)

  const escCwd = cwd === DEFAULT_PATH ? '~' : cwd.replace(DEFAULT_PATH + '/', '')
  const PROMPT = `${escCwd}$ `

  useEffect(() => {
    if (lines.length === 0) {
      setLines([{ id: ++procId.current, output: [
        `mac-sim-os 终端 v1.0`,
        `输入 'help' 查看可用命令。`,
        '',
      ]}])
    }
  }, [tabId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus()
  }, [tabId])

  const runCommand = useCallback(async (cmd: string) => {
    const id = ++procId.current
    setLines(prev => [...prev, { id, input: cmd, output: [] }])
    setHistory(prev => [...prev, cmd])
    setHistIdx(prev => prev + 1)
    setInput('')

    if (!cmd.trim()) return

    const result = await executeCommand(cmd, cwd)
    setLines(prev => prev.map(l => l.id === id ? { ...l, output: result.output } : l))

    if (result.newCwd) {
      onCwdChange(result.newCwd)
    }
    if (result.special === 'clear') {
      setLines([])
    }
    if (result.special === 'exit') {
      onExit()
    }
  }, [cwd, onCwdChange, onExit])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0 && histIdx > 0) {
        setHistIdx(prev => prev - 1)
        setInput(history[histIdx - 1])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx < history.length - 1) {
        setHistIdx(prev => prev + 1)
        setInput(history[histIdx + 1])
      } else {
        setHistIdx(prev => prev + 1)
        setInput('')
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      const id = ++procId.current
      setLines(prev => [...prev, { id, input: input + '^C', output: [] }])
      setInput('')
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }, [input, history, histIdx, runCommand])

  const handleTabComplete = useCallback(() => {
    if (!input.trim()) return
    const parts = input.split(/\s+/)
    const last = parts[parts.length - 1]
    if (!last) return

    import('../lib/filesystem').then(async ({ FS }) => {
      let searchPath = cwd
      if (last.includes('/')) {
        const idx = last.lastIndexOf('/')
        searchPath = last.slice(0, idx + 1) || '/'
      }
      let currentId = '__root__'
      const resolveParts = searchPath === '/' ? [] : searchPath.split('/').filter(Boolean)
      for (const p of resolveParts) {
        const children = await FS.getChildren(currentId)
        const found = children.find(c => c.name === p)
        if (!found) return
        currentId = found.id
      }
      const children = await FS.getChildren(currentId)
      const prefix = last.split('/').pop()!
      const matches = children.filter(c => c.name.startsWith(prefix))
      if (matches.length === 1) {
        const match = matches[0]
        const beforeSlash = last.lastIndexOf('/') >= 0 ? last.slice(0, last.lastIndexOf('/') + 1) : ''
        const suffix = match.kind === 'folder' ? '/' : ' '
        const newInput = parts.length === 1
          ? beforeSlash + match.name + suffix
          : parts.slice(0, -1).join(' ') + ' ' + beforeSlash + match.name + suffix
        setInput(newInput)
      } else if (matches.length > 1) {
        setLines(prev => [...prev, {
          id: ++procId.current,
          input,
          output: matches.map(m => m.name + (m.kind === 'folder' ? '/' : '')),
        }])
      }
    })
  }, [input, cwd])

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
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 8 }}>
        {lines.map(line => (
          <div key={line.id} style={{ marginBottom: 2, animation: 'fadeIn 0.15s ease-out' }}>
            {line.input !== undefined && (
              <div style={{ color: '#7ee787', whiteSpace: 'pre-wrap' }}>{line.input}</div>
            )}
            {line.output.map((text, i) => (
              <div key={i} style={{
                color: line.isError ? '#f48771' : '#d4d4d4',
                whiteSpace: 'pre-wrap', lineHeight: 1.5,
                animation: 'fadeIn 0.2s ease-out',
              }}>{text}</div>
            ))}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#7ee787', whiteSpace: 'nowrap' }}>{PROMPT}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onContextMenu={e => {
              e.preventDefault()
              navigator.clipboard.readText().then(t => setInput(prev => prev + t))
            }}
            onKeyDownCapture={e => {
              if (e.key === 'Tab') {
                e.preventDefault()
                handleTabComplete()
              }
            }}
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
