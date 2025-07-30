import dayjs from "dayjs";
import { CrosshairMode, type IChartApi, type Time } from "lightweight-charts";
import {
	CandlestickSeries,
	Chart,
	LineSeries,
	Pane,
} from "lightweight-charts-react-components";
import { useCallback, useEffect, useRef } from "react";
import { get_play_index } from "@/service/strategy-control/backtest-strategy-control";
import { SeriesType } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import {
	cleanupBacktestChartStore,
	useBacktestChartStore,
} from "./backtest-chart-store";
import { KlineLegend, useKlineLegend } from "./legend";

interface BacktestChartProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

const BacktestChart = ({ strategyId, chartConfig }: BacktestChartProps) => {
	const {
		chartData: klineData,
		initKlineData,
		setSeriesRef,
		setChartRef,
		setKlineKeyStr,
		setEnabled,
		initObserverSubscriptions,
		cleanupSubscriptions,
	} = useBacktestChartStore(chartConfig.id);

	// 添加容器和图表 API 引用
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const chartApiRef = useRef<IChartApi | null>(null);

	const { klineSeriesRef, legendData, onCrosshairMove } = useKlineLegend({data: klineData});

	const playIndex = useRef(0);

	// 存储初始的 chartId，用于组件卸载时的清理
	const initialChartIdRef = useRef(chartConfig.id);

	// 使用 useRef 存储 store 函数，避免依赖项变化导致无限渲染
	const storeActionsRef = useRef({
		setKlineKeyStr,
		setEnabled,
		initKlineData,
		setSeriesRef,
		setChartRef,
		initObserverSubscriptions,
		cleanupSubscriptions,
	});

	// 更新 ref 中的函数引用
	storeActionsRef.current = {
		setKlineKeyStr,
		setEnabled,
		initKlineData,
		setSeriesRef,
		setChartRef,
		initObserverSubscriptions,
		cleanupSubscriptions,
	};

	const getPlayIndex = useCallback(() => {
		get_play_index(strategyId).then((index) => {
			playIndex.current = index;
			initKlineData(playIndex.current);
		});
	}, [strategyId, initKlineData]);

	// 初始化配置
	useEffect(() => {
		const klineKeyStr = chartConfig.klineChartConfig.klineKeyStr;
		const enabled = true; // 默认启用 Observer 数据流
		console.log("初始化 BacktestChart 配置:", {
			chartId: chartConfig.id,
			klineKeyStr,
			enabled,
			reason: "useEffect triggered",
		});
		storeActionsRef.current.setKlineKeyStr(klineKeyStr);
		storeActionsRef.current.setEnabled(enabled);
		getPlayIndex();
	}, [
		chartConfig.klineChartConfig.klineKeyStr,
		chartConfig.id, // 只依赖 chartConfig.id，避免函数引用变化
		getPlayIndex,
	]);

	// 设置series引用到store中，这样store就可以直接使用series.update方法
	useEffect(() => {
		const checkAndSetSeries = () => {
			if (klineSeriesRef.current) {
				const seriesApi = klineSeriesRef.current.api();
				if (seriesApi) {
					storeActionsRef.current.setSeriesRef(klineSeriesRef.current);
					return true;
				} else {
					console.warn("series API尚未可用，稍后重试");
					return false;
				}
			}
			return false;
		};

		// 立即检查
		if (!checkAndSetSeries()) {
			// 如果立即检查失败，延迟重试
			const timer = setTimeout(() => {
				checkAndSetSeries();
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [klineSeriesRef]); // 只依赖 ref

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
				setTimeout(resizeChart, 50);
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
		storeActionsRef.current.setChartRef(chart);

		// 保存图表 API 引用
		chartApiRef.current = chart;

		// 延迟初始化 observer 订阅，确保所有引用都已设置
		setTimeout(() => {
			storeActionsRef.current.initObserverSubscriptions();
		}, 100);

		// // 手动调整图表大小
		// setTimeout(() => {
		// 	resizeChart();
		// }, 200);
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
			cleanupBacktestChartStore(initialChartIdRef.current);
		};
	}, []); // 移除依赖项，只在组件真正卸载时清理

	const chartOptions = {
		autoSize: false,
		// width: 400,
		// height: 600,
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
		<div ref={chartContainerRef} className="relative w-full h-full">
			<Chart
				options={chartOptions}
				onCrosshairMove={onCrosshairMove}
				onInit={handleChartInit}
			>
				<Pane>
					<CandlestickSeries
						ref={klineSeriesRef}
						data={klineData}
						reactive={true}
					/>
					{/* 图例 */}
					<KlineLegend klineSeriesData={legendData} />
					{/* 添加主图指标 */}
					{Object.entries(
						chartConfig.klineChartConfig.indicatorChartConfig,
					).map(([_, indicatorConfig]) => {
						// 主图指标
						if (indicatorConfig.isInMainChart) {
							return indicatorConfig.seriesConfigs.map((seriesConfig) => {
								if (seriesConfig.type === SeriesType.LINE) {
									return <LineSeries key={seriesConfig.name} data={[]} />;
								}
							});
						}
					})}
				</Pane>
			</Chart>
		</div>
	);
};

export default BacktestChart;
