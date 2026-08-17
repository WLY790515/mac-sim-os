---
created: 2025-01-01
updated: 2026-08-17
tags:
  - project
  - react
  - typescript
  - macOS
status: active
---

# mac-sim-os

> 在浏览器中运行的 macOS 风格操作系统模拟器

[[OBSIDIAN]] | [[TODO]] | [[CHANGELOG]]

---

## 🎯 简介

mac-sim-os 是一个基于 **React + TypeScript + IndexedDB** 的浏览器端 macOS 模拟器，完全纯前端运行，无需后端服务器。

**在线体验：** [wly790515.github.io/mac-sim-os](https://wly790515.github.io/mac-sim-os/)

| ![Desktop](assets/desktop_final.png) | ![Finder](assets/finder_final.png) |
|---|---|
| **桌面主界面** | **Finder 文件管理** |

| ![Terminal](assets/boot.png) | ![Calculator](assets/calculator_final.png) |
|---|---|
| **启动屏 / 终端** | **计算器** |

---

## ✨ 核心功能

### 桌面系统
- macOS 风格窗口管理：拖拽移动、边缘缩放、z-index 层级管理
- 红绿灯按钮动画：关闭（红）→ 居中缩小淡出；最小化（黄）→ easeIn 吸入 Dock；最大化（绿）→ easeOut 平滑展开
- 启动屏：Apple Logo 弹性进入 → 进度条加载 → 光晕爆发 → 淡出过渡
- **首次设置向导**：欢迎页 → 选择壁纸 → 选择主题（深浅色）
- 顶部菜单栏：实时时钟、WiFi / 电池状态图标、应用动态菜单
- 桌面壁纸渐变、桌面图标双击打开应用

### Dock 栏
- 悬停弹跳动画（CSS transform + cubic-bezier 弹性曲线）
- 图标位置共享（ref 同步 Dock 图标与窗口动画坐标）

### 内置应用（19 个）

| 应用 | 功能 |
|---|---|
| **Terminal** | 多标签终端，支持 ls/cd/cat/mkdir/touch/rm/cp/mv/echo/head/tail/find/grep/tree/neofetch，Tab 补全，命令历史，独立工作目录 |
| **Finder** | IndexedDB 虚拟文件系统浏览，图标/列表视图切换，侧边栏导航，面包屑路径，右键菜单，文件上传/下载 |
| **Safari** | 浏览器模拟，地址栏导航，历史记录前进/后退，书签面板 |
| **Clock** | 模拟时钟（60fps 平滑指针）、世界时钟、秒表、闹钟 |
| **Calculator** | 标准计算器 |
| **Notes** | IndexedDB 持久化备忘录，新建/编辑/删除/颜色选择，Tab 缩进 |
| **Music** | 音乐播放器 |
| **Calendar** | 添加/删除事件，颜色标记，右侧详情面板 |
| **Contacts** | IndexedDB CRUD，彩色头像，搜索过滤 |
| **Messages** | IndexedDB 对话持久化，自动回复，气泡消息 |
| **Mail** | IndexedDB 存储，收件箱/发件/草稿三文件夹，撰写/回复/删除 |
| **Photos** | 照片浏览器 |
| **Maps** | 地图应用 |
| **Weather** | 模拟天气 API，每 30s 刷新，7 日 + 24 小时预报 |
| **Videos** | 视频播放器 |
| **FaceTime** | 视频通话应用 |
| **Reminders** | 提醒事项 |
| **Editor** | 文本编辑器（行号、Tab 缩进） |
| **Settings** | 系统设置：主题切换、壁纸选择、玻璃效果、WiFi |

### 特效系统
- **Spotlight**：Cmd+Space 呼出，搜索所有应用
- **Mission Control**：右上角 ⊞ 按钮，窗口缩略图动画，点击聚焦/关闭
- **Control Center**：WiFi/蓝牙/亮度/音量快捷开关

### 键盘快捷键
- `Cmd+W` — 关闭当前窗口
- `Cmd+M` — 最小化窗口
- `Cmd+Q` — 退出所有窗口
- `Cmd+D` — 聚焦桌面
- `Cmd+F` — 全屏切换
- `Cmd+←/→/↑/↓` — 边缘分屏

---

## 🛠️ 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | React 18 + TypeScript 5 + Vite 5 |
| 状态管理 | React `useReducer` + Context API |
| 文件系统 | IndexedDB（自定义封装 `lib/filesystem.ts`） |
| 终端命令 | 自研虚拟文件系统命令层 `lib/terminal.ts` |
| 桌面客户端 | Electron（可选） |
| CI/CD | GitHub Actions → GitHub Pages 自动部署 |

---

## 📁 项目结构

```
vibeos/
├── client/                              # React 前端（Vite + Electron）
│   ├── src/
│   │   ├── apps/                       # 各应用组件（19 个）
│   │   │   ├── Calculator.tsx
│   │   │   ├── Terminal.tsx
│   │   │   ├── Finder.tsx
│   │   │   └── ...
│   │   ├── components/                 # 桌面核心组件
│   │   │   ├── BootScreen.tsx          # 启动动画
│   │   │   ├── SetupWizard.tsx         # 首次设置向导
│   │   │   ├── Desktop.tsx             # 桌面容器
│   │   │   ├── Window.tsx              # 单窗口（含动画引擎）
│   │   │   ├── WindowManager.tsx       # 窗口管理器
│   │   │   ├── MenuBar.tsx             # 动态菜单栏
│   │   │   ├── Dock.tsx                # Dock 栏
│   │   │   ├── Spotlight.tsx           # Spotlight 搜索
│   │   │   ├── MissionControl.tsx      # Mission Control
│   │   │   └── TerminalTab.tsx         # 终端标签页
│   │   ├── contexts/                   # AppRegistry 上下文
│   │   ├── lib/                        # 核心库
│   │   │   ├── filesystem.ts           # IndexedDB 文件系统封装
│   │   │   └── terminal.ts             # 终端命令执行引擎
│   │   ├── stores/                     # 状态管理
│   │   │   └── app.store.tsx           # useReducer + Context
│   │   ├── types/                      # TypeScript 类型定义
│   │   │   └── index.ts                # AppDefinition / WindowState 等
│   │   ├── registry.tsx                # 应用注册表（Dock 顺序）
│   │   ├── App.tsx                     # 根组件
│   │   └── main.tsx                    # 入口
│   ├── public/icons/                   # 应用图标（PNG + 动态 SVG）
│   ├── electron/                       # Electron 源文件
│   │   └── main.ts                     # Electron 主进程
│   └── package.json
├── server/
│   └── Caddyfile                       # Caddy 静态文件服务
├── assets/                             # README 截图资源
├── .github/workflows/deploy.yml        # GitHub Pages 自动部署
├── Dockerfile                          # Railway Docker 构建
└── README.md                           # 本文档
```

---

## 🚀 快速开始

### 环境要求
- Node.js ≥ 18

### 安装依赖
```bash
cd client
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:5173

### 本地生产预览
```bash
npm run build
npm run preview
```

### 打包 Electron 桌面应用
```bash
npm run electron:build
```
生成 Windows `.exe` 安装包。

---

## 🌐 部署

### GitHub Pages（推荐）
推送到 master 分支后自动触发 [GitHub Actions](https://github.com/WLY790515/mac-sim-os/actions) 构建部署。

访问：https://wly790515.github.io/mac-sim-os/

### Railway（备选）
1. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. 自动检测 `Dockerfile` 和 `Caddyfile` 并构建
3. 点击 **View Live** 获取地址

---

## 📄 License

MIT

---

> 有问题或建议欢迎提交 Issue 或 Pull Request ⭐
