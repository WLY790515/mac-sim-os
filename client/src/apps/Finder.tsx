import React, { useState, useMemo } from 'react'

interface FsNode {
  name: string
  type: 'file' | 'folder'
  size?: string
  modified: string
  children?: FsNode[]
}

const FS_TREE: FsNode[] = [
  {
    name: 'Desktop', type: 'folder', modified: 'Aug 14, 2026',
    children: [
      { name: 'Projects', type: 'folder', modified: 'Aug 13, 2026' },
      { name: 'notes.md', type: 'file', size: '1.0 KB', modified: 'Aug 13, 2026' },
      { name: 'Screenshot.png', type: 'file', size: '240 KB', modified: 'Aug 13, 2026' },
    ],
  },
  {
    name: 'Documents', type: 'folder', modified: 'Aug 12, 2026',
    children: [
      { name: 'Resume.pdf', type: 'file', size: '500 KB', modified: 'Aug 10, 2026' },
      { name: 'Budget.xlsx', type: 'file', size: '37 KB', modified: 'Aug 11, 2026' },
      { name: 'Reports', type: 'folder', modified: 'Aug 9, 2026', children: [
        { name: 'Q2 Report.pdf', type: 'file', size: '1.2 MB', modified: 'Aug 9, 2026' },
        { name: 'Q3 Draft.pdf', type: 'file', size: '890 KB', modified: 'Aug 8, 2026' },
      ]},
    ],
  },
  {
    name: 'Downloads', type: 'folder', modified: 'Aug 13, 2026',
    children: [
      { name: 'vibeos-setup.dmg', type: 'file', size: '100 MB', modified: 'Aug 13, 2026' },
      { name: 'photo.jpg', type: 'file', size: '3.4 MB', modified: 'Aug 12, 2026' },
    ],
  },
  {
    name: 'Projects', type: 'folder', modified: 'Aug 13, 2026',
    children: [
      { name: 'vibeos-client', type: 'folder', modified: 'Aug 13, 2026', children: [
        { name: 'package.json', type: 'file', size: '0.5 KB', modified: 'Aug 13, 2026' },
        { name: 'src', type: 'folder', modified: 'Aug 13, 2026' },
      ]},
      { name: 'vibeos-server', type: 'folder', modified: 'Aug 13, 2026', children: [
        { name: 'index.ts', type: 'file', size: '2.1 KB', modified: 'Aug 13, 2026' },
      ]},
    ],
  },
  {
    name: 'Music', type: 'folder', modified: 'Aug 10, 2026',
    children: [
      { name: 'Playlist.m3u', type: 'file', size: '1.2 KB', modified: 'Aug 10, 2026' },
    ],
  },
  {
    name: 'Pictures', type: 'folder', modified: 'Aug 11, 2026',
    children: [
      { name: 'wallpaper-4k.jpg', type: 'file', size: '8.5 MB', modified: 'Aug 11, 2026' },
    ],
  },
]

const ICONS: Record<string, string> = {
  folder: '📁',
  pdf: '📄',
  jpg: '🖼️',
  png: '🖼️',
  dmg: '💿',
  json: '📋',
  ts: '⚙️',
  md: '📝',
  xlsx: '📊',
  m3u: '🎵',
}

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return ICONS[ext] || '📄'
}

export default function FinderApp() {
  const [path, setPath] = useState(['/'])
  const [view, setView] = useState<'icons' | 'list'>('icons')
  const [selected, setSelected] = useState<string | null>(null)

  const currentDir = useMemo(() => {
    if (path.length === 1 && path[0] === '/') return FS_TREE
    // Find the current directory in the tree
    let current: FsNode[] = FS_TREE
    for (let i = 1; i < path.length; i++) {
      const found = current.find(n => n.name === path[i] && n.children)
      if (found?.children) current = found.children
      else break
    }
    return current
  }, [path])

  const handleNav = (node: FsNode) => {
    if (node.type === 'folder') {
      setSelected(null)
      setPath(prev => [...prev, node.name])
    }
  }

  const handleBack = () => {
    setPath(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
    setSelected(null)
  }

  const breadcrumb = path.map((p, i) => (
    <span key={i} style={{ cursor: i < path.length - 1 ? 'pointer' : 'default', opacity: i < path.length - 1 ? 0.6 : 1 }}
      onClick={() => i < path.length - 1 && setPath(path.slice(0, i + 1))}>
      {p === '/' ? 'VibeOS' : p}
      {i < path.length - 1 && <span style={{ margin: '0 4px', opacity: 0.4 }}> / </span>}
    </span>
  ))

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fafafa', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: 170, background: 'rgba(0,0,0,0.04)',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          padding: '8px 0', overflow: 'auto', flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '4px 12px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Favorites</div>
          {FS_TREE.slice(0, 4).map(folder => (
            <div key={folder.name} onClick={() => { setPath(['/', folder.name]); setSelected(null); }}
              style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                background: path.includes(folder.name) && path.length <= 2 ? 'rgba(0,122,255,0.15)' : 'transparent',
                borderRadius: 6, margin: '1px 4px', }}>
              <span style={{ fontSize: 14 }}>{ICONS.folder}</span>
              {folder.name}
            </div>
          ))}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '10px 12px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Locations</div>
          <div style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>💻</span> VibeOS (Local)
          </div>
          <div style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6 }}>
            <span>☁️</span> iCloud Drive
          </div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{
            height: 38, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6,
          }}>
            <button onClick={handleBack} disabled={path.length <= 1}
              style={{ padding: '2px 8px', borderRadius: 6, fontSize: 16, opacity: path.length <= 1 ? 0.3 : 0.7, cursor: path.length <= 1 ? 'default' : 'pointer', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>
              ◀
            </button>
            <button style={{ padding: '2px 8px', borderRadius: 6, fontSize: 16, opacity: 0.5, cursor: 'pointer', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>▶</button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, padding: '2px 8px', background: 'rgba(0,0,0,0.06)', borderRadius: 6, marginLeft: 4, fontSize: 12, color: '#444' }}>
              {breadcrumb}
            </div>
            <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
              <button onClick={() => setView('icons')} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: view === 'icons' ? 'rgba(0,122,255,0.2)' : 'rgba(0,0,0,0.05)', color: view === 'icons' ? '#007aff' : '#444', cursor: 'pointer', border: 'none' }}>▦ Icons</button>
              <button onClick={() => setView('list')} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: view === 'list' ? 'rgba(0,122,255,0.2)' : 'rgba(0,0,0,0.05)', color: view === 'list' ? '#007aff' : '#444', cursor: 'pointer', border: 'none' }}>☰ List</button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {view === 'icons' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
                {currentDir.map(node => (
                  <div key={node.name} onClick={() => handleNav(node)} onDoubleClick={() => handleNav(node)}
                    style={{
                      width: 80, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                      background: selected === node.name ? 'rgba(0,122,255,0.2)' : 'transparent',
                      border: `1px solid ${selected === node.name ? 'rgba(0,122,255,0.4)' : 'transparent'}`,
                    }}>
                    <span style={{ fontSize: 32, lineHeight: 1 }}>{node.type === 'folder' ? '📁' : getFileIcon(node.name)}</span>
                    <span style={{ fontSize: 11, color: '#333', wordBreak: 'break-all', lineHeight: 1.3 }}>{node.name}</span>
                  </div>
                ))}
                {currentDir.length === 0 && (
                  <div style={{ color: '#86868b', fontSize: 14, padding: 20, textAlign: 'center', width: '100%' }}>This folder is empty</div>
                )}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', color: '#86868b', fontSize: 11, textAlign: 'left' }}>
                    <th style={{ padding: '4px 8px', fontWeight: 500 }}>Name</th>
                    <th style={{ padding: '4px 8px', fontWeight: 500 }}>Size</th>
                    <th style={{ padding: '4px 8px', fontWeight: 500 }}>Type</th>
                    <th style={{ padding: '4px 8px', fontWeight: 500 }}>Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDir.map(node => (
                    <tr key={node.name} onClick={() => handleNav(node)} onDoubleClick={() => handleNav(node)}
                      style={{ background: selected === node.name ? 'rgba(0,122,255,0.1)' : 'transparent', cursor: 'pointer', borderRadius: 4 }}>
                      <td style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{node.type === 'folder' ? '📁' : getFileIcon(node.name)}</span>
                        {node.name}
                      </td>
                      <td style={{ padding: '4px 8px', color: '#86868b' }}>{node.size || '—'}</td>
                      <td style={{ padding: '4px 8px', color: '#86868b' }}>{node.type === 'folder' ? 'Folder' : (node.name.split('.').pop()?.toUpperCase() || 'File')}</td>
                      <td style={{ padding: '4px 8px', color: '#86868b' }}>{node.modified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Status bar */}
          <div style={{ height: 24, background: 'rgba(0,0,0,0.04)', borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 11, color: '#86868b' }}>
            {currentDir.length} items
          </div>
        </div>
      </div>
    </div>
  )
}
