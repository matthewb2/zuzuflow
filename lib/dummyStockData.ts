export interface DummyCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface DummyStockInfo {
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  candles: DummyCandle[];
}

const BASE_PRICES: Record<string, number> = {
  "005930": 72000,
  "000660": 185000,
  "035420": 210000,
  "035720": 42000,
  "비트코인": 85000000,
  "AAPL": 175,
};

const STOCK_NAMES: Record<string, string> = {
  "005930": "삼성전자",
  "000660": "SK하이닉스",
  "035420": "네이버",
  "035720": "카카오",
  "비트코인": "비트코인",
  "AAPL": "AAPL",
};

function randomWalk(base: number, days: number): number[] {
  const values: number[] = [base];
  for (let i = 1; i < days; i++) {
    const change = (Math.random() - 0.48) * base * 0.04;
    values.push(Math.round(Math.max(values[i - 1] + change, base * 0.7)));
  }
  return values;
}

export function getDummyStockData(code: string): DummyStockInfo {
  const basePrice = BASE_PRICES[code] || 50000;
  const name = STOCK_NAMES[code] || code;
  const days = 60;
  const closes = randomWalk(basePrice, days);

  const candles: DummyCandle[] = closes.map((close, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().slice(0, 10);
    const open = i === 0 ? close : closes[i - 1];
    const volatility = close * (0.005 + Math.random() * 0.02);
    const high = Math.round(Math.max(open, close) + volatility);
    const low = Math.round(Math.min(open, close) - volatility * 0.6);
    return {
      time: dateStr,
      open: Math.round(open),
      high,
      low: Math.max(low, 1),
      close,
    };
  });

  const currentPrice = candles[candles.length - 1].close;
  const prevClose = candles[candles.length - 2]?.close || currentPrice;
  const change = currentPrice - prevClose;
  const changePercent = Math.round((change / prevClose) * 10000) / 100;
  const high = Math.max(...candles.map(c => c.high));
  const low = Math.min(...candles.map(c => c.low));
  const volume = Math.floor(Math.random() * 10000000) + 1000000;

  return { name, currentPrice, change, changePercent, high, low, volume, candles };
}
