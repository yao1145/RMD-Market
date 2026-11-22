# tetris

**English** · [中文](README-ch.md)

`<tetris>` is a self-contained Tetris board built on the ReactiveMD extension SDK. It keeps its board state locally, supports keyboard and pointer input, and renders a static frame for SSR and offline export.

## Layout

| Path | Purpose |
| --- | --- |
| `index.ts` | Root discovery shim for `plugin/<name>/` |
| `component.css` | Root style shim for Demo discovery |
| `src/node-entry.ts` | Package entry and third-party notices |
| `src/manifests.ts` | `<tetris>` manifest |
| `src/components.tsx` | React implementation and static frame |
| `src/tetris-engine.ts` | Pure board engine |
| `src/component.css` | Scoped component styles |
| `sample/document.reactive.md` | Minimal example document |

## Use

Copy this directory into a ReactiveMD Demo `plugin/` directory. The root `index.ts` and `component.css` are the discovery entries; implementation lives in `src/`.

A Vite host can also import the source entry directly:

```ts
import tetrisPackage from './src/node-entry';
```

See `sample/document.reactive.md` for the authored tag.