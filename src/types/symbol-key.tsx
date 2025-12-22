import type { IndicatorType } from "./indicator";
import type { IndicatorConfigType } from "./indicator/config";

export type Key = KlineKey | IndicatorKey | OperationKey;

export type KeyStr = KlineKeyStr | IndicatorKeyStr;

export type KlineKeyStr = string;

export type IndicatorKeyStr = string;

export type KlineKey = {
	type: "kline";
	exchange: string;
	symbol: string;
	interval: string;
	startTime?: string;
	endTime?: string;
};

export type IndicatorKey = {
	type: "indicator";
	exchange: string;
	symbol: string;
	interval: string;
	indicatorType: IndicatorType;
	indicatorConfig: IndicatorConfigType;
	startTime?: string;
	endTime?: string;
};

export type OperationKey = {
	type: "operation";
	nodeId: string;
	interval: string;
	name: string;
}