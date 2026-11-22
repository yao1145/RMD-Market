# network

[English](README.md) · **中文**

一个轻量目录插件，再导出 `reactive-md/plugins/network`，包含官方的 `<submit-button>` 控件。它本身不新增 manifest、样式或实现。

## 目录

| 路径 | 用途 |
| --- | --- |
| `index.ts` | Demo `plugin/<name>/` 目录模式的根级发现入口 |
| `src/node-entry.ts` | 再导出 `reactive-md/plugins/network` |
| `sample/document.reactive.md` | 最小提交按钮示例 |

## 使用

把本目录复制到 ReactiveMD Demo 的 `plugin/` 目录。宿主需要开放名为 `answers` 的提交通道，并提供按钮声明的字段。文档写法见 `sample/document.reactive.md`。