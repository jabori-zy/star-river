import type { DataChangedScope } from "lightweight-charts";
import { createSeriesMarkers } from "lightweight-charts";
import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { get_play_index } from "@/service/backtest-strategy/backtest-strategy-control";
import { getStrategyDatetimeApi } from "@/service/backtest-strategy/strategy-datetime";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { addKlineSeries } from "../utils/add-chart-series";

interface UseKlineSeriesManagerProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
	onSeriesDataUpdate: (scope: DataChangedScope) => void;
}

interface UseKlineSeriesManagerReturn {
	changeKline: () => Promise<void>;
}

/**
 * K-line series management
 *
 * Responsibilities:
 * - K-line period switching
 * - Data re-initialization
 * - Subscription management
 * - Order marker and price line restoration
 * - Time axis reset
 */
export const useKlineSeriesManager = ({
	strategyId,
	chartConfig,
	onSeriesDataUpdate,
}: UseKlineSeriesManagerProps): UseKlineSeriesManagerReturn => {
	const {
		getKlineKeyStr,
		setKlineKeyStr,
		getChartRef,
		getKlineSeriesRef,
		setKlineSeriesRef,
		deleteKlineSeriesRef,
		deleteOrderMarkerSeriesRef,
		initKlineData,
		cleanupSubscriptions,
		subscribe,
		getOrderMarkers,
		getPositionPriceLine,
		getOrderPriceLine: getLimitOrderPriceLine,
		setOrderMarkerSeriesRef,
	} = useBacktestChartStore(chartConfig.id);

	const changeKline = useCallback(async () => {
		const nextKlineKey = chartConfig.klineChartConfig.klineKeyStr;
		const currentKlineKey = getKlineKeyStr();
		// If K-line keys don't match, switch K-line
		if (currentKlineKey !== nextKlineKey) {
			try {
				// Clear existing subscriptions to ensure indicator subscriptions are removed
				cleanupSubscriptions();
				// Reset K-line key
				setKlineKeyStr(nextKlineKey);
				// Fetch data first
				const playIndexValue = await get_play_index(strategyId);
				const strategyDatetime = (await getStrategyDatetimeApi(strategyId))
					.strategyDatetime;
				await initKlineData(strategyDatetime, playIndexValue, strategyId);

				// Remove current klineSeries from chart
				const chart = getChartRef();
				if (chart) {
					const klineSeries = getKlineSeriesRef();
					if (klineSeries) {
						klineSeries.unsubscribeDataChanged(onSeriesDataUpdate);
						chart.removeSeries(klineSeries);
						// Delete klineSeriesRef from store
						deleteKlineSeriesRef();
						deleteOrderMarkerSeriesRef();
					}

					// Create new klineSeries
					const newKlineSeries = addKlineSeries(
						chart,
						chartConfig.klineChartConfig,
					);
					if (newKlineSeries) {
						newKlineSeries.subscribeDataChanged(onSeriesDataUpdate);
						setKlineSeriesRef(newKlineSeries);

						// Restore order markers and price lines
						const currentOrderMarkers = getOrderMarkers();
						const orderMarkerSeries = createSeriesMarkers(
							newKlineSeries,
							currentOrderMarkers.length > 0 ? currentOrderMarkers : [],
						);
						setOrderMarkerSeriesRef(orderMarkerSeries);

						const positionPriceLine = getPositionPriceLine();
						if (positionPriceLine.length > 0) {
							positionPriceLine.forEach((priceLine) => {
								newKlineSeries.createPriceLine(priceLine);
							});
						}

						const limitOrderPriceLine = getLimitOrderPriceLine();
						if (limitOrderPriceLine.length > 0) {
							limitOrderPriceLine.forEach((priceLine) => {
								newKlineSeries.createPriceLine(priceLine);
							});
						}

						// Reset time axis to avoid residual zoom state after switching periods
						const timeScale = chart.timeScale();
						timeScale.resetTimeScale();
						requestAnimationFrame(() => {
							timeScale.fitContent();
						});
					}
				}
				// Re-subscribe to the latest K-line data stream
				subscribe(nextKlineKey);
			} catch (error) {
				console.error("Error switching K-line:", error);
			}
		}
	}, [
		strategyId,
		chartConfig.klineChartConfig,
		initKlineData,
		setKlineSeriesRef,
		getKlineKeyStr,
		setKlineKeyStr,
		getChartRef,
		getKlineSeriesRef,
		deleteKlineSeriesRef,
		deleteOrderMarkerSeriesRef,
		getOrderMarkers,
		getPositionPriceLine,
		getLimitOrderPriceLine,
		setOrderMarkerSeriesRef,
		onSeriesDataUpdate,
		cleanupSubscriptions,
		subscribe,
	]);

	return { changeKline };
};

export type { UseKlineSeriesManagerProps, UseKlineSeriesManagerReturn };
