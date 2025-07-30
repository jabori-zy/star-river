import dayjs from "dayjs";
import {
	CrosshairMode,
	type IChartApi,
	type TickMarkType,
	type Time,
	TimeFormatterFn,
} from "lightweight-charts";
import {
	CandlestickSeries,
	Chart,
	LineSeries,
	Pane,
	TimeScale,
	TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import React, { useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { get_play_index } from "@/service/strategy-control/backtest-strategy-control";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { useKlineChartStore } from "./klinechart-store";
import { KlineLegend, useLegend } from "./legend";

interface BacktestChartProps {
	strategyId: number;
	chartConfig: BacktestChartConfig;
}

const BacktestChart = ({ strategyId, chartConfig }: BacktestChartProps) => {
	console.log("chart refresh");
	const {
		klineData,
		initKlineData,
		stopSimulation,
		setSeriesRef,
		setChartRef,
		setKlineKeyStr,
		setEnabled,
		initObserverSubscriptions,
		cleanupSubscriptions,
	} = useKlineChartStore();

	const { ref, legendData, onCrosshairMove } = useLegend({ data: klineData });

	const playIndex = useRef(0);

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
		console.log("初始化 BacktestChart 配置:", { klineKeyStr, enabled });
		setKlineKeyStr(klineKeyStr);
		setEnabled(enabled);
		getPlayIndex();
	}, [
		chartConfig.klineChartConfig.klineKeyStr,
		setKlineKeyStr,
		setEnabled,
		getPlayIndex,
	]);

	// 设置series引用到store中，这样store就可以直接使用series.update方法
	useEffect(() => {
		const checkAndSetSeries = () => {
			if (ref.current) {
				const seriesApi = ref.current.api();
				if (seriesApi) {
					console.log("设置series引用到store:", seriesApi);
					setSeriesRef(ref.current);
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
	}, [ref, setSeriesRef]);

	// Chart onInit 回调 - 初始化 observer 订阅
	const handleChartInit = (chart: IChartApi) => {
		console.log("Chart 初始化完成:", chart);
		setChartRef(chart);

		// 延迟初始化 observer 订阅，确保所有引用都已设置
		setTimeout(() => {
			initObserverSubscriptions();
		}, 100);
	};

	// 组件卸载时清理
	useEffect(() => {
		return () => {
			console.log("BacktestChart 组件卸载，清理资源");
			cleanupSubscriptions();
			stopSimulation();
		};
	}, [cleanupSubscriptions, stopSimulation]);

	const chartOptions = {
		autoSize: true,
		width: 600,
		height: 400,
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
		<div className="space-y-4">
			{/* 图表容器 */}
			<Card className="w-full">
				<CardContent>
					<div className="relative h-96 w-full">
						<Chart
							options={chartOptions}
							onCrosshairMove={onCrosshairMove}
							onInit={handleChartInit}
						>
							<Pane>
								<CandlestickSeries ref={ref} data={klineData} reactive={true} />
								<KlineLegend klineSeriesData={legendData} />
							</Pane>
						</Chart>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default BacktestChart;
