import { useEffect } from "react";
import { useIndicatorLegend } from "@/hooks/chart/backtest-chart";
import { useBacktestChartStore } from "./backtest-chart-store";
import { IndicatorLegend } from "./indicator-legend";



// 将主图指标图例组件提取到外部，避免在渲染时重新创建
interface MainChartIndicatorLegendProps {
	chartId: number;
	indicatorKeyStr: string;
	index: number;
}

const MainChartIndicatorLegend = ({
	chartId,
	indicatorKeyStr,
	index,
}: MainChartIndicatorLegendProps) => {
	const { legendData: indicatorLegendData, onCrosshairMove, onSeriesDataUpdate } =
		useIndicatorLegend({
			chartId,
			indicatorKeyStr,
		});

	const { chartRef, indicatorSeriesRef } = useBacktestChartStore(chartId);
	const indicatorSeriesMap = indicatorSeriesRef[indicatorKeyStr] || {};

	// 🔑 订阅主图鼠标事件，当图表引用就绪时立即订阅
	useEffect(() => {
		if (!chartRef || !onCrosshairMove) return;

		// console.log("订阅鼠标移动事件", indicatorKeyStr);
		chartRef.subscribeCrosshairMove(onCrosshairMove);

		return () => {
			chartRef.unsubscribeCrosshairMove(onCrosshairMove);
		};
	}, [chartRef, indicatorKeyStr, onCrosshairMove]);

	// 指标数据变动订阅，等待指标 series 准备好后再订阅
	useEffect(() => {
		const seriesList = Object.values(indicatorSeriesMap).filter(
			(seriesRef): seriesRef is NonNullable<typeof seriesRef> => Boolean(seriesRef),
		);

		if (seriesList.length === 0) return;

		seriesList.forEach((seriesRef) => {
			seriesRef.subscribeDataChanged(onSeriesDataUpdate);
		});

		return () => {
			seriesList.forEach((seriesRef) => {
				seriesRef.unsubscribeDataChanged(onSeriesDataUpdate);
			});
		};
	}, [indicatorSeriesMap, onSeriesDataUpdate]);

	return (
		<IndicatorLegend
			indicatorLegendData={indicatorLegendData}
			indicatorKeyStr={indicatorKeyStr}
			chartId={chartId}
			style={{
				// 主图指标：从40px开始，每个间隔30px
				top: `${40 + index * 30}px`,
				left: "0px",
			}}
		/>
	);
};

export default MainChartIndicatorLegend;
