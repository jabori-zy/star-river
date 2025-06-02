import { SmaConfig, EmaConfig, BollConfig } from "./indicatorConfig";

export type IndicatorConfig = SmaConfig | EmaConfig | BollConfig;

export enum IndicatorType {
    SMA = "sma",
    EMA = "ema",
    BOLL = "boll",
}

export enum PriceSource {
    CLOSE = "close",
    OPEN = "open",
    HIGH = "high",
    LOW = "low",
}

