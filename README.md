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
| `plugin/bitcoin` | `<bitcoin>` | Live BTC/USDT quote component with a Binance WebSocket host channel, packaged as a Vite demo. |
| `plugin/cattca-package` | `<cattca>` | Interactive-fiction component package with a safe command interpreter, SSR and offline export. |
| `plugin/game-2048` | `<game-2048>` | Self-contained 2048 board as a directory plugin. |
| `plugin/network` | `reactive-md/plugins/network` | Directory plugin that re-exports the official network components. |
| `plugin/survey-tally` | `<survey-tally>` | Live survey counts for hosts that expose a `results` subscription channel. |
| `plugin/tetris` | `<tetris>` | Self-contained Tetris board as a directory plugin. |

The game, network and survey plugins are source directories for a Demo-style `plugin/<name>/` directory. The bitcoin and cattca entries are standalone packages with their own manifests. `survey-tally` carries a local copy of its survey contract so it does not depend on the Demo source tree.

## Theme

| Path | Name | Purpose |
| --- | --- | --- |
| `theme/sci-fi` | `sci-fi` | Semantic tokens, component styling and the notched-corner treatment for `<theme name="sci-fi">`. |

## Sources

- `skill/*`, `plugin/bitcoin` and `plugin/cattca-package` are collected from the workspace `others/` directory.
- `plugin/game-2048`, `plugin/network`, `plugin/survey-tally`, `plugin/tetris` and `theme/sci-fi` are collected from `ReactiveMD-Demo`.

Some demos expect a ReactiveMD engine checkout or installed package dependencies; install those in the package directory before running its scripts.