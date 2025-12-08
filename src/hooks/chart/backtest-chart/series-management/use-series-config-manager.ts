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
 * Series configuration management
 *
 * Responsibilities:
 * - Modify K-line visibility
 * - Modify indicator series color and visibility
 */
export const useSeriesConfigManager = ({
	chartConfig,
}: UseSeriesConfigManagerProps): UseSeriesConfigManagerReturn => {
	const { getKlineSeriesRef, getIndicatorSeriesRef } = useBacktestChartStore(
		chartConfig.id,
	);

	const changeSeriesConfig = useCallback(() => {
		// Toggle candlestick visibility
		const klineSeries = getKlineSeriesRef();
		if (klineSeries) {
			klineSeries.applyOptions({
				visible: chartConfig.klineChartConfig.visible,
			});
		}

		// Get seriesApi based on indicatorChartConfig
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
