# survey-tally

**English** · [中文](README-ch.md)

`<survey-tally>` renders live survey counts from a host-provided `results` subscription channel. Without that channel it shows the local-Demo hint and stays static.

## Layout

| Path | Purpose |
| --- | --- |
| `index.ts` | Root discovery shim for `plugin/<name>/` |
| `src/node-entry.ts` | Package entry and contract exports |
| `src/manifests.ts` | `<survey-tally>` manifest |
| `src/components.tsx` | React component and package factory |
| `src/survey-contract.ts` | Survey answer/count types and guards |
| `sample/document.reactive.md` | Minimal example document |

## Use

Copy this directory into a ReactiveMD Demo `plugin/` directory. The host must expose a `results` subscribe channel that publishes `{ yes, no }` counts. See `sample/document.reactive.md` for the authored tag.