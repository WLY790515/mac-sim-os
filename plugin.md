---
created: 2026-08-17
updated: 2026-08-17
tags:
  - plugin
  - specification
  - sdk
status: active
---

# mac-sim-os 插件系统规范

> 定义第三方应用的格式、加载方式、运行时 API 及开发工具链。

---

## 1. 概述

mac-sim-os 支持通过 **GitHub 插件仓库** 扩展系统功能。每个插件是一个独立的 GitHub 仓库，
内置「应用商店」页面可从仓库清单中浏览并一键安装。

---

## 2. 仓库命名规范

| 项目 | 规范 |
|------|------|
| 仓库名 | `mac-sim-os-plugin-{插件名}` |
| 分支 | 以插件功能命名，默认分支为 `main` |
| 仓库地址格式 | `https://github.com/WLY790515/mac-sim-os-plugin-{name}` |

---

## 3. Manifest 格式

每个插件仓库**根目录**必须包含 `manifest.json`：

```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "icon": "https://raw.githubusercontent.com/WLY790515/mac-sim-os-plugin-my-plugin/main/icon.png",
  "component": "https://raw.githubusercontent.com/WLY790515/mac-sim-os-plugin-my-plugin/main/dist/plugin.js",
  "defaultSize": { "width": 600, "height": 400 },
  "defaultPosition": { "x": 100, "y": 80 },
  "menus": [],
  "version": "1.0.0",
  "author": "作者名",
  "license": "MIT",
  "description": "插件简短描述",
  "permissions": ["fs", "storage"],
  "dependencies": []
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | ✅ | 唯一标识，小写英文 + 连字符，如 `weather-dashboard` |
| `name` | `string` | ✅ | 显示名称 |
| `icon` | `string` | ✅ | 图标 URL（PNG/SVG，建议 128×128） |
| `component` | `string` | ✅ | 打包后 ESM 文件 URL（必须是 https） |
| `defaultSize` | `{width: number, height: number}` | ❌ | 窗口默认尺寸，默认 `{680, 480}` |
| `defaultPosition` | `{x: number, y: number}` | ❌ | 窗口默认位置 |
| `menus` | `AppMenu[]` | ❌ | 菜单栏配置，格式与内置应用一致 |
| `version` | `string` | ❌ | semver 格式 |
| `author` | `string` | ❌ | 作者名 |
| `license` | `string` | ❌ | 开源协议 |
| `description` | `string` | ❌ | 插件描述（用于商店展示） |
| `permissions` | `string[]` | ❌ | 声明的系统权限，详见第 5 节 |
| `dependencies` | `string[]` | ❌ | 依赖的其他插件 id 列表 |

---

## 4. 插件组件格式

### 4.1 打包要求

- 使用 **Vite** 打包为单文件 ESM（`dist/plugin.js`）
- `build.target` 设为 `esnext`
- `build.lib` 配置 `formats: ['es']`
- 输出文件名固定为 `plugin.js`

### 4.2 导出格式

```tsx
// src/main.tsx
import React from 'react'
import type { PluginRuntime } from '@macsimos/plugin-sdk'

export default function MyPlugin({ runtime }: { runtime: PluginRuntime }) {
  const { dispatch, fs, notify } = runtime

  return (
    <div style={{ padding: 20 }}>
      <h1>Hello Plugin</h1>
    </div>
  )
}
```

### 4.3 样式规范

- 使用 **CSS Modules**（文件名 `.module.css`）
- 或内联 `style` 对象
- 禁止使用全局 CSS 类名（`.sidebar`, `.button` 等易冲突的名称）
- 推荐使用语义化前缀：`myplugin-container`, `myplugin-button`

---

## 5. 权限模型

| 权限标识 | 含义 | 对应 API |
|----------|------|----------|
| `fs` | 虚拟文件系统访问 | `runtime.fs` |
| `storage` | 持久化存储 | `runtime.storage` |
| `clipboard` | 剪贴板读写 | `runtime.clipboard` |
| `network` | 网络请求 | `runtime.fetch` |

**规则**：
- manifest 未声明的权限，对应 API 为 `undefined`
- 插件不得尝试绕过权限调用未声明的能力

---

## 6. 插件运行时 API

```typescript
interface PluginRuntime {
  // ─── 系统状态 ───
  dispatch: (action: AppAction) => void
  state: State

  // ─── 文件系统（需 'fs' 权限） ───
  fs: typeof FS | undefined

  // ─── 持久化存储（需 'storage' 权限） ───
  storage: StorageAPI | undefined

  // ─── 剪贴板（需 'clipboard' 权限） ───
  clipboard: {
    read: () => Promise<string>
    write: (text: string) => Promise<void>
  } | undefined

  // ─── 网络（需 'network' 权限） ───
  fetch: (url: string, init?: RequestInit) => Promise<Response> | undefined

  // ─── 通知 ───
  notify: (message: string, type?: 'info' | 'success' | 'error') => void
}
```

### 存储 API（storage 权限）

```typescript
interface StorageAPI {
  get: (key: string) => Promise<any>
  set: (key: string, value: any) => Promise<void>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
}
// key 自动加前缀：`plugin:{pluginId}:`
```

---

## 7. 数据隔离

插件数据按 **插件 ID 命名空间** 存储在 IndexedDB 中：

| 插件 ID | Storage Key 前缀 |
|---------|-----------------|
| `weather-dashboard` | `plugin:weather-dashboard:` |
| `code-editor-plus` | `plugin:code-editor-plus:` |

- 各插件数据完全隔离，不可互相访问
- 卸载插件时自动清除该命名空间下的所有数据

---

## 8. 错误处理

- 插件组件渲染报错时，显示 **错误边界 UI**（红色警告卡片）
- 错误信息包含：插件名称、错误类型、最后更新时间
- 不影响系统其他部分运行
- 用户可通过应用商店「卸载」按钮移除出问题的插件

---

## 9. 应用商店集成

### 9.1 插件清单

主仓库（`WLY790515/mac-sim-os`）维护 `plugins/registry.json`：

```json
[
  {
    "id": "my-plugin",
    "repo": "WLY790515/mac-sim-os-plugin-my-plugin",
    "branch": "main",
    "addedAt": "2026-08-17"
  }
]
```

### 9.2 安装流程

1. 用户在「应用商店」选择插件
2. 系统读取 `plugins/registry.json` 获取仓库和分支信息
3. 通过 GitHub API 拉取 `manifest.json` 和 `dist/plugin.js`
4. 验证 manifest 格式和权限声明
5. 将插件写入 IndexedDB `plugins` 表
6. 在 Dock 和菜单栏中注册该插件

---

## 10. 插件模板项目

仓库：`WLY790515/mac-sim-os-plugin-template`

```
mac-sim-os-plugin-template/
├── src/
│   ├── main.tsx          # 插件入口，default export
│   └── styles.module.css # CSS Modules 样式（可选）
├── public/
│   └── icon.png          # 128×128 图标
├── manifest.json         # 插件清单（安装前填写真实 URL）
├── vite.config.ts        # 已配置 lib 模式
├── package.json
└── tsconfig.json
```

### vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'Plugin',
      fileName: () => 'plugin.js',
      formats: ['es'],
    },
    target: 'esnext',
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
```

### manifest.json（模板）

```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "icon": "https://raw.githubusercontent.com/YOUR-REPO/main/public/icon.png",
  "component": "https://raw.githubusercontent.com/YOUR-REPO/main/dist/plugin.js",
  "version": "1.0.0",
  "author": "Your Name",
  "license": "MIT",
  "permissions": [],
  "dependencies": []
}
```

---

## 11. 快速开始

```bash
# 1. 克隆模板
git clone https://github.com/WLY790515/mac-sim-os-plugin-template.git
cd mac-sim-os-plugin-my-plugin

# 2. 安装依赖
npm install

# 3. 编辑 src/main.tsx
# 4. 更新 manifest.json（替换 YOUR-REPO 为实际仓库地址）
# 5. 构建
npm run build

# 6. 推送到 GitHub
git add .
git commit -m "feat: initial plugin"
git push origin main
```

---

## 12. SDK 类型定义

见 `client/src/lib/plugin-sdk.ts`，安装方式：

```bash
npm install @macsimos/plugin-sdk --save-dev
```
