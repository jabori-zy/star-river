import { PriceSource, IndicatorType, MAType} from "@/types/indicator";


export type MAConfig = {
    type: IndicatorType.MA;
    maType: MAType;
    timePeriod: number;
    priceSource: PriceSource;
}


export type SMAConfig = {
    type: IndicatorType.SMA;
    timePeriod: number;
    priceSource: PriceSource;
}

export type EMAConfig = {
    type: IndicatorType.EMA;
    timePeriod: number;
    priceSource: PriceSource;
}

export type BBandsConfig = {
    type: IndicatorType.BBANDS;
    timePeriod: number;
    stdDev: number;
    priceSource: PriceSource;
}

export type MACDConfig = {
    type: IndicatorType.MACD;
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
    priceSource: PriceSource;
}