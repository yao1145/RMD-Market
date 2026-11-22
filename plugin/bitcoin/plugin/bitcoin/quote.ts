/** Wire shape published by the host's Binance ticker channel. */
export interface BitcoinQuote {
  readonly symbol: string;
  readonly price: number;
  readonly changePercent: number;
  readonly high: number;
  readonly low: number;
  readonly quoteVolume: number;
  readonly eventTime: number;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isBitcoinQuote(value: unknown): value is BitcoinQuote {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const quote = value as { readonly [key: string]: unknown };
  return typeof quote.symbol === 'string' && quote.symbol.length > 0
    && finiteNumber(quote.price) && quote.price > 0
    && finiteNumber(quote.changePercent)
    && finiteNumber(quote.high) && quote.high > 0
    && finiteNumber(quote.low) && quote.low > 0
    && finiteNumber(quote.quoteVolume) && quote.quoteVolume >= 0
    && finiteNumber(quote.eventTime) && quote.eventTime > 0;
}
