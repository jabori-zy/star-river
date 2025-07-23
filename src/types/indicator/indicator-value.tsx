
export type IndicatorValue = MAValue | SMAValue | EMAValue | BBandsValue | MACDValue;


export type MAValue = {
    timestamp: number;
    ma: number;
}


export type SMAValue = {
    timestamp: number;
    sma: number;
}

export type EMAValue = {
    timestamp: number;
    ema: number;
}

export type BBandsValue = {
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


