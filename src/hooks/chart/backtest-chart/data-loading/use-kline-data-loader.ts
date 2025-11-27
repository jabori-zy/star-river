import type { CandlestickData, UTCTimestamp } from "lightweight-charts";
import { useCallback } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { getChartAlignedUtcTimestamp } from "@/components/chart/backtest-chart/utls";
import { getStrategyDataApi } from "@/service/backtest-strategy/get-strategy-data";
import { Kline } from "@/types/kline";

interface UseKlineDataLoaderProps {
	strategyId: number;
	chartId: number;
}

interface UseKlineDataLoaderReturn {
	loadKlineHistory: (
		firstKlineDateTime: string,
		klineKeyStr: string,
	) => Promise<void>;
}

/**
 * K线历史数据加载
 *
 * 职责：
 * - 加载K线历史数据
 * - 数据转换和合并
 * - 延迟更新避免无限触发
 */
export const useKlineDataLoader = ({
	strategyId,
	chartId,
}: UseKlineDataLoaderProps): UseKlineDataLoaderReturn => {
	const { getKlineSeriesRef } = useBacktestChartStore(chartId);

	const loadKlineHistory = useCallback(
		async (firstKlineDateTime: string, klineKeyStr: string) => {
			try {
				const data = await getStrategyDataApi({
					strategyId,
					keyStr: klineKeyStr,
					datetime: firstKlineDateTime,
					limit: 100,
				});

				const klinedata = data as Kline[];
				// 剔除最后1根k线（避免重复计算slice）
				const trimmedData = klinedata.slice(0, -1);

				// 如果数据长度为0，则不进行处理
				if (trimmedData.length === 0) {
					return;
				}

				const partialKlineData: CandlestickData[] = trimmedData.map(
					(kline) => ({
						time: getChartAlignedUtcTimestamp(
							kline.datetime,
						) as UTCTimestamp,
						open: kline.open,
						high: kline.high,
						low: kline.low,
						close: kline.close,
					}),
				);
				// console.log("加载k线历史数据", partialKlineData.length);

				// 添加延迟，避免无限触发可见范围变化事件
				setTimeout(() => {
					// 重新获取最新的 klineSeries，确保使用最新的引用
					const latestKlineSeries = getKlineSeriesRef();
					if (latestKlineSeries) {
						const newData = [...partialKlineData, ...latestKlineSeries.data()];
						latestKlineSeries.setData(newData as CandlestickData[]);
					}
				}, 250);
			} catch (error) {
				console.error("加载K线历史数据时出错:", error);
			}
		},
		[strategyId, getKlineSeriesRef],
	);

	return { loadKlineHistory };
};

export type { UseKlineDataLoaderProps, UseKlineDataLoaderReturn };
