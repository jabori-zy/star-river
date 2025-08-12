import type { Kline } from "@/types/kline";
import type { VirtualOrder } from "@/types/order/virtual-order";
import type { KeyStr } from "@/types/symbol-key";

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
	| klineUpdateEvent
	| indicatorUpdateEvent
	| FuturesOrderEvent;

export type BaseEventProps = {
	channel: string;
	event_type: string;
	event: string;
	timestamp: number;
	fromNodeId: string;
	fromNodeName: string;
	fromNodeHandleId: string;
};

export type klineUpdateEvent = BaseEventProps & {
	klineCacheIndex: number;
	klineKey: KeyStr;
	kline: Kline[];
};

export type indicatorUpdateEvent = BaseEventProps & {
	indicatorKey: KeyStr;
	indicatorSeries: Record<string, number>[];
};

export type FuturesOrderEvent = BaseEventProps & {
	futuresOrder: VirtualOrder;
};
