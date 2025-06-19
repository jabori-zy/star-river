export type SMAValue = {
    sma: number;
}

export type EMAValue = {
    ema: number;
}

export type BOLLValue = {
    upper: number;
    middle: number;
    lower: number;
}


export type IndicatorValue = SMAValue | EMAValue | BOLLValue;
