# 🍎 mac-sim-os v1.0.0 — 首次发布

> 在浏览器中运行的 macOS 风格操作系统模拟器，完整支持窗口动画、Dock、Spotlight、Terminal 终端、Finder 文件管理。

## ✨ 亮点功能

### 🪟 macOS 原生窗口动画
- **打开**：窗口从 Dock 栏向上平滑展开（easeOut cubic）
- **最小化**：窗口加速吸入 Dock 图标位置（easeIn cubic），完整可见直到缩到图标大小后消失
- **最大化/还原**：平滑展开/收缩，无闪烁
- **关闭**：窗口向中心缩小并淡出

### 📦 19 个内置应用
| 应用 | 说明 |
|------|------|
| **Terminal** | 基于 WebContainer 的真实浏览器终端，支持 `ls`、`cd`、`mkdir`、`echo`、`date` 等命令 |
| **Finder** | 虚拟文件系统浏览，图标/列表视图切换 |
| **Safari** | 浏览器模拟，地址栏、历史记录、书签 |
| **Clock** | 模拟时钟（60fps 指针动画）、世界时钟、秒表 |
| **Calculator** | 标准计算器 |
| **Settings** | 系统设置（深色模式、Wi-Fi、蓝牙、壁纸切换） |
| **Notes / Mail / Messages** | 备忘录、邮件、消息 |
| **Photos / Maps / Weather** | 照片、地图、天气 |
| **Music / Videos / FaceTime** | 媒体播放器 |
| **Calendar / Contacts / Reminders** | 日历、联系人、提醒事项 |
| **Editor** | 文本编辑器 |

### 🎨 桌面系统
- **Dock 栏**：悬停弹跳动画，运行时同步图标位置用于窗口动画锚点
- **Spotlight 搜索**：`Cmd + Space` 呼出，全局搜索应用
- **菜单栏**：实时时钟、WiFi / 音量 / 电池状态图标
- **Wallpaper 设置**：8 种精选渐变壁纸 + 自定义图片 URL 支持
- **深色/浅色主题**切换

### 🚀 部署支持
- **GitHub Pages** 一键自动部署
- **Railway** Docker 部署
- **Electron** 打包桌面客户端（Windows .exe / macOS .dmg）

## 📸 截图

![Desktop](https://raw.githubusercontent.com/WLY790515/mac-sim-os/master/assets/desktop_final.png)
![Finder](https://raw.githubusercontent.com/WLY790515/mac-sim-os/master/assets/finder_final.png)
![Terminal](https://raw.githubusercontent.com/WLY790515/mac-sim-os/master/assets/boot.png)
![Calculator](https://raw.githubusercontent.com/WLY790515/mac-sim-os/master/assets/calculator_final.png)

## 🔗 快速链接
- **[在线体验](https://wly790515.github.io/mac-sim-os/preview.html)** — 全屏无干扰预览
- **[仓库主页](https://github.com/WLY790515/mac-sim-os)** — 源码与 Issues

## 🛠️ 技术栈
React 18 · TypeScript 5 · Vite 6 · Electron 33 · WebContainer API · Zustand

## 📋 待办事项
- [ ] Mission Control 窗口缩略图
- [ ] 更多原生壁纸（Unsplash 集成）
- [ ] 真正的文件系统（IndexedDB + 文件上传）
- [ ] PWA 离线支持
- [ ] 移动端适配

> ⭐ 如果觉得这个项目有趣，欢迎 Star 支持！
