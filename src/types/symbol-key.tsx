import type { IndicatorType } from "./indicator";
import type { IndicatorConfigType } from "./indicator/config";
import type { KlineInterval } from "./kline";

export type Key = KlineKey | IndicatorKey;

export type KeyStr = KlineKeyStr | IndicatorKeyStr;

export type KlineKeyStr = string;

export type IndicatorKeyStr = string;

export type KlineKey = {
	type: "kline";
	exchange: string;
	symbol: string;
	interval: KlineInterval;
	startTime?: string;
	endTime?: string;
};

export type IndicatorKey = {
	type: "indicator";
	exchange: string;
	symbol: string;
	interval: KlineInterval;
	indicatorType: IndicatorType;
	indicatorConfig: IndicatorConfigType;
	startTime?: string;
	endTime?: string;
};
