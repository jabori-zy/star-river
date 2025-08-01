import type { SingleValueData } from "lightweight-charts";
import type { SeriesConfig } from "@/types/chart";
import { IndicatorSeries } from "./indicator-series";

// 主图指标 Series 组件
interface MainChartIndicatorSeriesProps {
	seriesConfig: SeriesConfig;
	data: SingleValueData[];
	// onSeriesRef: (keyStr: string, ref: SeriesApiRef<"Line"> | SeriesApiRef<"Histogram"> | SeriesApiRef<"Area">) => void;
}

/**
 * 主图指标 Series 组件
 * 使用共用的 IndicatorSeries 组件来渲染单个系列
 */
const MainChartIndicatorSeries = ({
	seriesConfig,
	data,
}: MainChartIndicatorSeriesProps) => {
	return (
		<IndicatorSeries
			seriesConfig={seriesConfig}
			data={data}
		/>
	);
};

export default MainChartIndicatorSeries;
