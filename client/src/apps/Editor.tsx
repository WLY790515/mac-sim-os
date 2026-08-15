import React, { useState, useRef, useEffect } from 'react'

const DEFAULT_CODE = `// Welcome to VibeOS Editor
// Start typing your code here...

function hello() {
  console.log("Hello, VibeOS!")
  return 42
}

hello()
`

export default function EditorApp() {
  const [content, setContent] = useState(DEFAULT_CODE)
  const [fileName, setFileName] = useState('untitled.js')
  const [modified, setModified] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineCount = content.split('\n').length

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setModified(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      setContent(content.substring(0, start) + '  ' + content.substring(end))
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2 }, 0)
    }
  }

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
      {/* Tab bar */}
      <div style={{
        height: 30, background: '#2d2d2d', display: 'flex', alignItems: 'center',
        padding: '0 8px', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          padding: '3px 12px', background: '#1e1e1e', borderRadius: '6px 6px 0 0',
          fontSize: 12, color: '#ccc', display: 'flex', alignItems: 'center', gap: 6,
          border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none',
        }}>
          <span>{fileName.endsWith('.js') ? '⚙️' : '📄'}</span>
          {fileName}{modified && ' ●'}
        </div>
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Line numbers */}
        <div style={{
          width: 48, background: '#1e1e1e', color: '#555', fontSize: 12,
          fontFamily: '"SF Mono", "Menlo", monospace', lineHeight: '20px',
          textAlign: 'right', paddingRight: 8, overflow: 'hidden', flexShrink: 0,
        }}>
          {lineNumbers.map(n => <div key={n}>{n}</div>)}
        </div>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          style={{
            flex: 1, background: '#1e1e1e', color: '#d4d4d4',
            fontFamily: '"SF Mono", "Menlo", monospace', fontSize: 13,
            lineHeight: '20px', padding: '0 12px', resize: 'none',
            border: 'none', outline: 'none', tabSize: 2,
          }}
        />
      </div>

      {/* Status bar */}
      <div style={{
        height: 24, background: '#007acc', display: 'flex',
        alignItems: 'center', padding: '0 10px', fontSize: 11, color: 'rgba(255,255,255,0.9)',
        gap: 16,
      }}>
        <span>master*</span>
        <span>Ln {lineCount}, Col 1</span>
        <span style={{ marginLeft: 'auto' }}>JavaScript · UTF-8 · Spaces: 2</span>
      </div>
    </div>
  )
}
