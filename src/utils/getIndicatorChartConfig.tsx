import { IndicatorCacheKey } from "@/types/cache";
import { IndicatorType } from "@/types/indicator";

export interface IndicatorSeriesConfig {
    id: string;
    type: 'line' | 'area' | 'column' | 'bar';
    name: string;
    dataGrouping: {
        enabled: boolean;
    };
}


// 获取指标图表中的数据系列配置
export function getIndicatorChartConfig(indicatorCacheKey: IndicatorCacheKey): IndicatorSeriesConfig | null {
    switch(indicatorCacheKey.indicator_type) {
        case IndicatorType.SMA:
            return {
                id: `sma-${indicatorCacheKey.indicator_config.period}`,
                type: 'line',
                name: 'SMA',
                dataGrouping: {
                    enabled: false
                },
            };
    }
    return null;
}



