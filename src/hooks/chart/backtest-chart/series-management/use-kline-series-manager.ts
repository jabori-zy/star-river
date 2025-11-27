import { createSeriesMarkers } from "lightweight-charts";
import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { get_play_index } from "@/service/backtest-strategy/backtest-strategy-control";
import { getStrategyDatetimeApi } from "@/service/backtest-strategy/strategy-datetime";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { DataChangedScope } from "lightweight-charts";
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
 * K线系列管理
 *
 * 职责：
 * - K线周期切换
 * - 数据重新初始化
 * - 订阅管理
 * - 订单标记和价格线恢复
 * - 时间轴重置
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
		getLimitOrderPriceLine,
		setOrderMarkerSeriesRef,
	} = useBacktestChartStore(chartConfig.id);

	const changeKline = useCallback(async () => {
		const nextKlineKey = chartConfig.klineChartConfig.klineKeyStr;
		const currentKlineKey = getKlineKeyStr();
		// 如果k线key不一致，则切换k线
		if (currentKlineKey !== nextKlineKey) {
			try {
				// 清空现有订阅，确保指标订阅被移除
				cleanupSubscriptions();
				// 重置k线key
				setKlineKeyStr(nextKlineKey);
				// 先获取数据
				const playIndexValue = await get_play_index(strategyId);
				const strategyDatetime = (await getStrategyDatetimeApi(strategyId))
					.strategyDatetime;
				await initKlineData(strategyDatetime, playIndexValue, strategyId);

				// 从图表移除当前的klineSeries
				const chart = getChartRef();
				if (chart) {
					const klineSeries = getKlineSeriesRef();
					if (klineSeries) {
						klineSeries.unsubscribeDataChanged(onSeriesDataUpdate);
						chart.removeSeries(klineSeries);
						// 从store中删除klineSeriesRef
						deleteKlineSeriesRef();
						deleteOrderMarkerSeriesRef();
					}

					// 创建新的klineSeries
					const newKlineSeries = addKlineSeries(
						chart,
						chartConfig.klineChartConfig,
					);
					if (newKlineSeries) {
						newKlineSeries.subscribeDataChanged(onSeriesDataUpdate);
						setKlineSeriesRef(newKlineSeries);

						// 恢复订单标记和价格线
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

						// 重置时间轴，避免在切换周期后残留之前的缩放状态
						const timeScale = chart.timeScale();
						timeScale.resetTimeScale();
						requestAnimationFrame(() => {
							timeScale.fitContent();
						});
					}
				}
				// 重新订阅最新k线的数据流
				subscribe(nextKlineKey);
			} catch (error) {
				console.error("切换K线时出错:", error);
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
