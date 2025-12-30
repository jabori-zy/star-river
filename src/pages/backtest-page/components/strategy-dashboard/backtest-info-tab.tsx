import {
	CheckCircle,
	ChevronDown,
	Cpu,
	FileCode,
	FileText,
	Package,
	SquareSigma,
	TrendingUp,
	Variable as VariableIcon,
} from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cleanupBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LayoutMode } from "@/types/chart";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import ChartManageButton from "./chart-manage-button";
import OperationResult, {
	type OperationResultRef,
} from "./operation-result";
import OrderRecord, { type OrderRecordRef } from "./order-record";
import PositionRecord, { type PositionRecordRef } from "./position-record";
import RunningLog, { type RunningLogRef } from "./running-log";
import StrategyBenchmark, {
	type StrategyBenchmarkRef,
} from "./strategy-benchmark";
import StrategyControl from "./strategy-control";
import StrategyStats from "./strategy-stats";
import StrategyVariable, {
	type StrategyVariableRef,
} from "./strategy-variable";
import TransactionRecord, {
	type TransactionRecordRef,
} from "./transaction-record";

interface BacktestInfoTabsProps {
	strategyId: number;
	onStop: () => void;
	addChart: (klineKeyStr: string) => void;
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
	clearRunningLogs: () => void;
	clearVariableEvents: () => void;
	clearPerformanceData: () => void;
	clearOperationResults: () => void;
}

const BacktestInfoTabs = forwardRef<BacktestInfoTabsRef, BacktestInfoTabsProps>(
	(
		{
			strategyId,
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
		const { t } = useTranslation();
		const orderRecordRef = useRef<OrderRecordRef>(null);
		const positionRecordRef = useRef<PositionRecordRef>(null);
		const runningLogRef = useRef<RunningLogRef>(null);
		const transactionRecordRef = useRef<TransactionRecordRef>(null);
		const variableRef = useRef<StrategyVariableRef>(null);
		const benchmarkRef = useRef<StrategyBenchmarkRef>(null);
		const operationResultRef = useRef<OperationResultRef>(null);
		// Expose methods for clearing order records and position records
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
				clearRunningLogs: () => {
					runningLogRef.current?.clearRunningLogs();
				},
				clearVariableEvents: () => {
					variableRef.current?.clearVariableEvents();
				},
				clearPerformanceData: () => {
					benchmarkRef.current?.clearPerformanceData();
				},
				clearOperationResults: () => {
					operationResultRef.current?.clearResults();
				},
			}),
			[],
		);

		// Handle tab switching, clear store data when switching from stats chart tab to other tabs
		const handleTabChange = useCallback(
			(value: string) => {
				// If currently on profit tab and switching to another tab, clear stats chart store
				if (activeTab === "profit" && value !== "profit") {
					cleanupBacktestStatsChartStore(strategyId);
				}

				onTabChange?.(value);
			},
			[activeTab, strategyId, onTabChange],
		);

		// Handle collapse dashboard
		const handleCollapse = () => {
			onCollapseDashboard?.(); // Collapse dashboard
		};

		return (
			<Tabs
				key={`tabs-${isDashboardExpanded ? "expanded" : "collapsed"}-${activeTab || "none"}`}
				value={activeTab}
				onValueChange={handleTabChange}
				className="w-full h-full flex flex-col"
			>
				{/* Header fixed at the top */}
				<div
					className={`grid grid-cols-3 items-center p-2 bg-white ${isDashboardExpanded ? "border-b" : ""}`}
				>
					{/* Left side: Tab components and collapse button */}
					<div className="flex items-center gap-2 justify-self-start min-w-0">
						<TabsList className="grid grid-cols-8 gap-1">
							<TabsTrigger
								value="performance"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px] overflow-hidden"
							>
								<TrendingUp className="h-4 w-4 shrink-0 xl:hidden" />
								<span className="hidden xl:block text-xs truncate">
									{t("desktop.backtestPage.dashboardTab.performance")}
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="positions"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px] overflow-hidden"
							>
								<Package className="h-4 w-4 shrink-0 xl:hidden" />
								<span className="hidden xl:block text-xs truncate">
									{t("desktop.backtestPage.dashboardTab.positions")}
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="orders"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px] overflow-hidden"
							>
								<FileText className="h-4 w-4 shrink-0 xl:hidden" />
								<span className="hidden xl:block text-xs truncate">
									{t("desktop.backtestPage.dashboardTab.orders")}
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="trades"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px] overflow-hidden"
							>
								<CheckCircle className="h-4 w-4 shrink-0 xl:hidden" />
								<span className="hidden xl:block text-xs truncate">
									{t("desktop.backtestPage.dashboardTab.transaction")}
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="logs"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px] overflow-hidden"
							>
								<FileCode className="h-4 w-4 shrink-0 xl:hidden" />
								<span className="hidden xl:block text-xs truncate">
									{t("desktop.backtestPage.dashboardTab.logs")}
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="variables"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px] overflow-hidden"
							>
								<VariableIcon className="h-4 w-4 shrink-0 xl:hidden" />
								<span className="hidden xl:block text-xs truncate">
									{t("desktop.backtestPage.dashboardTab.variables")}
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="benchmark"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px] overflow-hidden"
							>
								<Cpu className="h-4 w-4 shrink-0 xl:hidden" />
								<span className="hidden xl:block text-xs truncate">
									{t("desktop.backtestPage.dashboardTab.benchmark")}
								</span>
							</TabsTrigger>
							<TabsTrigger
								value="operation"
								className="flex items-center gap-1 px-1 xl:px-2 py-1 min-w-[32px] overflow-hidden"
							>
								<SquareSigma className="h-4 w-4 shrink-0 xl:hidden" />
								<span className="hidden xl:block text-xs truncate">
									{t("desktop.backtestPage.dashboardTab.operation")}
								</span>
							</TabsTrigger>
						</TabsList>

						{/* Collapse button */}
						{isDashboardExpanded && (
							<Button
								variant="ghost"
								onClick={handleCollapse}
								className="flex items-center justify-center p-1 rounded-md hover:bg-gray-100 transition-colors shrink-0"
								title="Collapse panel"
							>
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							</Button>
						)}
					</div>

					{/* Center: Playback control component - truly centered */}
					<div className="flex justify-center">
						<StrategyControl onStop={onStop} />
					</div>

					{/* Right side: Chart management component */}
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

				{/* Scrollable content area */}
				{isDashboardExpanded && activeTab && (
					<div
						className="flex-1 overflow-y-auto"
						style={{ scrollbarGutter: "stable" }} // This will cause the right margin to enlarge, resulting in inconsistent left and right margins
					>
						<TabsContent value="performance" className=" mx-2 h-200">
							<StrategyStats strategyId={strategyId} />
						</TabsContent>

						<TabsContent value="orders" className="w-full overflow-hidden">
							<div className="flex flex-col h-full pl-2 pr-4">
								<OrderRecord ref={orderRecordRef} strategyId={strategyId} />
							</div>
						</TabsContent>

						<TabsContent value="logs" className="w-full overflow-hidden">
							<div className="flex flex-col h-full pl-2 pr-4">
								<RunningLog ref={runningLogRef} strategyId={strategyId} />
							</div>
						</TabsContent>

						<TabsContent value="trades" className="w-full overflow-hidden">
							<div className="flex flex-col h-full pl-2 pr-4">
								<TransactionRecord
									ref={transactionRecordRef}
									strategyId={strategyId}
								/>
							</div>
						</TabsContent>

						<TabsContent
							value="positions"
							className="w-full overflow-hidden"
						>
							<div className="flex flex-col h-full pl-2 pr-4">
								<PositionRecord
									ref={positionRecordRef}
									strategyId={strategyId}
								/>
							</div>
						</TabsContent>
						<TabsContent value="variables" className="w-full overflow-hidden">
							<div className="flex flex-col h-full pl-2 pr-4">
								<StrategyVariable ref={variableRef} strategyId={strategyId} />
							</div>
						</TabsContent>
						<TabsContent value="benchmark" className="w-full overflow-hidden">
							<div className="flex flex-col h-full p-2">
								<StrategyBenchmark ref={benchmarkRef} strategyId={strategyId} />
							</div>
						</TabsContent>
						<TabsContent value="operation" className="w-full overflow-hidden">
							<div className="flex flex-col h-full pl-2 pr-4">
								<OperationResult
									ref={operationResultRef}
									strategyId={strategyId}
								/>
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
