/**
 * Plugin Adapter
 *
 * 将插件组件与系统状态桥接，注入 PluginRuntime。
 * 插件开发者无需感知此层，由系统自动包装。
 */

import React, { useEffect, useRef } from 'react'
import { useApp } from '../stores/app.store'
import { FS } from '../lib/filesystem'
import type { PluginRuntime, PluginProps } from '../lib/plugin-sdk'

// ─── 持久化存储实现（按插件 ID 命名空间）────────────────────────

class PluginStorageImpl {
  private prefix: string

  constructor(private pluginId: string) {
    this.prefix = `plugin:${pluginId}:`
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.prefix + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    localStorage.setItem(this.prefix + key, JSON.stringify(value))
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key)
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix))
    keys.forEach(k => localStorage.removeItem(k))
  }

  async keys(): Promise<string[]> {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .map(k => k.slice(this.prefix.length))
  }
}

// ─── 通知实现 ────────────────────────────────────────────────────────

function createNotify(dispatch: ReturnType<typeof useApp>['dispatch']) {
  return (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    // 创建临时 toast 元素
    const el = document.createElement('div')
    el.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      padding: 8px 16px; border-radius: 8px; font-size: 13px; font-family: -apple-system, sans-serif;
      color: #fff; z-index: 99999; animation: toastIn 0.2s ease;
      background: ${type === 'success' ? '#34c759' : type === 'error' ? '#ff3b30' : '#0071e3'};
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    `
    el.textContent = message
    document.body.appendChild(el)
    setTimeout(() => {
      el.style.animation = 'toastOut 0.2s ease forwards'
      setTimeout(() => el.remove(), 200)
    }, 2000)
  }
}

// ─── 插件适配器组件 ────────────────────────────────────────────────────

export default function PluginAdapter({
  pluginComponent: PluginComponent,
  pluginId,
  permissions = [],
}: {
  pluginComponent: React.ComponentType<any>
  pluginId: string
  permissions?: ('fs' | 'storage' | 'clipboard' | 'network')[]
}) {
  const { state, dispatch } = useApp()
  const runtimeRef = useRef<PluginRuntime | null>(null)

  // 构建 runtime
  useEffect(() => {
    const runtime: PluginRuntime = {
      dispatch,
      state,
      fs: permissions.includes('fs') ? FS : undefined,
      storage: permissions.includes('storage') ? new PluginStorageImpl(pluginId) : undefined,
      clipboard: permissions.includes('clipboard') ? {
        read: () => navigator.clipboard.readText(),
        write: (text) => navigator.clipboard.writeText(text),
      } : undefined,
      fetch: permissions.includes('network') ? window.fetch.bind(window) : undefined,
      notify: createNotify(dispatch),
    }
    runtimeRef.current = runtime
    // 也注入到 window 供开发调试使用
    window.__pluginRuntime__ = runtime
  }, [dispatch, state, pluginId, permissions])

  // 同步 state 更新
  useEffect(() => {
    if (runtimeRef.current) {
      runtimeRef.current.state = state
    }
  }, [state])

  if (!runtimeRef.current) return null

  return <PluginComponent runtime={runtimeRef.current} />
}
