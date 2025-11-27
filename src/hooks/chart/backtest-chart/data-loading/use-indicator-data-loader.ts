import type { SingleValueData, UTCTimestamp } from "lightweight-charts";
import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { getChartAlignedUtcTimestamp } from "@/components/chart/backtest-chart/utls";
import { getStrategyDataApi } from "@/service/backtest-strategy/get-strategy-data";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";

interface SeriesConfig {
	indicatorValueKey: string;
}

interface UseIndicatorDataLoaderProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

interface UseIndicatorDataLoaderReturn {
	loadIndicatorHistory: (
		indicatorKeyStr: string,
		firstIndicatorDateTime: string,
		seriesConfigs: SeriesConfig[],
	) => Promise<void>;
}

/**
 * 指标历史数据加载
 *
 * 职责：
 * - 加载指标历史数据
 * - 批量处理多个指标系列
 * - 数据转换和合并
 */
export const useIndicatorDataLoader = ({
	strategyId,
	chartConfig,
}: UseIndicatorDataLoaderProps): UseIndicatorDataLoaderReturn => {
	const { getIndicatorSeriesRef } = useBacktestChartStore(chartConfig.id);

	const loadIndicatorHistory = useCallback(
		async (
			indicatorKeyStr: string,
			firstIndicatorDateTime: string,
			seriesConfigs: SeriesConfig[],
		) => {
			try {
				const data = await getStrategyDataApi({
					strategyId,
					keyStr: indicatorKeyStr,
					datetime: firstIndicatorDateTime,
					limit: 100,
				});

				const indicatorData = data as Record<
					keyof IndicatorValueConfig,
					number | Date
				>[];
				if (!indicatorData || !Array.isArray(indicatorData)) {
					return;
				}

				// 剔除最后1根数据（避免重复计算slice）
				const trimmedData = indicatorData.slice(0, -1);
				if (trimmedData.length === 0) {
					return;
				}
				// console.log("加载指标历史数据", trimmedData.length);

				const partialIndicatorData: Record<
					keyof IndicatorValueConfig,
					SingleValueData[]
				> = {};

				// 优化：预先构建数据结构，避免重复扩展数组
				trimmedData.forEach((item) => {
					Object.entries(item).forEach(([indicatorValueField, value]) => {
						// 跳过datetime字段，只处理指标值，并过滤value为0的数据和value为空的数据
						if (
							indicatorValueField !== "datetime" &&
							value !== 0 &&
							value !== null
						) {
							const key = indicatorValueField as keyof IndicatorValueConfig;
							if (!partialIndicatorData[key]) {
								partialIndicatorData[key] = [];
							}
							partialIndicatorData[key].push({
								time: getChartAlignedUtcTimestamp(
									item.datetime as unknown as string,
								) as UTCTimestamp,
								value: value as number,
							} as SingleValueData);
						}
					});
				});

				// 更新各个系列的数据
				seriesConfigs.forEach((seriesConfig) => {
					const indicatorSeriesRef = getIndicatorSeriesRef(
						indicatorKeyStr,
						seriesConfig.indicatorValueKey,
					);
					if (indicatorSeriesRef) {
						const originalData =
							indicatorSeriesRef.data() as SingleValueData[];
						const partialData =
							partialIndicatorData[
								seriesConfig.indicatorValueKey as keyof IndicatorValueConfig
							];
						if (partialData && partialData.length > 0) {
							const newData = [...partialData, ...originalData];
							indicatorSeriesRef.setData(newData);
						}
					}
				});
			} catch (error) {
				console.error(
					`加载指标 ${indicatorKeyStr} 历史数据时出错:`,
					error,
				);
			}
		},
		[strategyId, getIndicatorSeriesRef],
	);

	return { loadIndicatorHistory };
};

export type { UseIndicatorDataLoaderProps, UseIndicatorDataLoaderReturn };
