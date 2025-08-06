import type {
    MouseEventParams,
    SingleValueData,
    Time,
} from "lightweight-charts";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart-new/backtest-chart-store";
import { getIndicatorConfig, getValueLegendShowName } from "@/types/indicator/indicator-config";
import type { IndicatorType } from "@/types/indicator";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKey, IndicatorKeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

export type IndicatorLegendData = {
    indicatorName: string;
    values: Record<string, { label: string; value: string; color?: string }>;
    time: Time;
    timeString: string;
};

// 颜色配置
const colors = {
    blue: "#3b82f6",
    green: "#22c55e",
    red: "#ef4444",
    gray: "#6b7280",
};

// 解析指标名称从indicatorKeyStr
const parseIndicatorName = (indicatorKeyStr: IndicatorKeyStr): string => {
    try {
        const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
        const config = getIndicatorConfig(indicatorKey.indicatorType);
        return config?.displayName || indicatorKey.indicatorType;
    } catch (error) {
        console.error("解析指标名称失败:", error);
        return "Unknown";
    }
};

// 时间转换为字符串
const timeToString = (time: Time): string => {
    if (typeof time === "number") {
        return new Date(time * 1000).toLocaleString();
    }
    if (typeof time === "object") {
        const date = new Date(time.year, time.month - 1, time.day);
        return date.toLocaleDateString();
    }
    return time;
};

// 获取指标值的颜色
const getIndicatorValueColor = (_key: string, index: number): string => {
    const colorList = [colors.blue, colors.green, colors.red, colors.gray];
    return colorList[index % colorList.length];
};

// 将指标数据转换为图例数据
const mapIndicatorDataToLegendData = (
    indicatorKeyStr: IndicatorKeyStr,
    data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
    time: Time,
): IndicatorLegendData => {
    const indicatorName = parseIndicatorName(indicatorKeyStr);
    const values: Record<string, { label: string; value: string; color?: string }> = {};

    let colorIndex = 0;

    // 解析indicatorType用于获取legend名称
    let indicatorType: string | undefined;
    try {
        const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
        indicatorType = indicatorKey.indicatorType;
    } catch (error) {
        console.error("解析indicatorType失败:", error);
    }

    // 遍历所有指标值字段
    Object.entries(data).forEach(([key, seriesData]) => {
        if (key === "timestamp") return; // 跳过timestamp字段

        // 查找对应时间的数据点
        const dataPoint = seriesData.find((point) => point.time === time);

        if (dataPoint) {
            // 使用新的方法获取legend显示名称，如果没有则使用原始key
            const legendShowName = indicatorType
                ? getValueLegendShowName(indicatorType as IndicatorType, key as keyof IndicatorValueConfig)
                : undefined;

            values[key] = {
                label: legendShowName || key,
                value: dataPoint.value.toFixed(2),
                color: getIndicatorValueColor(key, colorIndex++),
            };
        } else {
            // 即使没有数据，也要创建空的值条目，确保legend显示
            const legendShowName = indicatorType
                ? getValueLegendShowName(indicatorType as IndicatorType, key as keyof IndicatorValueConfig)
                : undefined;

            values[key] = {
                label: legendShowName || key,
                value: "--", // 显示占位符而不是空值
                color: getIndicatorValueColor(key, colorIndex++),
            };
        }
    });

    return {
        indicatorName,
        values,
        time,
        timeString: timeToString(time),
    };
};

// 获取最新数据点的图例数据
const getLastDataLegendData = (
    indicatorKeyStr: IndicatorKeyStr,
    data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
): IndicatorLegendData => {
    let latestTime: Time | null = null;
    let latestTimestamp = 0;

    // 找到最新的时间点
    Object.entries(data).forEach(([key, seriesData]) => {
        if (key === "timestamp" || seriesData.length === 0) return;

        const lastPoint = seriesData[seriesData.length - 1];
        const timestamp = typeof lastPoint.time === "number" ? lastPoint.time : 0;

        if (timestamp > latestTimestamp) {
            latestTimestamp = timestamp;
            latestTime = lastPoint.time;
        }
    });

    // 如果没有找到时间点，使用当前时间作为默认值
    if (!latestTime) {
        latestTime = Math.floor(Date.now() / 1000) as Time; // 转换为秒级时间戳并断言为Time类型
    }

    return mapIndicatorDataToLegendData(indicatorKeyStr, data, latestTime);
};

interface UseIndicatorLegendProps {
    chartId: number;
    indicatorKeyStr: IndicatorKeyStr;
}

export const useIndicatorLegend = ({ chartId, indicatorKeyStr }: UseIndicatorLegendProps) => {
    // 从 store 获取数据和方法
    const { indicatorData, getIndicatorSeriesRef, getSubChartPaneRef } = useBacktestChartStore(chartId);

    // 🔑 使用 useMemo 稳定 data 引用，避免无限重新创建 onCrosshairMove
    const data = useMemo(() => {
        return (indicatorData[indicatorKeyStr] as Record<keyof IndicatorValueConfig, SingleValueData[]>) || {};
    }, [indicatorData, indicatorKeyStr]);

    const [legendData, setLegendData] = useState<IndicatorLegendData>(() => {
        // 总是返回legend数据，即使没有数据也显示空的legend
        return getLastDataLegendData(indicatorKeyStr, data);
    });

    // 监听数据变化，自动更新图例数据
    useEffect(() => {
        // 总是更新legend数据，即使data为空也要显示
        const newLegendData = getLastDataLegendData(indicatorKeyStr, data);
        setLegendData((prev) => {
            // 只有在时间不同时才更新，避免不必要的渲染
            const shouldUpdate = prev?.time !== newLegendData?.time;
            return shouldUpdate ? newLegendData : prev;
        });
    }, [data, indicatorKeyStr]);

    const onCrosshairMove = useCallback((param: MouseEventParams) => {
            if (!param || !param.time) {
                // 没有时间参数时，显示空值而不是最新数据
                const indicatorName = parseIndicatorName(indicatorKeyStr);
                const values: Record<string, { label: string; value: string; color?: string }> = {};

                // 解析indicatorType用于获取legend名称
                let indicatorType: string | undefined;
                try {
                    const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
                    indicatorType = indicatorKey.indicatorType;
                } catch (error) {
                    console.error("解析indicatorType失败:", error);
                }

                let colorIndex = 0;
                // 为所有字段创建空值条目
                Object.entries(data).forEach(([key]) => {
                    if (key === "timestamp") return; // 跳过timestamp字段

                    const legendShowName = indicatorType
                        ? getValueLegendShowName(indicatorType as IndicatorType, key as keyof IndicatorValueConfig)
                        : undefined;

                    values[key] = {
                        label: legendShowName || key,
                        value: "--", // 显示占位符
                        color: getIndicatorValueColor(key, colorIndex++),
                    };
                    
                });

                const emptyLegendData = {
                    indicatorName,
                    values,
                    time: Math.floor(Date.now() / 1000) as Time,
                    timeString: timeToString(Math.floor(Date.now() / 1000) as Time),
                };

                setLegendData((prev) => {
                    const shouldUpdate = prev?.time !== emptyLegendData.time;
                    return shouldUpdate ? emptyLegendData : prev;
                });
                return;
            }

            // 根据鼠标位置获取对应时间的数据
            const newLegendData = mapIndicatorDataToLegendData(
                indicatorKeyStr,
                data,
                param.time,
            );

            // 总是更新legend数据，即使没有找到具体时间的数据也显示空值
            setLegendData((prev) => {
                const shouldUpdate = prev?.time !== newLegendData.time;
                return shouldUpdate ? newLegendData : prev;
            });
    }, [indicatorKeyStr, data]);

    return {
        legendData,
        onCrosshairMove,
        getIndicatorSeriesRef,
        getSubChartPaneRef,
    };
};