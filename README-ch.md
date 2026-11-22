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
| `plugin/bitcoin` | `<bitcoin>` | 通过 Binance WebSocket 宿主通道显示 BTC/USDT 实时行情的插件，附带 Vite 演示。 |
| `plugin/cattca-package` | `<cattca>` | 互动小说组件包，包含安全的命令解释器、SSR 与离线导出。 |
| `plugin/game-2048` | `<game-2048>` | 自包含的 2048 棋盘目录插件。 |
| `plugin/network` | `reactive-md/plugins/network` | 再导出官方网络组件的目录插件。 |
| `plugin/survey-tally` | `<survey-tally>` | 显示实时问卷统计，宿主需提供 `results` 订阅通道。 |
| `plugin/tetris` | `<tetris>` | 自包含的俄罗斯方块目录插件。 |

## 插件布局

六个插件采用同一套包结构：

```text
plugin/<name>/
  index.ts                 # 根级发现入口
  component.css            # 非内联样式时的根级样式入口
  package.json
  tsconfig.json
  README.md / README-ch.md
  src/
    node-entry.ts          # 包入口
    components.tsx
    manifests.ts
    component.css
  sample/document.reactive.md
```

根级 `index.ts` 与 `component.css` 保持与 ReactiveMD Demo 目录发现兼容；实现和包元数据位于 `src/`。game-2048、tetris 与 bitcoin 使用根级样式入口，cattca-package 继续内联 CSS，survey-tally 与 network 本身没有样式表。`survey-tally` 已内联问卷契约，不再依赖 Demo 源码树。

## Theme

| 路径 | 名称 | 用途 |
| --- | --- | --- |
| `theme/sci-fi` | `sci-fi` | 为 `<theme name="sci-fi">` 提供语义 token、组件样式与切角效果。 |
