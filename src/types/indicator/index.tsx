import { MAConfig, SMAConfig, EMAConfig, BBandsConfig, MACDConfig } from "./indicator-config";
import { IndicatorValue } from "./indicator-value";

export type IndicatorConfig = MAConfig | SMAConfig | EMAConfig | BBandsConfig | MACDConfig;


export enum MAType {
    SMA = "SMA",
    EMA = "EMA",
    WMA = "WMA",
    DEMA = "DEMA",
    TEMA = "TEMA",
    TRIMA = "TRIMA",
    KAMA = "KAMA",
    MANA = "MANA",
    T3 = "T3",
}

export enum IndicatorType {
    MA = "ma",
    SMA = "sma",
    EMA = "ema",
    BBANDS = "bbands",
    MACD = "macd",
}



export type IndicatorMap = {
    [IndicatorType.SMA]: SMAConfig;
    [IndicatorType.EMA]: EMAConfig;
    [IndicatorType.BBANDS]: BBandsConfig;
    [IndicatorType.MACD]: MACDConfig;
}



export enum PriceSource {
    CLOSE = "CLOSE",
    OPEN = "OPEN",
    HIGH = "HIGH",
    LOW = "LOW",
}

export type { IndicatorValue };

