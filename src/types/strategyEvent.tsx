import {CacheKeyStr} from "@/types/cache";



export type LiveStrategyEvent = {
    channel: string;
    event_name: string;
    strategy_id: number;
    data: Record<CacheKeyStr, number[][]>;
    timestamp: number;
}


export type BacktestStrategyEvent = {
    channel: string;
    event_name: string;
    strategy_id: number;
    cache_key: CacheKeyStr;
    data: number[];
    timestamp: number;
}

