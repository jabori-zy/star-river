import type { Kline } from "@/types/kline";
import type { VirtualOrder } from "@/types/order/virtual-order";
import type { KeyStr } from "@/types/symbol-key";
import type { VirtualPosition } from "../position";
import type { StrategyStats } from "../statistics";
import type { VirtualTransaction } from "../transaction";

export type LiveStrategyEvent = {
	channel: string;
	event_name: string;
	strategy_id: number;
	data: Record<KeyStr, number[][]>;
	timestamp: number;
};

// export type BacktestStrategyEvent = {
//     channel: string;
//     event_name: string;
//     strategy_id: number;
//     cache_key: CacheKeyStr;
//     data: number[];
//     timestamp: number;
// }

export type BacktestStrategyEvent =
	| KlineUpdateEvent
	| IndicatorUpdateEvent
	| VirtualOrderEvent
	| VirtualPositionEvent
	| VirtualTransactionEvent
	| BacktestStrategyStatsUpdateEvent
	| PlayFinishedEvent;

export type BaseEventProps = {
	channel: string;
	eventType: string;
	event: string;
	timestamp: number;
	fromNodeId: string;
	fromNodeName: string;
	fromNodeHandleId: string;
};

export type KlineUpdateEvent = BaseEventProps & {
	klineCacheIndex: number;
	klineKey: KeyStr;
	kline: Kline;
};

export type IndicatorUpdateEvent = BaseEventProps & {
	indicatorKey: KeyStr;
	indicatorValue: Record<string, number | string>;
};

export type VirtualOrderEvent = BaseEventProps & {
	futuresOrder: VirtualOrder;
};


export type VirtualPositionEvent = BaseEventProps & {
	virtualPosition: VirtualPosition;
};

export type BacktestStrategyStatsUpdateEvent = Omit<BaseEventProps, "fromNodeId" | "fromNodeName" | "fromNodeHandleId"> & {
	statsSnapshot: StrategyStats;
};

export type VirtualTransactionEvent = BaseEventProps & {
	transaction: VirtualTransaction;
};

export type PlayFinishedEvent = Omit<BaseEventProps, "fromNodeId" | "fromNodeName" | "fromNodeHandleId"> & {
	strategyId: number;
	strategyName: string;
	playIndex: number;
};

