import type { DeepPartial, ChartOptions, IChartApi } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { useBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { type KlineLegendData, useKlineLegend } from "./use-kline-legend";
import {
	useChartInitialization,
	useChartLifecycle,
	useChartResize,
} from "./core";
import {
	useKlineSeriesManager,
	useIndicatorSeriesManager,
	useSeriesConfigManager,
} from "./series-management";
import { useVisibleRangeHandler } from "./data-loading";

interface UseBacktestChartProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
	chartContainerRef: React.RefObject<HTMLDivElement | null>;
	chartOptions: DeepPartial<ChartOptions>;
}

interface UseBacktestChartReturn {
	klineLegendData: KlineLegendData | null; // K线图例数据
	getChartRef: () => IChartApi | null;
}

export const useBacktestChart = ({
	strategyId,
	chartConfig,
	chartContainerRef,
	chartOptions,
}: UseBacktestChartProps): UseBacktestChartReturn => {
	// 使用状态追踪初始化状态，而不是 ref
	const [isInitialized, setIsInitialized] = useState(false);
	// 是否是第一次加载
	const isFirstChartConfigLoad = useRef(true);

	const { setChartConfig, getChartRef } = useBacktestChartStore(
		chartConfig.id,
		chartConfig,
	);

	// K线 legend
	const { klineLegendData, onCrosshairMove, onSeriesDataUpdate } =
		useKlineLegend({ chartId: chartConfig.id });

	// 同步最新的图表配置到store，避免使用过期的配置
	useEffect(() => {
		setChartConfig(chartConfig);
	}, [chartConfig, setChartConfig]);

	// 核心功能
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

	// 系列管理
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

	// 数据加载
	useVisibleRangeHandler({ strategyId, chartConfig, isInitialized });

	// 配置变更协调
	useEffect(() => {
		if (chartConfig) {
			// 跳过第一次加载（初始化时），只在后续配置变化时重新创建
			if (isFirstChartConfigLoad.current) {
				isFirstChartConfigLoad.current = false;
				return;
			}
			// 切换k线
			changeKline();

			// 添加series (异步操作)
			addSeries().catch((error) => {
				console.error("添加series时出错:", error);
			});

			// 修改series配置
			changeSeriesConfig();

			// 删除指标系列
			deleteSeries();
		}
	}, [chartConfig, addSeries, changeSeriesConfig, deleteSeries, changeKline]);

	return {
		klineLegendData,
		getChartRef,
	};
};
