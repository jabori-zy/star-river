import {CacheKeyStr} from "@/types/cache";



export type StrategyEvent = {
    channel: string;
    event_name: string;
    strategy_id: number;
    data: Record<CacheKeyStr, number[][]>;
    timestamp: number;
}

