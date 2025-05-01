

export interface IndicatorValueItem {
    showName: string; // 显示名称(中文)
    value: number;     // 指标值
  }


export type SMAValue = {
    sma: IndicatorValueItem;

}

export type BOLLValue = {
    upper: IndicatorValueItem;
    middle: IndicatorValueItem;
    lower: IndicatorValueItem;
}


export type IndicatorValue = SMAValue | BOLLValue;
