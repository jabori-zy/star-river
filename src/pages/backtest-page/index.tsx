import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { stopStrategy } from "@/service/strategy";

import {
	pause,
	play,
	playOne,
	stop,
} from "@/service/backtest-strategy/backtest-strategy-control";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import BacktestWindowHeader from "../../components/backtest/backtest-window-header";
import useBacktestStrategySSE from "../../hooks/sse/use-backtest-strategy-sse";
import BacktestControl from "./components/backtest-control";
import ChartContainer from "./components/chart-container";
import { resetAllBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";

export default function BacktestPage() {
	const navigate = useNavigate();
	const params = useParams<{ strategyId: string }>();

	// 使用zustand store
	const {
		chartConfig,
		isLoading,
		configLoaded,
		strategyId,
		setStrategyId,
		loadChartConfig,
	} = useBacktestChartConfigStore();

	// 从URL参数获取strategyId
	const getStrategyIdFromParams = useCallback((): number | null => {
		if (params.strategyId) {
			const id = parseInt(params.strategyId, 10);
			return !Number.isNaN(id) && id > 0 ? id : null;
		}
		return null;
	}, [params]);

	const [isRunning, setIsRunning] = useState<boolean>(false); // 是否正在回测
	const isValidStrategyId = strategyId !== null;

	// 监听策略SSE
	useBacktestStrategySSE();

	// 当URL参数变化时，更新store中的strategyId
	useEffect(() => {
		const urlStrategyId = getStrategyIdFromParams();
		if (urlStrategyId !== strategyId) {
			setStrategyId(urlStrategyId);
		}
	}, [getStrategyIdFromParams, setStrategyId, strategyId]);

	// 当strategyId变化时，重新加载配置
	useEffect(() => {
		if (strategyId) {
			loadChartConfig(strategyId);
		}
	}, [strategyId, loadChartConfig]);

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
		resetAllBacktestChartStore();
		// 注意：现在使用zustand管理状态，不再需要手动清空图表数据
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
						strategyChartConfig={chartConfig}
						strategyId={strategyId}
					/>
				</div>
				<div className="flex items-center p-2 bg-white border-t">
					<BacktestControl
						strategyId={strategyId}
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
