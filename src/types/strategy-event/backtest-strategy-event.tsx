import { KeyStr } from "@/types/symbol-key";
import { Kline } from "@/types/kline";
import { IndicatorValue } from "@/types/indicator";
import { VirtualOrder } from "@/types/order/virtual-order";

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
	| FuturesOrderFilledEvent;

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
	indicatorSeries: IndicatorValue[];
};

export type FuturesOrderFilledEvent = BaseEventProps & {
	futuresOrder: VirtualOrder;
};
