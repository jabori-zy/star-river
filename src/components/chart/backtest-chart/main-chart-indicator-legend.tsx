import { useEffect } from "react";
import { useIndicatorLegend } from "@/hooks/chart/backtest-chart";
import { useBacktestChartStore } from "./backtest-chart-store";
import { IndicatorLegend } from "./indicator-legend";

// Extract main chart indicator legend component to avoid recreation during render
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
	const {
		legendData: indicatorLegendData,
		onCrosshairMove,
		onSeriesDataUpdate,
	} = useIndicatorLegend({
		chartId,
		indicatorKeyStr,
	});

	const { chartRef, indicatorSeriesRef } = useBacktestChartStore(chartId);
	const indicatorSeriesMap = indicatorSeriesRef[indicatorKeyStr] || {};

	// Subscribe to main chart mouse events, subscribe immediately when chart reference is ready
	useEffect(() => {
		if (!chartRef || !onCrosshairMove) return;

		// console.log("Subscribe to mouse move event", indicatorKeyStr);
		chartRef.subscribeCrosshairMove(onCrosshairMove);

		return () => {
			chartRef.unsubscribeCrosshairMove(onCrosshairMove);
		};
	}, [chartRef, indicatorKeyStr, onCrosshairMove]);

	// Indicator data change subscription, wait for indicator series to be ready before subscribing
	useEffect(() => {
		const seriesList = Object.values(indicatorSeriesMap).filter(
			(seriesRef): seriesRef is NonNullable<typeof seriesRef> =>
				Boolean(seriesRef),
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
				// Main chart indicators: start from 40px, 30px spacing between each
				top: `${40 + index * 30}px`,
				left: "0px",
			}}
		/>
	);
};

export default MainChartIndicatorLegend;
