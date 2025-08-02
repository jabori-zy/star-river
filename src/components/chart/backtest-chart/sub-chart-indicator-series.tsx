import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import type { SingleValueData, MouseEventParams } from "lightweight-charts";
import { Pane, type PaneApiRef } from "lightweight-charts-react-components";
import type { IndicatorChartConfig } from "@/types/chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import { IndicatorSeries } from "./indicator-series";
import { calculateSubChartHeight } from "./utils/pane-height-manager";
import SubChartIndicatorLegend, { type SubChartIndicatorLegendRef } from "./sub-chart-indicator-legend";

// 子图指标 Series 组件 - 支持多个 series 在同一个 Pane 中，自管理高度
interface SubChartIndicatorSeriesProps {
	indicatorKeyStr: IndicatorKeyStr;
	indicatorChartConfig: IndicatorChartConfig;
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>;
	subChartIndex: number; // 子图索引（从0开始）
	totalSubChartCount: number; // 总子图数量
	containerHeight: number; // 容器高度
	// onSeriesRef: (keyStr: string, ref: SeriesApiRef<"Line"> | SeriesApiRef<"Histogram"> | SeriesApiRef<"Area">) => void;
}

export interface SubChartIndicatorSeriesRef {
	onCrosshairMove: (param: MouseEventParams) => void;
}

const SubChartIndicatorSeries = forwardRef<SubChartIndicatorSeriesRef, SubChartIndicatorSeriesProps>(({
	indicatorKeyStr,
	indicatorChartConfig,
	data,
	subChartIndex,
	totalSubChartCount,
	containerHeight,
}, ref) => {
	// 创建 Pane 引用
	const paneRef = useRef<PaneApiRef>(null);
	// 创建 Legend 引用
	const legendRef = useRef<SubChartIndicatorLegendRef>(null);

	// 暴露onCrosshairMove方法给父组件
	useImperativeHandle(ref, () => ({
		onCrosshairMove: (param: MouseEventParams) => {
			if (legendRef.current?.onCrosshairMove) {
				legendRef.current.onCrosshairMove(param);
			}
		},
	}), []);

	// 计算当前子图的高度
	const subChartHeight = calculateSubChartHeight(subChartIndex, totalSubChartCount, containerHeight);

	// 当组件挂载或高度参数变化时，设置 Pane 高度
	// 添加一个状态来跟踪pane是否已经完全初始化
	const [paneInitialized, setPaneInitialized] = useState(false);

	useEffect(() => {
		if (paneRef.current) {
			const paneApi = paneRef.current.api();

			if (paneApi && typeof paneApi.setHeight === 'function') {
				// 延迟设置，确保 Pane 完全初始化
				setTimeout(() => {
					paneApi.setHeight(subChartHeight);
					console.log(`✅ 子图 ${subChartIndex} 高度设置为: ${subChartHeight}px`);

					// 再延迟一点时间，确保高度设置完全生效
					setTimeout(() => {
						setPaneInitialized(true);
						console.log(`🎯 子图 ${subChartIndex} 完全初始化完成`);
					}, 50);
				}, 100);
			}
		}
	}, [subChartIndex, subChartHeight]);

	// 渲染所有 series 在同一个 Pane 中
	return (
		<Pane ref={paneRef}>
			
			{/* 指标系列 */}
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
			{/* 子图指标图例 */}
			<SubChartIndicatorLegend
				ref={legendRef}
				indicatorKeyStr={indicatorKeyStr}
				data={data}
				paneRef={paneRef}
				paneInitialized={paneInitialized}
			/>
		</Pane>
	);
});

SubChartIndicatorSeries.displayName = 'SubChartIndicatorSeries';

export default SubChartIndicatorSeries;
