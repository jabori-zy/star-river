export type Kline = {
	datetime: string;
	open: number; // 开盘价
	high: number; // 最高价
	low: number; // 最低价
	close: number; // 收盘价
	volume: number; // 成交量
};

export enum KlineInterval {
	"1m" = 60,
	"5m" = 300,
	"15m" = 900,
	"30m" = 1800,
	"1h" = 3600,
	"4h" = 14400,
	"1d" = 86400,
}

// Time interval value to label mapping
export const INTERVAL_LABEL_MAP: Record<string, string> = {
	"1m": "1 Minute",
	"2m": "2 Minutes",
	"3m": "3 Minutes",
	"4m": "4 Minutes",
	"5m": "5 Minutes",
	"6m": "6 Minutes",
	"10m": "10 Minutes",
	"12m": "12 Minutes",
	"15m": "15 Minutes",
	"20m": "20 Minutes",
	"30m": "30 Minutes",
	"1h": "1 Hour",
	"2h": "2 Hours",
	"3h": "3 Hours",
	"4h": "4 Hours",
	"6h": "6 Hours",
	"8h": "8 Hours",
	"12h": "12 Hours",
	"1d": "1 Day",
	"1w": "1 Week",
	"1M": "1 Month",
};
