import { SmaConfig, EmaConfig, BollConfig } from "./indicatorConfig";
import { IndicatorValue } from "./indicatorValue";

export type IndicatorConfig = SmaConfig | EmaConfig | BollConfig;

export enum IndicatorType {
    SMA = "sma",
    EMA = "ema",
    BOLL = "boll",
    MACD = "macd",
}



export type IndicatorMap = {
    [IndicatorType.SMA]: SmaConfig;
    [IndicatorType.EMA]: EmaConfig;
    [IndicatorType.BOLL]: BollConfig;
}



export enum PriceSource {
    CLOSE = "close",
    OPEN = "open",
    HIGH = "high",
    LOW = "low",
}

export type { IndicatorValue };

