# survey-tally

[English](README.md) · **中文**

`<survey-tally>` 通过宿主提供的 `results` 订阅通道显示实时问卷统计。没有该通道时显示本地 Demo 提示，并保持静态内容。

## 目录

| 路径 | 用途 |
| --- | --- |
| `index.ts` | Demo `plugin/<name>/` 目录模式的根级发现入口 |
| `src/node-entry.ts` | 包入口与契约导出 |
| `src/manifests.ts` | `<survey-tally>` manifest |
| `src/components.tsx` | React 组件与包工厂 |
| `src/survey-contract.ts` | 问卷答案/计数类型与校验 |
| `sample/document.reactive.md` | 最小示例文档 |

## 使用

把本目录复制到 ReactiveMD Demo 的 `plugin/` 目录。宿主需要提供名为 `results` 的订阅通道，发布 `{ yes, no }` 计数。文档写法见 `sample/document.reactive.md`。