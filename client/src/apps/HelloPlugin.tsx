/**
 * Hello Plugin - 基础测试插件
 *
 * 演示插件系统的核心能力：
 * - dispatch: 系统操作
 * - notify: 通知
 * - storage: 持久化存储
 * - state: 系统状态读取
 */

import React from 'react'
import type { PluginRuntime } from '../lib/plugin-sdk'

export default function HelloPlugin({ runtime }: { runtime: PluginRuntime }) {
  const { dispatch, notify, storage, state } = runtime
  const [count, setCount] = React.useState(0)
  const [savedCount, setSavedCount] = React.useState<number | null>(null)

  // 加载保存的值
  React.useEffect(() => {
    if (storage) {
      storage.get<number>('count').then(val => setSavedCount(val ?? 0))
    }
  }, [storage])

  const handleIncrement = async () => {
    const next = count + 1
    setCount(next)
    if (storage) {
      await storage.set('count', next)
      setSavedCount(next)
    }
    notify(`计数已增加至 ${next}`, 'success')
  }

  const handleReset = () => {
    setCount(0)
    if (storage) {
      storage.set('count', 0).then(() => setSavedCount(0))
    }
    notify('计数器已重置', 'info')
  }

  const handleClose = () => {
    // 关闭当前窗口（需要知道 window id）
    const winId = state.windows.find((w: any) => w.appId === 'hello-plugin')?.id
    if (winId) {
      dispatch({ type: 'CLOSE_WINDOW', id: winId })
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>👋 Hello Plugin</span>
        <span style={styles.version}>v1.0.0</span>
      </div>

      <div style={styles.content}>
        <p style={styles.desc}>这是 mac-sim-os 的基础测试插件，演示了以下 API：</p>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>计数器（storage 测试）</h3>
          <p style={styles.meta}>保存值: <strong>{savedCount !== null ? savedCount : '—'}</strong></p>
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
          <h3 style={styles.sectionTitle}>通知（notify 测试）</h3>
          <button style={{ ...styles.btn, ...styles.btnSuccess }} onClick={() => notify('这是一条信息通知', 'info')}>
            信息通知
          </button>
          <button style={{ ...styles.btn, ...styles.btnSuccess }} onClick={() => notify('操作成功！', 'success')}>
            成功通知
          </button>
          <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => notify('发生了错误', 'error')}>
            错误通知
          </button>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>系统状态（state 测试）</h3>
          <ul style={styles.infoList}>
            <li>主题: <strong>{state.theme}</strong></li>
            <li>WiFi: <strong>{state.wifiOn ? '已连接' : '断开'}</strong></li>
            <li>电量: <strong>{state.battery}%</strong></li>
            <li>窗口数: <strong>{state.windows.length}</strong></li>
          </ul>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>系统操作（dispatch 测试）</h3>
          <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={handleClose}>
            关闭此窗口
          </button>
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
  title: { fontSize: 15, fontWeight: 600 },
  version: { fontSize: 12, color: '#86868b' },
  content: { flex: 1, overflow: 'auto', padding: '16px' },
  desc: { margin: '0 0 16px', color: '#6e6e73', fontSize: 13 },
  section: {
    marginBottom: 16,
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.06)',
  },
  sectionTitle: { margin: '0 0 8px', fontSize: 13, fontWeight: 600 },
  meta: { margin: '0 0 10px', fontSize: 12, color: '#86868b' },
  btnGroup: { display: 'flex', gap: 8 },
  btn: {
    padding: '6px 14px',
    fontSize: 13,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'opacity 0.15s',
  },
  btnPrimary: { background: '#0071e3', color: '#fff' },
  btnDanger: { background: '#ff3b30', color: '#fff' },
  btnSuccess: { background: '#34c759', color: '#fff' },
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
  footerText: { fontSize: 11, color: '#86868b' },
}
