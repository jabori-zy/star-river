import type { IChartApi, IPaneApi, ISeriesApi, Time } from "lightweight-charts";
import { AreaSeries, HistogramSeries, LineSeries } from "lightweight-charts";
import type { IndicatorChartConfig, SeriesConfig } from "@/types/chart";
import { SeriesType } from "@/types/chart";

export const addChartSeries = (
	chart: IChartApi | IPaneApi<Time>,
	config: IndicatorChartConfig,
	seriesConfig: SeriesConfig,
) => {
	let mainChartIndicatorSeries:
		| ISeriesApi<"Line">
		| ISeriesApi<"Area">
		| ISeriesApi<"Histogram">
		| null = null;
	switch (seriesConfig.type) {
		case SeriesType.LINE:
			mainChartIndicatorSeries = chart.addSeries(
				LineSeries,
				{
					visible: config.visible ?? true,
					lastValueVisible: false,
					priceLineVisible: false,
					lineWidth: 1,
					color: seriesConfig.color,
				},
				0,
			);
			break;
		case SeriesType.COLUMN:
			mainChartIndicatorSeries = chart.addSeries(
				HistogramSeries,
				{
					visible: config.visible ?? true,
					priceLineVisible: false,
					color: seriesConfig.color,
				},
				0,
			);
			break;
		case SeriesType.MOUNTAIN:
			mainChartIndicatorSeries = chart.addSeries(
				AreaSeries,
				{
					visible: config.visible ?? true,
					priceLineVisible: false,
				},
				0,
			);
			break;
		case SeriesType.DASH:
			mainChartIndicatorSeries = chart.addSeries(
				LineSeries,
				{
					visible: config.visible ?? true,
					lineStyle: 2, // 虚线样式
					lineWidth: 1,
					priceLineVisible: false,
					lastValueVisible: false,
					color: seriesConfig.color,
				},
				0,
			);
			break;
	}
	return mainChartIndicatorSeries;
};
