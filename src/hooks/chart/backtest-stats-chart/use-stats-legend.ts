import type {
	MouseEventParams,
	SingleValueData,
	Time,
} from "lightweight-charts";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";
import type { StrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import { getStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import type { StrategyStatsName } from "@/types/statistics";

export type StatsLegendData = {
	statsName: string;
	displayName: string;
	value: string;
	color?: string;
	time: Time;
	timeString: string;
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

// Get latest value from stats data
const getLastStatsValue = (
	statsData: SingleValueData[],
): { value: number; time: Time } | null => {
	if (!statsData || statsData.length === 0) {
		return null;
	}

	const lastData = statsData[statsData.length - 1];
	return {
		value: lastData.value,
		time: lastData.time,
	};
};

// Convert statistics data to legend data
const mapStatsDataToLegendData = (
	config: StrategyStatsChartConfig,
	statsData: Record<string, SingleValueData[]>,
	time: Time | null,
	t: ReturnType<typeof useTranslation>["t"],
): StatsLegendData | null => {
	const statsName = config.seriesConfigs.statsName;
	const data = statsData[statsName];

	// Get real-time color and translated name from config store
	const currentConfig = getStatsChartConfig(
		statsName as StrategyStatsName,
		t,
	);
	const currentColor = currentConfig?.seriesConfigs.color || config.seriesConfigs.color;
	const displayName = currentConfig?.seriesConfigs.name || config.seriesConfigs.name;

	if (!data || data.length === 0) {
		return {
			statsName,
			displayName,
			value: "--",
			color: currentColor,
			time: time || (Math.floor(Date.now() / 1000) as Time),
			timeString: timeToString(time || (Math.floor(Date.now() / 1000) as Time)),
		};
	}

	// Find data point at specified time
	const dataPoint = time ? data.find((point) => point.time === time) : null;

	// If no data point found at specified time, use the latest data point
	const targetData = dataPoint || data[data.length - 1];

	// Format value according to valueType
	let formattedValue: string;
	if (config.valueType === "percentage") {
		formattedValue = `${(targetData.value * 100).toFixed(5)}%`;
	} else {
		if (targetData.value !== undefined) {
			formattedValue = targetData.value.toFixed(2);
		} else {
			formattedValue = "--";
		}
	}

	return {
		statsName,
		displayName,
		value: formattedValue,
		color: currentColor,
		time: targetData.time,
		timeString: timeToString(targetData.time),
	};
};

interface UseStatsLegendProps {
	strategyId: number;
	statsChartConfig: StrategyStatsChartConfig;
}

export const useStatsLegend = ({
	strategyId,
	statsChartConfig,
}: UseStatsLegendProps) => {
	const { t } = useTranslation();
	const { statsData } = useBacktestStatsChartStore(strategyId, {
		statsChartConfigs: [statsChartConfig],
	});

	// Get config store for real-time color updates
	const configStore = useBacktestStatsChartConfigStore();

	const [legendData, setLegendData] = useState<StatsLegendData | null>(() => {
		// Use latest data on initialization
		return mapStatsDataToLegendData(statsChartConfig, statsData, null, t);
	});

	// Listen to data changes and config changes, automatically update legend data
	useEffect(() => {
		const newLegendData = mapStatsDataToLegendData(
			statsChartConfig,
			statsData,
			null,
			t,
		);
		setLegendData((prev) => {
			// Only update when time, value, color, or display name differs, to avoid unnecessary rendering
			const shouldUpdate =
				prev?.time !== newLegendData?.time ||
				prev?.value !== newLegendData?.value ||
				prev?.color !== newLegendData?.color ||
				prev?.displayName !== newLegendData?.displayName;
			return shouldUpdate ? newLegendData : prev;
		});
	}, [statsData, statsChartConfig, t]);

	const onCrosshairMove = useCallback(
		(param: MouseEventParams) => {
			const time = param?.time || null;

			const newLegendData = mapStatsDataToLegendData(
				statsChartConfig,
				statsData,
				time,
				t,
			);

			setLegendData((prev) => {
				const shouldUpdate = prev?.time !== newLegendData?.time;
				return shouldUpdate ? newLegendData : prev;
			});
		},
		[statsChartConfig, statsData, t],
	);

	return {
		statsLegendData: legendData,
		onCrosshairMove,
	};
};
