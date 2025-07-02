export type SMAValue = {
    timestamp: number;
    sma: number;
}

export type EMAValue = {
    timestamp: number;
    ema: number;
}

export type BOLLValue = {
    timestamp: number;
    upper: number;
    middle: number;
    lower: number;
}

export type MACDValue = {
    timestamp: number;
    macd: number;
    signal: number;
    histogram: number;
}

export type IndicatorValue = SMAValue | EMAValue | BOLLValue | MACDValue;
