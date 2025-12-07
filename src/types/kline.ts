export type Kline = {
	datetime: string;
	open: number; // Open price
	high: number; // High price
	low: number; // Low price
	close: number; // Close price
	volume: number; // Trading volume
};

export enum KlineInterval {
	m1 = "1m",
	m2 = "2m",
	m3 = "3m",
	m4 = "4m",
	m5 = "5m",
	m6 = "6m",
	m10 = "10m",
	m12 = "12m",
	m15 = "15m",
	m30 = "30m",
	h1 = "1h",
	h2 = "2h",
	h3 = "3h",
	h4 = "4h",
	h6 = "6h",
	h8 = "8h",
	h12 = "12h",
	d1 = "1d",
	w1 = "1w",
	M1 = "1M",
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

export const getKlineIntervalLabel = (interval: string) => {
	return INTERVAL_LABEL_MAP[interval];
};
