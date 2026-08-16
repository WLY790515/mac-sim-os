# VibeOS

> 在浏览器中运行的 macOS 风格操作系统模拟器

<!-- last-deployed: 2026-08-16 -->

![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Node](https://img.shields.io/badge/Node-%3E%3D18-339935)
![License](https://img.shields.io/badge/License-MIT-green)
![Electron](https://img.shields.io/badge/Electron-33.4.6-47848F?logo=electron)

---

## 在线预览

<div align="center">
  <a href="https://wly790515.github.io/vibeos/preview.html" target="_blank" rel="noopener">
    <img
      src="https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E9%A2%84%E8%A7%88-Click%20to%20try%20live%20demo!-6366f1?style=for-the-badge&logo=vercel&logoColor=white"
      alt="Try Live Demo"
      style="max-width:100%;border-radius:8px"
    >
  </a>
</div>

👉 **[点击体验完整交互式预览](https://wly790515.github.io/vibeos/preview.html)** · [返回仓库主页](https://github.com/WLY790515/vibeos)

> 预览页以全屏方式加载应用，无 README 干扰，可直接操作窗口动画、Dock、Spotlight 等所有功能。

---

## ✨ 已实现功能

### 桌面系统
- **macOS 风格窗口管理**：拖拽移动、边缘缩放、z-index 层级管理
- **红绿灯按钮动画**：关闭（红）→ 居中缩小淡出；最小化（黄）→ easeIn 吸入 Dock；最大化（绿）→ easeOut 平滑展开
- **启动屏**：Apple Logo + 进度条，加载完成后自动切换桌面
- **顶部菜单栏**：实时时钟、WiFi / 音量 / 电池状态图标
- **桌面**：壁纸渐变、桌面图标双击打开应用

### Dock 栏
- **悬停弹跳动画**：CSS `transform: scale()` + cubic-bezier 弹性曲线
- **活跃状态指示器**：运行中的应用显示白点（已移除）
- **图标位置共享**：通过 ref 系统同步 Dock 图标与窗口动画坐标

### 内置应用（19 个）

| 应用 | 功能 |
|------|------|
| **Terminal** | 基于 WebContainer 的真实终端，支持 `ls`、`cd`、`mkdir`、`touch`、`echo`、`date`、`whoami`、`clear` 等命令及命令历史 |
| **Finder** | 虚拟文件系统浏览，支持图标/列表视图切换、侧边栏导航、面包屑路径 |
| **Safari** | 浏览器模拟，地址栏导航、历史记录前进/后退、书签面板 |
| **Clock** | 模拟时钟（60fps 平滑指针）、世界时钟、秒表、闹钟 |
| **Calculator** | 标准计算器 |
| **Notes** | 简易备忘录 |
| **Music** | 音乐播放器 |
| **Calendar** | 日历视图 |
| **Contacts** | 联系人管理 |
| **Messages** | 消息应用 |
| **Mail** | 邮件应用 |
| **Photos** | 照片浏览器 |
| **Maps** | 地图应用 |
| **Weather** | 天气应用 |
| **Videos** | 视频播放器 |
| **FaceTime** | 视频通话应用 |
| **Reminders** | 提醒事项 |
| **Editor** | 文本编辑器 |
| **Settings** | 系统设置（主题切换） |

### 特效系统
- **Spotlight 全局搜索**：Cmd+Space 呼出，搜索所有应用
- **Notification Center**：通知中心面板
- **Control Center**：控制中心（WiFi/蓝牙/亮度/音量快捷开关）

### 部署支持
- **GitHub Pages** 自动部署（CI/CD 流水线）
- **Railway** 一键部署（Docker + Express 静态服务）
- **Electron 桌面客户端**：本地打包为 .exe/.dmg 可执行文件

---

## 🗺️ 规划路线图

### Phase 1 — 核心体验优化（进行中）
- [x] macOS 风格窗口动画（easeOut/easeIn cubic 曲线）
- [ ] 窗口阴影层级优化
- [ ] 多窗口管理改进（分屏、浮动窗口）
- [ ] 键盘快捷键增强（Cmd+W 关闭、Cmd+M 最小化、Cmd+Q 退出）

### Phase 2 — 文件系统增强
- [ ] 真实文件上传/下载支持
- [ ] 文件夹嵌套与右键菜单
- [ ] 文件类型图标区分
- [ ] 搜索文件内容

### Phase 3 — 更多原生应用
- [ ] 系统偏好设置完整化（显示器、声音、网络、蓝牙）
- [ ] App Store 界面（模拟应用商店）
- [ ] 日历完整日程管理
- [ ] 备忘录富文本编辑

### Phase 4 — 性能与体验
- [ ] WebGL 壁纸动画
- [ ] 窗口缩略图预览（Mission Control）
- [ ] Spotlight AI 搜索建议
- [ ] 离线 PWA 支持

### Phase 5 — 社区与扩展
- [ ] 插件系统（第三方应用开发）
- [ ] 共享配置导出/导入
- [ ] 更多主题皮肤
- [ ] 移动端适配

---

## 🛠️ 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 18 + TypeScript + Vite |
| 状态管理 | Zustand（类 Redux 结构） |
| 终端引擎 | `@webcontainer/api`（浏览器内 Node.js 运行时） |
| 桌面客户端 | Electron（可选） |
| 包管理 | npm |

---

## 📁 目录结构

```
vibeos/
├── client/                      # React 前端应用（Vite + Electron）
│   ├── src/
│   │   ├── apps/               # 各应用组件（19 个内置应用）
│   │   │   ├── Calculator.tsx
│   │   │   ├── Finder.tsx
│   │   │   ├── Terminal.tsx
│   │   │   └── ...
│   │   ├── components/         # 桌面核心组件
│   │   │   ├── Window.tsx      # 单窗口组件（含动画引擎）
│   │   │   ├── WindowManager.tsx # 窗口管理器
│   │   │   ├── Dock.tsx        # Dock 栏
│   │   │   ├── MenuBar.tsx     # 顶部菜单栏
│   │   │   ├── Spotlight.tsx   # Spotlight 搜索
│   │   │   ├── BootScreen.tsx  # 启动屏
│   │   │   └── iconRefs.ts     # Dock 图标位置共享
│   │   ├── stores/             # Zustand 状态 store
│   │   ├── contexts/           # AppRegistry 上下文
│   │   ├── types/              # TypeScript 类型定义
│   │   └── apps/               # 应用注册
│   ├── public/icons/           # 应用图标资源（PNG / 动态 SVG）
│   ├── electron-main.ts        # Electron 主进程入口
│   └── package.json
├── server/                     # Railway 部署服务端
│   └── src/
│       └── index.js            # Express 静态服务
├── vibeos-icons/               # 图标集（21 个 PNG + 3 个动态 SVG）
├── railway.toml                # Railway 部署配置
├── Dockerfile                  # Railway Docker 构建
└── README.md                   # 本文档
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

### GitHub Pages（推荐，免费）

项目已内置 GitHub Actions 自动部署，推送到 main 分支后自动构建。

1. 打开 [Settings → Pages](https://github.com/WLY790515/vibeos/settings/pages)
2. **Source** 选择 **GitHub Actions**
3. 等待 Actions 完成部署

访问：https://wly790515.github.io/vibeos/

### Railway（备选）

1. 打开 [railway.app](https://railway.app)，GitHub 登录
2. **New Project** → **Deploy from GitHub repo** → 选择 `WLY790515/vibeos`
3. Railway 自动检测 Dockerfile 并构建
4. 点击 **View Live** 获取地址

### 自定义域名（Railway）

1. 进入项目 **Settings** → **Domains**
2. 点击 **Add Domain**，输入你的域名
3. 按提示配置 DNS（CNAME 指向 Railway 分配的地址）

---

## 🎨 图标资源

图标存放在 `vibeos-icons/` 目录：

- **21 个 PNG 应用图标**（从 macosicons.com 批量下载）
- **3 个动态 SVG 图标**：
  - `clock_dynamic.svg` — 时针/分针/秒针实时旋转
  - `calendar_dynamic.svg` — 显示当前日期和星期
  - `terminal_dynamic.svg` — 带闪烁光标动画

---

## 📄 License

MIT

---

> 如有问题或建议，欢迎提交 Issue 或 Pull Request ⭐
