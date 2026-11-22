# RMD Market

[English](README.md) · **中文**

ReactiveMD 的 skill、组件插件与主题集合。

## Skills

| 路径 | 用途 |
| --- | --- |
| `skill/reactive-md-authoring` | 编写和修改 `.reactive.md` 文档：控件、绑定、计算值、图表、曲线、图解、校验与诊断。 |
| `skill/reactive-md-extension-authoring` | 创建自定义组件与主题包：manifest、React 实现、作用域 CSS、主题 token 与注册。 |

## Plugins

| 路径 | 标签 / 入口 | 用途 |
| --- | --- | --- |
| `plugin/bitcoin` | `<bitcoin>` | 通过 Binance WebSocket 宿主通道显示 BTC/USDT 实时行情的组件，附带 Vite 演示。 |
| `plugin/cattca-package` | `<cattca>` | 互动小说组件包，包含安全的命令解释器、SSR 与离线导出。 |
| `plugin/game-2048` | `<game-2048>` | 自包含的 2048 棋盘目录插件。 |
| `plugin/network` | `reactive-md/plugins/network` | 再导出官方网络组件的目录插件。 |
| `plugin/survey-tally` | `<survey-tally>` | 显示实时问卷统计，宿主需提供 `results` 订阅通道。 |
| `plugin/tetris` | `<tetris>` | 自包含的俄罗斯方块目录插件。 |

game-2048、network 与 survey-tally 是面向 Demo 式 `plugin/<name>/` 目录的源码插件。bitcoin 与 cattca 是带独立 manifest 的完整包。`survey-tally` 已内联问卷契约，不再依赖 Demo 源码树。

## Theme

| 路径 | 名称 | 用途 |
| --- | --- | --- |
| `theme/sci-fi` | `sci-fi` | 为 `<theme name="sci-fi">` 提供语义 token、组件样式与切角效果。 |
