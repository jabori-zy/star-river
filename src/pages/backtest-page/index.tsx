import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	getBacktestStrategyChartConfig,
	getStrategyCacheKeys,
	stopStrategy,
	updateBacktestStrategyChartConfig,
} from "@/service/strategy";
import {
	pause,
	play,
	playOne,
	stop,
} from "@/service/strategy-control/backtest-strategy-control";
import type {
	IndicatorChartConfig,
	LayoutMode,
	SubChartConfig,
} from "@/types/chart";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorKey, KlineKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import BacktestWindowHeader from "../../components/backtest/backtest-window-header";
import useBacktestStrategySSE from "../../hooks/sse/use-backtest-strategy-sse";
import BacktestControl from "./components/backtest-control";
import ChartContainer from "./components/chart-container";

export default function BacktestPage() {
	const navigate = useNavigate();

	// 创建ref来获取ChartContainer的清空方法
	const chartContainerRef = useRef<{ clearAllChartData: () => void }>(null);

	// 从URL路径获取strategyId参数
	const getStrategyIdFromPath = (): number | null => {
		const path = window.location.pathname;
		const match = path.match(/\/backtest\/(\d+)/);
		if (match && match[1]) {
			const id = parseInt(match[1], 10);
			return !Number.isNaN(id) && id > 0 ? id : null;
		}
		return null;
	};

	const [strategyId, setStrategyId] = useState<number | null>(
		getStrategyIdFromPath(),
	);
	const isValidStrategyId = strategyId !== null;

	// 监听策略SSE
	useBacktestStrategySSE();

	const [chartConfig, setChartConfig] = useState<BacktestStrategyChartConfig>({
		charts: [],
		layout: "vertical",
	});

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isRunning, setIsRunning] = useState<boolean>(false); // 是否正在回测
	const [configLoaded, setConfigLoaded] = useState<boolean>(false);

	// 获取策略缓存键
	const fetchCacheKeys = useCallback(async () => {
		try {
			if (!strategyId) return;
			const keys = await getStrategyCacheKeys(strategyId);
			const parsedKeyMap: Record<string, KlineKey | IndicatorKey> = {};
			console.log("keys", keys);

			keys.forEach((keyString) => {
				parsedKeyMap[keyString] = parseKey(keyString) as
					| KlineKey
					| IndicatorKey;
			});
			console.log("parsedKeyMap", parsedKeyMap);
			return parsedKeyMap;
		} catch (error) {
			console.error("获取策略缓存键失败:", error);
			return {};
		}
	}, [strategyId]);

	// 从后端获取图表配置
	const loadChartConfig = useCallback(
		async (strategyId: number) => {
			try {
				setIsLoading(true);
				const config = await getBacktestStrategyChartConfig(strategyId);
				console.log("从后端获取的配置:", config);

				// 如果后端返回的配置有效，则使用后端配置，否则默认生成一个配置
				if (config && config.charts && config.charts.length > 0) {
					setChartConfig({
						charts: config.charts || [],
						layout: config.layout || "vertical",
					});
				} else {
					// 图表配置为空，尝试自动创建默认图表
					const cacheKeys = await fetchCacheKeys();
					if (cacheKeys) {
						// 过滤出kline key（BacktestKlineCacheKey没有indicatorType属性）
						const klineKeys = Object.keys(cacheKeys).filter((key) => {
							const parsedKey = cacheKeys[key];
							return !("indicatorType" in parsedKey);
						});

						if (klineKeys.length > 0) {
							// 使用第一个kline key创建默认图表
							const firstKlineKey = klineKeys[0];
							const klineData = cacheKeys[firstKlineKey] as KlineKey;
							const defaultChart = {
								id: 1,
								chartName: `${klineData.symbol} ${klineData.interval}`,
								klineChartConfig: {
									klineKeyStr: firstKlineKey,
									upColor: "#FF0000",
									downColor: "#0000FF",
									indicatorChartConfig: {},
								},
								subChartConfigs: [],
							};

							setChartConfig({
								charts: [defaultChart],
								layout: "vertical",
							});
							console.log("自动创建默认图表:", defaultChart);
						} else {
							// 没有kline key，使用空配置
							setChartConfig({
								charts: [],
								layout: "vertical",
							});
						}
					} else {
						// 无法获取缓存键，使用空配置
					}
				}
				setConfigLoaded(true);
			} catch (error) {
				console.error("获取图表配置失败:", error);
				// 如果获取失败，使用默认配置
				setConfigLoaded(true);
				toast.error("获取图表配置失败", {
					description: "已使用默认配置，您可以重新添加图表",
					duration: 4000,
				});
			} finally {
				setIsLoading(false);
			}
		},
		[fetchCacheKeys],
	);

	// 保存图表配置到后端
	const saveChartConfig = async () => {
		if (!strategyId) return;

		try {
			setIsSaving(true);
			await updateBacktestStrategyChartConfig(strategyId, chartConfig);
			console.log("配置保存成功:", chartConfig);

			// 显示简洁的成功提示
			toast.success("图表配置保存成功");
		} catch (error) {
			console.error("保存图表配置失败:", error);
			toast.error("保存图表配置失败", {
				description: error instanceof Error ? error.message : "未知错误",
				duration: 4000,
			});
		} finally {
			setIsSaving(false);
		}
	};

	// 监听路径变化
	useEffect(() => {
		const handlePathChange = () => {
			const newStrategyId = getStrategyIdFromPath();
			setStrategyId(newStrategyId);
		};

		// 监听popstate事件（浏览器前进后退）
		window.addEventListener("popstate", handlePathChange);

		return () => {
			window.removeEventListener("popstate", handlePathChange);
		};
	}, []);

	// 当strategyId变化时，重新加载配置
	useEffect(() => {
		if (strategyId) {
			setConfigLoaded(false);
			loadChartConfig(strategyId);
		}
	}, [strategyId, loadChartConfig]);

	useEffect(() => {
		console.log("当前图表配置:", chartConfig);
	}, [chartConfig]);

	// 处理退出确认
	const handleQuit = async () => {
		try {
			if (strategyId) {
				console.log("正在停止策略...");
				await stopStrategy(strategyId);
				console.log("策略已停止");
			}
			return true; // 返回 true 表示可以关闭窗口
		} catch (error) {
			console.error("停止策略失败:", error);
			return true; // 即使失败也关闭窗口
		}
	};

	// 如果没有提供有效的strategyId，显示错误页面
	if (!isValidStrategyId) {
		return (
			<div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
				<Alert variant="destructive" className="max-w-md mb-4">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						缺少或无效的策略ID参数。请从策略页面正确启动回测。
					</AlertDescription>
				</Alert>
				<Button
					variant="outline"
					onClick={() => navigate("/")}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					返回策略列表
				</Button>
			</div>
		);
	}

	// 配置加载中的显示
	if (isLoading || !configLoaded) {
		return (
			<div className="h-screen flex flex-col overflow-hidden bg-gray-100">
				<BacktestWindowHeader
					strategyName={`策略 ${strategyId} 回测`}
					onQuit={handleQuit}
				/>
				<div className="flex items-center justify-center h-full">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-8 w-8 animate-spin" />
						<p className="text-muted-foreground">正在加载图表配置...</p>
					</div>
				</div>
			</div>
		);
	}

	// 添加图表
	const addChart = (klineCacheKeyStr: string, chartName: string) => {
		const chartId = chartConfig.charts.length + 1;
		setChartConfig((prev) => ({
			...prev,
			charts: [
				...prev.charts,
				{
					id: chartId,
					chartName: chartName,
					klineChartConfig: {
						klineKeyStr: klineCacheKeyStr,
						upColor: "#FF0000",
						downColor: "#0000FF",
						indicatorChartConfig: {},
					},
					subChartConfigs: [],
				},
			],
		}));
	};

	// 删除图表
	const onDelete = (chartId: number) => {
		// 判断是否是最后一个图表
		if (chartConfig.charts.length === 1) {
			toast.error("至少保留一个图表");
			return;
		}

		setChartConfig((prev) => ({
			...prev,
			charts: prev.charts.filter((chart) => chart.id !== chartId),
		}));
	};

	// 更新布局模式
	const updateLayout = (layout: LayoutMode) => {
		setChartConfig((prev) => ({
			...prev,
			layout,
		}));
	};

	// 更新图表的kline配置
	const onUpdateChart = (
		chartId: number,
		klineCacheKeyStr: string,
		chartName: string,
	) => {
		setChartConfig((prev) => ({
			...prev,
			charts: prev.charts.map((chart) =>
				chart.id === chartId
					? { ...chart, klineCacheKeyStr, chartName, indicatorCacheKeyStrs: [] }
					: chart,
			),
		}));
	};

	// 添加指标到图表
	const onAddMainChartIndicator = (
		chartId: number,
		indicatorKeyStr: string,
		indicatorChartConfig: IndicatorChartConfig,
	) => {
		console.log("添加主图指标: ", indicatorChartConfig);
		setChartConfig((prev) => ({
			...prev,
			charts: prev.charts.map((chart) =>
				chart.id === chartId
					? {
							...chart,
							klineChartConfig: {
								...chart.klineChartConfig,
								indicatorChartConfig: {
									...chart.klineChartConfig.indicatorChartConfig,
									[indicatorKeyStr]: indicatorChartConfig,
								},
							},
						}
					: chart,
			),
		}));
	};

	const onAddSubChartIndicator = (
		chartId: number,
		subChartConfig: SubChartConfig,
	) => {
		setChartConfig((prev) => ({
			...prev,
			charts: prev.charts.map((chart) =>
				chart.id === chartId
					? {
							...chart,
							subChartConfigs: [...chart.subChartConfigs, subChartConfig],
						}
					: chart,
			),
		}));
	};

	// 删除子图
	const onDeleteSubChart = (subChartId: number) => {
		console.log("删除子图: ", subChartId);
		setChartConfig((prev) => ({
			...prev,
			charts: prev.charts.map((chart) =>
				chart.subChartConfigs.find(
					(subChart) => subChart.subChartId === subChartId,
				)
					? {
							...chart,
							subChartConfigs: chart.subChartConfigs.filter(
								(subChart) => subChart.subChartId !== subChartId,
							),
						}
					: chart,
			),
		}));
	};

	// 播放策略
	const onPlay = () => {
		setIsRunning(true);
		play(strategyId);
	};
	const onPause = () => {
		setIsRunning(false);
		pause(strategyId);
	};
	const onStop = () => {
		setIsRunning(false);
		stop(strategyId);
		// 调用图表的清空方法
		if (chartContainerRef.current) {
			chartContainerRef.current.clearAllChartData();
		}
	};
	const onPlayOne = () => {
		playOne(strategyId);
	};

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-gray-100">
			<BacktestWindowHeader
				strategyName={`策略 ${strategyId} 回测`}
				onQuit={handleQuit}
			/>

			{/* 回测窗口内容 */}
			<div className="flex flex-col h-full overflow-hidden">
				<div className="flex-1 overflow-hidden m-2 rounded-lg border border-border shadow-md bg-white">
					<ChartContainer
						ref={chartContainerRef}
						strategyChartConfig={chartConfig}
						strategyId={strategyId}
						onDelete={onDelete}
						onUpdate={onUpdateChart}
						onAddMainChartIndicator={onAddMainChartIndicator}
						onAddSubChartIndicator={onAddSubChartIndicator}
						onDeleteSubChart={onDeleteSubChart}
					/>
				</div>
				<div className="flex items-center p-2 bg-white border-t">
					<BacktestControl
						strategyId={strategyId}
						strategyChartConfig={chartConfig}
						updateLayout={updateLayout}
						onAddChart={addChart}
						onSaveChart={saveChartConfig}
						isSaving={isSaving}
						isRunning={isRunning}
						onPlay={onPlay}
						onPlayOne={onPlayOne}
						onPause={onPause}
						onStop={onStop}
					/>
				</div>
			</div>
		</div>
	);
}
