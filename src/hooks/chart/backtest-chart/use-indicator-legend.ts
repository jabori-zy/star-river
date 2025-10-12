import type {
	MouseEventParams,
	SingleValueData,
	Time,
	ISeriesApi,
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
	indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	time: Time | null,
	chartConfig: BacktestChartConfig,
): Record<string, { label: string; value: string; color?: string }> => {
	
	const legendValue: Record<string,{ label: string; value: string; color?: string }> = {};

	// 解析indicatorType用于获取legend名称
	let indicatorType: string | undefined;
	try {
		const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
		indicatorType = indicatorKey.indicatorType;
	} catch (error) {
		console.error("解析indicatorType失败:", error);
	}

	Object.entries(indicatorData).forEach(([indicatorValueField, indicatorData]) => {
		
		// 找到与time相同的数据
		let dataPoint = indicatorData.find((point) => point.time === time);
		legendValue[indicatorValueField] = {
			label: indicatorValueField,
			value: dataPoint ? (dataPoint as SingleValueData).value?.toFixed(2) : "--",
			color: getIndicatorValueColorFromConfig(
				indicatorKeyStr,
				indicatorValueField,
				chartConfig,
			),
		};
		
	});

	return legendValue;
};

// 将指标数据转换为图例数据
const mapIndicatorDataToLegendData = (
	indicatorKeyStr: IndicatorKeyStr,
	indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	time: Time,
	chartConfig: BacktestChartConfig,
): IndicatorLegendData => {
	const indicatorName = parseIndicatorName(indicatorKeyStr);
	const values = processIndicatorValues(
		indicatorKeyStr,
		indicatorData,
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
	indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	chartConfig: BacktestChartConfig,
): IndicatorLegendData => {
	let latestTime: Time | null = null;
	let latestTimestamp = 0;


	Object.entries(indicatorData).forEach(([_, indicatorData]) => {
			const lastPoint = indicatorData[indicatorData.length - 1];
			if (lastPoint) {	
				const timestamp = typeof lastPoint.time === "number" ? lastPoint.time : 0;
				if (timestamp > latestTimestamp) {
					latestTimestamp = timestamp;
					latestTime = lastPoint.time as Time;
				}
			}
	});

	// 如果没有找到时间点，使用当前时间作为默认值
	if (!latestTime) {
		latestTime = Math.floor(Date.now() / 1000) as Time; // 转换为秒级时间戳并断言为Time类型
	}

	return mapIndicatorDataToLegendData(
		indicatorKeyStr,
		indicatorData,
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
	const { getIndicatorAllSeriesRef } = useBacktestChartStore(chartId);


	const indicatorAllSeriesRef = getIndicatorAllSeriesRef(indicatorKeyStr);

	// 构建原始数据
	const rawIndicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]> = {};
	Object.entries(indicatorAllSeriesRef).forEach(([key, seriesRef]) => {
		if (seriesRef) {
			rawIndicatorData[key as keyof IndicatorValueConfig] = seriesRef.data() as SingleValueData[];
		}
	});

	// 计算用于依赖比较的稳定值（使用原始值而不是对象）
	// 将所有字段的长度拼接成字符串，例如 "value:10,timestamp:10"
	const dataLengthStr = Object.entries(rawIndicatorData)
		.map(([key, data]) => `${key}:${data.length}`)
		.join(',');

	// 将所有字段的最后时间拼接成字符串
	const lastTimeStr = Object.entries(rawIndicatorData)
		.map(([key, data]) => `${key}:${data.length > 0 ? data[data.length - 1]?.time : 'null'}`)
		.join(',');

	// 使用稳定的字符串作为依赖，只有在数据长度或最后时间真正变化时才更新
	const indicatorData = useMemo(() => rawIndicatorData, [dataLengthStr, lastTimeStr]);

	const chartConfig = useBacktestChartConfigStore
		.getState()
		.getChartConfig(chartId) as BacktestChartConfig;


	const [legendData, setLegendData] = useState<IndicatorLegendData | null>(() => {
		return getLastDataLegendData(indicatorKeyStr, indicatorData, chartConfig);
	});
		// () => {
		// 总是返回legend数据，即使没有数据也显示空的legend
		// return getLastDataLegendData(indicatorKeyStr, data, chartConfig);
	// });

	// 监听数据变化，自动更新图例数据
	useEffect(() => {
		// 总是更新legend数据，即使data为空也要显示
		const newLegendData = getLastDataLegendData(
			indicatorKeyStr,
			indicatorData,
			chartConfig,
		);
		setLegendData((prev) => {
			// 只有在时间不同时才更新，避免不必要的渲染
			const shouldUpdate = prev?.time !== newLegendData?.time;
			return shouldUpdate ? newLegendData : prev;
		});
	}, [indicatorKeyStr, chartConfig, indicatorData]);

	const onCrosshairMove = useCallback((param: MouseEventParams) => {
		// console.log("onCrosshairMove", param);
		const indicatorName = parseIndicatorName(indicatorKeyStr);
		const time = param?.time || null;

		// 使用通用函数处理指标值
		const values = processIndicatorValues(
			indicatorKeyStr,
			indicatorData,
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
	[indicatorKeyStr, indicatorData, chartConfig],
);

	return {
		legendData,
		onCrosshairMove
	};
};
