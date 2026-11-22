# bitcoin

**English** · [中文](README-ch.md)

`<bitcoin>` displays live BTC/USDT quotes through a host-authorized WebSocket channel. The component only knows the channel name; the endpoint, validation and reconnect policy stay in host code.

## Layout

| Path | Purpose |
| --- | --- |
| `index.ts` | Root discovery shim for `plugin/<name>/` |
| `component.css` | Root style shim for Demo discovery |
| `src/node-entry.ts` | Package entry: default package, manifest and quote types |
| `src/manifests.ts` | `<bitcoin>` manifest: tag, props, capabilities and editor metadata |
| `src/components.tsx` | React implementation, static frame and subscription lifecycle |
| `src/quote.ts` | Quote shape and runtime type guard |
| `src/component.css` | Scoped component styles |
| `host/binance.ts` | Host WebSocket adapter: connect, parse, validate and reconnect |
| `main.tsx` | Manual-registration preview page and channel grant |
| `sample/document.reactive.md` | Minimal document containing `<bitcoin>` |
| `scripts/verify.mjs` | Playwright check with a mocked Binance WebSocket |

## Run the preview

```sh
cd plugin/bitcoin
npm install
npm run dev
```

Open `http://127.0.0.1:5211/`. The page provides the Binance grant, static preview and light/dark switch.

```sh
npm run typecheck    # TypeScript check
npm run verify       # Playwright with a mocked Binance feed
npm run verify:live  # Real Binance public market mirror
```

`verify` and `verify:live` start Vite on port 5211 when needed and write screenshots to `artifacts/` (ignored). Set `BITCOIN_DEMO_URL` to test an already running page. The host supplies the `binance` subscribe channel; without it the card shows that the live channel is unavailable.

## Use

Copy this directory into a ReactiveMD Demo `plugin/` directory. The root `index.ts` and `component.css` are the discovery entries; implementation lives in `src/`. A Vite host can import the source entry directly:

```ts
import bitcoinPackage from './src/node-entry';
```

See `README-ch.md` for the full channel contract and manual-registration example.