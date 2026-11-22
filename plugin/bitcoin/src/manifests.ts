import { defineLocalComponent } from 'reactive-md/sdk';

export const bitcoin = defineLocalComponent({
  id: 'example/bitcoin',
  name: 'bitcoin',
  version: '1.0.0',
  protocol: 'reactive-md-component/v1',
  form: 'leaf',
  props: {
    label: { kind: 'string', coerce: 'text', default: 'BTC/USDT' },
    channel: { kind: 'string', static: true, default: 'binance' },
  },
  structure: { rule: 'none', label: 'none' },
  capabilities: { interactive: true, static: true, ssr: true, offline: false },
  authoring: {
    title: { en: 'Bitcoin price', zh: '比特币实时价格' },
    description: {
      en: 'Live Binance BTC/USDT spot quote over a host-granted WebSocket channel.',
      zh: '通过宿主授权的 WebSocket 通道显示 Binance BTC/USDT 现货实时行情。',
    },
    category: 'data',
    insertText: '<bitcoin>',
  },
});
