import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
	TrendingUp, 
	FileText, 
	CheckCircle, 
	Package,
	ChevronDown 
} from "lucide-react";
import BacktestOrderRecordTable from "@/components/table/backtest-order-record-table";
import StrategyControl from "./strategy-control";
import ChartManageButton from "./chart-manage-button";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import type { LayoutMode } from "@/types/chart";
import { Button } from "@/components/ui/button";
import OrderRecord, { type OrderRecordRef } from "./order-record";

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
	onCollapseDashboard?: () => void;
	isDashboardExpanded?: boolean;
}

export interface BacktestInfoTabsRef {
	clearOrderRecords: () => void;
}

// 临时占位组件
const ProfitCurvePanel = () => (
	<div className="flex items-center justify-center h-40 text-muted-foreground">
		<div className="text-center">
			<TrendingUp className="h-8 w-8 mx-auto mb-2" />
			<p>收益曲线图表</p>
			<p className="text-sm">即将实现...</p>
		</div>
	</div>
);

const TradeRecordPanel = () => (
	<div className="flex items-center justify-center h-40 text-muted-foreground">
		<div className="text-center">
			<CheckCircle className="h-8 w-8 mx-auto mb-2" />
			<p>成交记录表格</p>
			<p className="text-sm">即将实现...</p>
		</div>
	</div>
);

const PositionPanel = () => (
	<div className="flex items-center justify-center h-40 text-muted-foreground">
		<div className="text-center">
			<Package className="h-8 w-8 mx-auto mb-2" />
			<p>仓位信息</p>
			<p className="text-sm">即将实现...</p>
		</div>
	</div>
);

const BacktestInfoTabs = forwardRef<BacktestInfoTabsRef, BacktestInfoTabsProps>(({ 
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
	onCollapseDashboard,
	isDashboardExpanded
}, ref) => {
	const orderRecordRef = useRef<OrderRecordRef>(null);

	// 暴露清空订单记录的方法
	useImperativeHandle(ref, () => ({
		clearOrderRecords: () => {
			orderRecordRef.current?.clearOrders();
		}
	}), []);

	// 处理收起dashboard
	const handleCollapse = () => {
		onCollapseDashboard?.(); // 收起dashboard
	};

	return (
		<Tabs defaultValue="profit" value={activeTab} onValueChange={onTabChange} className="w-full h-full flex flex-col">
			{/* 固定在顶部的头部 */}
			<div className="grid grid-cols-3 items-center p-2 bg-white shrink-0 gap-2 border-b">
				{/* 左侧：Tab组件和收起按钮 */}
				<div className="flex items-center gap-2 justify-self-start min-w-0">
					<TabsList className="grid grid-cols-4 gap-1">
						<TabsTrigger value="profit" className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px]">
							<TrendingUp className="h-4 w-4 flex-shrink-0" />
							<span className="hidden xl:inline text-xs whitespace-nowrap">收益曲线</span>
						</TabsTrigger>
						<TabsTrigger value="positions" className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px]">
							<Package className="h-4 w-4 flex-shrink-0" />
							<span className="hidden xl:inline text-xs whitespace-nowrap">仓位</span>
						</TabsTrigger>
						<TabsTrigger value="orders" className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px]">
							<FileText className="h-4 w-4 flex-shrink-0" />
							<span className="hidden xl:inline text-xs whitespace-nowrap">订单记录</span>
						</TabsTrigger>
						<TabsTrigger value="trades" className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px]">
							<CheckCircle className="h-4 w-4 flex-shrink-0" />
							<span className="hidden xl:inline text-xs whitespace-nowrap">成交记录</span>
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
			<div className="flex-1 overflow-y-auto">
				<TabsContent value="profit" className="mt-4 mx-4">
					<ProfitCurvePanel />
				</TabsContent>
				
				<TabsContent value="orders" className="w-full overflow-hidden">
					<OrderRecord ref={orderRecordRef} strategyId={strategyId} />
				</TabsContent>
				
				<TabsContent value="trades" className="mt-4 mx-4">
					<TradeRecordPanel />
				</TabsContent>
				
				<TabsContent value="positions" className="mt-4 mx-4">
					<PositionPanel />
				</TabsContent>
			</div>
		</Tabs>
	);
});

BacktestInfoTabs.displayName = 'BacktestInfoTabs';

export default BacktestInfoTabs;