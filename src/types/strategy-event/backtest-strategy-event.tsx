import {CacheKeyStr} from "@/types/cache";
import { Kline } from "@/types/kline";
import { IndicatorValue } from "@/types/indicator";




export type LiveStrategyEvent = {
    channel: string;
    event_name: string;
    strategy_id: number;
    data: Record<CacheKeyStr, number[][]>;
    timestamp: number;
}


// export type BacktestStrategyEvent = {
//     channel: string;
//     event_name: string;
//     strategy_id: number;
//     cache_key: CacheKeyStr;
//     data: number[];
//     timestamp: number;
// }

export type BacktestStrategyEvent = klineUpdateEvent | indicatorUpdateEvent;


export type BaseEventProps = {
    channel: string;
    event_type: string;
    event: string;
    timestamp: number;
}


export type klineUpdateEvent = BaseEventProps & {
    fromNodeId: string;
    fromNodeName: string;
    fromNodeHandleId: string;
    klineCacheIndex: number;
    klineCacheKey: CacheKeyStr;
    kline: Kline[];
}

export type indicatorUpdateEvent = BaseEventProps & {
    fromNodeId: string;
    fromNodeName: string;
    fromNodeHandleId: string;
    indicatorCacheKey: CacheKeyStr;
    indicatorSeries: IndicatorValue[];
}
