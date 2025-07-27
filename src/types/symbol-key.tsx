import type { IndicatorType } from "./indicator";
import type { IndicatorConfigType } from "./indicator/config";
import type { KlineInterval } from "./kline";

export type Key = KlineKey | IndicatorKey;
// | BacktestKlineKey
// | BacktestIndicatorKey;

export type KeyStr = KlineKeyStr | IndicatorKeyStr;
// | BacktestKlineKeyStr
// | BacktestIndicatorKeyStr;

export type KlineKeyStr = string;

export type IndicatorKeyStr = string;

// export type BacktestKlineKeyStr = string;

// export type BacktestIndicatorKeyStr = string;

// export type KlineKey = {
// 	exchange: string;
// 	symbol: string;
// 	interval: KlineInterval;

// };

export type KlineKey = {
	exchange: string;
	symbol: string;
	interval: KlineInterval;
	startTime?: string;
	endTime?: string;
};

// export type IndicatorKey = {
// 	exchange: string;
// 	symbol: string;
// 	interval: KlineInterval;
// 	indicatorType: IndicatorType;
// 	indicatorConfig: IndicatorConfig;
// };

export type IndicatorKey = {
	exchange: string;
	symbol: string;
	interval: KlineInterval;
	indicatorType: IndicatorType;
	indicatorConfig: IndicatorConfigType;
	startTime?: string;
	endTime?: string;
};
