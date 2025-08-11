import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
	TrendingUp, 
	FileText, 
	CheckCircle, 
	Package 
} from "lucide-react";
import BacktestOrderRecordTable from "@/components/table/backtest-order-record-table";
import StrategyControl from "./strategy-control";
import ChartManageButton from "./chart-manage-button";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import type { LayoutMode } from "@/types/chart";

interface BacktestInfoTabsProps {
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

const BacktestInfoTabs: React.FC<BacktestInfoTabsProps> = ({ 
	isRunning, 
	onPause, 
	onPlay, 
	onPlayOne, 
	onStop, 
	addChart, 
	chartConfig, 
	saveChartConfig, 
	isSaving,
	updateLayout
}) => {
	return (
		<Tabs defaultValue="profit" className="w-full">
			<div className="flex items-center mb-6">
				{/* 左侧：Tab组件 */}
				<TabsList className="grid grid-cols-4 mr-auto">
					<TabsTrigger value="profit" className="flex items-center gap-1">
						<TrendingUp className="h-4 w-4" />
						<span className="hidden sm:inline">收益曲线</span>
					</TabsTrigger>
					<TabsTrigger value="orders" className="flex items-center gap-1">
						<FileText className="h-4 w-4" />
						<span className="hidden sm:inline">订单记录</span>
					</TabsTrigger>
					<TabsTrigger value="trades" className="flex items-center gap-1">
						<CheckCircle className="h-4 w-4" />
						<span className="hidden sm:inline">成交记录</span>
					</TabsTrigger>
					<TabsTrigger value="positions" className="flex items-center gap-1">
						<Package className="h-4 w-4" />
						<span className="hidden sm:inline">仓位</span>
					</TabsTrigger>
				</TabsList>
				
				{/* 中央：播放控制组件 */}
				<div className="flex-1 flex justify-center">
					<StrategyControl
						isRunning={isRunning}
						onPause={onPause}
						onPlay={onPlay}
						onPlayOne={onPlayOne}
						onStop={onStop}
					/>
				</div>
				
				{/* 右侧：图表管理组件 */}
				<ChartManageButton
					onAddChart={addChart}
					saveChartConfig={saveChartConfig}
					isSaving={isSaving}
					strategyChartConfig={chartConfig}
					updateLayout={updateLayout}
				/>
			</div>
			
			<TabsContent value="profit" className="mt-4">
				<ProfitCurvePanel />
			</TabsContent>
			
			<TabsContent value="orders" className="">
				<BacktestOrderRecordTable title="订单记录" showTitle={false} />
			</TabsContent>
			
			<TabsContent value="trades" className="mt-4">
				<TradeRecordPanel />
			</TabsContent>
			
			<TabsContent value="positions" className="mt-4">
				<PositionPanel />
			</TabsContent>
		</Tabs>
	);
};

export default BacktestInfoTabs;