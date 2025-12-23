import type { IChartApi } from "lightweight-charts";
import {
	Bug,
	ChevronDown,
	ChevronRight,
	Copy,
	Eye,
	EyeOff,
	RefreshCw,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorKeyStr, OperationKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "../backtest-chart-store";

interface ChartDebugPanelProps {
	chartConfig: BacktestChartConfig;
	chartApiRef?: React.RefObject<IChartApi | null>;
}

interface CollapsibleSectionProps {
	title: string;
	badge?: string | number;
	defaultOpen?: boolean;
	children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
	title,
	badge,
	defaultOpen = false,
	children,
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-sm hover:bg-gray-200 transition-colors">
				<div className="flex items-center gap-2">
					{isOpen ? (
						<ChevronDown size={12} />
					) : (
						<ChevronRight size={12} />
					)}
					<span className="text-xs font-medium">{title}</span>
				</div>
				{badge !== undefined && (
					<Badge variant="secondary" className="text-xs">
						{badge}
					</Badge>
				)}
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-2">{children}</CollapsibleContent>
		</Collapsible>
	);
};

const ChartDebugPanel: React.FC<ChartDebugPanelProps> = ({ chartConfig }) => {
	const [isOpen, setIsOpen] = useState(false);
	// Refresh version for manual data recalculation
	const [refreshVersion, setRefreshVersion] = useState(0);

	const handleRefresh = () => {
		setRefreshVersion((v) => v + 1);
	};

	const {
		getChartRef,
		getKlineSeriesRef,
		indicatorSeriesRef,
		operationSeriesRef,
		indicatorSubChartPaneRef,
		operationSubChartPaneRef,
		paneVersion,
		getIndicatorVisibility,
		toggleIndicatorVisibility,
	} = useBacktestChartStore(chartConfig.id);

	const { removeIndicator, removeOperation } = useBacktestChartConfigStore();

	// Statistics
	const stats = useMemo(() => {
		const chart = getChartRef();
		const klineSeries = getKlineSeriesRef();

		// Indicator statistics
		const mainIndicators = chartConfig.indicatorChartConfigs.filter(
			(c) => c.isInMainChart && !c.isDelete,
		);
		const subIndicators = chartConfig.indicatorChartConfigs.filter(
			(c) => !c.isInMainChart && !c.isDelete,
		);
		const deletedIndicators = chartConfig.indicatorChartConfigs.filter(
			(c) => c.isDelete,
		);

		// Operation statistics
		const mainOperations = (chartConfig.operationChartConfigs || []).filter(
			(c) => c.isInMainChart && !c.isDelete,
		);
		const subOperations = (chartConfig.operationChartConfigs || []).filter(
			(c) => !c.isInMainChart && !c.isDelete,
		);
		const deletedOperations = (
			chartConfig.operationChartConfigs || []
		).filter((c) => c.isDelete);

		// Series ref counts
		const indicatorSeriesCount = Object.keys(indicatorSeriesRef).length;
		const operationSeriesCount = Object.keys(operationSeriesRef).length;

		// Pane counts
		const indicatorPaneCount = Object.keys(indicatorSubChartPaneRef).filter(
			(k) => indicatorSubChartPaneRef[k as IndicatorKeyStr] !== null,
		).length;
		const operationPaneCount = Object.keys(operationSubChartPaneRef).filter(
			(k) => operationSubChartPaneRef[k as OperationKeyStr] !== null,
		).length;

		return {
			chartId: chartConfig.id,
			chartName: chartConfig.chartName,
			paneCount: chart?.panes().length ?? 0,
			klineDataCount: klineSeries?.data().length ?? 0,
			mainIndicators: mainIndicators.length,
			subIndicators: subIndicators.length,
			deletedIndicators: deletedIndicators.length,
			mainOperations: mainOperations.length,
			subOperations: subOperations.length,
			deletedOperations: deletedOperations.length,
			indicatorSeriesCount,
			operationSeriesCount,
			indicatorPaneCount,
			operationPaneCount,
			paneVersion,
		};
	}, [
		chartConfig,
		getChartRef,
		getKlineSeriesRef,
		indicatorSeriesRef,
		operationSeriesRef,
		indicatorSubChartPaneRef,
		operationSubChartPaneRef,
		paneVersion,
		refreshVersion,
	]);

	// Copy config to clipboard
	const handleCopyConfig = () => {
		const configStr = JSON.stringify(chartConfig, null, 2);
		navigator.clipboard
			.writeText(configStr)
			.then(() => {
				toast.success("Config copied to clipboard");
			})
			.catch(() => {
				toast.error("Failed to copy config");
			});
	};

	// Get series data counts from series refs
	const getSeriesDataCounts = useMemo(() => {
		const counts: Record<string, Record<string, number>> = {
			indicators: {},
			operations: {},
		};

		// Indicator data counts from series refs
		Object.entries(indicatorSeriesRef).forEach(([key, seriesMap]) => {
			if (seriesMap) {
				let totalCount = 0;
				Object.values(seriesMap).forEach((series) => {
					if (series) {
						try {
							totalCount += series.data().length;
						} catch {
							// Series may be disposed
						}
					}
				});
				counts.indicators[key] = totalCount;
			}
		});

		// Operation data counts from series refs
		Object.entries(operationSeriesRef).forEach(([key, seriesMap]) => {
			if (seriesMap) {
				let totalCount = 0;
				Object.values(seriesMap).forEach((series) => {
					if (series) {
						try {
							totalCount += series.data().length;
						} catch {
							// Series may be disposed
						}
					}
				});
				counts.operations[key] = totalCount;
			}
		});

		return counts;
	}, [indicatorSeriesRef, operationSeriesRef, refreshVersion]);

	const dataCounts = getSeriesDataCounts;

	// Print full debug info
	const handlePrintDebugInfo = () => {
		console.group("Chart Debug Info");
		console.log("Chart Config:", chartConfig);
		console.log("Statistics:", stats);
		console.log("Indicator Series Refs:", indicatorSeriesRef);
		console.log("Operation Series Refs:", operationSeriesRef);
		console.log("Indicator Pane Refs:", indicatorSubChartPaneRef);
		console.log("Operation Pane Refs:", operationSubChartPaneRef);
		console.log("Data Counts:", dataCounts);
		console.groupEnd();
	};

	if (!isOpen) {
		return (
			<Button
				variant="outline"
				size="sm"
				className="fixed top-4 right-4 z-50 bg-white shadow-lg"
				onClick={() => setIsOpen(true)}
			>
				<Bug size={16} />
				Debug
			</Button>
		);
	}

	return (
		<Card className="fixed top-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto bg-white shadow-lg">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm flex items-center gap-2">
						<Bug size={14} />
						Chart Debug Panel
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0"
						onClick={() => setIsOpen(false)}
					>
						<X size={12} />
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0 space-y-3">
				{/* Quick Actions */}
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="h-7 text-xs flex-1"
						onClick={handleRefresh}
						title="Refresh statistics"
					>
						<RefreshCw size={10} className="mr-1" />
						Refresh
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-7 text-xs flex-1"
						onClick={handleCopyConfig}
					>
						<Copy size={10} className="mr-1" />
						Copy Config
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-7 text-xs flex-1"
						onClick={handlePrintDebugInfo}
					>
						<Bug size={10} className="mr-1" />
						Print Debug
					</Button>
				</div>

				{/* Statistics Overview */}
				<CollapsibleSection
					title="Statistics"
					badge={`${stats.mainIndicators + stats.subIndicators} indicators`}
					defaultOpen
				>
					<div className="grid grid-cols-2 gap-2 text-xs">
						<div className="p-2 bg-blue-50 rounded">
							<div className="font-medium text-blue-800">Chart</div>
							<div className="text-blue-600">ID: {stats.chartId}</div>
							<div className="text-blue-600">Panes: {stats.paneCount}</div>
							<div className="text-blue-600">
								Kline Data: {stats.klineDataCount}
							</div>
							<div className="text-blue-600">
								Pane Version: {stats.paneVersion}
							</div>
						</div>
						<div className="p-2 bg-green-50 rounded">
							<div className="font-medium text-green-800">Indicators</div>
							<div className="text-green-600">Main: {stats.mainIndicators}</div>
							<div className="text-green-600">Sub: {stats.subIndicators}</div>
							<div className="text-green-600">
								Deleted: {stats.deletedIndicators}
							</div>
						</div>
						<div className="p-2 bg-purple-50 rounded">
							<div className="font-medium text-purple-800">Operations</div>
							<div className="text-purple-600">Main: {stats.mainOperations}</div>
							<div className="text-purple-600">Sub: {stats.subOperations}</div>
							<div className="text-purple-600">
								Deleted: {stats.deletedOperations}
							</div>
						</div>
						<div className="p-2 bg-orange-50 rounded">
							<div className="font-medium text-orange-800">Refs</div>
							<div className="text-orange-600">
								Indicator Series: {stats.indicatorSeriesCount}
							</div>
							<div className="text-orange-600">
								Operation Series: {stats.operationSeriesCount}
							</div>
							<div className="text-orange-600">
								Indicator Panes: {stats.indicatorPaneCount}
							</div>
							<div className="text-orange-600">
								Operation Panes: {stats.operationPaneCount}
							</div>
						</div>
					</div>
				</CollapsibleSection>

				<Separator />

				{/* Indicator Series Refs */}
				<CollapsibleSection
					title="Indicator Series Refs"
					badge={Object.keys(indicatorSeriesRef).length}
				>
					<div className="space-y-1 max-h-40 overflow-y-auto">
						{Object.keys(indicatorSeriesRef).length === 0 ? (
							<div className="text-xs text-gray-500">No indicator series</div>
						) : (
							Object.entries(indicatorSeriesRef).map(([key, seriesMap]) => (
								<div key={key} className="p-2 bg-gray-50 rounded text-xs">
									<div className="font-medium truncate" title={key}>
										{key.split("|").pop()}
									</div>
									<div className="text-gray-500">
										Series: {Object.keys(seriesMap || {}).join(", ") || "none"}
									</div>
									<div className="text-gray-500">
										Data: {dataCounts.indicators[key] ?? 0} points
									</div>
								</div>
							))
						)}
					</div>
				</CollapsibleSection>

				{/* Operation Series Refs */}
				<CollapsibleSection
					title="Operation Series Refs"
					badge={Object.keys(operationSeriesRef).length}
				>
					<div className="space-y-1 max-h-40 overflow-y-auto">
						{Object.keys(operationSeriesRef).length === 0 ? (
							<div className="text-xs text-gray-500">No operation series</div>
						) : (
							Object.entries(operationSeriesRef).map(([key, seriesMap]) => (
								<div key={key} className="p-2 bg-gray-50 rounded text-xs">
									<div className="font-medium truncate" title={key}>
										{key.split("|").pop()}
									</div>
									<div className="text-gray-500">
										Series: {Object.keys(seriesMap || {}).join(", ") || "none"}
									</div>
									<div className="text-gray-500">
										Data: {dataCounts.operations[key] ?? 0} points
									</div>
								</div>
							))
						)}
					</div>
				</CollapsibleSection>

				{/* Pane Refs */}
				<CollapsibleSection
					title="Subchart Pane Refs"
					badge={stats.indicatorPaneCount + stats.operationPaneCount}
				>
					<div className="space-y-2">
						<div className="text-xs font-medium text-gray-600">
							Indicator Panes
						</div>
						<div className="space-y-1 max-h-32 overflow-y-auto">
							{Object.entries(indicatorSubChartPaneRef).map(([key, pane]) => (
								<div
									key={key}
									className={`p-2 rounded text-xs ${pane ? "bg-green-50" : "bg-red-50"}`}
								>
									<div className="font-medium truncate" title={key}>
										{key.split("|").pop()}
									</div>
									<div className={pane ? "text-green-600" : "text-red-600"}>
										{pane ? `Pane Index: ${pane.paneIndex()}` : "null"}
									</div>
								</div>
							))}
						</div>

						<div className="text-xs font-medium text-gray-600 mt-2">
							Operation Panes
						</div>
						<div className="space-y-1 max-h-32 overflow-y-auto">
							{Object.entries(operationSubChartPaneRef).map(([key, pane]) => (
								<div
									key={key}
									className={`p-2 rounded text-xs ${pane ? "bg-green-50" : "bg-red-50"}`}
								>
									<div className="font-medium truncate" title={key}>
										{key.split("|").pop()}
									</div>
									<div className={pane ? "text-green-600" : "text-red-600"}>
										{pane ? `Pane Index: ${pane.paneIndex()}` : "null"}
									</div>
								</div>
							))}
						</div>
					</div>
				</CollapsibleSection>

				<Separator />

				{/* Active Indicators List */}
				<CollapsibleSection
					title="Active Indicators"
					badge={stats.mainIndicators + stats.subIndicators}
				>
					<div className="space-y-1 max-h-48 overflow-y-auto">
						{chartConfig.indicatorChartConfigs
							.filter((c) => !c.isDelete)
							.map((config) => {
								const isVisible = getIndicatorVisibility(config.indicatorKeyStr);
								return (
									<div
										key={config.indicatorKeyStr}
										className="flex items-center justify-between p-2 bg-gray-50 rounded"
									>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-1">
												<Badge
													variant={config.isInMainChart ? "default" : "secondary"}
													className="text-xs"
												>
													{config.isInMainChart ? "Main" : "Sub"}
												</Badge>
												<span
													className="text-xs truncate"
													title={config.indicatorKeyStr}
												>
													{config.indicatorKeyStr.split("|").pop()}
												</span>
											</div>
										</div>
										<div className="flex gap-1">
											<Button
												variant="outline"
												size="sm"
												className="h-5 w-5 p-0"
												onClick={() =>
													toggleIndicatorVisibility(config.indicatorKeyStr)
												}
											>
												{isVisible ? (
													<Eye size={10} />
												) : (
													<EyeOff size={10} />
												)}
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="h-5 w-5 p-0 text-red-500"
												onClick={() =>
													removeIndicator(chartConfig.id, config.indicatorKeyStr)
												}
											>
												<Trash2 size={10} />
											</Button>
										</div>
									</div>
								);
							})}
					</div>
				</CollapsibleSection>

				{/* Active Operations List */}
				<CollapsibleSection
					title="Active Operations"
					badge={stats.mainOperations + stats.subOperations}
				>
					<div className="space-y-1 max-h-48 overflow-y-auto">
						{(chartConfig.operationChartConfigs || [])
							.filter((c) => !c.isDelete)
							.map((config) => (
								<div
									key={config.operationKeyStr}
									className="flex items-center justify-between p-2 bg-gray-50 rounded"
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-1">
											<Badge
												variant={config.isInMainChart ? "default" : "secondary"}
												className="text-xs"
											>
												{config.isInMainChart ? "Main" : "Sub"}
											</Badge>
											<span
												className="text-xs truncate"
												title={config.operationKeyStr}
											>
												{config.operationKeyStr.split("|").pop()}
											</span>
										</div>
									</div>
									<div className="flex gap-1">
										<Button
											variant="outline"
											size="sm"
											className="h-5 w-5 p-0 text-red-500"
											onClick={() =>
												removeOperation(chartConfig.id, config.operationKeyStr)
											}
										>
											<Trash2 size={10} />
										</Button>
									</div>
								</div>
							))}
					</div>
				</CollapsibleSection>

				{/* Deleted Items (soft deleted) */}
				{(stats.deletedIndicators > 0 || stats.deletedOperations > 0) && (
					<>
						<Separator />
						<CollapsibleSection
							title="Deleted Items (soft)"
							badge={stats.deletedIndicators + stats.deletedOperations}
						>
							<div className="space-y-1 max-h-32 overflow-y-auto">
								{chartConfig.indicatorChartConfigs
									.filter((c) => c.isDelete)
									.map((config) => (
										<div
											key={config.indicatorKeyStr}
											className="p-2 bg-red-50 rounded text-xs text-red-600 truncate"
											title={config.indicatorKeyStr}
										>
											[Indicator] {config.indicatorKeyStr.split("|").pop()}
										</div>
									))}
								{(chartConfig.operationChartConfigs || [])
									.filter((c) => c.isDelete)
									.map((config) => (
										<div
											key={config.operationKeyStr}
											className="p-2 bg-red-50 rounded text-xs text-red-600 truncate"
											title={config.operationKeyStr}
										>
											[Operation] {config.operationKeyStr.split("|").pop()}
										</div>
									))}
							</div>
						</CollapsibleSection>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default ChartDebugPanel;
