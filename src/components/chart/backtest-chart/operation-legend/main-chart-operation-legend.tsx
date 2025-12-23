import { useEffect, useMemo } from "react";
import { useOperationLegend } from "@/components/chart/backtest-chart/hooks/use-operation-legend";
import type { OperationKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "../backtest-chart-store";
import { OperationLegend } from "./operation-legend";

// Stable empty object reference to avoid infinite loop caused by || {}
const EMPTY_SERIES_MAP: Record<string, unknown> = {};

// Extract main chart operation legend component to avoid recreation during render
interface MainChartOperationLegendProps {
	chartId: number;
	operationKeyStr: OperationKeyStr;
	index: number;
	indicatorCount: number; // Number of main chart indicators, for positioning
}

const MainChartOperationLegend = ({
	chartId,
	operationKeyStr,
	index,
	indicatorCount,
}: MainChartOperationLegendProps) => {
	const {
		legendData: operationLegendData,
		onCrosshairMove,
		onSeriesDataUpdate,
	} = useOperationLegend({
		chartId,
		operationKeyStr,
	});

	const { chartRef, operationSeriesRef } = useBacktestChartStore(chartId);

	// Use stable reference to avoid infinite loop
	const operationSeriesMap = useMemo(
		() => operationSeriesRef[operationKeyStr] ?? EMPTY_SERIES_MAP,
		[operationSeriesRef, operationKeyStr],
	);

	// Subscribe to main chart mouse events, subscribe immediately when chart reference is ready
	useEffect(() => {
		if (!chartRef || !onCrosshairMove) return;

		chartRef.subscribeCrosshairMove(onCrosshairMove);

		return () => {
			chartRef.unsubscribeCrosshairMove(onCrosshairMove);
		};
	}, [chartRef, onCrosshairMove]);

	// Operation data change subscription, wait for operation series to be ready before subscribing
	useEffect(() => {
		const seriesList = Object.values(operationSeriesMap).filter(
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
	}, [operationSeriesMap, onSeriesDataUpdate]);

	return (
		<OperationLegend
			operationLegendData={operationLegendData}
			operationKeyStr={operationKeyStr}
			chartId={chartId}
			style={{
				// Operation legends: start after indicator legends (40px base + indicatorCount * 30px), 30px spacing between each
				top: `${40 + (indicatorCount + index) * 30}px`,
				left: "0px",
			}}
		/>
	);
};

export default MainChartOperationLegend;
