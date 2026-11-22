# `<bitcoin>`：Binance BTC/USDT 实时行情组件

一个 ReactiveMD 目录模式组件：通过宿主授权的 WebSocket 通道订阅 Binance BTC/USDT 现货行情，在文档中显示最新价、24 小时涨跌、最高、最低、成交额和连接状态。

组件本身只认识通道名。WebSocket 地址、交易对、重连策略和消息校验都留在宿主代码中，文档里不出现端点或凭据。

## 运行预览

预览复用引擎仓库已安装的 Vite、React 和构建产物：

```sh
cd ReactiveMD/others/plugin/bitcoin
npm run dev
```

打开 `http://127.0.0.1:5211/`。页面提供“允许连接 Binance”、静态预览和浅色/深色开关。

```sh
npm run typecheck    # TypeScript 检查
npm run verify       # Playwright：拦截 WebSocket 并注入 Binance 格式行情
npm run verify:live  # 访问真实 Binance 官方行情镜像，确认实时报价
```

`npm run verify` 和 `npm run verify:live` 在 5211 没有响应时会自行启动 Vite，结束后关闭；截图写入 `artifacts/`。设置 `BITCOIN_DEMO_URL` 可以对已经运行的页面执行同一套检查。

预览依赖 `ReactiveMD/dist-library`。如果缺少，先在引擎仓库运行 `npm run build:lib`。

## 文件

| 路径 | 作用 |
| --- | --- |
| `plugin/bitcoin/manifest.ts` | `defineLocalComponent` 清单：标签名、属性、能力、编辑器元数据 |
| `plugin/bitcoin/components.tsx` | React 实现、静态实现、订阅生命周期 |
| `plugin/bitcoin/quote.ts` | 通道发布的行情结构与类型守卫 |
| `plugin/bitcoin/component.css` | 组件样式，选择器限定在 `.local-document` 内 |
| `plugin/bitcoin/index.ts` | 目录模式入口，默认导出组件包 |
| `host/binance.ts` | 宿主 WebSocket 适配器：连接、解析、校验、重连 |
| `main.tsx` | 手动注册组件的预览页；网络通道在这里授予 |
| `sample.reactive.md` | 示例文档，正文只有 `<bitcoin>` |
| `scripts/verify.mjs` | 浏览器验收，使用 Playwright 的 `routeWebSocket` 模拟 Binance |

## 在宿主中使用

### 目录模式

把 `plugin/bitcoin/` 复制到宿主的 `plugin/` 目录。Vite 的 `reactiveMd()` 会发现入口、收集 `component.css`，并把 `authoring` 信息加入编辑器插入目录。文档中写：

```md
<bitcoin>
```

### 手动注册

不使用 Vite 发现时，和预览页一样显式装配清单与实现：

```tsx
import { createLocalConfig } from 'reactive-md/sdk';
import { createReactConfig, LocalReactiveDocument } from 'reactive-md/react';
import { defaultPreset } from 'reactive-md/presets/default';
import './plugin/bitcoin/component.css';
import { bitcoin } from './plugin/bitcoin/manifest';
import bitcoinPackage from './plugin/bitcoin/components';
import { binanceTickerChannel } from './host/binance';

const config = createLocalConfig({
  presets: [defaultPreset],
  components: [bitcoin],
});

const reactConfig = createReactConfig(config, {
  components: bitcoinPackage.components,
});

const network = {
  channels: {
    binance: { subscribe: binanceTickerChannel() },
  },
};

<LocalReactiveDocument
  source={source}
  reactConfig={reactConfig}
  network={network}
/>
```

通道由宿主授予。宿主不传 `network` 时，组件显示“实时通道未启用”，不会自行打开连接。手动注册时把 `host/binance.ts` 一并复制，或按 `reactive-md/runtime` 的 `SubscribeAdapter` 接口实现自己的通道。

`binanceTickerChannel()` 接受可选参数：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `symbol` | `btcusdt` | Binance 现货交易对，大小写均可 |
| `endpoint` | `wss://data-stream.binance.vision/ws` | Binance 官方公开行情镜像；也可换成 `wss://stream.binance.com:9443/ws` 或本地测试服务 |

### 通道契约

通道名默认 `binance`，只支持订阅。宿主把 Binance 的 `24hrTicker` 消息转换成下面的结构，运行时会先按 `isBitcoinQuote` 校验再分发：

| 字段 | 来源 | 含义 |
| --- | --- | --- |
| `symbol` | `s` | 交易对，例如 `BTCUSDT` |
| `price` | `c` | 最新成交价 |
| `changePercent` | `P` | 24 小时涨跌幅；缺失时用 `(c - o) / o` 计算 |
| `high` | `h` | 24 小时最高价 |
| `low` | `l` | 24 小时最低价 |
| `quoteVolume` | `q` | 24 小时计价货币成交额 |
| `eventTime` | `E` | 事件时间，毫秒时间戳 |

流地址为 `${endpoint}/${symbol}@ticker`。当前实现每个文档、每个通道共用一个 WebSocket：第一个可见实例订阅时连接，最后一个实例退订、隐藏、禁用或切到静态模式时释放。断线从 1 秒开始指数退避，上限 30 秒；单次连接超过 15 秒未打开按失败处理。

## 行为与限制

- 实时数据需要交互模式。静态预览显示占位卡片；`renderStatic` 不依赖浏览器 API。
- `capabilities.offline` 为 `false`。离线导出会报告诊断，不会把最后一笔价格伪装成离线数据。
- 默认使用 Binance 官方公开行情镜像 `data-stream.binance.vision`，只提供市场数据。主站 `stream.binance.com` 在部分网络不可达，可用 `endpoint` 切换。连接失败时卡片保留上一笔报价并降低透明度，状态显示“重连中…”，恢复后自动更新。
- 只使用 Binance 公开市场数据，不需要 API Key。
- 数值格式化跟随文档 `locale`：中文使用 `zh-CN`，英文使用 `en-US`。
- 样式使用 `--surface`、`--ink`、`--line`、`--success`、`--danger`、`--warning` 等语义 token，并暴露 `data-rmd-component="bitcoin"`、`data-rmd-part`、`data-status`、`data-trend`、`data-has-quote` 供主题装饰。

## 验证范围

`npm run verify` 覆盖：

- 首条行情后显示价格、涨跌幅、最高、最低和成交额
- 服务端断开后进入“重连中…”，新连接恢复后更新报价
- 静态模式使用 `renderStatic`，返回交互后重新订阅
- 撤销宿主授权后显示未启用状态，并关闭 WebSocket
- 深色模式切换、375px 视口无横向溢出、无控制台错误

自动验收拦截 `wss://data-stream.binance.vision/ws/btcusdt@ticker`，不访问真实交易所。`npm run verify:live` 不拦截连接，直接读取真实行情并输出价格、涨跌幅和实际 WebSocket 地址；当前开发网络连接 `api.binance.com` 和 `stream.binance.com` 超时，而官方行情镜像 `data.binance.vision` 可用，所以默认端点使用后者。
