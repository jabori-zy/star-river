export type Kline = {
	timestamp: number; // 时间戳
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
