import type { ChartOptions, DeepPartial, IChartApi } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import {
	useChartInitialization,
	useChartLifecycle,
	useChartResize,
} from "./core";
import { useVisibleRangeHandler } from "./data-loading";
import {
	useIndicatorSeriesManager,
	useKlineSeriesManager,
	useSeriesConfigManager,
} from "./series-management";
import { type KlineLegendData, useKlineLegend } from "./use-kline-legend";

interface UseBacktestChartProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	chartOptions: DeepPartial<ChartOptions>;
}

interface UseBacktestChartReturn {
	klineLegendData: KlineLegendData | null; // K-line legend data
	getChartRef: () => IChartApi | null;
}

export const useBacktestChart = ({
	strategyId,
	chartConfig,
	chartContainerRef,
	chartOptions,
}: UseBacktestChartProps): UseBacktestChartReturn => {
	// Use state to track initialization status instead of ref
	const [isInitialized, setIsInitialized] = useState(false);
	// Whether this is the first load
	const isFirstChartConfigLoad = useRef(true);

	const { setChartConfig, getChartRef } = useBacktestChartStore(
		chartConfig.id,
		chartConfig,
	);

	// K-line legend
	const { klineLegendData, onCrosshairMove, onSeriesDataUpdate } =
		useKlineLegend({ chartId: chartConfig.id });

	// Synchronize latest chart configuration to store to avoid using outdated config
	useEffect(() => {
		setChartConfig(chartConfig);
	}, [chartConfig, setChartConfig]);

	// Core functionality
	const { initializeBacktestChart } = useChartInitialization({
		strategyId,
		chartConfig,
		chartContainerRef,
		chartOptions,
		onCrosshairMove,
		onSeriesDataUpdate,
	});

	useChartLifecycle({
		strategyId,
		chartContainerRef,
		isInitialized,
		setIsInitialized,
		initializeBacktestChart,
		chartId: chartConfig.id,
	});

	useChartResize({ chartContainerRef, chartId: chartConfig.id });

	// Series management
	const { changeKline } = useKlineSeriesManager({
		strategyId,
		chartConfig,
		onSeriesDataUpdate,
	});

	const { addSeries, deleteSeries } = useIndicatorSeriesManager({
		strategyId,
		chartConfig,
	});

	const { changeSeriesConfig } = useSeriesConfigManager({ chartConfig });

	// Data loading
	useVisibleRangeHandler({ strategyId, chartConfig, isInitialized });

	// Configuration change coordination
	useEffect(() => {
		if (chartConfig) {
			// Skip first load (during initialization), only recreate on subsequent config changes
			if (isFirstChartConfigLoad.current) {
				isFirstChartConfigLoad.current = false;
				return;
			}
			// Switch K-line
			changeKline();

			// Add series (async operation)
			addSeries().catch((error) => {
				console.error("Error adding series:", error);
			});

			// Modify series configuration
			changeSeriesConfig();

			// Delete indicator series
			deleteSeries();
		}
	}, [chartConfig, addSeries, changeSeriesConfig, deleteSeries, changeKline]);

	return {
		klineLegendData,
		getChartRef,
	};
};
