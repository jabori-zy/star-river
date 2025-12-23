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
 * - Modify operation series color and visibility
 */
export const useSeriesConfigManager = ({
	chartConfig,
}: UseSeriesConfigManagerProps): UseSeriesConfigManagerReturn => {
	const { getKlineSeriesRef, getIndicatorSeriesRef, getOperationSeriesRef } =
		useBacktestChartStore(chartConfig.id);

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

		// Get seriesApi based on operationChartConfig
		(chartConfig.operationChartConfigs || []).forEach((config) => {
			config.seriesConfigs.forEach((seriesConfig) => {
				const seriesApi = getOperationSeriesRef(
					config.operationKeyStr,
					seriesConfig.outputSeriesKey,
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
		getOperationSeriesRef,
		chartConfig.indicatorChartConfigs,
		chartConfig.operationChartConfigs,
		getKlineSeriesRef,
		chartConfig.klineChartConfig.visible,
	]);

	return { changeSeriesConfig };
};

export type { UseSeriesConfigManagerProps, UseSeriesConfigManagerReturn };
