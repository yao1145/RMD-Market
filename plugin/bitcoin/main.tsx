import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createLocalConfig } from 'reactive-md/sdk';
import { createReactConfig, LocalReactiveDocument } from 'reactive-md/react';
import { defaultPreset } from 'reactive-md/presets/default';
import type { NetworkConfig } from 'reactive-md/runtime';
import 'reactive-md/styles.css';
import './plugin/bitcoin/component.css';
import './page.css';
import source from './sample.reactive.md?raw';
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

const network: NetworkConfig = {
  channels: {
    binance: { subscribe: binanceTickerChannel() },
  },
};

function App() {
  const [enabled, setEnabled] = useState(true);
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<'interactive' | 'static'>('interactive');

  return (
    <main className="bitcoin-page" data-scheme={scheme}>
      <header className="page-head">
        <p className="eyebrow">ReactiveMD · Custom component</p>
        <h1>&lt;bitcoin&gt;</h1>
        <p className="lede">
          Binance BTC/USDT 现货行情，通过宿主授权的 WebSocket 通道推送到文档。
          卡片显示最新成交价、24 小时涨跌，以及最高、最低和成交额。
        </p>
        <div className="page-facts" aria-label="数据链路">
          <span>Binance 现货</span>
          <span>WebSocket 推送</span>
          <span>宿主授权通道</span>
        </div>
      </header>

      <section className="preview-shell" aria-label="组件预览">
        <div className="preview-toolbar">
          <label className="preview-toggle">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            允许连接 Binance
          </label>
          <span className="preview-actions">
            <button
              type="button"
              onClick={() => setMode(mode === 'interactive' ? 'static' : 'interactive')}
            >
              {mode === 'interactive' ? '静态预览' : '返回交互'}
            </button>
            <button
              type="button"
              onClick={() => setScheme(scheme === 'light' ? 'dark' : 'light')}
            >
              {scheme === 'light' ? '切换到深色' : '切换到浅色'}
            </button>
          </span>
        </div>
        <div className="preview-document">
          <LocalReactiveDocument
            source={source}
            reactConfig={reactConfig}
            network={enabled ? network : undefined}
            colorScheme={scheme}
            mode={mode}
            locale="zh"
            documentId="bitcoin-component-demo"
          />
        </div>
      </section>

      <details className="source-panel">
        <summary>文档源码</summary>
        <pre>{source}</pre>
      </details>

      <p className="page-note">
        组件位于 <code>plugin/bitcoin/</code>，宿主通道位于 <code>host/binance.ts</code>。
        关闭开关会撤销宿主授权，组件随即停止订阅并显示未启用状态。
      </p>
    </main>
  );
}

const root = document.getElementById('root');
if (root === null) throw new Error('The page is missing #root.');
createRoot(root).render(<App />);
