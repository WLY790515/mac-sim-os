import React from 'react'
import type { PluginRuntime } from '../../lib/plugin-sdk'

export default function HelloPlugin({ runtime }: { runtime: PluginRuntime }) {
  const { dispatch, notify, storage } = runtime
  const [count, setCount] = React.useState(0)
  const [savedCount, setSavedCount] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (storage) {
      storage.get('count').then(val => setSavedCount(val ?? 0))
    }
  }, [storage])

  const handleIncrement = async () => {
    const next = count + 1
    setCount(next)
    if (storage) {
      await storage.set('count', next)
      setSavedCount(next)
    }
  }

  const handleReset = () => {
    setCount(0)
    if (storage) {
      storage.set('count', 0).then(() => setSavedCount(0))
    }
  }

  const handleNotify = () => {
    notify(`当前计数: ${count}`, 'info')
  }

  const handleCloseParent = () => {
    // 尝试关闭当前窗口（实际需知道 window id，此处仅演示）
    notify('关闭功能需传入 windowId，当前为演示', 'info')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>👋 Hello Plugin</span>
        <span style={styles.version}>v{runtime.state.windows.length} 窗口</span>
      </div>

      <div style={styles.content}>
        <p style={styles.desc}>这是 mac-sim-os 的基础测试插件。</p>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>计数器</h3>
          <p style={styles.meta}>保存值: {savedCount ?? '—'}</p>
          <div style={styles.btnGroup}>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleIncrement}>
              + 增加 ({count})
            </button>
            <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={handleReset}>
              重置
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>通知</h3>
          <button style={{ ...styles.btn, ...styles.btnSuccess }} onClick={handleNotify}>
            弹出通知
          </button>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>系统信息</h3>
          <ul style={styles.infoList}>
            <li>主题: <strong>{runtime.state.theme}</strong></li>
            <li>壁纸: <strong>{runtime.state.wallpaper.slice(0, 40)}...</strong></li>
            <li>WiFi: <strong>{runtime.state.wifiOn ? '已连接' : '断开'}</strong></li>
            <li>电量: <strong>{runtime.state.battery}%</strong></li>
            <li>窗口数: <strong>{runtime.state.windows.length}</strong></li>
          </ul>
        </div>
      </div>

      <div style={styles.footer}>
        <span style={styles.footerText}>mac-sim-os Plugin SDK Demo</span>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: 'var(--bg, #f5f5f7)',
    color: 'var(--text, #1d1d1f)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
  },
  version: {
    fontSize: 12,
    color: '#86868b',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
  },
  desc: {
    margin: '0 0 16px',
    color: '#6e6e73',
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    margin: '0 0 8px',
    fontSize: 13,
    fontWeight: 600,
    color: '#1d1d1f',
  },
  meta: {
    margin: '0 0 10px',
    fontSize: 12,
    color: '#86868b',
  },
  btnGroup: {
    display: 'flex',
    gap: 8,
  },
  btn: {
    padding: '6px 14px',
    fontSize: 13,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'opacity 0.15s',
  },
  btnPrimary: {
    background: '#0071e3',
    color: '#fff',
  },
  btnDanger: {
    background: '#ff3b30',
    color: '#fff',
  },
  btnSuccess: {
    background: '#34c759',
    color: '#fff',
  },
  infoList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    color: '#3a3a3c',
    lineHeight: 1.8,
  },
  footer: {
    padding: '8px 16px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    background: 'rgba(255,255,255,0.5)',
  },
  footerText: {
    fontSize: 11,
    color: '#86868b',
  },
}
