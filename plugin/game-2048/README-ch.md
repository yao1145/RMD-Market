# game-2048

[English](README.md) · **中文**

`<game-2048>` 是基于 ReactiveMD 扩展 SDK 的自包含 2048 棋盘组件。棋盘状态保存在本地，支持键盘和指针输入，并提供 SSR 与离线导出所需的静态画面。

## 目录

| 路径 | 用途 |
| --- | --- |
| `index.ts` | Demo `plugin/<name>/` 目录模式的根级发现入口 |
| `component.css` | Demo 发现使用的根级样式入口 |
| `src/node-entry.ts` | 包入口与第三方 notices |
| `src/manifests.ts` | `<game-2048>` manifest |
| `src/components.tsx` | React 实现与静态画面 |
| `src/game-engine.ts` | 纯棋盘引擎 |
| `src/component.css` | 作用域内的组件样式 |
| `sample/document.reactive.md` | 最小示例文档 |

## 使用

把本目录复制到 ReactiveMD Demo 的 `plugin/` 目录。根级 `index.ts` 与 `component.css` 是发现入口，实际实现位于 `src/`。

Vite 宿主也可以直接导入源码入口：

```ts
import game2048Package from './src/node-entry';
```

文档写法见 `sample/document.reactive.md`。