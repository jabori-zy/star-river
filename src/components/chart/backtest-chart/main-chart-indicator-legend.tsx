import { useEffect } from "react";
import { useIndicatorLegend } from "@/hooks/chart";
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
	const { legendData: indicatorLegendData, onCrosshairMove } =
		useIndicatorLegend({
			chartId,
			indicatorKeyStr,
		});

	// 获取图表API引用 - 使用 useMemo 稳定引用
	const { getChartRef } = useBacktestChartStore(chartId);

	// 🔑 为主图指标订阅鼠标事件 - 延迟订阅，确保图表完全初始化
	useEffect(() => {
		// 使用 setTimeout 确保在图表完全初始化后再订阅
		const timer = setTimeout(() => {
			const chart = getChartRef();
			if (!chart || !onCrosshairMove || !indicatorLegendData) return;

			// 订阅鼠标移动事件
			chart.subscribeCrosshairMove(onCrosshairMove);
		}, 10); // 稍微延迟，确保图表初始化完成

		return () => {
			clearTimeout(timer);
			const chart = getChartRef();
			if (chart && onCrosshairMove) {
				chart.unsubscribeCrosshairMove(onCrosshairMove);
			}
		};
	}, [getChartRef, onCrosshairMove, indicatorLegendData]);

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