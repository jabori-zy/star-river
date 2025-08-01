import { useRef, useEffect } from "react";
import type { SingleValueData } from "lightweight-charts";
import { Pane, type PaneApiRef } from "lightweight-charts-react-components";
import type { IndicatorChartConfig } from "@/types/chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import { IndicatorSeries } from "./indicator-series";
import { calculateSubChartHeight } from "./utils/pane-height-manager";

// 子图指标 Series 组件 - 支持多个 series 在同一个 Pane 中，自管理高度
interface SubChartIndicatorSeriesProps {
	indicatorChartConfig: IndicatorChartConfig;
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>;
	subChartIndex: number; // 子图索引（从0开始）
	totalSubChartCount: number; // 总子图数量
	containerHeight: number; // 容器高度
	// onSeriesRef: (keyStr: string, ref: SeriesApiRef<"Line"> | SeriesApiRef<"Histogram"> | SeriesApiRef<"Area">) => void;
}

const SubChartIndicatorSeries = ({
	indicatorChartConfig,
	data,
	subChartIndex,
	totalSubChartCount,
	containerHeight,
}: SubChartIndicatorSeriesProps) => {
	// 创建 Pane 引用
	const paneRef = useRef<PaneApiRef>(null);

	// 计算当前子图的高度
	const subChartHeight = calculateSubChartHeight(subChartIndex, totalSubChartCount, containerHeight);

	// 当组件挂载或高度参数变化时，设置 Pane 高度
	useEffect(() => {
		if (paneRef.current) {
			const paneApi = paneRef.current.api();
			if (paneApi && typeof paneApi.setHeight === 'function') {
				// 延迟设置，确保 Pane 完全初始化
				setTimeout(() => {
					paneApi.setHeight(subChartHeight);
					console.log(`✅ 子图 ${subChartIndex} 高度设置为: ${subChartHeight}px`);
				}, 100);
			}
		}
	}, [subChartIndex, subChartHeight]);

	// 渲染所有 series 在同一个 Pane 中
	return (
		<Pane ref={paneRef}>
			{indicatorChartConfig.seriesConfigs.map((seriesConfig, index) => {
				// 根据 indicatorValueKey 获取对应的数据
				const seriesData = data[seriesConfig.indicatorValueKey] || [];

				return (
					<IndicatorSeries
						key={`${seriesConfig.name}-${index}`}
						seriesConfig={seriesConfig}
						data={seriesData}
					/>
				);
			})}
		</Pane>
	);
};

export default SubChartIndicatorSeries;
