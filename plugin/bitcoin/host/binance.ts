import type {
  ChannelValidator,
  Json,
  SubscribeAdapter,
  SubscribeAdapterContext,
} from 'reactive-md/runtime';
import { isBitcoinQuote, type BitcoinQuote } from '../plugin/bitcoin/quote';

const TICKER_EVENT = '24hrTicker';
const DEFAULT_ENDPOINT = 'wss://data-stream.binance.vision/ws';
const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30_000;
const CONNECT_TIMEOUT_MS = 15_000;

export interface BinanceTickerOptions {
  /** Lowercase or uppercase pair; defaults to `btcusdt`. */
  readonly symbol?: string;
  /** Market-data endpoint base; override for a regional mirror or a local test server. */
  readonly endpoint?: string;
}

function normalizeSymbol(value: string): string {
  const symbol = value.trim().toLowerCase();
  if (!/^[a-z0-9]{5,32}$/.test(symbol)) {
    throw new TypeError('A Binance symbol must be 5–32 lowercase letters or digits.');
  }
  return symbol;
}

function normalizeEndpoint(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
    throw new TypeError('The Binance endpoint must use ws: or wss:.');
  }
  return url.toString().replace(/\/$/, '');
}

function numberField(record: { readonly [key: string]: unknown }, key: string): number | null {
  const raw = record[key];
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Map one raw `24hrTicker` payload to the channel's public quote shape. */
export function parseBinanceTicker(raw: unknown, symbol: string): BitcoinQuote | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const record = raw as { readonly [key: string]: unknown };
  if (record.e !== TICKER_EVENT) return null;
  if (typeof record.s !== 'string' || record.s.toUpperCase() !== symbol.toUpperCase()) return null;

  const price = numberField(record, 'c');
  const high = numberField(record, 'h');
  const low = numberField(record, 'l');
  const quoteVolume = numberField(record, 'q');
  const eventTime = numberField(record, 'E');
  const reportedPercent = numberField(record, 'P');
  const open = numberField(record, 'o');
  const changePercent = reportedPercent ?? (
    open !== null && open > 0 && price !== null ? ((price - open) / open) * 100 : null
  );
  if (price === null || high === null || low === null
    || quoteVolume === null || eventTime === null || changePercent === null) {
    return null;
  }

  const quote: BitcoinQuote = {
    symbol: record.s,
    price,
    changePercent,
    high,
    low,
    quoteVolume,
    eventTime,
  };
  return isBitcoinQuote(quote) ? quote : null;
}

const validate: ChannelValidator<Json> = value => isBitcoinQuote(value)
  ? true
  : 'Binance 行情消息格式无效。';

function retryDelay(attempt: number): number {
  return Math.min(INITIAL_RETRY_MS * 2 ** Math.max(0, attempt - 1), MAX_RETRY_MS);
}

function openTickerStream(
  url: string,
  symbol: string,
  context: SubscribeAdapterContext,
): () => void {
  let socket: WebSocket | null = null;
  let retry: ReturnType<typeof setTimeout> | null = null;
  let connectTimer: ReturnType<typeof setTimeout> | null = null;
  let attempts = 0;
  let disposed = false;
  let failureReported = false;

  context.status('connecting');

  const clearRetry = (): void => {
    if (retry === null) return;
    clearTimeout(retry);
    retry = null;
  };

  const clearConnectTimer = (): void => {
    if (connectTimer === null) return;
    clearTimeout(connectTimer);
    connectTimer = null;
  };

  const reportFailure = (): void => {
    if (failureReported) return;
    failureReported = true;
    context.error({
      code: 'transport',
      message: '与 Binance 的行情连接中断，正在重试。',
    });
  };

  const schedule = (): void => {
    if (disposed || context.signal.aborted) return;
    attempts += 1;
    context.status('connecting');
    clearRetry();
    retry = setTimeout(connect, retryDelay(attempts));
  };

  const detach = (current: WebSocket): void => {
    current.onopen = null;
    current.onmessage = null;
    current.onerror = null;
    current.onclose = null;
    try {
      current.close();
    } catch {
      // The socket may already be closed.
    }
  };

  const lost = (current: WebSocket): void => {
    if (disposed || current !== socket) return;
    socket = null;
    clearConnectTimer();
    detach(current);
    if (context.signal.aborted) return;
    reportFailure();
    schedule();
  };

  const connect = (): void => {
    retry = null;
    if (disposed || context.signal.aborted) return;
    context.status('connecting');

    let next: WebSocket;
    try {
      next = new WebSocket(url);
    } catch {
      reportFailure();
      schedule();
      return;
    }
    socket = next;
    clearConnectTimer();
    connectTimer = setTimeout(() => {
      if (disposed || next !== socket) return;
      lost(next);
    }, CONNECT_TIMEOUT_MS);

    next.onopen = () => {
      if (disposed || next !== socket) return;
      clearConnectTimer();
      attempts = 0;
      failureReported = false;
      context.status('open');
    };
    next.onmessage = (event) => {
      if (disposed || next !== socket) return;
      if (typeof event.data !== 'string') return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      const quote = parseBinanceTicker(parsed, symbol);
      if (quote !== null) context.data(quote);
    };
    next.onerror = () => {
      lost(next);
    };
    next.onclose = () => {
      lost(next);
    };
  };

  const release = (): void => {
    if (disposed) return;
    disposed = true;
    context.signal.removeEventListener('abort', onAbort);
    clearRetry();
    clearConnectTimer();
    const current = socket;
    socket = null;
    if (current !== null) detach(current);
  };

  const onAbort = (): void => {
    release();
  };

  context.signal.addEventListener('abort', onAbort, { once: true });
  connect();
  return release;
}

/**
 * Host channel for the `<bitcoin>` component. The document supplies only the
 * channel name; the endpoint, pair and reconnect policy stay in host code.
 */
export function binanceTickerChannel(options: BinanceTickerOptions = {}): SubscribeAdapter {
  const symbol = normalizeSymbol(options.symbol ?? 'btcusdt');
  const base = normalizeEndpoint(options.endpoint ?? DEFAULT_ENDPOINT);
  const url = `${base}/${symbol}@ticker`;
  return {
    validate,
    open: (context) => openTickerStream(url, symbol, context),
  };
}
