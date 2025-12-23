import { useEffect } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { get_play_index } from "@/service/backtest-strategy/backtest-strategy-control";
import { getStrategyDatetimeApi } from "@/service/backtest-strategy/strategy-datetime";

interface UseChartLifecycleProps {
	strategyId: number;
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	isInitialized: boolean;
	setIsInitialized: (value: boolean) => void;
	initializeBacktestChart: () => void;
	chartId: number;
}

/**
 * Chart lifecycle management
 *
 * Responsibilities:
 * 1. Data initialization flow
 * 2. Container reference validity monitoring
 * 3. Automatic detection and repair of container reference loss
 */
export const useChartLifecycle = ({
	strategyId,
	chartContainerRef,
	isInitialized,
	setIsInitialized,
	initializeBacktestChart,
	chartId,
}: UseChartLifecycleProps): void => {
	const {
		getChartRef,
		setChartRef,
		initChartData,
		// Cleanup methods
		cleanupSubscriptions,
		deleteKlineSeriesRef,
		deleteOrderMarkerSeriesRef,
	} = useBacktestChartStore(chartId);

	/**
	 * Container reference validity monitoring
	 *
	 * Critical fix: Automatically detect and repair chart container reference loss
	 *
	 * Trigger scenarios:
	 * - When adding new charts, React re-renders causing existing chart's DOM containers to be recreated
	 * - ResizablePanel layout changes cause DOM structure adjustments
	 * - Any other operations that cause DOM reflow
	 *
	 * Detection logic:
	 * 1. Get chart instance and current container reference
	 * 2. Get the DOM element actually bound to the chart via chart.chartElement()
	 * 3. Compare whether the actually bound DOM element is still a child of the current container
	 *
	 * Repair process:
	 * 1. Clean up all subscriptions to prevent data pushing to destroyed series
	 * 2. Clear all series refs (kline, indicator, operation)
	 * 3. Destroy old chart instance (chart.remove())
	 * 4. Clear chart reference in store (setChartRef(null))
	 * 5. Reset initialization state to trigger complete re-initialization flow
	 */
	useEffect(() => {
		const chart = getChartRef();
		if (chart && chartContainerRef.current) {
			// Get the DOM container element actually bound to the chart
			const container = chart.chartElement();

			// Check if chart is still correctly bound to current container
			// If container doesn't exist or its parent element is not the current container, reference is lost
			if (!container || container.parentElement !== chartContainerRef.current) {
				// Step 1: Clean up all subscriptions first to prevent data pushing to destroyed series
				// This is critical to avoid "Value is null" errors
				cleanupSubscriptions();

				// Step 2: Clear all series refs before destroying chart
				deleteKlineSeriesRef();
				deleteOrderMarkerSeriesRef();
				// Note: indicator and operation series refs will be rebuilt during re-initialization

				// Step 3: Destroy old chart instance, release resources
				chart.remove();

				// Step 4: Clear chart reference in store, ensure subsequent initialization can proceed normally
				setChartRef(null);

				// Step 5: Reset initialization state, trigger complete re-initialization flow
				// This will cause useEffect to re-run initChartData and initializeBacktestChart
				setIsInitialized(false);
			}
		}
	}, [
		getChartRef,
		chartContainerRef,
		setChartRef,
		setIsInitialized,
		cleanupSubscriptions,
		deleteKlineSeriesRef,
		deleteOrderMarkerSeriesRef,
	]);

	/**
	 * Data initialization
	 *
	 * Responsibilities:
	 * 1. Get strategy play index
	 * 2. Get strategy timestamp
	 * 3. Initialize chart data
	 * 4. Initialize chart instance
	 */
	useEffect(() => {
		if (isInitialized) {
			return;
		}

		let isCancelled = false;

		const initialize = async () => {
			try {
				const playIndexValue = await get_play_index(strategyId);

				// Call API inside initialize function
				const strategyDatetime = (await getStrategyDatetimeApi(strategyId))
					.strategyDatetime;

				if (isCancelled) {
					return;
				}
				await initChartData(strategyDatetime, playIndexValue, strategyId);
				if (isCancelled) {
					return;
				}
				initializeBacktestChart();
			} catch (error) {
				console.error("Error initializing backtest chart:", error);
			}
		};

		initialize();

		return () => {
			isCancelled = true;
		};
	}, [strategyId, initChartData, initializeBacktestChart, isInitialized]);
};

export type { UseChartLifecycleProps };
