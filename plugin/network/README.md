# network

**English** · [中文](README-ch.md)

A thin directory plugin that re-exports `reactive-md/plugins/network`, including the official `<submit-button>` control. It adds no manifest, styles or implementation of its own.

## Layout

| Path | Purpose |
| --- | --- |
| `index.ts` | Root discovery shim for `plugin/<name>/` |
| `src/node-entry.ts` | Re-export of `reactive-md/plugins/network` |
| `sample/document.reactive.md` | Minimal submit-button example |

## Use

Copy this directory into a ReactiveMD Demo `plugin/` directory. The host must expose an `answers` submit channel and the fields named by the button. See `sample/document.reactive.md` for a minimal document.