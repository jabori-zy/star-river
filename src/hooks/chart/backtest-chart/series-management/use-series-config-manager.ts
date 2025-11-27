import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";

interface UseSeriesConfigManagerProps {
	chartConfig: BacktestChartConfig;
}

interface UseSeriesConfigManagerReturn {
	changeSeriesConfig: () => void;
}

/**
 * 系列配置管理
 *
 * 职责：
 * - 修改K线可见性
 * - 修改指标系列颜色和可见性
 */
export const useSeriesConfigManager = ({
	chartConfig,
}: UseSeriesConfigManagerProps): UseSeriesConfigManagerReturn => {
	const { getKlineSeriesRef, getIndicatorSeriesRef } = useBacktestChartStore(
		chartConfig.id,
	);

	const changeSeriesConfig = useCallback(() => {
		// 切换蜡烛图可见性
		const klineSeries = getKlineSeriesRef();
		if (klineSeries) {
			klineSeries.applyOptions({
				visible: chartConfig.klineChartConfig.visible,
			});
		}

		// 根据indicatorChartConfig，获取seriesApi
		chartConfig.indicatorChartConfigs.forEach((config) => {
			config.seriesConfigs.forEach((seriesConfig) => {
				const seriesApi = getIndicatorSeriesRef(
					config.indicatorKeyStr,
					seriesConfig.indicatorValueKey,
				);
				if (seriesApi) {
					seriesApi.applyOptions({
						visible: config.visible,
						color: seriesConfig.color,
					});
				}
			});
		});
	}, [
		getIndicatorSeriesRef,
		chartConfig.indicatorChartConfigs,
		getKlineSeriesRef,
		chartConfig.klineChartConfig.visible,
	]);

	return { changeSeriesConfig };
};

export type { UseSeriesConfigManagerProps, UseSeriesConfigManagerReturn };
