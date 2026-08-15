# VibeOS

> 在浏览器中运行的 macOS 风格操作系统模拟器

![VibeOS](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Node](https://img.shields.io/badge/Node-%3E%3D18-339935)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 预览

[在线演示]()（待部署）

![VibeOS Screenshot](./screenshot.png)

---

## 简介

VibeOS 是一个纯前端实现的类 macOS 桌面操作系统模拟器，采用 React + TypeScript 构建，核心交互包括：

- **可拖拽、可缩放、可最小化/最大化的窗口系统**
- **macOS 风格 Dock 栏**，支持悬停弹跳动画和活跃状态指示点
- **顶部菜单栏**，实时时钟、WiFi / 音量 / 电池状态图标
- **虚拟文件系统**，Finder 支持图标/列表两种视图、面包屑导航
- **内置应用**：Terminal（基于 WebContainer）、Safari、计算器、时钟（含世界时钟与秒表）、备忘录、音乐播放器等
- **Spotlight 全局搜索**入口

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 18 + TypeScript + Vite |
| 状态管理 | Zustand |
| 终端引擎 | `@webcontainer/api`（浏览器内 Node.js 运行时） |
| 后端服务 | Express（虚拟 FS API） |
| 包管理 | pnpm workspace |

---

## 目录结构

```
vibeos/
├── client/               # React 前端应用
│   ├── src/
│   │   ├── apps/         # 各应用组件（Terminal, Finder, Clock…）
│   │   ├── components/   # 桌面、Dock、MenuBar、WindowManager、Spotlight
│   │   ├── contexts/     # AppRegistry 上下文
│   │   ├── stores/       # Zustand 状态 store
│   │   └── types/        # TypeScript 类型定义
│   ├── public/icons/     # 应用图标资源（PNG / 动态 SVG）
│   └── package.json
├── server/               # Express 后端（虚拟文件系统）
│   └── src/index.ts
├── vibeos-icons/         # 完整图标集（21 个应用图标）
└── package.json          # 根 workspace
```

---

## 内置应用

| 应用 | 功能 |
|------|------|
| **Terminal** | 基于 WebContainer 的真实终端，支持 `ls`、`cd`、`mkdir`、`touch`、`echo`、`date`、`whoami`、`clear` 等命令及命令历史 |
| **Finder** | 虚拟文件系统浏览，支持图标/列表视图切换、侧边栏导航、面包屑路径 |
| **Safari** | 浏览器模拟，地址栏导航、历史记录前进/后退、书签面板 |
| **Clock** | 模拟时钟（60fps 平滑指针）、世界时钟、秒表、闹钟 |
| **Calculator** | 标准计算器 |
| **Notes** | 简易备忘录 |
| **Music** | 音乐播放器 |
| **Editor** | 文本编辑器 |
| **Settings** | 系统设置 |

---

## 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm（推荐）

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

同时启动客户端（Vite）和服务端（Express）：

```bash
pnpm dev
```

- 客户端：http://localhost:5173
- 服务端：http://localhost:4000

### 单独启动

```bash
# 仅客户端
pnpm dev:client

# 仅服务端
pnpm dev:server
```

### 生产构建

```bash
pnpm build    # 构建前端
pnpm start    # 启动服务端（含静态文件托管）
```

---

## 图标资源

图标存放在 `vibeos-icons/` 目录，包含：

- **21 个 PNG 应用图标**（从 macosicons.com 批量下载）
- **3 个动态 SVG 图标**：
  - `clock_dynamic.svg` — 时针/分针/秒针实时旋转，显示当前时间
  - `calendar_dynamic.svg` — 显示当前日期和星期
  - `terminal_dynamic.svg` — 带闪烁光标动画的终端界面

图标生成脚本：

```bash
node generate-dynamic-icons-v2.js   # 重新生成动态 SVG 图标
node download-icons.js              # 批量下载 PNG 图标
```

---

## 核心设计

### 窗口管理

使用 Zustand 集中管理所有窗口状态，支持：

- 拖拽移动（mousedown → mousemove → mouseup）
- 边缘拉伸缩放
- z-index 层级管理（点击置顶）
- 最小化/最大化/关闭

### Dock 动画

采用 CSS `transform: scale()` + `cubic-bezier` 弹性曲线，模拟 macOS Dock 的弹簧放大效果，同时保留独立的 tooltip 气泡。

### WebContainer 终端

通过 `@webcontainer/api` 在浏览器中启动轻量 Node.js 运行时，Terminal 应用可直接执行真实 JavaScript，为后续扩展（如运行 npm 包）提供基础。

---

## License

MIT
