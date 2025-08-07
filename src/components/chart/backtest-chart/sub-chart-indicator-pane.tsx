import type { MouseEventParams, SingleValueData } from "lightweight-charts";
import { Pane, type PaneApiRef } from "lightweight-charts-react-components";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { IndicatorChartConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "./backtest-chart-store";
import { IndicatorSeries } from "./indicator-series";
import SubChartIndicatorLegend, {
	type SubChartIndicatorLegendRef,
} from "./sub-chart-indicator-legend";
import { calculateSubChartHeight } from "./utils/pane-height-manager";

// 子图指标 Series 组件 - 支持多个 series 在同一个 Pane 中，自管理高度
interface SubChartIndicatorSeriesProps {
	indicatorKeyStr: IndicatorKeyStr;
	indicatorChartConfig: IndicatorChartConfig;
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>;
	subChartIndex: number; // 子图索引（从0开始）
	totalSubChartCount: number; // 总子图数量
	containerHeight: number; // 容器高度
	chartConfig: BacktestChartConfig; // 新增图表配置
	// onSeriesRef: (keyStr: string, ref: SeriesApiRef<"Line"> | SeriesApiRef<"Histogram"> | SeriesApiRef<"Area">) => void;
}

export interface SubChartIndicatorSeriesRef {
	onCrosshairMove: (param: MouseEventParams) => void;
}

const SubChartIndicatorPane = forwardRef<
	SubChartIndicatorSeriesRef,
	SubChartIndicatorSeriesProps
>(
	(
		{
			indicatorKeyStr,
			indicatorChartConfig,
			data,
			subChartIndex,
			totalSubChartCount,
			containerHeight,
			chartConfig,
		},
		ref,
	) => {
		// 创建 Pane 引用
		const paneRef = useRef<PaneApiRef>(null);
		// 创建 Legend 引用
		const legendRef = useRef<SubChartIndicatorLegendRef>(null);

		// 获取指标可见性状态（从当前图表的store中获取）
		const { getIndicatorVisibility } = useBacktestChartStore(chartConfig.id);
		const isVisible = getIndicatorVisibility(indicatorKeyStr);

		// 暴露onCrosshairMove方法给父组件
		useImperativeHandle(
			ref,
			() => ({
				onCrosshairMove: (param: MouseEventParams) => {
					if (legendRef.current?.onCrosshairMove) {
						legendRef.current.onCrosshairMove(param);
					}
				},
			}),
			[],
		);

		// 计算当前子图的高度
		const subChartHeight = calculateSubChartHeight(
			subChartIndex,
			totalSubChartCount,
			containerHeight,
		);

		// 当组件挂载或高度参数变化时，设置 Pane 高度
		// 添加一个状态来跟踪pane是否已经完全初始化
		const [paneInitialized, setPaneInitialized] = useState(false);
		// 添加一个状态来跟踪HTML元素是否已经获取到
		const [isHtmlGet, setIsHtmlGet] = useState(false);

		useEffect(() => {
			if (paneRef.current) {
				const paneApi = paneRef.current.api();

				if (paneApi && typeof paneApi.setHeight === "function") {
					// 延迟设置，确保 Pane 完全初始化
					setTimeout(() => {
						paneApi.setHeight(subChartHeight);

						// 再延迟一点时间，确保高度设置完全生效，并验证HTML元素可用性
						setTimeout(() => {
							// 验证pane的HTML元素是否可用
							if (paneApi && typeof paneApi.getHTMLElement === "function") {
								const htmlElement = paneApi.getHTMLElement();
								if (htmlElement) {
									const rect = htmlElement.getBoundingClientRect();
									if (rect.width > 0 && rect.height > 0) {
										setPaneInitialized(true);
										setIsHtmlGet(true); // 设置HTML元素已获取状态
									} else {
										// 如果HTML元素尺寸无效，再延迟一点时间
										setTimeout(() => {
											setPaneInitialized(true);
											setIsHtmlGet(true);
										}, 100);
									}
								} else {
									setTimeout(() => {
										setPaneInitialized(true);
										// HTML元素未获取到，不设置isHtmlGet为true
									}, 100);
								}
							} else {
								setPaneInitialized(true);
								// getHTMLElement方法不可用，不设置isHtmlGet为true
							}
						}, 100); // 增加延迟时间，确保DOM完全更新
					}, 150); // 增加初始延迟时间
				}
			}
		}, [subChartHeight]);

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
							visible={isVisible}
						/>
					);
				})}
				{/* 子图指标图例 - 只有在HTML元素获取到后才渲染 */}
				{isHtmlGet && (
					<SubChartIndicatorLegend
						ref={legendRef}
						indicatorKeyStr={indicatorKeyStr}
						data={data}
						paneRef={paneRef}
						paneInitialized={paneInitialized}
						chartConfig={chartConfig}
					/>
				)}
			</Pane>
		);
	},
);

SubChartIndicatorPane.displayName = "SubChartIndicatorPane";

export default SubChartIndicatorPane;
