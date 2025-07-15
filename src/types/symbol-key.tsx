import { IndicatorConfig, IndicatorType } from "./indicator";


export type Key = KlineKey | IndicatorKey | BacktestKlineKey | BacktestIndicatorKey;

export type KeyStr = KlineKeyStr | IndicatorKeyStr | BacktestKlineKeyStr | BacktestIndicatorKeyStr;

export type KlineKeyStr = string;

export type IndicatorKeyStr = string;

export type BacktestKlineKeyStr = string;

export type BacktestIndicatorKeyStr = string;




export type KlineKey = {
    exchange: string;
    symbol: string;
    interval: string;
}

export type BacktestKlineKey = {
    exchange: string;
    symbol: string;
    interval: string;
    startTime: string;
    endTime: string;
}

export type IndicatorKey = {
    exchange: string;
    symbol: string;
    interval: string;
    indicatorType: IndicatorType;
    indicatorConfig: IndicatorConfig;
}

export type BacktestIndicatorKey = {
    exchange: string;
    symbol: string;
    interval: string;
    indicatorType: IndicatorType;
    indicatorConfig: IndicatorConfig;
    startTime: string;
    endTime: string;
}




