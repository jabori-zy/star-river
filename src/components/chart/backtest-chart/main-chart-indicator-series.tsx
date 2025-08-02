import type { SingleValueData } from "lightweight-charts";
import type { SeriesConfig } from "@/types/chart";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { IndicatorSeries } from "./indicator-series";
import { useBacktestChartStore } from "./backtest-chart-store";

// 主图指标 Series 组件
interface MainChartIndicatorSeriesProps {
	seriesConfig: SeriesConfig;
	data: SingleValueData[];
	indicatorKeyStr: IndicatorKeyStr; // 新增指标键字符串，用于获取可见性状态
	chartConfig: BacktestChartConfig; // 新增图表配置
	// onSeriesRef: (keyStr: string, ref: SeriesApiRef<"Line"> | SeriesApiRef<"Histogram"> | SeriesApiRef<"Area">) => void;
}

/**
 * 主图指标 Series 组件
 * 使用共用的 IndicatorSeries 组件来渲染单个系列
 */
const MainChartIndicatorSeries = ({
	seriesConfig,
	data,
	indicatorKeyStr,
	chartConfig,
}: MainChartIndicatorSeriesProps) => {
	// 获取指标可见性状态（从当前图表的store中获取）
	const { getIndicatorVisibility } = useBacktestChartStore(chartConfig);
	const isVisible = getIndicatorVisibility(indicatorKeyStr);

	return (
		<IndicatorSeries
			seriesConfig={seriesConfig}
			data={data}
			visible={isVisible}
		/>
	);
};

export default MainChartIndicatorSeries;
