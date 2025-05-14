import { IndicatorConfig, IndicatorType } from "./indicator";


export type CacheKey = KlineCacheKey | IndicatorCacheKey;

export type CacheKeyStr = KlineCacheKeyStr | IndicatorCacheKeyStr;

export type KlineCacheKeyStr = string;

export type IndicatorCacheKeyStr = string;


export type KlineCacheKey = {
    exchange: string;
    symbol: string;
    interval: string;
}

export type IndicatorCacheKey = {
    exchange: string;
    symbol: string;
    interval: string;
    indicator_type: IndicatorType;
    indicator_config: IndicatorConfig;
}




