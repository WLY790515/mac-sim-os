import React, { useState, useRef, useEffect } from 'react'

const URLS = ['https://www.apple.com', 'https://developer.apple.com', 'https://support.apple.com']
const DEFAULT_URL = 'https://www.apple.com'

const BOOKMARKS = [
  { name: 'Apple', url: 'https://www.apple.com', icon: '🍎' },
  { name: 'Developer', url: 'https://developer.apple.com', icon: '👨‍💻' },
  { name: 'Support', url: 'https://support.apple.com', icon: '🛠️' },
  { name: 'Store', url: 'https://www.apple.com/shop', icon: '🛒' },
]

export default function SafariApp() {
  const [url, setUrl] = useState(DEFAULT_URL)
  const [displayUrl, setDisplayUrl] = useState(DEFAULT_URL)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([DEFAULT_URL])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const navigate = (newUrl: string) => {
    let url = newUrl
    if (!url.startsWith('http')) url = 'https://' + url
    setUrl(url)
    setDisplayUrl(url)
    setIsLoading(true)
    setHistory(prev => {
      const newHist = [...prev.slice(0, historyIndex + 1), url]
      setHistoryIndex(newHist.length - 1)
      return newHist
    })
    // Simulate loading
    setTimeout(() => setIsLoading(false), 800)
  }

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setUrl(history[newIndex])
      setDisplayUrl(history[newIndex])
    }
  }

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setUrl(history[newIndex])
      setDisplayUrl(history[newIndex])
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Address bar */}
      <div style={{
        height: 44, background: 'rgba(245,245,247,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6,
      }}>
        <button onClick={goBack} disabled={historyIndex <= 0} style={{
          width: 28, height: 28, borderRadius: 8, fontSize: 14,
          background: historyIndex <= 0 ? 'transparent' : 'rgba(0,0,0,0.06)',
          border: 'none', cursor: historyIndex <= 0 ? 'default' : 'pointer',
          color: '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>◀</button>
        <button onClick={goForward} disabled={historyIndex >= history.length - 1} style={{
          width: 28, height: 28, borderRadius: 8, fontSize: 14,
          background: historyIndex >= history.length - 1 ? 'transparent' : 'rgba(0,0,0,0.06)',
          border: 'none', cursor: 'pointer', color: '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>▶</button>
        <button onClick={() => setShowBookmarks(!showBookmarks)} style={{
          width: 28, height: 28, borderRadius: 8, fontSize: 14,
          background: showBookmarks ? 'rgba(0,122,255,0.15)' : 'rgba(0,0,0,0.06)',
          border: 'none', cursor: 'pointer', color: showBookmarks ? '#007aff' : '#1d1d1f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>☆</button>
        <div style={{
          flex: 1, height: 30, background: 'rgba(0,0,0,0.06)', borderRadius: 8,
          display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6,
        }}>
          {isLoading && <span style={{ fontSize: 10, animation: 'spin 1s linear infinite' }}>⟳</span>}
          <input value={displayUrl} onChange={e => setDisplayUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(displayUrl)}
            onBlur={() => setDisplayUrl(url)}
            style={{ flex: 1, fontSize: 12, color: '#1d1d1f', background: 'transparent', fontFamily: '-apple-system, sans-serif' }}
          />
        </div>
        <button onClick={() => navigate(url)} style={{
          width: 28, height: 28, borderRadius: 8, fontSize: 14,
          background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', color: '#1d1d1f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>↗</button>
      </div>

      {/* Bookmarks panel */}
      {showBookmarks && (
        <div style={{
          background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '8px 12px', display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 11, color: '#86868b', alignSelf: 'center', marginRight: 4 }}>收藏夹：</span>
          {BOOKMARKS.map(b => (
            <button key={b.url} onClick={() => { navigate(b.url); setShowBookmarks(false); }}
              style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              {b.icon} {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Page content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          src={url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
        {/* Placeholder since most sites block iframes */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#fafafa',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🧭</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1d1d1f', marginBottom: 8 }}>Safari</div>
          <div style={{ fontSize: 13, color: '#86868b', textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
            This site blocks iframe embedding.<br />
            Use the address bar to navigate or bookmark.
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {BOOKMARKS.map(b => (
              <button key={b.url} onClick={() => navigate(b.url)}
                style={{ padding: '8px 16px', borderRadius: 12, fontSize: 13, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                {b.icon} {b.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
