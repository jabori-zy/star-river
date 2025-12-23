import type {
	DataChangedScope,
	MouseEventParams,
	SingleValueData,
	Time,
} from "lightweight-charts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorChartConfig, IndicatorSeriesConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { getIndicatorConfig } from "@/types/indicator/indicator-config";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKey, IndicatorKeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

// Stable empty object reference to avoid infinite loop caused by || {}
const EMPTY_SERIES_MAP: Record<string, unknown> = {};

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
			(config: IndicatorSeriesConfig) => config.indicatorValueKey === valueKey,
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
): IndicatorLegendData | null => {
	let latestTime: Time | null = null;

	for (const [_, data] of Object.entries(indicatorData)) {
		const lastPoint = data[data.length - 1];
		if (lastPoint) {
			latestTime = lastPoint.time as Time;
			break;
		}
	}

	// If no time is found, do not fallback to Date.now() to avoid render loops.
	if (!latestTime) {
		return null;
	}
	const time = latestTime;

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

// Build empty legend data from chart config (when no series data available)
const buildEmptyLegendDataFromConfig = (
	indicatorKeyStr: IndicatorKeyStr,
	chartConfig: BacktestChartConfig,
): IndicatorLegendData | null => {
	const indicatorConfig = chartConfig.indicatorChartConfigs?.find(
		(config: IndicatorChartConfig) =>
			config.indicatorKeyStr === indicatorKeyStr && !config.isDelete,
	);

	if (!indicatorConfig) {
		return null;
	}

	const indicatorName = parseIndicatorName(indicatorKeyStr);
	const values: Record<string, { label: string; value: string; color?: string }> = {};

	// Build empty values from series configs
	indicatorConfig.seriesConfigs?.forEach((seriesConfig: IndicatorSeriesConfig) => {
		values[seriesConfig.indicatorValueKey] = {
			label: seriesConfig.indicatorValueKey,
			value: "--",
			color: seriesConfig.color || getIndicatorValueColorFromConfig(
				indicatorKeyStr,
				seriesConfig.indicatorValueKey,
				chartConfig,
			),
		};
	});

	return {
		indicatorName,
		values,
		time: 0 as Time,
		timeString: "",
	};
};

const isIndicatorLegendDataEqual = (
	a: IndicatorLegendData | null,
	b: IndicatorLegendData | null,
): boolean => {
	if (a === b) return true;
	if (!a || !b) return false;
	if (a.time !== b.time) return false;

	const aKeys = Object.keys(a.values);
	const bKeys = Object.keys(b.values);
	if (aKeys.length !== bKeys.length) return false;

	for (const key of aKeys) {
		const av = a.values[key];
		const bv = b.values[key];
		if (!bv) return false;
		if (av.label !== bv.label) return false;
		if (av.value !== bv.value) return false;
		if (av.color !== bv.color) return false;
	}

	return true;
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

	// Use stable reference to avoid infinite loop
	const indicatorSeriesMap = useMemo(
		() => indicatorSeriesRef[indicatorKeyStr] ?? EMPTY_SERIES_MAP,
		[indicatorSeriesRef, indicatorKeyStr],
	);

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
			// Fallback to empty legend from config when no series data
			return buildEmptyLegendDataFromConfig(indicatorKeyStr, chartConfig);
		}

		// Try to get legend data from series, fallback to empty legend if no data
		return (
			getLastDataLegendData(indicatorKeyStr, indicatorData, chartConfig) ||
			buildEmptyLegendDataFromConfig(indicatorKeyStr, chartConfig)
		);
	}, [chartConfig, getIndicatorAllSeriesRef, indicatorKeyStr]);

	// Initialize legendData
	const [legendData, setLegendData] = useState<IndicatorLegendData | null>(
		buildLegendDataFromSeries,
	);
	// console.log("indicator legend initialization", legendData);

	// Sync current series data to legend, ensuring display even when data is ready on first load
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> aaa
	useEffect(() => {
		const latestLegendData = buildLegendDataFromSeries();
		setLegendData((prev) =>
			isIndicatorLegendDataEqual(prev, latestLegendData)
				? prev
				: latestLegendData,
		);
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
			const newLegendData =
				getLastDataLegendData(indicatorKeyStr, indicatorData, chartConfig) ||
				buildEmptyLegendDataFromConfig(indicatorKeyStr, chartConfig);
			setLegendData((prev) =>
				isIndicatorLegendDataEqual(prev, newLegendData) ? prev : newLegendData,
			);
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

			// If crosshair time is not available, fallback to the latest bar or empty legend
			if (!param?.time) {
				const latestLegendData =
					getLastDataLegendData(indicatorKeyStr, indicatorData, chartConfig) ||
					buildEmptyLegendDataFromConfig(indicatorKeyStr, chartConfig);
				setLegendData((prev) =>
					isIndicatorLegendDataEqual(prev, latestLegendData)
						? prev
						: latestLegendData,
				);
				return;
			}

			const indicatorName = parseIndicatorName(indicatorKeyStr);
			const time = param.time;

			// Use generic function to process indicator values
			const values = processIndicatorValues(
				indicatorKeyStr,
				indicatorData,
				time,
				chartConfig,
			);

			const newLegendData: IndicatorLegendData = {
				indicatorName,
				values,
				time,
				timeString: timeToString(time),
			};

			setLegendData((prev) =>
				isIndicatorLegendDataEqual(prev, newLegendData) ? prev : newLegendData,
			);
		},
		[chartConfig, getIndicatorAllSeriesRef, indicatorKeyStr],
	);

	return {
		legendData,
		onCrosshairMove,
		onSeriesDataUpdate,
	};
};
