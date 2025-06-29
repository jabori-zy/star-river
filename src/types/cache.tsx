import { IndicatorConfig, IndicatorType } from "./indicator";


export type CacheKey = KlineCacheKey | IndicatorCacheKey | BacktestKlineCacheKey | BacktestIndicatorCacheKey;

export type CacheKeyStr = KlineCacheKeyStr | IndicatorCacheKeyStr | BacktestKlineCacheKeyStr | BacktestIndicatorCacheKeyStr;

export type KlineCacheKeyStr = string;

export type IndicatorCacheKeyStr = string;

export type BacktestKlineCacheKeyStr = string;

export type BacktestIndicatorCacheKeyStr = string;




export type KlineCacheKey = {
    exchange: string;
    symbol: string;
    interval: string;
}

export type BacktestKlineCacheKey = {
    exchange: string;
    symbol: string;
    interval: string;
    startTime: string;
    endTime: string;
}

export type IndicatorCacheKey = {
    exchange: string;
    symbol: string;
    interval: string;
    indicatorType: IndicatorType;
    indicatorConfig: IndicatorConfig;
}

export type BacktestIndicatorCacheKey = {
    exchange: string;
    symbol: string;
    interval: string;
    indicatorType: IndicatorType;
    indicatorConfig: IndicatorConfig;
    startTime: string;
    endTime: string;
}




