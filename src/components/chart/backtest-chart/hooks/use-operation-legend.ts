import type {
	DataChangedScope,
	MouseEventParams,
	SingleValueData,
	Time,
} from "lightweight-charts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { OperationChartConfig, OperationSeriesConfig, SeriesType } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { OperationKey, OperationKeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

// Stable empty object reference to avoid infinite loop caused by || {}
const EMPTY_SERIES_MAP: Record<string, unknown> = {};


export type OperationLegendData = {
	operationName: string;
	values: Record<string, { label: string; value: string; color?: string }>;
	time: Time;
	timeString: string;
};

// Default color palette for random selection
const DEFAULT_COLOR_PALETTE = [
	"#2196F3", // Blue
	"#FF6B6B", // Red
	"#4ECDC4", // Cyan
	"#45B7D1", // Sky blue
	"#96CEB4", // Green
	"#FFEAA7", // Yellow
	"#DDA0DD", // Purple
	"#98D8C8", // Mint green
	"#F7DC6F", // Gold
	"#BB8FCE", // Light purple
];

// Generate a random color from palette
const getRandomColor = (usedColors: string[]): string => {
	// Filter out already used colors
	const availableColors = DEFAULT_COLOR_PALETTE.filter(
		(color) => !usedColors.includes(color),
	);
	// If all colors are used, use full palette
	const colorPool =
		availableColors.length > 0 ? availableColors : DEFAULT_COLOR_PALETTE;
	return colorPool[Math.floor(Math.random() * colorPool.length)];
};

// Parse operation name from operationKeyStr
const parseOperationName = (operationKeyStr: OperationKeyStr): string => {
	try {
		const operationKey = parseKey(operationKeyStr) as OperationKey;
		return operationKey.name || "Operation";
	} catch (error) {
		console.error("Failed to parse operation name:", error);
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

// Get operation value color from chart configuration
const getOperationValueColorFromConfig = (
	operationKeyStr: OperationKeyStr,
	valueKey: string,
	chartConfig: BacktestChartConfig,
): string | undefined => {
	const operationConfig = chartConfig.operationChartConfigs?.find(
		(config: OperationChartConfig) =>
			config.operationKeyStr === operationKeyStr,
	);

	if (operationConfig) {
		const seriesConfig = operationConfig.seriesConfigs?.find(
			(config: OperationSeriesConfig) => config.outputSeriesKey === valueKey,
		);
		if (seriesConfig?.color) {
			return seriesConfig.color;
		}
	}

	return undefined;
};

// Generic function for processing operation values
const processOperationValues = (
	operationKeyStr: OperationKeyStr,
	operationData: Record<string, SingleValueData[]>,
	time: Time | null,
	chartConfig: BacktestChartConfig,
	colorMap: Record<string, string>,
): Record<string, { label: string; value: string; color?: string }> => {
	const legendValue: Record<
		string,
		{ label: string; value: string; color?: string }
	> = {};

	Object.entries(operationData).forEach(([outputKey, data]) => {
		// Find data with the same time
		const dataPoint = data.find((point) => point.time === time);
		const configColor = getOperationValueColorFromConfig(
			operationKeyStr,
			outputKey,
			chartConfig,
		);
		legendValue[outputKey] = {
			label: outputKey,
			value: dataPoint
				? (dataPoint as SingleValueData).value?.toFixed(2)
				: "--",
			color: configColor || colorMap[outputKey],
		};
	});

	return legendValue;
};

// Get legend data for the latest data point
const getLastDataLegendData = (
	operationKeyStr: OperationKeyStr,
	operationData: Record<string, SingleValueData[]>,
	chartConfig: BacktestChartConfig,
	colorMap: Record<string, string>,
): OperationLegendData | null => {
	let latestTime: Time | null = null;

	for (const [_, data] of Object.entries(operationData)) {
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

	const operationName = parseOperationName(operationKeyStr);
	const values = processOperationValues(
		operationKeyStr,
		operationData,
		time,
		chartConfig,
		colorMap,
	);

	return {
		operationName,
		values,
		time,
		timeString: timeToString(time),
	};
};

// Build empty legend data from chart config (when no series data available)
const buildEmptyLegendDataFromConfig = (
	operationKeyStr: OperationKeyStr,
	chartConfig: BacktestChartConfig,
	colorMap: Record<string, string>,
): OperationLegendData | null => {
	const operationConfig = chartConfig.operationChartConfigs?.find(
		(config: OperationChartConfig) =>
			config.operationKeyStr === operationKeyStr && !config.isDelete,
	);

	if (!operationConfig) {
		return null;
	}

	const operationName = parseOperationName(operationKeyStr);
	const values: Record<string, { label: string; value: string; color?: string }> = {};

	// Build empty values from series configs
	operationConfig.seriesConfigs?.forEach((seriesConfig: OperationSeriesConfig) => {
		const configColor = getOperationValueColorFromConfig(
			operationKeyStr,
			seriesConfig.outputSeriesKey,
			chartConfig,
		);
		values[seriesConfig.outputSeriesKey] = {
			label: seriesConfig.outputSeriesKey,
			value: "--",
			color: configColor || colorMap[seriesConfig.outputSeriesKey],
		};
	});

	return {
		operationName,
		values,
		time: 0 as Time,
		timeString: "",
	};
};

const isOperationLegendDataEqual = (
	a: OperationLegendData | null,
	b: OperationLegendData | null,
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

interface UseOperationLegendProps {
	chartId: number;
	operationKeyStr: OperationKeyStr;
}

export const useOperationLegend = ({
	chartId,
	operationKeyStr,
}: UseOperationLegendProps) => {
	// Get data and methods from store
	const { getOperationAllSeriesRef, operationSeriesRef } =
		useBacktestChartStore(chartId);

	const { getChartConfig, setChartConfig } = useBacktestChartConfigStore();
	const globalChartConfig = useBacktestChartConfigStore(
		(state) => state.chartConfig,
	);

	const chartConfig = getChartConfig(chartId) as BacktestChartConfig;

	// Use stable reference to avoid infinite loop
	const operationSeriesMap = useMemo(
		() => operationSeriesRef[operationKeyStr] ?? EMPTY_SERIES_MAP,
		[operationSeriesRef, operationKeyStr],
	);

	// Track if colors have been persisted to avoid duplicate writes
	const colorsPersistedRef = useRef(false);

	// Local color map for series without configured colors
	const [colorMap, setColorMap] = useState<Record<string, string>>({});

	// Ensure all series have colors and persist to config if needed
	useEffect(() => {
		if (!chartConfig || colorsPersistedRef.current) return;

		const operationConfig = chartConfig.operationChartConfigs?.find(
			(config) => config.operationKeyStr === operationKeyStr,
		);

		if (!operationConfig) return;

		const seriesKeys = Object.keys(operationSeriesMap);
		if (seriesKeys.length === 0) return;

		// Collect existing colors
		const existingColors: string[] = [];
		operationConfig.seriesConfigs?.forEach((config) => {
			if (config.color) {
				existingColors.push(config.color);
			}
		});

		// Find series without colors and generate new ones
		const newColorMap: Record<string, string> = {};
		const updatedSeriesConfigs: OperationSeriesConfig[] = [];
		let hasNewColors = false;

		for (const key of seriesKeys) {
			const existingConfig = operationConfig.seriesConfigs?.find(
				(config) => config.outputSeriesKey === key,
			);

			if (existingConfig?.color) {
				// Already has color
				updatedSeriesConfigs.push(existingConfig);
				newColorMap[key] = existingConfig.color;
			} else {
				// Generate new random color
				const newColor = getRandomColor([
					...existingColors,
					...Object.values(newColorMap),
				]);
				newColorMap[key] = newColor;
				hasNewColors = true;

				if (existingConfig) {
					// Update existing config with new color
					updatedSeriesConfigs.push({
						...existingConfig,
						color: newColor,
					});
				} else {
					// Create new config
					updatedSeriesConfigs.push({
						outputSeriesKey: key,
						name: key,
						type: "line" as SeriesType,
						color: newColor,
					});
				}
			}
		}

		setColorMap(newColorMap);

		// Persist new colors to config
		if (hasNewColors) {
			colorsPersistedRef.current = true;

			const newChartConfig = {
				...globalChartConfig,
				charts: globalChartConfig.charts.map((chart) =>
					chart.id === chartId
						? {
								...chart,
								operationChartConfigs: (chart.operationChartConfigs || []).map(
									(config) =>
										config.operationKeyStr === operationKeyStr
											? { ...config, seriesConfigs: updatedSeriesConfigs }
											: config,
								),
							}
						: chart,
				),
			};
			setChartConfig(newChartConfig);
		}
	}, [
		chartConfig,
		chartId,
		globalChartConfig,
		operationKeyStr,
		operationSeriesMap,
		setChartConfig,
	]);

	const buildLegendDataFromSeries = useCallback(() => {
		const operationAllSeriesRef = getOperationAllSeriesRef(operationKeyStr);
		const operationData: Record<string, SingleValueData[]> = {};
		Object.entries(operationAllSeriesRef).forEach(([key, seriesRef]) => {
			if (seriesRef) {
				operationData[key] = seriesRef.data() as SingleValueData[];
			}
		});

		if (Object.keys(operationData).length === 0) {
			// Fallback to empty legend from config when no series data
			return buildEmptyLegendDataFromConfig(operationKeyStr, chartConfig, colorMap);
		}

		// Try to get legend data from series, fallback to empty legend if no data
		return (
			getLastDataLegendData(operationKeyStr, operationData, chartConfig, colorMap) ||
			buildEmptyLegendDataFromConfig(operationKeyStr, chartConfig, colorMap)
		);
	}, [chartConfig, colorMap, getOperationAllSeriesRef, operationKeyStr]);

	// Initialize legendData
	const [legendData, setLegendData] = useState<OperationLegendData | null>(
		buildLegendDataFromSeries,
	);

	// Sync current series data to legend, ensuring display even when data is ready on first load
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> we don't need to re-run this effect when operationSeriesMap changes
	useEffect(() => {
		const latestLegendData = buildLegendDataFromSeries();
		setLegendData((prev) =>
			isOperationLegendDataEqual(prev, latestLegendData)
				? prev
				: latestLegendData,
		);
	}, [buildLegendDataFromSeries, operationSeriesMap]);

	// Listen to operation data change events
	const onSeriesDataUpdate = useCallback(
		(_scope: DataChangedScope) => {
			const operationAllSeriesRef = getOperationAllSeriesRef(operationKeyStr);
			const operationData: Record<string, SingleValueData[]> = {};
			Object.entries(operationAllSeriesRef).forEach(([key, seriesRef]) => {
				if (seriesRef) {
					operationData[key] = seriesRef.data() as SingleValueData[];
				}
			});
			const newLegendData =
				getLastDataLegendData(operationKeyStr, operationData, chartConfig, colorMap) ||
				buildEmptyLegendDataFromConfig(operationKeyStr, chartConfig, colorMap);
			setLegendData((prev) =>
				isOperationLegendDataEqual(prev, newLegendData) ? prev : newLegendData,
			);
		},
		[chartConfig, colorMap, getOperationAllSeriesRef, operationKeyStr],
	);

	const onCrosshairMove = useCallback(
		(param: MouseEventParams) => {
			const operationAllSeriesRef = getOperationAllSeriesRef(operationKeyStr);
			const operationData: Record<string, SingleValueData[]> = {};
			Object.entries(operationAllSeriesRef).forEach(([key, seriesRef]) => {
				if (seriesRef) {
					operationData[key] = seriesRef.data() as SingleValueData[];
				}
			});

			// If crosshair time is not available, fallback to the latest bar or empty legend
			if (!param?.time) {
				const latestLegendData =
					getLastDataLegendData(operationKeyStr, operationData, chartConfig, colorMap) ||
					buildEmptyLegendDataFromConfig(operationKeyStr, chartConfig, colorMap);
				setLegendData((prev) =>
					isOperationLegendDataEqual(prev, latestLegendData)
						? prev
						: latestLegendData,
				);
				return;
			}

			const operationName = parseOperationName(operationKeyStr);
			const time = param.time;

			// Use generic function to process operation values
			const values = processOperationValues(
				operationKeyStr,
				operationData,
				time,
				chartConfig,
				colorMap,
			);

			const newLegendData: OperationLegendData = {
				operationName,
				values,
				time,
				timeString: timeToString(time),
			};

			setLegendData((prev) =>
				isOperationLegendDataEqual(prev, newLegendData) ? prev : newLegendData,
			);
		},
		[chartConfig, colorMap, getOperationAllSeriesRef, operationKeyStr],
	);

	return {
		legendData,
		onCrosshairMove,
		onSeriesDataUpdate,
	};
};
