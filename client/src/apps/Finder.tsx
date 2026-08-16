import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useApp } from '../stores/app.store'
import { FS, getFileIcon, type FsItem } from '../lib/filesystem'

const ROOT_ID = '__root__'

interface ContextMenu {
  x: number; y: number; parentId: string
  targetItem?: FsItem
}

export default function FinderApp() {
  const { dispatch } = useApp()
  const [path, setPath] = useState<string[]>([ROOT_ID])
  const [view, setView] = useState<'icons' | 'list'>('icons')
  const [items, setItems] = useState<FsItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [ctxMenu, setCtxMenu] = useState<ContextMenu | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Load items for current path
  useEffect(() => {
    if (path.length === 0) return
    const p = path[path.length - 1]
    FS.getChildren(p).then(setItems).catch(console.error)
  }, [path])

  const currentParentId = path[path.length - 1] ?? ROOT_ID

  const parentMap = useMemo(() => {
    const m: Record<string, string> = { [ROOT_ID]: '' }
    path.slice(1).forEach((name, i) => { m[name] = path[i] })
    return m
  }, [path])

  const breadcrumb = path.map((id, i) => {
    const name = i === 0 ? 'mac-sim-os' : id
    return (
      <span key={i} style={{ cursor: i < path.length - 1 ? 'pointer' : 'default', opacity: i < path.length - 1 ? 0.6 : 1, color: '#1d1d1f', fontSize: 12 }}
        onClick={() => i < path.length - 1 && setPath(path.slice(0, i + 1))}>
        {name}
        {i < path.length - 1 && <span style={{ margin: '0 4px', opacity: 0.4 }}> / </span>}
      </span>
    )
  })

  const handleNav = useCallback(async (item: FsItem) => {
    if (item.kind === 'folder') {
      setSelected(null)
      setPath(prev => [...prev, item.id])
    }
  }, [])

  const handleBack = useCallback(() => {
    setPath(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
    setSelected(null)
  }, [])

  const handleUp = useCallback(() => {
    setPath(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
    setSelected(null)
  }, [])

  const handleRight = useCallback(() => {}, [])

  const handleDelete = useCallback(async (id: string) => {
    await FS.remove(id)
    setItems(prev => prev.filter(i => i.id !== id))
    if (selected === id) setSelected(null)
  }, [selected])

  const handleRename = useCallback(async (id: string, newName: string) => {
    await FS.update(id, { name: newName })
    setItems(prev => prev.map(i => i.id === id ? { ...i, name: newName } : i))
  }, [])

  const handleCreateFolder = useCallback(async () => {
    const name = 'New Folder'
    const folder = await FS.addFolder(currentParentId, name)
    setItems(prev => [...prev, folder])
    setRenameId(folder.id)
    setRenameValue(name)
  }, [currentParentId])

  const handleCreateFile = useCallback(async () => {
    const name = 'New File.txt'
    const file = await FS.addFileToFolder(currentParentId, name, '')
    setItems(prev => [...prev, file])
  }, [currentParentId])

  const handleUpload = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = async () => {
      for (const file of input.files!) {
        const buffer = await file.arrayBuffer()
        await FS.create({ name: file.name, kind: 'file', parentId: currentParentId, size: buffer.byteLength, modifiedAt: Date.now(), content: new Uint8Array(buffer) })
      }
      setItems(await FS.getChildren(currentParentId))
    }
    input.click()
  }, [currentParentId])

  const handleDownload = useCallback(async (item: FsItem) => {
    if (item.kind !== 'file' || !item.content) return
    const blob = new Blob([item.content.buffer as ArrayBuffer])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = item.name; a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent, item?: FsItem) => {
    e.preventDefault()
    e.stopPropagation()
    if (item) setSelected(item.id)
    setCtxMenu({ x: e.clientX, y: e.clientY, parentId: currentParentId, targetItem: item })
  }, [currentParentId])

  useEffect(() => {
    function onClick() { setCtxMenu(null) }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (ctxMenu) return
      if (e.key === 'Backspace' && !renameId) { handleBack() }
      if (e.key === 'Delete' && selected) { handleDelete(selected) }
      if (e.key === 'F2' && selected) {
        const item = items.find(i => i.id === selected)
        if (item) { setRenameId(selected); setRenameValue(item.name) }
      }
      if (e.key === 'Escape') { setCtxMenu(null); setSelected(null) }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [ctxMenu, renameId, selected, items, handleBack, handleDelete])

  const filteredItems = searchQuery.trim()
    ? items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items

  const ContextMenuItem = ({ label, action, danger }: { label: string; action: () => void; danger?: boolean }) => (
    <div onClick={() => { action(); setCtxMenu(null) }}
      style={{ padding: '6px 16px', fontSize: 13, cursor: 'pointer', color: danger ? '#ff3b30' : '#1d1d1f', display: 'flex', alignItems: 'center', gap: 8 }}>
      {label}
    </div>
  )

  const RenameInput = ({ id, value, onSubmit }: { id: string; value: string; onSubmit: (v: string) => void }) => (
    <input autoFocus defaultValue={value}
      onBlur={e => onSubmit((e.target as HTMLInputElement).value)}
      onKeyDown={e => { if (e.key === 'Enter') onSubmit((e.target as HTMLInputElement).value); if (e.key === 'Escape') setRenameId(null) }}
      style={{ fontSize: 11, padding: '1px 4px', border: '1px solid #007aff', borderRadius: 3, outline: 'none', width: '100%', background: '#fff' }}
    />
  )

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fafafa', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
      onClick={() => { setCtxMenu(null); setSelected(null) }}>

      {/* Sidebar */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: 170, background: 'rgba(0,0,0,0.04)', borderRight: '1px solid rgba(0,0,0,0.08)', padding: '8px 0', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '4px 12px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Favorites</div>
          {items.filter(i => i.kind === 'folder').slice(0, 6).map(folder => (
            <div key={folder.id} onClick={() => { setPath([ROOT_ID, folder.id]); setSelected(null) }}
              style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                background: path.includes(folder.id) && path.length <= 2 ? 'rgba(0,122,255,0.15)' : 'transparent',
                borderRadius: 6, margin: '1px 4px', }}>
              <span style={{ fontSize: 14 }}>📁</span> {folder.name}
            </div>
          ))}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '10px 12px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Locations</div>
          <div style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>💻 mac-sim-os (Local)</div>
          <div style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6 }}>☁️ iCloud Drive</div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ height: 38, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6 }}>
            <button onClick={handleUp} disabled={path.length <= 1}
              style={{ padding: '2px 8px', borderRadius: 6, fontSize: 16, opacity: path.length <= 1 ? 0.3 : 0.7, cursor: path.length <= 1 ? 'default' : 'pointer', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>▲</button>
            <button onClick={handleBack} disabled={path.length <= 1}
              style={{ padding: '2px 8px', borderRadius: 6, fontSize: 16, opacity: path.length <= 1 ? 0.3 : 0.7, cursor: path.length <= 1 ? 'default' : 'pointer', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>◀</button>
            <button onClick={handleRight} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 16, opacity: 0.3, cursor: 'default', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>▶</button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, padding: '2px 8px', background: 'rgba(0,0,0,0.06)', borderRadius: 6, marginLeft: 4, fontSize: 12, color: '#444' }}>
              {breadcrumb}
            </div>
            <div style={{ display: 'flex', gap: 4, marginLeft: 4, alignItems: 'center' }}>
              {/* Search */}
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..."
                onFocus={() => setShowSearch(true)} onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                style={{ width: showSearch || searchQuery ? 120 : 0, padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', fontSize: 12, outline: 'none', background: 'rgba(0,0,0,0.04)', transition: 'width 0.2s', overflow: 'hidden' }} />
              <button onClick={() => setView('icons')} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: view === 'icons' ? 'rgba(0,122,255,0.2)' : 'rgba(0,0,0,0.05)', color: view === 'icons' ? '#007aff' : '#444', cursor: 'pointer', border: 'none' }}>▦</button>
              <button onClick={() => setView('list')} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: view === 'list' ? 'rgba(0,122,255,0.2)' : 'rgba(0,0,0,0.05)', color: view === 'list' ? '#007aff' : '#444', cursor: 'pointer', border: 'none' }}>☰</button>
            </div>
          </div>

          {/* Toolbar actions */}
          <div style={{ height: 32, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6, fontSize: 12 }}>
            <button onClick={handleCreateFolder} style={btnStyle}>＋ New Folder</button>
            <button onClick={handleCreateFile} style={btnStyle}>＋ New File</button>
            <button onClick={handleUpload} style={btnStyle}>⬆ Upload</button>
            {selected && (
              <>
                <button onClick={() => { const it = items.find(i => i.id === selected); if (it) handleDownload(it) }} style={btnStyle}>⬇ Download</button>
                <button onClick={() => { const it = items.find(i => i.id === selected); if (it) handleDelete(selected!) }} style={{ ...btnStyle, color: '#ff3b30' }}>🗑 Delete</button>
                <button onClick={() => { const it = items.find(i => i.id === selected); if (it) { setRenameId(selected); setRenameValue(it.name) } }} style={btnStyle}>✏ Rename</button>
              </>
            )}
            <div style={{ flex: 1 }} />
            <span style={{ color: '#86868b', fontSize: 11 }}>{items.length} items · {selected ? '1 selected' : ''}</span>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}
            onContextMenu={e => handleContextMenu(e)}>
            {filteredItems.length === 0 && !searchQuery && (
              <div style={{ color: '#86868b', fontSize: 14, padding: 20, textAlign: 'center', width: '100%' }}>This folder is empty</div>
            )}
            {filteredItems.length === 0 && searchQuery && (
              <div style={{ color: '#86868b', fontSize: 14, padding: 20, textAlign: 'center', width: '100%' }}>No results for "{searchQuery}"</div>
            )}

            {view === 'icons' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
                {filteredItems.map(node => (
                  <div key={node.id}
                    onClick={e => { e.stopPropagation(); setSelected(node.id) }}
                    onDoubleClick={() => handleNav(node)}
                    onContextMenu={e => handleContextMenu(e, node)}
                    style={{
                      width: 84, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                      background: selected === node.id ? 'rgba(0,122,255,0.2)' : 'transparent',
                      border: `1px solid ${selected === node.id ? 'rgba(0,122,255,0.4)' : 'transparent'}`,
                    }}>
                    {renameId === node.id ? (
                      <RenameInput id={node.id} value={renameValue} onSubmit={v => { handleRename(node.id, v); setRenameId(null) }} />
                    ) : (
                      <>
                        <span style={{ fontSize: 32, lineHeight: 1 }}>{node.kind === 'folder' ? '📁' : getFileIcon(node.name)}</span>
                        <span style={{ fontSize: 11, color: '#333', wordBreak: 'break-all', lineHeight: 1.3 }}>{node.name}</span>
                      </>
                    )}
                  </div>
                ))}
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
                  {filteredItems.map(node => (
                    <tr key={node.id}
                      onClick={e => { e.stopPropagation(); setSelected(node.id) }}
                      onDoubleClick={() => handleNav(node)}
                      onContextMenu={e => handleContextMenu(e, node)}
                      style={{ background: selected === node.id ? 'rgba(0,122,255,0.1)' : 'transparent', cursor: 'pointer', borderRadius: 4 }}>
                      <td style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {renameId === node.id
                          ? <RenameInput id={node.id} value={renameValue} onSubmit={v => { handleRename(node.id, v); setRenameId(null) }} />
                          : <>{node.kind === 'folder' ? '📁' : getFileIcon(node.name)}</>}
                        {node.name}
                      </td>
                      <td style={{ padding: '4px 8px', color: '#86868b' }}>{node.kind === 'folder' ? '—' : FS.formatSize(node.size)}</td>
                      <td style={{ padding: '4px 8px', color: '#86868b' }}>{node.kind === 'folder' ? 'Folder' : (node.name.split('.').pop()?.toUpperCase() || 'File')}</td>
                      <td style={{ padding: '4px 8px', color: '#86868b' }}>{FS.formatDate(node.modifiedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Status bar */}
          <div style={{ height: 24, background: 'rgba(0,0,0,0.04)', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 11, color: '#86868b' }}>
            {filteredItems.length} items{searchQuery ? ` (filtered)` : ''}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {ctxMenu && (
        <div style={{ position: 'fixed', left: ctxMenu.x, top: ctxMenu.y, background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 9999, minWidth: 180, overflow: 'hidden' }}>
          {ctxMenu.targetItem ? (
            <>
              <ContextMenuItem label="Open" action={() => { if (ctxMenu.targetItem) handleNav(ctxMenu.targetItem) }} />
              {ctxMenu.targetItem.kind === 'file' && <ContextMenuItem label="Download" action={() => { if (ctxMenu.targetItem) handleDownload(ctxMenu.targetItem) }} />}
              <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '2px 0' }} />
              <ContextMenuItem label="Rename" action={() => { if (ctxMenu.targetItem) { setRenameId(ctxMenu.targetItem!.id); setRenameValue(ctxMenu.targetItem!.name) } }} />
              <ContextMenuItem label="Delete" action={() => { if (ctxMenu.targetItem) handleDelete(ctxMenu.targetItem.id) }} danger />
            </>
          ) : (
            <>
              <ContextMenuItem label="New Folder" action={handleCreateFolder} />
              <ContextMenuItem label="New File" action={handleCreateFile} />
              <ContextMenuItem label="Upload..." action={handleUpload} />
              <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '2px 0' }} />
              <ContextMenuItem label="Paste" action={() => {}} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '3px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
  background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.1)', color: '#1d1d1f',
}
