import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelHandle } from "react-resizable-panels";
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
// import useBacktestStrategySSE from "../../hooks/sse/use-backtest-strategy-sse";
import StrategyDashboard, { type StrategyDashboardRef } from "./components/strategy-dashboard";
import ChartContainer from "./components/chart-container";
import { resetAllBacktestChartStore } from "@/components/chart/backtest-chart/backtest-chart-store";
import { resetAllBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import { calculateDashboardSize, getDashboardPanelConfig } from "./utils";

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
	const [activeTab, setActiveTab] = useState<string | undefined>(undefined); // 当前选中的tab
	const [lastActiveTab, setLastActiveTab] = useState<string | undefined>(undefined); // 上一次选中的tab
	const [isDashboardExpanded, setIsDashboardExpanded] = useState<boolean>(false); // dashboard是否处于展开状态
	const [expandTrigger, setExpandTrigger] = useState<'tab' | 'drag' | null>(null); // 展开触发方式
	const dashboardPanelRef = useRef<ImperativePanelHandle>(null); // dashboard面板引用
	const chartContainerPanelRef = useRef<ImperativePanelHandle>(null); // 图表容器面板引用
	const strategyDashboardRef = useRef<StrategyDashboardRef>(null); // 策略面板引用
	const isValidStrategyId = strategyId !== null;
	
	// 计算控制栏的最小高度百分比
	const initialSize = calculateDashboardSize();
	const [dashboardMinSize, setDashboardMinSize] = useState<number>(initialSize);
	const [dashboardCollapsedSize, setDashboardCollapsedSize] = useState<number>(initialSize);
	const [dashboardDefaultSize, setDashboardDefaultSize] = useState<number>(initialSize);

	

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


	// 窗口大小监控
	useEffect(() => {
		const handleResize = () => {
			// 获取新的面板配置
			const config = getDashboardPanelConfig();
			
			// 设置新的尺寸
			setDashboardMinSize(config.minSize);
			setDashboardCollapsedSize(config.collapsedSize);
			setDashboardDefaultSize(config.defaultSize);
			
			// 如果面板已存在且未展开，确保其大小正确
			if (dashboardPanelRef.current && !isDashboardExpanded) {
				const currentSize = dashboardPanelRef.current.getSize();
				
				// 强制调整到精确的最小尺寸，确保贴合底部
				if (Math.abs(currentSize - config.minSize) > 0.1) {
					dashboardPanelRef.current.resize(config.minSize);
				}
			}
		};

		// 初始计算
		handleResize();

		// 添加事件监听器
		window.addEventListener('resize', handleResize);

		// 清理事件监听器
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [isDashboardExpanded]);

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
		resetAllBacktestStatsChartStore();
		// 清空订单记录
		strategyDashboardRef.current?.clearOrderRecords();
		strategyDashboardRef.current?.clearPositionRecords();
		strategyDashboardRef.current?.clearTransactionRecords();
		strategyDashboardRef.current?.clearRunningLogs();
	};
	const onPlayOne = () => {
		playOne(strategyId);
	};

	// 处理面板展开
	const handlePanelExpand = () => {
		setIsDashboardExpanded(true);
		
		// 如果没有触发标识（拖拽展开）且有上次的tab，则恢复
		if (expandTrigger === "drag" && lastActiveTab) {
			setActiveTab(lastActiveTab);
		}

		if (expandTrigger === "drag" && !lastActiveTab) {
			setActiveTab("profit");
		}
		
		// 重置触发标识
		setExpandTrigger(null);
	};

	// 处理面板折叠
	const handleOnPanelCollapse = () => {
		setIsDashboardExpanded(false);
		setLastActiveTab(activeTab);
		setActiveTab(undefined);
		setExpandTrigger(null);
		
	};

	// 处理tab切换
	const handleTabChange = (value: string) => {
		setActiveTab(value); // 设置当前选中的tab
		
		// 只有当dashboard处于未展开状态时，点击tab才需要展开
		if (!isDashboardExpanded && dashboardPanelRef.current) {
			setExpandTrigger('tab'); // 标记为tab触发的展开
			const minExpandedSize = 50; // 展开后的最小尺寸
			dashboardPanelRef.current.resize(minExpandedSize);
		}
		// 重置触发标识
		setExpandTrigger(null);
	};

	// 处理点击折叠按钮
	const handleCollapsePanel = () => {
		if (dashboardPanelRef.current) {
			setLastActiveTab(activeTab); // 在折叠前保存当前tab
			dashboardPanelRef.current.collapse(); // 收起到最小尺寸，会触发onCollapse回调
		}
	};

	const handlePanelPointerUp = () => setExpandTrigger(null);
	const handlePanelPointerDown = () => setExpandTrigger("drag");

	



	return (
		<div className="h-screen flex flex-col overflow-hidden bg-gray-100">
			<div className="flex-shrink-0 border-b ">
				<BacktestWindowHeader
					strategyName={`策略 ${strategyId} 回测`}
					onQuit={handleQuit}
				/>

			</div>
			

			{/* 回测窗口内容 */}
			<div className="flex-1 flex flex-col overflow-hidden">
				<PanelGroup direction="vertical" className="flex-1">
					<Panel defaultSize={100 - dashboardDefaultSize} minSize={30} ref={chartContainerPanelRef}>
						<div className="h-full  bg-white overflow-hidden">
							<ChartContainer
								strategyChartConfig={chartConfig}
								strategyId={strategyId}
							/>
						</div>
					</Panel>
					<PanelResizeHandle 
						className="h-1 hover:bg-gray-400"
						onPointerUp={handlePanelPointerUp}
						onPointerDown={handlePanelPointerDown}
						 />
					<Panel
						defaultSize={dashboardDefaultSize}
						minSize={dashboardMinSize} 
						ref={dashboardPanelRef}
						collapsedSize={dashboardCollapsedSize}
						collapsible={true}
						onExpand={handlePanelExpand}
						onCollapse={handleOnPanelCollapse}
						>
						<div className="h-full bg-white border-l border-t border-r border-border shadow-md flex flex-col overflow-hidden">
							<StrategyDashboard
								ref={strategyDashboardRef}
								strategyId={strategyId}
								isRunning={isRunning}
								onPlay={onPlay}
								onPlayOne={onPlayOne}
								onPause={onPause}
								onStop={onStop}
								onCollapsePanel={handleCollapsePanel}
								onTabChange={handleTabChange}
								activeTab={activeTab}
								isDashboardExpanded={isDashboardExpanded}
							/>
						</div>
					</Panel>
				</PanelGroup>
			</div>
		</div>
	);
}
