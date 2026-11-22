# RMD Market

**English** · [中文](README-ch.md)

A collection of ReactiveMD skills, component plugins and themes.

## Skills

| Path | Purpose |
| --- | --- |
| `skill/reactive-md-authoring` | Author and edit `.reactive.md` documents: controls, bindings, computed values, charts, plots, diagrams, validation and diagnostics. |
| `skill/reactive-md-extension-authoring` | Create custom component and theme packages: manifests, React implementations, scoped CSS, theme tokens and registration. |

## Plugins

| Path | Tag / entry | Purpose |
| --- | --- | --- |
| `plugin/bitcoin` | `<bitcoin>` | Live BTC/USDT quote plugin with a Binance WebSocket host channel and a Vite demo. |
| `plugin/cattca-package` | `<cattca>` | Interactive-fiction component package with a safe command interpreter, SSR and offline export. |
| `plugin/game-2048` | `<game-2048>` | Self-contained 2048 board as a directory plugin. |
| `plugin/network` | `reactive-md/plugins/network` | Directory plugin that re-exports the official network components. |
| `plugin/survey-tally` | `<survey-tally>` | Live survey counts for hosts that expose a `results` subscription channel. |
| `plugin/tetris` | `<tetris>` | Self-contained Tetris board as a directory plugin. |

## Plugin layout

All six plugins follow one package layout:

```text
plugin/<name>/
  index.ts                 # root discovery shim
  component.css            # root style shim when CSS is not inline
  package.json
  tsconfig.json
  README.md / README-ch.md
  src/
    node-entry.ts          # package entry
    components.tsx
    manifests.ts
    component.css
  sample/document.reactive.md
```

The root `index.ts` and `component.css` keep the plugin compatible with ReactiveMD Demo directory discovery; the implementation and package metadata live under `src/`. `game-2048`, `tetris` and `bitcoin` use a root CSS shim, `cattca-package` keeps inline CSS, and `survey-tally`/`network` have no stylesheet of their own. `survey-tally` carries a local copy of its survey contract so it does not depend on the Demo source tree.

## Theme

| Path | Name | Purpose |
| --- | --- | --- |
| `theme/sci-fi` | `sci-fi` | Semantic tokens, component styling and the notched-corner treatment for `<theme name="sci-fi">`. |
