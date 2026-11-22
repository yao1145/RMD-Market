import { useEffect, useState } from 'react';
import {
  defineReactComponentPackage,
  type LocalComponentContext,
} from 'reactive-md/react';
import { bitcoin } from './manifest';
import { isBitcoinQuote, type BitcoinQuote } from './quote';

type FeedPhase = 'connecting' | 'open' | 'closed';
type StatusTone = 'open' | 'connecting' | 'closed' | 'paused' | 'unavailable';
type Trend = 'up' | 'down' | 'flat';

interface BitcoinFeed {
  readonly supported: boolean;
  readonly quote: BitcoinQuote | null;
  readonly phase: FeedPhase;
  readonly problem: string | null;
}

function labelOf(context: LocalComponentContext): string {
  const value = context.props.label;
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : 'BTC/USDT';
}

function localeTag(context: LocalComponentContext): string {
  return context.locale.locale === 'zh' ? 'zh-CN' : 'en-US';
}

function useBitcoinFeed(context: LocalComponentContext, channel: string): BitcoinFeed {
  const network = context.services.network;
  const supported = network !== undefined && channel !== ''
    && network.supports(channel, 'subscribe');
  const active = supported && context.visible && !context.disabled;
  const [quote, setQuote] = useState<BitcoinQuote | null>(null);
  const [phase, setPhase] = useState<FeedPhase>('connecting');
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    setQuote(null);
    setPhase('connecting');
    setProblem(null);
  }, [channel]);

  useEffect(() => {
    if (!active || network === undefined) return;
    return network.subscribe(channel, (event) => {
      if (event.type === 'status') {
        setPhase(event.state);
        if (event.state === 'open') setProblem(null);
        return;
      }
      if (event.type === 'data') {
        if (!isBitcoinQuote(event.value)) return;
        setQuote(event.value);
        setProblem(null);
        return;
      }
      setProblem(event.error.message);
    });
  }, [active, channel, network]);

  return { supported, quote, phase, problem };
}

function statusTone(feed: BitcoinFeed, context: LocalComponentContext): StatusTone {
  if (!feed.supported) return 'unavailable';
  if (!context.visible || context.disabled) return 'paused';
  if (feed.phase === 'open') return 'open';
  if (feed.phase === 'closed') return 'closed';
  return 'connecting';
}

function statusLabel(
  context: LocalComponentContext,
  status: StatusTone,
  problem: string | null,
): string {
  const t = context.locale.t;
  switch (status) {
    case 'open': return t('Live', '实时');
    case 'connecting': return problem === null ? t('Connecting…', '连接中…') : t('Reconnecting…', '重连中…');
    case 'closed': return t('Disconnected', '已断开');
    case 'paused': return t('Paused', '已暂停');
    case 'unavailable': return t('No live channel', '实时通道未启用');
  }
}

function trendOf(quote: BitcoinQuote | null): Trend {
  if (quote === null || quote.changePercent === 0) return 'flat';
  return quote.changePercent > 0 ? 'up' : 'down';
}

function formatPrice(value: number, tag: string): string {
  return new Intl.NumberFormat(tag, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number, tag: string): string {
  const number = new Intl.NumberFormat(tag, {
    signDisplay: 'always',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${number}%`;
}

function formatVolume(value: number, tag: string): string {
  return new Intl.NumberFormat(tag, {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

function BitcoinStatic({ context }: { readonly context: LocalComponentContext }) {
  const t = context.locale.t;
  const label = labelOf(context);
  return (
    <div
      className="rmd-bitcoin rmd-bitcoin-static"
      data-rmd-component="bitcoin"
      data-status="static"
      role="group"
      aria-label={label}
      hidden={!context.visible || undefined}
    >
      <header className="rmd-bitcoin-head" data-rmd-part="head">
        <span className="rmd-bitcoin-badge" aria-hidden="true">₿</span>
        <span className="rmd-bitcoin-ident">
          <span className="rmd-bitcoin-pair">{label}</span>
          <span className="rmd-bitcoin-source">{t('Binance · Spot', 'Binance · 现货')}</span>
        </span>
        <span className="rmd-bitcoin-status" data-rmd-part="status">
          {t('Static', '静态')}
        </span>
      </header>
      <div className="rmd-bitcoin-price-row" data-rmd-part="price-row">
        <span className="rmd-bitcoin-price" data-rmd-part="price">
          —
          <span className="rmd-bitcoin-unit" aria-hidden="true">USDT</span>
        </span>
      </div>
      <p className="rmd-bitcoin-note">
        {t('Live prices appear in interactive mode.', '实时价格在交互模式中显示。')}
      </p>
    </div>
  );
}

function BitcoinLive({ context }: { readonly context: LocalComponentContext }) {
  const t = context.locale.t;
  const label = labelOf(context);
  const tag = localeTag(context);
  const channel = typeof context.props.channel === 'string' ? context.props.channel.trim() : '';
  const feed = useBitcoinFeed(context, channel);
  const status = statusTone(feed, context);
  const trend = trendOf(feed.quote);
  const price = feed.quote === null ? '—' : formatPrice(feed.quote.price, tag);
  const change = feed.quote === null ? null : formatPercent(feed.quote.changePercent, tag);
  const arrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '·';
  const eventTime = feed.quote === null ? null : feed.quote.eventTime;
  const time = eventTime === null
    ? null
    : new Date(eventTime).toLocaleTimeString(tag, { hour12: false });

  return (
    <div
      className="rmd-bitcoin"
      data-rmd-component="bitcoin"
      data-rmd-part="frame"
      data-status={status}
      data-trend={trend}
      data-has-quote={feed.quote === null ? 'false' : 'true'}
      role="group"
      aria-label={label}
      aria-disabled={context.disabled || undefined}
      aria-busy={status === 'connecting' || undefined}
      hidden={!context.visible || undefined}
    >
      <header className="rmd-bitcoin-head" data-rmd-part="head">
        <span className="rmd-bitcoin-badge" aria-hidden="true">₿</span>
        <span className="rmd-bitcoin-ident">
          <span className="rmd-bitcoin-pair">{label}</span>
          <span className="rmd-bitcoin-source">{t('Binance · Spot', 'Binance · 现货')}</span>
        </span>
        <span className="rmd-bitcoin-status" data-rmd-part="status" role="status">
          {statusLabel(context, status, feed.problem)}
        </span>
      </header>

      <div className="rmd-bitcoin-price-row" data-rmd-part="price-row">
        <output
          className="rmd-bitcoin-price"
          data-rmd-part="price"
          aria-label={feed.quote === null ? label : `${label} ${price} USDT`}
        >
          {price}
          <span className="rmd-bitcoin-unit" aria-hidden="true">USDT</span>
        </output>
        {change === null ? null : (
          <span className="rmd-bitcoin-change" data-rmd-part="change">
            <span aria-hidden="true">{arrow}</span>
            {change}
          </span>
        )}
      </div>

      {status === 'unavailable' ? (
        <p className="rmd-bitcoin-note" data-rmd-part="note">
          {t('This page has not enabled a live quote channel.', '此页面未启用实时行情通道。')}
        </p>
      ) : feed.problem === null ? null : (
        <p className="rmd-bitcoin-note" data-rmd-part="note" data-tone="warning">
          {feed.problem}
        </p>
      )}

      <dl className="rmd-bitcoin-stats" data-rmd-part="stats">
        <div>
          <dt>{t('24h high', '24h 最高')}</dt>
          <dd>{feed.quote === null ? '—' : formatPrice(feed.quote.high, tag)}</dd>
        </div>
        <div>
          <dt>{t('24h low', '24h 最低')}</dt>
          <dd>{feed.quote === null ? '—' : formatPrice(feed.quote.low, tag)}</dd>
        </div>
        <div>
          <dt>{t('24h turnover', '24h 成交额')}</dt>
          <dd>{feed.quote === null ? '—' : formatVolume(feed.quote.quoteVolume, tag)}</dd>
        </div>
      </dl>

      <footer className="rmd-bitcoin-foot" data-rmd-part="foot">
        <span>
          {time === null || eventTime === null ? t('Waiting for the first tick…', '等待首条行情…') : (
            <>
              {t('Updated', '更新')}{' '}
              <time dateTime={new Date(eventTime).toISOString()}>{time}</time>
            </>
          )}
        </span>
        <span>Binance · WebSocket</span>
      </footer>
    </div>
  );
}

export function Bitcoin(context: LocalComponentContext) {
  if (context.mode === 'static') return <BitcoinStatic context={context} />;
  return <BitcoinLive context={context} />;
}

export default defineReactComponentPackage({
  ...bitcoin,
  render: Bitcoin,
  renderStatic: (context) => <BitcoinStatic context={context} />,
});
