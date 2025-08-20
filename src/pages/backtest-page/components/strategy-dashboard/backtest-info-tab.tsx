import {
	CheckCircle,
	ChevronDown,
	FileText,
	Package,
	TrendingUp,
} from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LayoutMode } from "@/types/chart";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import { cleanupBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import ChartManageButton from "./chart-manage-button";
import OrderRecord, { type OrderRecordRef } from "./order-record";
import PositionRecord, { type PositionRecordRef } from "./position-record";
import TransactionRecord, { type TransactionRecordRef } from "./transaction-record";
import StrategyControl from "./strategy-control";
import StrategyStats from "./strategy-stats";

interface BacktestInfoTabsProps {
	strategyId: number;
	isRunning: boolean;
	onPause: () => void;
	onPlay: () => void;
	onPlayOne: () => void;
	onStop: () => void;
	addChart: (klineCacheKeyStr: string, chartName: string) => void;
	chartConfig: BacktestStrategyChartConfig;
	saveChartConfig: () => void;
	isSaving: boolean;
	updateLayout: (layout: LayoutMode) => void;
	activeTab?: string;
	onTabChange?: (value: string) => void;
	onCollapsePanel?: () => void;
	isDashboardExpanded?: boolean;
}

export interface BacktestInfoTabsRef {
	clearOrderRecords: () => void;
	clearPositionRecords: () => void;
	clearTransactionRecords: () => void;
}


const BacktestInfoTabs = forwardRef<BacktestInfoTabsRef, BacktestInfoTabsProps>(
	(
		{
			strategyId,
			isRunning,
			onPause,
			onPlay,
			onPlayOne,
			onStop,
			addChart,
			chartConfig,
			saveChartConfig,
			isSaving,
			updateLayout,
			activeTab,
			onTabChange,
			onCollapsePanel: onCollapseDashboard,
			isDashboardExpanded,
		},
		ref,
	) => {
		const orderRecordRef = useRef<OrderRecordRef>(null);
		const positionRecordRef = useRef<PositionRecordRef>(null);
		const transactionRecordRef = useRef<TransactionRecordRef>(null);
		
		// 暴露清空订单记录和持仓记录的方法
		useImperativeHandle(
			ref,
			() => ({
				clearOrderRecords: () => {
					orderRecordRef.current?.clearOrders();
				},
				clearPositionRecords: () => {
					positionRecordRef.current?.clearPositions();
				},
				clearTransactionRecords: () => {
					transactionRecordRef.current?.clearTransactions();
				},
			}),
			[],
		);

		// 处理tab切换，当从统计图表tab切换到其他tab时清空store数据
		const handleTabChange = useCallback((value: string) => {
			// 如果当前是profit tab且要切换到其他tab，清空统计图表store
			if (activeTab === "profit" && value !== "profit") {
				cleanupBacktestStatsChartStore(strategyId);
			}
			
			onTabChange?.(value);
		}, [activeTab, strategyId, onTabChange]);

		// 处理收起dashboard
		const handleCollapse = () => {
			onCollapseDashboard?.(); // 收起dashboard
		};

		return (
			<Tabs
				key={`tabs-${isDashboardExpanded ? "expanded" : "collapsed"}-${activeTab || "none"}`}
				value={activeTab}
				onValueChange={handleTabChange}
				className="w-full h-full flex flex-col"
			>
				{/* 固定在顶部的头部 */}
				<div
					className={`grid grid-cols-3 items-center p-2 bg-white ${isDashboardExpanded ? "border-b" : ""}`}
				>
					{/* 左侧：Tab组件和收起按钮 */}
					<div className="flex items-center gap-2 justify-self-start min-w-0">
						<TabsList className="grid grid-cols-4 gap-1">
							<TabsTrigger
								value="profit"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px]"
							>
								<TrendingUp className="h-4 w-4 flex-shrink-0" />
								<span className="hidden xl:inline text-xs whitespace-nowrap">
									策略表现
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="positions"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px]"
							>
								<Package className="h-4 w-4 flex-shrink-0" />
								<span className="hidden xl:inline text-xs whitespace-nowrap">
									仓位
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="orders"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px]"
							>
								<FileText className="h-4 w-4 flex-shrink-0" />
								<span className="hidden xl:inline text-xs whitespace-nowrap">
									订单记录
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="trades"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px]"
							>
								<CheckCircle className="h-4 w-4 flex-shrink-0" />
								<span className="hidden xl:inline text-xs whitespace-nowrap">
									成交记录
								</span>
							</TabsTrigger>
						</TabsList>

						{/* 收起按钮 */}
						{isDashboardExpanded && (
							<Button
								variant="ghost"
								onClick={handleCollapse}
								className="flex items-center justify-center p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
								title="收起面板"
							>
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							</Button>
						)}
					</div>

					{/* 中央：播放控制组件 - 真正居中 */}
					<div className="flex justify-center">
						<StrategyControl
							isRunning={isRunning}
							onPause={onPause}
							onPlay={onPlay}
							onPlayOne={onPlayOne}
							onStop={onStop}
						/>
					</div>

					{/* 右侧：图表管理组件 */}
					<div className="flex justify-end">
						<ChartManageButton
							onAddChart={addChart}
							saveChartConfig={saveChartConfig}
							isSaving={isSaving}
							strategyChartConfig={chartConfig}
							updateLayout={updateLayout}
						/>
					</div>
				</div>

				{/* 可滚动的内容区域 */}
				{isDashboardExpanded && activeTab && (
					<div
						className="flex-1 overflow-y-auto"
						style={{ scrollbarGutter: "stable" }} // 这里会造成右侧边距放大，造成左右边距不一致
					>
						<TabsContent value="profit" className="mt-2 mx-6 h-96">
							<StrategyStats strategyId={strategyId} />
						</TabsContent>

						<TabsContent value="orders" className="w-full overflow-hidden">
							<div className="flex flex-col h-full pl-2">
								<OrderRecord ref={orderRecordRef} strategyId={strategyId} />
							</div>
						</TabsContent>

						<TabsContent value="trades" className="w-full overflow-hidden">
							<div className="flex flex-col h-full pl-2">
								<TransactionRecord ref={transactionRecordRef} strategyId={strategyId} />
							</div>
						</TabsContent>

						<TabsContent value="positions" className="w-full overflow-hidden mt-2">
							<div className="flex flex-col h-full pl-2">
								<PositionRecord ref={positionRecordRef} strategyId={strategyId} />
							</div>
						</TabsContent>
					</div>
				)}
			</Tabs>
		);
	},
);

BacktestInfoTabs.displayName = "BacktestInfoTabs";

export default BacktestInfoTabs;
