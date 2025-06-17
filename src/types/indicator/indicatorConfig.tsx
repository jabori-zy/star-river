import { PriceSource, IndicatorType } from "@/types/indicator";


export type SmaConfig = {
    type: IndicatorType.SMA;
    period: number;
    priceSource: PriceSource;
}

export type EmaConfig = {
    type: IndicatorType.EMA;
    period: number;
    priceSource: PriceSource;
}

export type BollConfig = {
    type: IndicatorType.BOLL;
    period: number;
    stdDev: number;
    priceSource: PriceSource;
}