import { IndicatorType } from "@/types/indicator";
import { SMAValue, BOLLValue } from "@/types/indicatorValue";

export function getIndicatorValue(indicatorType: IndicatorType) {
	switch (indicatorType) {
		case IndicatorType.SMA:
			return {
				sma: {
					showName: "均线",
					value: 0,
				},
			} as SMAValue;
		case IndicatorType.BBANDS:
			return {
				upper: {
					showName: "上轨",
					value: 0,
				},
				middle: {
					showName: "中轨",
					value: 0,
				},
				lower: {
					showName: "下轨",
					value: 0,
				},
			} as BOLLValue;
		default:
			return null;
	}
}
