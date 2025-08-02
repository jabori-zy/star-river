import dayjs from "dayjs";
import {
	type CandlestickData,
	CrosshairMode,
	type IChartApi,
	type SingleValueData,
	type Time,
} from "lightweight-charts";
import {
	CandlestickSeries,
	Chart,
	// Pane,
} from "lightweight-charts-react-components";
import { useCallback, useEffect, useRef } from "react";
import { get_play_index } from "@/service/strategy-control/backtest-strategy-control";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import {
	cleanupBacktestChartStore,
	useBacktestChartStore,
} from "./backtest-chart-store";
import { KlineLegend, useKlineLegend } from "./legend";
import MainChartIndicatorLegend, {
	type MainChartIndicatorLegendRef,
} from "./main-chart-indicator-legend";
import MainChartIndicatorSeries from "./main-chart-indicator-series";
import SubChartIndicatorSeries, {
	type SubChartIndicatorSeriesRef,
} from "./sub-chart-indicator-series";
// import ChartApiDebugger from "./debug/chart-api-debugger";
import { autoApplyPaneHeights } from "./utils/pane-height-manager";

interface BacktestChartProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

const BacktestChart = ({ strategyId, chartConfig }: BacktestChartProps) => {
	const {
		setChartConfig,
		klineData,
		indicatorData,
		initChartData,
		initObserverSubscriptions,
		cleanupSubscriptions,
		// 可见性控制方法
		getKlineVisibility,
		// getIndicatorVisibility,
	} = useBacktestChartStore(chartConfig);

	// 使用 useRef 存储 store 函数，避免依赖项变化导致无限渲染
	const storeActionsRef = useRef({
		klineData,
		indicatorData,
		setChartConfig,
		// setChartRef,
		initObserverSubscriptions,
		cleanupSubscriptions,
	});

	// 更新 ref 中的函数引用
	storeActionsRef.current = {
		klineData,
		indicatorData,
		setChartConfig,
		// setChartRef,
		initObserverSubscriptions,
		cleanupSubscriptions,
	};

	// 添加容器和图表 API 引用
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const chartApiRef = useRef<IChartApi | null>(null);

	// 不再需要暴露引用给外部组件，调试器在内部使用

	const { klineSeriesRef, legendData, onCrosshairMove } = useKlineLegend(
		(klineData[
			chartConfig.klineChartConfig.klineKeyStr
		] as CandlestickData[]) || [],
	);

	// 获取K线可见性状态（从当前图表的store中获取）
	const klineVisible = getKlineVisibility(
		chartConfig.klineChartConfig.klineKeyStr,
	);

	// 收集所有指标legend的ref
	const indicatorLegendRefs = useRef<
		Record<IndicatorKeyStr, MainChartIndicatorLegendRef | null>
	>({});
	// 收集所有子图指标的ref
	const subChartIndicatorRefs = useRef<
		Record<IndicatorKeyStr, SubChartIndicatorSeriesRef | null>
	>({});

	// 统一的crosshair事件处理函数
	const handleCrosshairMove = useCallback(
		(param: import("lightweight-charts").MouseEventParams) => {
			// 调用K线legend的onCrosshairMove
			onCrosshairMove(param);

			// 调用所有主图指标legend的onCrosshairMove
			Object.entries(indicatorLegendRefs.current).forEach(([_, ref]) => {
				if (ref?.onCrosshairMove) {
					ref.onCrosshairMove(param);
				}
			});

			// 调用所有子图指标的onCrosshairMove
			Object.entries(subChartIndicatorRefs.current).forEach(([_, ref]) => {
				if (ref?.onCrosshairMove) {
					ref.onCrosshairMove(param);
				}
			});
		},
		[onCrosshairMove],
	);

	// 处理动态 series ref 的回调函数
	// const handleSeriesRef = useCallback((keyStr: string, ref: SeriesApiRef<"Line"> | SeriesApiRef<"Histogram"> | SeriesApiRef<"Area">) => {
	// 	if (ref) {
	// 		addSeriesRef(keyStr, ref);
	// 	}
	// }, [addSeriesRef]);

	const playIndex = useRef(0);
	const getPlayIndex = useCallback(() => {
		get_play_index(strategyId).then((index) => {
			playIndex.current = index;
			initChartData(playIndex.current);
		});
	}, [strategyId, initChartData]);

	// 计算子图数量和获取容器高度
	const subChartCount = chartConfig.subChartConfigs.reduce(
		(count, subChartConfig) => {
			return (
				count +
				Object.keys(subChartConfig.indicatorChartConfigs).filter(
					(indicatorKeyStr) => {
						const indicatorConfig =
							subChartConfig.indicatorChartConfigs[indicatorKeyStr];
						return !indicatorConfig.isInMainChart;
					},
				).length
			);
		},
		0,
	);

	// 获取容器高度
	const getContainerHeight = useCallback(() => {
		if (chartContainerRef.current) {
			const rect = chartContainerRef.current.getBoundingClientRect();
			return rect.height || 600; // 默认600px
		}
		return 600;
	}, []);

	const containerHeight = getContainerHeight();

	// 初始化配置
	useEffect(() => {
		getPlayIndex();
	}, [getPlayIndex]);

	// 当子图数量变化时，重新应用高度配置
	useEffect(() => {
		if (chartApiRef.current) {
			// 减少延迟，确保 DOM 更新完成但减少闪烁
			const timer = setTimeout(() => {
				autoApplyPaneHeights(chartApiRef.current);
			}, 100); // 从 300ms 减少到 100ms

			return () => clearTimeout(timer);
		}
	}, []);

	// 手动调整图表大小的函数
	const resizeChart = useCallback(() => {
		if (chartApiRef.current && chartContainerRef.current) {
			const rect = chartContainerRef.current.getBoundingClientRect();
			chartApiRef.current.resize(rect.width, rect.height, true);
		}
	}, []);

	// 监听容器大小变化
	useEffect(() => {
		let resizeObserver: ResizeObserver | null = null;

		if (chartContainerRef.current) {
			resizeObserver = new ResizeObserver(() => {
				// 当容器大小变化时，手动调整图表大小
				setTimeout(resizeChart, 20);
			});
			resizeObserver.observe(chartContainerRef.current);
		}

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, [resizeChart]);

	// Chart onInit 回调 - 初始化 observer 订阅
	const handleChartInit = (chart: IChartApi) => {
		// storeActionsRef.current.setChartRef(chart);

		// 保存图表 API 引用
		chartApiRef.current = chart;

		// 延迟初始化 observer 订阅，确保所有引用都已设置
		setTimeout(() => {
			storeActionsRef.current.initObserverSubscriptions();
		}, 100);

		// 手动调整图表大小
		setTimeout(() => {
			resizeChart();
		}, 100);

		// 尽快应用 Pane 高度配置，减少闪烁
		setTimeout(() => {
			autoApplyPaneHeights(chartApiRef.current);
		}, 10); // 减少延迟时间
	};

	// 组件挂载后进行初始 resize
	useEffect(() => {
		const timer = setTimeout(() => {
			resizeChart();
		}, 300);

		return () => clearTimeout(timer);
	}, [resizeChart]);

	// 组件卸载时清理
	useEffect(() => {
		return () => {
			storeActionsRef.current.cleanupSubscriptions();
			chartApiRef.current = null;
			// 使用初始的 chartId 进行清理，避免因 chartId 变化导致错误清理
			cleanupBacktestChartStore(chartConfig);
		};
	}, [chartConfig]); // 移除依赖项，只在组件真正卸载时清理

	const chartOptions = {
		grid: {
			vertLines: {
				visible: false,
			},
			horzLines: {
				visible: false,
			},
		},
		crosshair: {
			mode: CrosshairMode.Normal,
			vertLine: {
				style: 3,
				color: "#080F25",
			},
			horzLine: {
				style: 3,
				color: "#080F25",
			},
		},
		layout: {
			panes: {
				separatorColor: "#080F25",
			},
		},
		localization: {
			timeFormatter: (time: Time) => {
				// 将时间戳转换为 yyyy-mm-dd hh:mm 格式
				if (typeof time === "number") {
					return dayjs(time * 1000).format("YYYY-MM-DD HH:mm");
				}

				if (typeof time === "object" && time !== null && "year" in time) {
					const date = new Date(time.year, time.month - 1, time.day);
					return dayjs(date).format("YYYY-MM-DD");
				}

				if (typeof time === "string") {
					return dayjs(time).format("YYYY-MM-DD");
				}

				return String(time);
			},
		},
		timeScale: {
			visible: true,
			timeVisible: true,
		},
	};

	return (
		<div ref={chartContainerRef} className="w-full h-full">
			{/* Chart API 调试器 */}
			{/* {process.env.NODE_ENV === 'development' && (
				<ChartApiDebugger
					chartApiRef={chartApiRef}
					containerRef={chartContainerRef}
				/>
			)} */}

			<div className="relative w-full h-full">
				<Chart
					options={chartOptions}
					onCrosshairMove={handleCrosshairMove}
					onInit={handleChartInit}
				>
					{/* <Pane> */}
					<CandlestickSeries
						ref={klineSeriesRef}
						data={
							(klineData[
								chartConfig.klineChartConfig.klineKeyStr
							] as CandlestickData[]) || []
						}
						options={{
							visible: klineVisible,
						}}
						reactive={true}
						alwaysReplaceData={false}
					/>
					{/* 图例 */}
					<KlineLegend
						klineSeriesData={legendData}
						klineKeyStr={chartConfig.klineChartConfig.klineKeyStr}
						chartConfig={chartConfig}
					/>
					{/* 添加主图指标 */}
					{Object.entries(
						chartConfig.klineChartConfig.indicatorChartConfig,
					).map(([indicatorKeyStr, indicatorConfig], index) => {
						const data =
							(indicatorData[indicatorKeyStr] as Record<
								keyof IndicatorValueConfig,
								SingleValueData[]
							>) || {};
						// 主图指标
						if (indicatorConfig.isInMainChart && data) {
							return (
								<>
									{/* 指标图例 - 根据索引调整位置 */}
									<MainChartIndicatorLegend
										key={`${indicatorKeyStr}-legend`}
										ref={(ref) => {
											if (ref) {
												indicatorLegendRefs.current[indicatorKeyStr] = ref;
											} else {
												delete indicatorLegendRefs.current[indicatorKeyStr];
											}
										}}
										indicatorKeyStr={indicatorKeyStr}
										data={data}
										index={index}
										chartConfig={chartConfig}
									/>
									{/* 指标系列 */}
									{indicatorConfig.seriesConfigs.map((seriesConfig) => {
										const seriesKeyStr = `${indicatorKeyStr}_${seriesConfig.name}`;

										return (
											<MainChartIndicatorSeries
												key={seriesKeyStr}
												seriesConfig={seriesConfig}
												data={
													(data[
														seriesConfig.indicatorValueKey
													] as SingleValueData[]) || []
												}
												indicatorKeyStr={indicatorKeyStr}
												chartConfig={chartConfig}
												// onSeriesRef={handleSeriesRef}
											/>
										);
									})}
								</>
							);
						}
						return null;
					})}
					{/* </Pane> */}

					{/* 添加子图指标 */}
					{(() => {
						let subChartIndex = 0; // 子图索引计数器
						return chartConfig.subChartConfigs.map((subChartConfig) => {
							return Object.entries(subChartConfig.indicatorChartConfigs).map(
								([indicatorKeyStr, indicatorConfig]) => {
									const data =
										(indicatorData[indicatorKeyStr] as Record<
											keyof IndicatorValueConfig,
											SingleValueData[]
										>) || {};
									// 子图指标
									if (!indicatorConfig.isInMainChart && data) {
										const currentSubChartIndex = subChartIndex++;
										return (
											<SubChartIndicatorSeries
												key={indicatorKeyStr}
												ref={(ref) => {
													if (ref) {
														subChartIndicatorRefs.current[indicatorKeyStr] =
															ref;
													} else {
														delete subChartIndicatorRefs.current[
															indicatorKeyStr
														];
													}
												}}
												indicatorKeyStr={indicatorKeyStr}
												indicatorChartConfig={indicatorConfig}
												data={data}
												subChartIndex={currentSubChartIndex}
												totalSubChartCount={subChartCount}
												containerHeight={containerHeight}
												chartConfig={chartConfig}
											/>
										);
									}
									return null;
								},
							);
						});
					})()}
				</Chart>
			</div>
		</div>
	);
};

export default BacktestChart;
