import type {
	DataChangedScope,
	MouseEventParams,
	SingleValueData,
	Time,
} from "lightweight-charts";
import { useCallback, useEffect, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorChartConfig, SeriesConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { getIndicatorConfig } from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKey, IndicatorKeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

export type IndicatorLegendData = {
	indicatorName: string;
	values: Record<string, { label: string; value: string; color?: string }>;
	time: Time;
	timeString: string;
};

// Default color configuration
const defaultColors = {
	blue: "#3b82f6",
	green: "#22c55e",
	red: "#ef4444",
	gray: "#6b7280",
};

// Parse indicator name from indicatorKeyStr, including configuration parameters
const parseIndicatorName = (indicatorKeyStr: IndicatorKeyStr): string => {
	try {
		const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
		const config = getIndicatorConfig(indicatorKey.indicatorType);
		const displayName = config?.displayName || indicatorKey.indicatorType;

		// Directly use the parsed configuration parameters
		const parsedConfig = indicatorKey.indicatorConfig;

		if (parsedConfig && config?.params) {
			// Build parameter string, directly use config.params
			const paramStrings: string[] = [];
			Object.entries(config.params).forEach(([key, paramDef]) => {
				const value = parsedConfig[key as keyof typeof parsedConfig];
				if (value !== undefined && paramDef.legendShowName) {
					paramStrings.push(`${paramDef.legendShowName}=${value}`);
				}
			});

			// If there are parameters, format as "IndicatorName(param1=value1, param2=value2)"
			if (paramStrings.length > 0) {
				return `${displayName}(${paramStrings.join(", ")}):`;
			}
		}

		return displayName;
	} catch (error) {
		console.error("Failed to parse indicator name:", error);
		return "Unknown";
	}
};

// Convert time to string
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

// Get indicator value color from chart configuration
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

	// If no color in configuration, use default color
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

// Generic function for processing indicator values
const processIndicatorValues = (
	indicatorKeyStr: IndicatorKeyStr,
	indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	time: Time | null,
	chartConfig: BacktestChartConfig,
): Record<string, { label: string; value: string; color?: string }> => {
	const legendValue: Record<
		string,
		{ label: string; value: string; color?: string }
	> = {};

	// // Parse indicatorType to get legend name
	// let indicatorType: string | undefined;
	// try {
	// 	const indicatorKey = parseKey(indicatorKeyStr) as IndicatorKey;
	// 	indicatorType = indicatorKey.indicatorType;
	// } catch (error) {
	// 	console.error("Failed to parse indicatorType:", error);
	// }

	Object.entries(indicatorData).forEach(
		([indicatorValueField, indicatorData]) => {
			// Find data with the same time
			const dataPoint = indicatorData.find((point) => point.time === time);
			legendValue[indicatorValueField] = {
				label: indicatorValueField,
				value: dataPoint
					? (dataPoint as SingleValueData).value?.toFixed(2)
					: "--",
				color: getIndicatorValueColorFromConfig(
					indicatorKeyStr,
					indicatorValueField,
					chartConfig,
				),
			};
		},
	);

	return legendValue;
};

// Get legend data for the latest data point
const getLastDataLegendData = (
	indicatorKeyStr: IndicatorKeyStr,
	indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	chartConfig: BacktestChartConfig,
): IndicatorLegendData => {
	let latestTime: Time | null = null;

	for (const [_, data] of Object.entries(indicatorData)) {
		const lastPoint = data[data.length - 1];
		if (lastPoint) {
			latestTime = lastPoint.time as Time;
			break;
		}
	}

	// If no time is found, use current time as default value
	const time = latestTime || (Math.floor(Date.now() / 1000) as Time);

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

interface UseIndicatorLegendProps {
	chartId: number;
	indicatorKeyStr: IndicatorKeyStr;
}

export const useIndicatorLegend = ({
	chartId,
	indicatorKeyStr,
}: UseIndicatorLegendProps) => {
	// Get data and methods from store
	const { getIndicatorAllSeriesRef, indicatorSeriesRef } =
		useBacktestChartStore(chartId);

	const chartConfig = useBacktestChartConfigStore
		.getState()
		.getChartConfig(chartId) as BacktestChartConfig;
	const indicatorSeriesMap = indicatorSeriesRef[indicatorKeyStr] || {};

	const buildLegendDataFromSeries = useCallback(() => {
		const indicatorAllSeriesRef = getIndicatorAllSeriesRef(indicatorKeyStr);
		const indicatorData: Record<keyof IndicatorValueConfig, SingleValueData[]> =
			{};
		Object.entries(indicatorAllSeriesRef).forEach(([key, seriesRef]) => {
			if (seriesRef) {
				indicatorData[key as keyof IndicatorValueConfig] =
					seriesRef.data() as SingleValueData[];
			}
		});

		if (Object.keys(indicatorData).length === 0) {
			return null;
		}

		return getLastDataLegendData(indicatorKeyStr, indicatorData, chartConfig);
	}, [chartConfig, getIndicatorAllSeriesRef, indicatorKeyStr]);

	// Initialize legendData
	const [legendData, setLegendData] = useState<IndicatorLegendData | null>(
		buildLegendDataFromSeries,
	);
	// console.log("indicator legend initialization", legendData);

	// Sync current series data to legend, ensuring display even when data is ready on first load
	useEffect(() => {
		const latestLegendData = buildLegendDataFromSeries();
		setLegendData(latestLegendData);
	}, [buildLegendDataFromSeries, indicatorSeriesMap]);

	// Listen to indicator data change events
	const onSeriesDataUpdate = useCallback(
		(_scope: DataChangedScope) => {
			const indicatorAllSeriesRef = getIndicatorAllSeriesRef(indicatorKeyStr);
			const indicatorData: Record<
				keyof IndicatorValueConfig,
				SingleValueData[]
			> = {};
			Object.entries(indicatorAllSeriesRef).forEach(([key, seriesRef]) => {
				if (seriesRef) {
					indicatorData[key as keyof IndicatorValueConfig] =
						seriesRef.data() as SingleValueData[];
				}
			});
			const newLegendData = getLastDataLegendData(
				indicatorKeyStr,
				indicatorData,
				chartConfig,
			);
			setLegendData(newLegendData);
		},
		[chartConfig, getIndicatorAllSeriesRef, indicatorKeyStr],
	);

	const onCrosshairMove = useCallback(
		(param: MouseEventParams) => {
			const indicatorAllSeriesRef = getIndicatorAllSeriesRef(indicatorKeyStr);
			const indicatorData: Record<
				keyof IndicatorValueConfig,
				SingleValueData[]
			> = {};
			Object.entries(indicatorAllSeriesRef).forEach(([key, seriesRef]) => {
				if (seriesRef) {
					indicatorData[key as keyof IndicatorValueConfig] =
						seriesRef.data() as SingleValueData[];
				}
			});

			const indicatorName = parseIndicatorName(indicatorKeyStr);
			const time = param?.time || null;

			// Use generic function to process indicator values
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

			setLegendData(newLegendData);
		},
		[chartConfig, getIndicatorAllSeriesRef, indicatorKeyStr],
	);

	return {
		legendData,
		onCrosshairMove,
		onSeriesDataUpdate,
	};
};
