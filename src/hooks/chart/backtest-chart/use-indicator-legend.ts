import type {
	MouseEventParams,
	SingleValueData,
	Time,
} from "lightweight-charts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorChartConfig, SeriesConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorType } from "@/types/indicator";
import {
	getIndicatorConfig,
	getValueLegendShowName,
} from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKey, IndicatorKeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

export type IndicatorLegendData = {
	indicatorName: string;
	values: Record<string, { label: string; value: string; color?: string }>;
	time: Time;
	timeString: string;
};

// 默认颜色配置
const defaultColors = {
	blue: "#3b82f6",
	green: "#22c55e",
	red: "#ef4444",
	gray: "#6b7280",
};

// 解析指标名称从indicatorKeyStr，包含配置参数
const parseIndicatorName = (indicatorKeyStr: IndicatorKeyStr): string => {
	try {
		const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
		const config = getIndicatorConfig(indicatorKey.indicatorType);
		const displayName = config?.displayName || indicatorKey.indicatorType;

		// 直接使用已解析的配置参数
		const parsedConfig = indicatorKey.indicatorConfig;

		if (parsedConfig && config?.params) {
			// 构建参数字符串，直接使用 config.params
			const paramStrings: string[] = [];
			Object.entries(config.params).forEach(([key, paramDef]) => {
				const value = parsedConfig[key as keyof typeof parsedConfig];
				if (value !== undefined && paramDef.legendShowName) {
					paramStrings.push(`${paramDef.legendShowName}=${value}`);
				}
			});

			// 如果有参数，则格式化为 "指标名(参数1=值1, 参数2=值2)"
			if (paramStrings.length > 0) {
				return `${displayName}(${paramStrings.join(", ")}):`;
			}
		}

		return displayName;
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

// 从图表配置中获取指标值的颜色
const getIndicatorValueColorFromConfig = (
	indicatorKeyStr: IndicatorKeyStr,
	valueKey: string,
	chartConfig: BacktestChartConfig,
): string => {
	const indicatorConfig = chartConfig.indicatorChartConfigs?.find(
		(config: IndicatorChartConfig) =>
			config.indicatorKeyStr === indicatorKeyStr,
	);

	if (indicatorConfig) {
		const seriesConfig = indicatorConfig.seriesConfigs?.find(
			(config: SeriesConfig) => config.indicatorValueKey === valueKey,
		);
		if (seriesConfig?.color) {
			return seriesConfig.color;
		}
	}

	// 如果配置中没有颜色，使用默认颜色
	const colorList = [
		defaultColors.blue,
		defaultColors.green,
		defaultColors.red,
		defaultColors.gray,
	];
	const hash = valueKey.split("").reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);
	return colorList[Math.abs(hash) % colorList.length];
};

// 处理指标值的通用函数
const processIndicatorValues = (
	indicatorKeyStr: IndicatorKeyStr,
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	time: Time | null,
	chartConfig: BacktestChartConfig,
): Record<string, { label: string; value: string; color?: string }> => {
	const values: Record<
		string,
		{ label: string; value: string; color?: string }
	> = {};

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
		const dataPoint = time
			? seriesData.find((point) => point.time === time)
			: null;

		// 使用新的方法获取legend显示名称，如果没有则使用原始key
		const legendShowName = indicatorType
			? getValueLegendShowName(
					indicatorType as IndicatorType,
					key as keyof IndicatorValueConfig,
				)
			: undefined;

		values[key] = {
			label: legendShowName || key,
			value: dataPoint ? dataPoint.value.toFixed(2) : "--",
			color: getIndicatorValueColorFromConfig(
				indicatorKeyStr,
				key,
				chartConfig,
			),
		};
	});

	return values;
};

// 将指标数据转换为图例数据
const mapIndicatorDataToLegendData = (
	indicatorKeyStr: IndicatorKeyStr,
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	time: Time,
	chartConfig: BacktestChartConfig,
): IndicatorLegendData => {
	const indicatorName = parseIndicatorName(indicatorKeyStr);
	const values = processIndicatorValues(
		indicatorKeyStr,
		data,
		time,
		chartConfig,
	);

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
	chartConfig: BacktestChartConfig,
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

	return mapIndicatorDataToLegendData(
		indicatorKeyStr,
		data,
		latestTime,
		chartConfig,
	);
};

interface UseIndicatorLegendProps {
	chartId: number;
	indicatorKeyStr: IndicatorKeyStr;
}

export const useIndicatorLegend = ({
	chartId,
	indicatorKeyStr,
}: UseIndicatorLegendProps) => {
	// 从 store 获取数据和方法
	const { indicatorData, getIndicatorSeriesRef, getSubChartPaneRef } =
		useBacktestChartStore(chartId);

	const chartConfig = useBacktestChartConfigStore
		.getState()
		.getChartConfig(chartId) as BacktestChartConfig;

	// 🔑 使用 useMemo 稳定 data 引用，避免无限重新创建 onCrosshairMove
	const data = useMemo(() => {
		return (
			(indicatorData[indicatorKeyStr] as Record<
				keyof IndicatorValueConfig,
				SingleValueData[]
			>) || {}
		);
	}, [indicatorData, indicatorKeyStr]);

	const [legendData, setLegendData] = useState<IndicatorLegendData>(() => {
		// 总是返回legend数据，即使没有数据也显示空的legend
		return getLastDataLegendData(indicatorKeyStr, data, chartConfig);
	});

	// 监听数据变化，自动更新图例数据
	useEffect(() => {
		// 总是更新legend数据，即使data为空也要显示
		const newLegendData = getLastDataLegendData(
			indicatorKeyStr,
			data,
			chartConfig,
		);
		setLegendData((prev) => {
			// 只有在时间不同时才更新，避免不必要的渲染
			const shouldUpdate = prev?.time !== newLegendData?.time;
			return shouldUpdate ? newLegendData : prev;
		});
	}, [data, indicatorKeyStr, chartConfig]);

	const onCrosshairMove = useCallback(
		(param: MouseEventParams) => {
			const indicatorName = parseIndicatorName(indicatorKeyStr);
			const time = param?.time || null;

			// 使用通用函数处理指标值
			const values = processIndicatorValues(
				indicatorKeyStr,
				data,
				time,
				chartConfig,
			);

			const currentTime = time || (Math.floor(Date.now() / 1000) as Time);
			const newLegendData = {
				indicatorName,
				values,
				time: currentTime,
				timeString: timeToString(currentTime),
			};

			setLegendData((prev) => {
				const shouldUpdate = prev?.time !== newLegendData.time;
				return shouldUpdate ? newLegendData : prev;
			});
		},
		[indicatorKeyStr, data, chartConfig],
	);

	return {
		legendData,
		onCrosshairMove,
		getIndicatorSeriesRef,
		getSubChartPaneRef,
	};
};
