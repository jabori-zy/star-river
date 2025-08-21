import type {
	MouseEventParams,
	SingleValueData,
	Time,
} from "lightweight-charts";
import { useCallback, useEffect, useState } from "react";
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

// 从stats数据获取最新值
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

// 将统计数据转换为图例数据
const mapStatsDataToLegendData = (
	config: StrategyStatsChartConfig,
	statsData: Record<string, SingleValueData[]>,
	time: Time | null,
): StatsLegendData | null => {
	const statsName = config.seriesConfigs.statsName;
	const data = statsData[statsName];

	// 从配置store获取实时颜色，如果没有则使用原始配置
	const currentColor =
		getStatsChartConfig(statsName as StrategyStatsName)?.seriesConfigs.color ||
		config.seriesConfigs.color;

	if (!data || data.length === 0) {
		return {
			statsName,
			displayName: config.seriesConfigs.name,
			value: "--",
			color: currentColor,
			time: time || (Math.floor(Date.now() / 1000) as Time),
			timeString: timeToString(time || (Math.floor(Date.now() / 1000) as Time)),
		};
	}

	// 查找指定时间的数据点
	const dataPoint = time ? data.find((point) => point.time === time) : null;

	// 如果没有找到指定时间的数据点，使用最新的数据点
	const targetData = dataPoint || data[data.length - 1];

	// 根据valueType格式化数值
	let formattedValue: string;
	if (config.valueType === "percentage") {
		formattedValue = `${(targetData.value * 100).toFixed(5)}%`;
	} else {
		formattedValue = targetData.value.toFixed(2);
	}

	return {
		statsName,
		displayName: config.seriesConfigs.name,
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
	const { statsData } = useBacktestStatsChartStore(strategyId, {
		statsChartConfigs: [statsChartConfig],
	});

	// 获取配置store以获取实时颜色更新
	const configStore = useBacktestStatsChartConfigStore();

	const [legendData, setLegendData] = useState<StatsLegendData | null>(() => {
		// 初始化时使用最新数据
		return mapStatsDataToLegendData(
			statsChartConfig,
			statsData,
			null,
		);
	});

	// 监听数据变化和配置变化，自动更新图例数据
	useEffect(() => {
		const newLegendData = mapStatsDataToLegendData(
			statsChartConfig,
			statsData,
			null,
		);
		setLegendData((prev) => {
			// 只有在时间、值或颜色不同时才更新，避免不必要的渲染
			const shouldUpdate =
				prev?.time !== newLegendData?.time ||
				prev?.value !== newLegendData?.value ||
				prev?.color !== newLegendData?.color;
			return shouldUpdate ? newLegendData : prev;
		});
	}, [statsData, statsChartConfig]);

	const onCrosshairMove = useCallback(
		(param: MouseEventParams) => {
			const time = param?.time || null;

			const newLegendData = mapStatsDataToLegendData(
				statsChartConfig,
				statsData,
				time,
			);

			setLegendData((prev) => {
				const shouldUpdate = prev?.time !== newLegendData?.time;
				return shouldUpdate ? newLegendData : prev;
			});
		},
		[statsChartConfig, statsData],
	);

	return {
		statsLegendData: legendData,
		onCrosshairMove,
	};
};
