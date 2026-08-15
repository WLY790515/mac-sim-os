# VibeOS

macOS simulator running in Electron.

## 功能

- 18 个模拟应用（Finder、Safari、时钟、计算器、终端等）
- macOS 风格窗口管理（拖拽、缩放、最小化、最大化）
- Dock 磁吸动画
- 菜单栏实时状态
- 桌面图标布局

## 技术栈

- React 18 + TypeScript
- Vite
- Electron（桌面打包）

## 开发

```bash
cd client
npm install
npm run dev          # 浏览器开发模式
npm run electron:dev # Electron 桌面开发模式
npm run build        # 构建 Web 版本
npm run electron:build # 打包为桌面安装包
```

## 打包

```bash
cd client
npm run electron:build
# 输出在 client/release/
```
