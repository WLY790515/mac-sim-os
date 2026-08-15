# VibeOS

> 在浏览器中运行的 macOS 风格操作系统模拟器

![VibeOS](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Node](https://img.shields.io/badge/Node-%3E%3D18-339935)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 预览

[在线演示](https://vibeos-railway.vercel.app)（部署后更新）

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
| 桌面客户端 | Electron（可选） |
| 包管理 | npm |

---

## 目录结构

```
vibeos/
├── client/               # React 前端应用（Vite + Electron）
│   ├── src/
│   │   ├── apps/         # 各应用组件（Terminal, Finder, Clock…）
│   │   ├── components/   # 桌面、Dock、MenuBar、WindowManager、Spotlight
│   │   ├── contexts/     # AppRegistry 上下文
│   │   ├── stores/       # Zustand 状态 store
│   │   └── types/        # TypeScript 类型定义
│   ├── public/icons/     # 应用图标资源（PNG / 动态 SVG）
│   ├── electron/         # Electron 主进程
│   └── package.json
├── vibeos-icons/         # 完整图标集（21 个应用图标）
└── package.json          # 根配置
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

### 安装依赖

```bash
cd client
npm install
```

### 启动开发服务器

```bash
cd client
npm run dev
```

访问 http://localhost:5173

### 本地生产预览

```bash
cd client
npm run build
npm run preview
```

---

## 部署到 Railway（在线演示）

Railway 是本项目推荐的部署方案，通过 [Dockerfile](./Dockerfile) 实现一键构建和静态托管。

### 第一步：创建 Railway 项目

1. 打开 [railway.app](https://railway.app)，使用 GitHub 登录
2. 点击右上角 **New Project**
3. 选择 **Deploy from GitHub repo**
4. 授权 Railway 访问 GitHub，搜索并选择本项目仓库
5. 点击 **Deploy Now**

### 第二步：确认配置

Railway 会自动检测到根目录的 [Dockerfile](./Dockerfile)，无需任何额外配置。

Dockerfile 内容：

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client
COPY client/ ./client/
RUN npm run build --prefix client

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/client/dist ./dist
EXPOSE $PORT
CMD ["serve", "dist", "-p", "$PORT", "-s"]
```

自动完成：
- 构建阶段：安装依赖 → 编译 Vite 前端 → 生成 `client/dist/`
- 运行阶段：用 `serve` 托管静态文件，监听 `$PORT` 环境变量

### 第三步：等待部署完成

在项目页面左侧点击 **Deployments**，等待构建完成（首次约 2-3 分钟），出现绿色 ✅ 即为成功。

### 第四步：获取在线地址

点击页面右上角 **View Live**，获得 Railway 分配的域名，例如：
```
https://vibeos-xxxx.up.railway.app
```

将链接填入 README.md 中的"在线演示"处即可。

---

## 自定义域名（可选）

在 Railway 项目中：
1. 进入项目 **Settings** → **Domains**
2. 点击 **Add Domain**，输入你的域名
3. 按提示配置 DNS（CNAME 指向 Railway 分配的地址）

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
