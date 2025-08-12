import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels";
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
import StrategyDashboard, { type StrategyDashboardRef } from "./components/strategy-dashboard";
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
	// const [activeTab, setActiveTab] = useState<string | undefined>(undefined); // 当前选中的tab
	const [isDashboardExpanded, setIsDashboardExpanded] = useState<boolean>(false); // dashboard是否处于展开状态
	const dashboardPanelRef = useRef<ImperativePanelHandle>(null); // dashboard面板引用
	const strategyDashboardRef = useRef<StrategyDashboardRef>(null); // 策略面板引用
	const isValidStrategyId = strategyId !== null;

	// 监听策略SSE
	// useBacktestStrategySSE();

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
		// 注意：现在使用zustand管理状态，不再需要手动清空图表数据
		resetAllBacktestChartStore();
		// 清空订单记录
		strategyDashboardRef.current?.clearOrderRecords();
	};
	const onPlayOne = () => {
		playOne(strategyId);
	};

	// 处理Panel大小变化
	const handlePanelResize = (_sizes: number[]) => {
		// const dashboardSize = sizes[1]; // 第二个panel是dashboard
		if (dashboardPanelRef.current) {
			const isExpanded = dashboardPanelRef.current.isExpanded();
			if (isExpanded) {
				setIsDashboardExpanded(true);
			} else {
				setIsDashboardExpanded(false);
			}
		}
		// console.log("isDashboardExpanded", isDashboardExpanded)
		// const threshold = 8; // 阈值：当dashboard大小超过8%时激活第一个tab
		// const expandedThreshold = 5; // 判断是否为展开状态的阈值
		
		// // 更新展开状态
		// setIsDashboardExpanded(dashboardSize > expandedThreshold);
		
		// if (dashboardSize > threshold && !activeTab) {
		// 	// 当展开时，恢复之前的tab或默认选择第一个
		// 	const tabToActivate = lastActiveTab || "profit";
		// 	setActiveTab(tabToActivate);
		// } else if (dashboardSize <= threshold && activeTab) {
		// 	// 折叠时，记录当前选中的tab并取消选择
		// 	setLastActiveTab(activeTab);
		// 	setActiveTab(undefined);
		// }
	};

	// // 处理tab切换
	// const handleTabChange = (value: string) => {
	// 	setActiveTab(value);
		
		// 只有当dashboard处于未展开状态时，点击tab才需要设置高度
		// if (!isDashboardExpanded && dashboardPanelRef.current) {
		// 	const minExpandedSize = 50; // 展开后的最小尺寸
		// 	dashboardPanelRef.current.resize(minExpandedSize);
		// 	setIsDashboardExpanded(true); // 手动设置为展开状态
		// }
	// };

	// 处理收起dashboard
	const handleCollapseDashboard = () => {
		if (dashboardPanelRef.current) {
			dashboardPanelRef.current.collapse(); // 收起到最小尺寸
			setIsDashboardExpanded(false);
		}
	};



	return (
		<div className="h-screen flex flex-col overflow-hidden bg-gray-100">
			<BacktestWindowHeader
				strategyName={`策略 ${strategyId} 回测`}
				onQuit={handleQuit}
			/>

			{/* 回测窗口内容 */}
			<div className="flex flex-col h-full">
				<div className="m-2 mb-0 flex-1">
					<PanelGroup direction="vertical" className="h-full" onLayout={handlePanelResize}>
					<Panel defaultSize={80} minSize={30}>
						<div className="h-full rounded-lg border border-border shadow-md bg-white overflow-hidden">
							<ChartContainer
								strategyChartConfig={chartConfig}
								strategyId={strategyId}
							/>
						</div>
					</Panel>
					<PanelResizeHandle className="h-1 hover:bg-gray-400" />
					<Panel 
						defaultSize={20} 
						minSize={20} 
						ref={dashboardPanelRef}
						collapsedSize={20}
						collapsible={true}
						>
						<div className="h-full bg-white border-l border-t border-r border-border rounded-t-lg shadow-md flex flex-col overflow-hidden">
							<StrategyDashboard
								ref={strategyDashboardRef}
								strategyId={strategyId}
								isRunning={isRunning}
								onPlay={onPlay}
								onPlayOne={onPlayOne}
								onPause={onPause}
								onStop={onStop}
								onCollapseDashboard={handleCollapseDashboard}
								isDashboardExpanded={isDashboardExpanded}
							/>
						</div>
					</Panel>
					</PanelGroup>
				</div>
			</div>
		</div>
	);
}
