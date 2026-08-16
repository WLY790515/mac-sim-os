export interface FsItem {
  id: string
  name: string
  kind: 'file' | 'folder'
  parentId: string | null
  size: number
  modifiedAt: number
  content?: Uint8Array
  createdAt: number
}

const DB_NAME = 'macsimos-fs'
const DB_STORE = 'items'
const DB_VERSION = 1

let _db: IDBDatabase | null = null

async function openDB(): Promise<IDBDatabase> {
  if (_db) return _db
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(DB_STORE)) {
        const store = db.createObjectStore(DB_STORE, { keyPath: 'id' })
        store.createIndex('parentId', 'parentId', { unique: false })
        store.createIndex('name', 'name', { unique: false })
      }
    }
    req.onsuccess = () => { _db = req.result; resolve(req.result) }
    req.onerror = () => reject(req.error)
  })
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const FS = {
  async init() {
    const db = await openDB()
    const tx = db.transaction(DB_STORE, 'readwrite')
    const store = tx.objectStore(DB_STORE)
    const countReq = store.count()
    const count = await new Promise<number>((resolve, reject) => {
      countReq.onsuccess = () => resolve(countReq.result)
      countReq.onerror = () => reject(countReq.error)
    })
    if (count === 0) {
      const now = Date.now()
      const rootId = '__root__'
      const folders: Array<{ id: string; name: string; parentId: string; kind: 'folder'; size: number; modifiedAt: number; createdAt: number }> = [
        { id: genId(), name: 'Desktop', parentId: rootId, kind: 'folder', size: 0, modifiedAt: now, createdAt: now },
        { id: genId(), name: 'Documents', parentId: rootId, kind: 'folder', size: 0, modifiedAt: now, createdAt: now },
        { id: genId(), name: 'Downloads', parentId: rootId, kind: 'folder', size: 0, modifiedAt: now, createdAt: now },
        { id: genId(), name: 'Projects', parentId: rootId, kind: 'folder', size: 0, modifiedAt: now, createdAt: now },
        { id: genId(), name: 'Music', parentId: rootId, kind: 'folder', size: 0, modifiedAt: now, createdAt: now },
        { id: genId(), name: 'Pictures', parentId: rootId, kind: 'folder', size: 0, modifiedAt: now, createdAt: now },
      ]
      for (const f of folders) await this.create(f)
      await store.add({ id: rootId, name: 'mac-sim-os', parentId: null, kind: 'folder', size: 0, modifiedAt: now, createdAt: now })
    }
  },

  async getAll(): Promise<FsItem[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const req = db.transaction(DB_STORE).objectStore(DB_STORE).getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  },

  async getChildren(parentId: string): Promise<FsItem[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly')
      const store = tx.objectStore(DB_STORE)
      const idx = store.index('parentId')
      const req = idx.getAll(parentId)
      req.onsuccess = () => resolve(req.result.sort((a, b) => a.name.localeCompare(b.name)))
      req.onerror = () => reject(req.error)
    })
  },

  async get(id: string): Promise<FsItem | undefined> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const req = db.transaction(DB_STORE).objectStore(DB_STORE).get(id)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  },

  async create(item: Omit<FsItem, 'id' | 'createdAt'>): Promise<FsItem> {
    const db = await openDB()
    const now = Date.now()
    const entry: FsItem = { ...item, id: genId(), createdAt: now }
    return new Promise((resolve, reject) => {
      const req = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).put(entry)
      req.onsuccess = () => resolve(entry)
      req.onerror = () => reject(req.error)
    })
  },

  async update(id: string, patch: Partial<FsItem>): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite')
      const store = tx.objectStore(DB_STORE)
      const getReq = store.get(id)
      getReq.onsuccess = () => {
        const item = getReq.result
        if (!item) { reject(new Error('not found')); return }
        Object.assign(item, patch, { modifiedAt: Date.now() })
        store.put(item)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }
      getReq.onerror = () => reject(getReq.error)
    })
  },

  async remove(id: string): Promise<void> {
    const db = await openDB()
    const children = await this.getChildren(id)
    for (const child of children) await this.remove(child.id)
    return new Promise((resolve, reject) => {
      const req = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  },

  async move(id: string, newParentId: string): Promise<void> {
    await this.update(id, { parentId: newParentId })
  },

  async search(query: string): Promise<FsItem[]> {
    const all = await this.getAll()
    const q = query.toLowerCase()
    return all.filter(item => item.name.toLowerCase().includes(q))
  },

  async readFile(id: string): Promise<string | null> {
    const item = await this.get(id)
    if (!item || item.kind !== 'file') return null
    if (!item.content) return ''
    return new TextDecoder().decode(item.content)
  },

  async writeFile(id: string, content: string): Promise<void> {
    await this.update(id, { content: new TextEncoder().encode(content), size: new TextEncoder().encode(content).length })
  },

  async addFileToFolder(parentId: string, name: string, content: string = ''): Promise<FsItem> {
    const bytes = new TextEncoder().encode(content)
    return this.create({ name, kind: 'file', parentId, size: bytes.length, modifiedAt: Date.now() })
  },

  async addFolder(parentId: string, name: string): Promise<FsItem> {
    return this.create({ name, kind: 'folder', parentId, size: 0, modifiedAt: Date.now() })
  },

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i]
  },

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  },
}

export function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const icons: Record<string, string> = {
    // Documents
    pdf: '📕', doc: '📘', docx: '📘', txt: '📄', md: '📝', rtf: '📄',
    // Images
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️', bmp: '🖼️',
    // Audio
    mp3: '🎵', wav: '🎵', flac: '🎵', m3u: '🎵', aac: '🎵',
    // Video
    mp4: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬', webm: '🎬',
    // Code
    js: '📜', ts: '📜', jsx: '📜', tsx: '📜', py: '🐍', go: '🔷', rust: '🦀',
    json: '📋', xml: '📋', yaml: '📋', yml: '📋', toml: '📋',
    html: '🌐', css: '🎨', scss: '🎨',
    sh: '⚡', bash: '⚡', zsh: '⚡',
    // Archives
    zip: '📦', tar: '📦', gz: '📦', dmg: '💿', pkg: '💿',
    // Data
    csv: '📊', xlsx: '📊', xls: '📊',
    // Fonts
    ttf: '🔤', otf: '🔤', woff: '🔤',
  }
  return icons[ext] ?? '📄'
}
