import type { IChartApi, IPaneApi, ISeriesApi, Time } from "lightweight-charts";
import {
	AreaSeries,
	HistogramSeries,
	LineSeries,
	type LineStyle,
	type LineWidth,
} from "lightweight-charts";
import type { StatsSeriesConfig } from "@/types/chart";
import { SeriesType } from "@/types/chart";
import type { StrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";

export const addStatsSeries = (
	pane: IPaneApi<Time>,
	config: StrategyStatsChartConfig,
	seriesConfig: StatsSeriesConfig,
) => {
	let statsSeries:
		| ISeriesApi<"Line">
		| ISeriesApi<"Area">
		| ISeriesApi<"Histogram">
		| null = null;

	const lineSeriesConfig = {
		visible: config.visible ?? true,
		lastValueVisible: false,
		priceLineVisible: false,
		lineWidth: 1 as LineWidth,
		color: seriesConfig.color,
	};

	const histogramSeriesConfig = {
		visible: config.visible ?? true,
		priceLineVisible: false,
		color: seriesConfig.color,
	};

	const areaSeriesConfig = {
		visible: config.visible ?? true,
		priceLineVisible: false,
	};

	const dashSeriesConfig = {
		visible: config.visible ?? true,
		lineStyle: 2 as LineStyle,
	};

	switch (seriesConfig.type) {
		case SeriesType.LINE:
			statsSeries = pane.addSeries(LineSeries, lineSeriesConfig);

			break;
		case SeriesType.COLUMN:
			statsSeries = pane.addSeries(HistogramSeries, histogramSeriesConfig);

			break;
		case SeriesType.MOUNTAIN:
			statsSeries = pane.addSeries(AreaSeries, areaSeriesConfig);
			break;
		case SeriesType.DASH:
			statsSeries = pane.addSeries(LineSeries, dashSeriesConfig);

			break;
	}
	return statsSeries;
};
