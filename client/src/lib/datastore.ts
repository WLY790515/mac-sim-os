const DB_NAME = 'macsimos-data'
const STORE_NAME = 'items'

async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getAll<T>(storeName = STORE_NAME): Promise<T[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

export async function put<T>(item: T, storeName = STORE_NAME): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function remove(id: string, storeName = STORE_NAME): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export function useData<T>(storeName: string) {
  const itemsRef = { current: [] as T[] }
  let loaded = false

  async function load() {
    if (loaded) return
    loaded = true
    try {
      itemsRef.current = await getAll<T>(storeName)
    } catch { itemsRef.current = [] }
  }

  async function setItems(items: T[]) {
    await load()
    const db = await getDB()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      tx.objectStore(storeName).clear()
      items.forEach(item => tx.objectStore(storeName).put(item))
      tx.oncomplete = () => { itemsRef.current = items; resolve() }
      tx.onerror = () => reject(tx.error)
    })
  }

  function addItem(item: T) {
    itemsRef.current = [...itemsRef.current, item]
    put(item, storeName).catch(console.error)
    return item
  }

  function updateItem(id: string, patch: Partial<T>) {
    const idx = itemsRef.current.findIndex((x: any) => x.id === id)
    if (idx < 0) return
    const next = { ...itemsRef.current[idx], ...patch, id }
    itemsRef.current[idx] = next
    put(next, storeName).catch(console.error)
  }

  function deleteItem(id: string) {
    itemsRef.current = itemsRef.current.filter((x: any) => x.id !== id)
    remove(id, storeName).catch(console.error)
  }

  return { load, set: setItems, add: addItem, update: updateItem, del: deleteItem, get current() { return itemsRef.current } }
}
