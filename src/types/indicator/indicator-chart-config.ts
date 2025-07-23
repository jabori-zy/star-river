import { IndicatorType } from ".";
import { IndicatorValue} from "./indicator-value";
import { parseKey } from "@/utils/parse-key";
import { IndicatorKey } from "@/types/symbol-key";
import { SeriesType } from "../chart";
import { IndicatorChartConfig } from "../chart";


// 单个数据系列配置
// export interface SeriesConfig {
//     name: string; // 数据系列名称
//     type: SeriesType; // 数据系列类型
//     color?: string; // 数据系列颜色
//     strokeThickness?: number; // 数据系列线宽
//     indicatorValueKey: keyof IndicatorValue; // 指标值的键名
// }



// 指标图表配置
// export interface IndicatorChartConfig {
//     name: string; // 指标名称
//     isInMainChart: boolean; // 默认在主图中，还是子图中
//     seriesConfigs: IndicatorSeriesConfig[];
// }


// 指标配置映射
export const INDICATOR_CHART_CONFIG_MAP: Record<IndicatorType, IndicatorChartConfig> = {
    [IndicatorType.MA]:{
        name: "MA",
        isInMainChart: true,
        seriesConfigs: [
            {name: "SMA", type: SeriesType.LINE, color: "#FF6B6B", strokeThickness: 2, indicatorValueKey: "ma" as keyof IndicatorValue }
        ]

    },
    [IndicatorType.SMA]: {
        name: "SMA",
        isInMainChart: true,
        seriesConfigs: [
            { name: "SMA", type: SeriesType.LINE, color: "#FF6B6B", strokeThickness: 2, indicatorValueKey: "sma" as keyof IndicatorValue }
        ],
    },
    
    [IndicatorType.EMA]: {
        name: "移动平均线",
        isInMainChart: true,
        seriesConfigs: [
            { name: "MA", type: SeriesType.LINE, color: "#4ECDC4", strokeThickness: 2, indicatorValueKey: "ema" as keyof IndicatorValue }
        ],
    },
    
    [IndicatorType.BBANDS]: {
        name: "布林带",
        isInMainChart: true,
        seriesConfigs: [
            { name: "上轨", type: SeriesType.LINE, color: "#FF6B6B", strokeThickness: 1, indicatorValueKey: "upper" as keyof IndicatorValue },
            { name: "中轨", type: SeriesType.LINE, color: "#4ECDC4", strokeThickness: 2, indicatorValueKey: "middle" as keyof IndicatorValue },
            { name: "下轨", type: SeriesType.LINE, color: "#FF6B6B", strokeThickness: 1, indicatorValueKey: "lower" as keyof IndicatorValue }
        ],
    },
    
    [IndicatorType.MACD]: {
        name: "MACD",
        isInMainChart: false,
        seriesConfigs: [
            { name: "MACD线", type: SeriesType.LINE, color: "#FF6B6B", strokeThickness: 2, indicatorValueKey: "macd" as keyof IndicatorValue },
            { name: "信号线", type: SeriesType.LINE, color: "#4ECDC4", strokeThickness: 2, indicatorValueKey: "signal" as keyof IndicatorValue },
            { name: "柱状图", type: SeriesType.COLUMN, color: "#45B7D1", indicatorValueKey: "histogram" as keyof IndicatorValue }
        ],
    }
};

// 从缓存键解析指标类型的工具函数
export function parseIndicatorTypeFromCacheKey(cacheKey: string): IndicatorType | null {
    // 假设缓存键格式为: "INDICATOR_TYPE-SYMBOL-TIMEFRAME" 例如: "RSI-BTC-USDT-1m"
    const parts = cacheKey.split('-');
    if (parts.length === 0) return null;
    
    const indicatorStr = parts[0].toUpperCase();
    
    // 检查是否匹配已知的指标类型
    for (const [key, value] of Object.entries(IndicatorType)) {
        if (value === indicatorStr) {
            return value as IndicatorType;
        }
    }
    
    return null;
}

// 获取指标配置的工具函数
export function getIndicatorConfig(indicatorType: IndicatorType): IndicatorChartConfig | null {
    return INDICATOR_CHART_CONFIG_MAP[indicatorType] || null;
}

// 从缓存键获取指标配置
export function getIndicatorChartConfig(cacheKeyStr: string): IndicatorChartConfig | null {
    const indicatorKey = parseKey(cacheKeyStr) as IndicatorKey;
    if (!indicatorKey) return null;
    return INDICATOR_CHART_CONFIG_MAP[indicatorKey.indicatorType];
} 