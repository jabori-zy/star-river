import type { IPaneApi, ISeriesApi, Time } from "lightweight-charts";
import {
	AreaSeries,
	HistogramSeries,
	LineSeries,
	BaselineSeries,
	type LineStyle,
	type LineWidth,
} from "lightweight-charts";
import { SeriesType } from "@/types/chart";
import type { StrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";

export const addStatsSeries = (
	pane: IPaneApi<Time>,
	config: StrategyStatsChartConfig,
) => {

	console.log("addStatsSeries config", config);

	const seriesConfig = config.seriesConfigs;
	let statsSeries:
		| ISeriesApi<"Line">
		| ISeriesApi<"Area">
		| ISeriesApi<"Histogram">
		| ISeriesApi<"Baseline">
		| null = null;

	const lineSeriesConfig = {
		visible: config.visible ?? true,
		lastValueVisible: false,
		priceLineVisible: false,
		lineWidth: 1 as LineWidth,
		color: seriesConfig.color,
	};

	const baselineSeriesConfig = {
		visible: config.visible ?? true,
		lastValueVisible: true,
		priceLineVisible: false,
		color: seriesConfig.color,
		lineWidth: 1 as LineWidth,
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
		case SeriesType.BASELINE:
			statsSeries = pane.addSeries(BaselineSeries, baselineSeriesConfig);

			break;
	}
	return statsSeries;
};
