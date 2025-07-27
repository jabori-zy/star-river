import { IndicatorType } from "@/types/indicator";
import type { IndicatorKey } from "@/types/symbol-key";

export interface IndicatorSeriesConfig {
	id: string;
	type: "line" | "area" | "column" | "bar";
	name: string;
	dataGrouping: {
		enabled: boolean;
	};
}

// 获取指标图表中的数据系列配置
export function getIndicatorChartConfig(
	indicatorCacheKey: IndicatorKey,
): IndicatorSeriesConfig | null {
	switch (indicatorCacheKey.indicatorType) {
		case IndicatorType.SMA:
			return {
				id: `sma-${indicatorCacheKey.indicatorConfig.period}`,
				type: "line",
				name: "SMA",
				dataGrouping: {
					enabled: false,
				},
			};
	}
	return null;
}
