import type { LogicalRange } from "lightweight-charts";
import { useEffect } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { getDateTimeFromChartTimestamp } from "@/components/chart/backtest-chart/utls";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { useKlineDataLoader } from "./use-kline-data-loader";
import { useIndicatorDataLoader } from "./use-indicator-data-loader";

interface UseVisibleRangeHandlerProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
	isInitialized: boolean;
}

/**
 * 可见范围处理和懒加载协调
 *
 * 职责：
 * - 监听可见范围变化
 * - 虚拟滚动检测（当 logicalRange.from >= 30 时触发）
 * - 防抖和加载状态管理
 * - 协调K线和指标数据加载
 */
export const useVisibleRangeHandler = ({
	strategyId,
	chartConfig,
	isInitialized,
}: UseVisibleRangeHandlerProps): void => {
	const {
		getChartRef,
		getKlineSeriesRef,
		getIndicatorSeriesRef,
		getKlineKeyStr,
		setVisibleLogicalRange,
	} = useBacktestChartStore(chartConfig.id);

	const { loadKlineHistory } = useKlineDataLoader({
		strategyId,
		chartId: chartConfig.id,
	});
	const { loadIndicatorHistory } = useIndicatorDataLoader({
		strategyId,
		chartConfig,
	});

	// 订阅图表的可见逻辑范围变化
	useEffect(() => {
		const chart = getChartRef();
		if (!chart || !isInitialized) {
			return;
		}

		// 使用ref追踪是否正在加载，防止重复请求
		const loadingRef = { current: false };

		const handleVisibleRangeChange = (logicalRange: LogicalRange | null) => {
			if (!logicalRange || loadingRef.current) {
				return;
			}

			// console.log("visibleRangeChange", logicalRange);
			setVisibleLogicalRange(logicalRange);

			// 只有在接近边界时才加载更多数据
			if (logicalRange.from >= 30) {
				return;
			}

			// 设置加载标志，防止重复请求
			loadingRef.current = true;

			// 获取当前的 klineSeries（从最新的 ref 中获取）
			const currentKlineSeries = getKlineSeriesRef();
			if (currentKlineSeries) {
				const klineData = currentKlineSeries.data();
				const firstKline = klineData[0];
				const firstKlineDateTime = firstKline
					? getDateTimeFromChartTimestamp(firstKline.time as number)
					: null;

				if (firstKlineDateTime) {
					console.log("firstKlineDateTime:", firstKlineDateTime);
					// 获取 klineKeyStr，如果不存在则提前返回
					const klineKeyStr = getKlineKeyStr();
					if (!klineKeyStr) {
						loadingRef.current = false;
						return;
					}

					// 获取第一根k线前的100根k线
					loadKlineHistory(firstKlineDateTime, klineKeyStr)
						.catch((error) => {
							console.error("加载K线历史数据时出错:", error);
						})
						.finally(() => {
							// 重置加载标志
							loadingRef.current = false;
						});
				}
			}

			// 处理指标数据
			const indicatorsNeedingData = chartConfig.indicatorChartConfigs.filter(
				(config) => !config.isDelete,
			);

			if (indicatorsNeedingData.length > 0) {
				indicatorsNeedingData.forEach((config) => {
					// 使用 find 代替 forEach + return，更高效地获取第一个时间戳
					let firstIndicatorDateTime = "";

					for (const seriesConfig of config.seriesConfigs) {
						const indicatorSeriesRef = getIndicatorSeriesRef(
							config.indicatorKeyStr,
							seriesConfig.indicatorValueKey,
						);
						if (indicatorSeriesRef) {
							const firstData = indicatorSeriesRef.data()[0];
							if (firstData) {
								const firstDataTime = getDateTimeFromChartTimestamp(
									firstData.time as number,
								);
								if (firstDataTime) {
									firstIndicatorDateTime = firstDataTime;
									break; // 找到第一个有效时间后立即退出
								}
							}
						}
					}

					if (firstIndicatorDateTime) {
						// 获取指标的前100根数据
						loadIndicatorHistory(
							config.indicatorKeyStr,
							firstIndicatorDateTime,
							config.seriesConfigs,
						).catch((error) => {
							console.error(
								`加载指标 ${config.indicatorKeyStr} 历史数据时出错:`,
								error,
							);
						});
					}
				});
			}
		};

		// 订阅可见范围变化
		chart
			.timeScale()
			.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

		// 清理函数：取消订阅
		return () => {
			chart
				.timeScale()
				.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
		};
	}, [
		isInitialized,
		chartConfig.indicatorChartConfigs,
		getChartRef,
		getKlineSeriesRef,
		getIndicatorSeriesRef,
		getKlineKeyStr,
		setVisibleLogicalRange,
		loadKlineHistory,
		loadIndicatorHistory,
	]);
};

export type { UseVisibleRangeHandlerProps };
