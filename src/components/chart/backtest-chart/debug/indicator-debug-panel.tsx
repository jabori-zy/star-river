import type { IChartApi } from "lightweight-charts";
import {
	Bug,
	Eye,
	EyeOff,
	FileText,
	Info,
	Layers,
	Minimize2,
	RefreshCw,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "../backtest-chart-store";

interface IndicatorDebugPanelProps {
	chartConfig: BacktestChartConfig;
	chartApiRef?: React.RefObject<IChartApi | null>;
}

const IndicatorDebugPanel: React.FC<IndicatorDebugPanelProps> = ({
	chartConfig,
	chartApiRef,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const {
		getIndicatorVisibility,
		toggleIndicatorVisibility,
		indicatorData,
		getChartRef,
		getSubChartPaneRef,
		getKlineSeriesRef,
	} = useBacktestChartStore(chartConfig.id);

	// Use global config store to delete indicators
	const { removeIndicator } = useBacktestChartConfigStore();

	// Indicator classification methods
	const getMainChartIndicators = () => {
		return (chartConfig.indicatorChartConfigs || []).filter(
			(indicatorConfig) =>
				indicatorConfig.isInMainChart === true && !indicatorConfig.isDelete,
		);
	};

	const getSubChartIndicators = () => {
		return (chartConfig.indicatorChartConfigs || []).filter(
			(indicatorConfig) =>
				indicatorConfig.isInMainChart === false && !indicatorConfig.isDelete,
		);
	};

	// Print chart config to console
	const printChartConfig = () => {
		const currentConfig = chartConfig;
		const mainIndicators = getMainChartIndicators();
		const subIndicators = getSubChartIndicators();
		const chartApi = getChartRef();

		console.group("🔧 Chart Configuration Debug Info (New Chart)");
		console.log("📊 Complete config:", currentConfig);
		console.log("🔑 Chart ID:", currentConfig.id);
		console.log("📈 Kline config:", currentConfig.klineChartConfig);
		console.log("📊 All indicator configs:", currentConfig.indicatorChartConfigs);
		console.log("📈 Main chart indicators:", mainIndicators);
		console.log("📉 Subchart indicators:", subIndicators);
		console.log("📋 Indicator data:", indicatorData);

		// Print indicator classification details
		console.log(`📊 Main chart indicator count: ${mainIndicators.length}`);
		mainIndicators.forEach((indicator, index) => {
			console.log(`  Main chart indicator ${index + 1}:`, indicator);
		});

		console.log(`📉 Subchart indicator count: ${subIndicators.length}`);
		subIndicators.forEach((indicator, index) => {
			console.log(`  Subchart indicator ${index + 1}:`, indicator);
			// Print subchart Pane reference info
			const paneRef = getSubChartPaneRef(indicator.indicatorKeyStr);
			console.log(`    Pane reference:`, paneRef);
		});

		// Print chart API info
		if (chartApi) {
			console.log("🎯 Chart API info:");
			console.log("  - Panes count:", chartApi.panes().length);
			console.log("  - Time range:", chartApi.timeScale().getVisibleRange());
			console.log("  - Chart size:", chartApi.options());
		}

		console.groupEnd();

		// Also copy config to clipboard (if supported)
		if (navigator.clipboard) {
			navigator.clipboard
				.writeText(JSON.stringify(currentConfig, null, 2))
				.then(() => {
					console.log("✅ Config copied to clipboard");
				})
				.catch(() => {
					console.log("❌ Failed to copy to clipboard");
				});
		}
	};

	// Get all indicators
	const getAllIndicators = () => {
		const indicators: Array<{
			keyStr: IndicatorKeyStr;
			name: string;
			type: "main" | "sub";
			subChartIndex?: number;
		}> = [];

		const mainIndicators = getMainChartIndicators();
		const subIndicators = getSubChartIndicators();

		// Main chart indicators
		mainIndicators.forEach((config) => {
			indicators.push({
				keyStr: config.indicatorKeyStr,
				name: config.indicatorKeyStr, // Use keyStr as name, or can parse for friendlier name
				type: "main",
			});
		});

		// Subchart indicators
		subIndicators.forEach((config, index) => {
			indicators.push({
				keyStr: config.indicatorKeyStr,
				name: config.indicatorKeyStr, // Use keyStr as name, or can parse for friendlier name
				type: "sub",
				subChartIndex: index,
			});
		});

		return indicators;
	};

	const handleDeleteIndicator = (indicatorKeyStr: IndicatorKeyStr) => {
		// Only delete config, let React naturally unmount component and clean up Pane
		// New chart component will automatically handle series and pane cleanup
		removeIndicator(chartConfig.id, indicatorKeyStr);
	};

	// Only delete Pane, don't delete config
	const handleRemovePaneOnly = (indicatorKeyStr: IndicatorKeyStr) => {
		const subIndicators = getSubChartIndicators();
		const targetIndicator = subIndicators.find(
			(indicator) => indicator.indicatorKeyStr === indicatorKeyStr,
		);

		// Only handle Pane deletion for subchart indicators
		if (targetIndicator) {
			const chartApi = getChartRef();
			if (chartApi) {
				// Find the indicator's index in subcharts
				const subChartIndex = subIndicators.findIndex(
					(indicator) => indicator.indicatorKeyStr === indicatorKeyStr,
				);

				if (subChartIndex !== -1) {
					try {
						// Get all Panes
						const panes = chartApi.panes();
						console.log("Only delete Pane - panes", panes);

						// Subchart Pane index = main chart(0) + subchart index + 1
						const paneIndex = subChartIndex + 1;

						if (panes[paneIndex]) {
							chartApi.removePane(paneIndex);
							console.log(`Deleted Pane ${paneIndex}, but config retained`);

							// Note: After deleting Pane, React component still exists but cannot render properly
							// This may cause some display issues, but config is still retained
						}
					} catch (error) {
						console.error("Failed to delete Pane:", error);
					}
				}
			}
		} else {
			console.warn("Main chart indicators cannot delete Pane alone, only subchart indicators support this operation");
		}
	};

	// Clear Pane by deleting all Series inside Pane (new approach)
	const handleClearPaneSeries = (indicatorKeyStr: IndicatorKeyStr) => {
		const subIndicators = getSubChartIndicators();
		const targetIndicator = subIndicators.find(
			(indicator) => indicator.indicatorKeyStr === indicatorKeyStr,
		);

		// Only handle Pane cleanup for subchart indicators
		if (targetIndicator) {
			const chartApi = getChartRef();
			if (chartApi) {
				// Find the indicator's index in subcharts
				const subChartIndex = subIndicators.findIndex(
					(indicator) => indicator.indicatorKeyStr === indicatorKeyStr,
				);

				if (subChartIndex !== -1) {
					try {
						// Get all Panes
						const panes = chartApi.panes();
						console.log("Clear Series in Pane - panes", panes);

						// Subchart Pane index = main chart(0) + subchart index + 1
						const paneIndex = subChartIndex + 1;

						if (panes[paneIndex]) {
							const targetPane = panes[paneIndex];

							// Get all Series in this Pane
							const seriesInPane = targetPane.getSeries();
							console.log(
								`Series count in Pane ${paneIndex}:`,
								seriesInPane.length,
							);

							// Delete all Series in this Pane
							seriesInPane.forEach((series, index) => {
								console.log(`Delete Series ${index} in Pane ${paneIndex}`);
								if (chartApi) {
									chartApi.removeSeries(series);
								}
							});

							console.log(
								`Cleared all Series in Pane ${paneIndex}, Pane will disappear automatically`,
							);
						}
					} catch (error) {
						console.error("Failed to clear Series in Pane:", error);
					}
				}
			}
		} else {
			console.warn("Main chart indicators cannot clear Pane alone, only subchart indicators support this operation");
		}
	};

	const indicators = getAllIndicators();

	if (!isOpen) {
		return (
			<Button
				variant="outline"
				size="sm"
				className="fixed top-4 right-4 z-50 bg-white shadow-lg"
				onClick={() => setIsOpen(true)}
			>
				<Bug size={16} />
				Debug Panel (New)
			</Button>
		);
	}

	return (
		<Card className="fixed top-4 right-4 z-50 w-80 max-h-96 overflow-auto bg-white shadow-lg">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm">Indicator Debug Panel (New Chart)</CardTitle>
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
			<CardContent className="pt-0">
				{/* Chart info */}
				<div className="mb-3 p-2 bg-blue-50 rounded-sm">
					<div className="flex items-center gap-2 mb-1">
						<Info size={12} className="text-blue-600" />
						<span className="text-xs font-medium text-blue-800">Chart Info</span>
					</div>
					<div className="text-xs text-blue-700 space-y-1">
						<div>Chart ID: {chartConfig.id}</div>
						<div>Main chart indicators: {getMainChartIndicators().length}</div>
						<div>Subchart indicators: {getSubChartIndicators().length}</div>
						<div>
							Total indicators: {chartConfig.indicatorChartConfigs?.length || 0}
						</div>
						{getChartRef() && (
							<div>Pane count: {getChartRef()?.panes().length}</div>
						)}
					</div>
					<div className="flex gap-1 mt-2">
						<Button
							variant="outline"
							size="sm"
							className="h-6 text-xs flex-1"
							onClick={printChartConfig}
						>
							<FileText size={10} className="mr-1" />
							Print Config
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-6 text-xs flex-1"
							onClick={() => {
								const chartApi = getChartRef();
								if (chartApi) {
									const panes = chartApi.panes();
									console.group("🔍 Kline Series Check");
									console.log("Pane count:", panes.length);
									if (panes[0]) {
										const mainPaneSeries = panes[0].getSeries();
										console.log("Main chart series count:", mainPaneSeries.length);
										console.log("All main chart series:", mainPaneSeries);

										// Check kline series reference
										const klineSeries = getKlineSeriesRef(
											chartConfig.klineChartConfig.klineKeyStr,
										);
										console.log("Kline series reference:", klineSeries);
										if (klineSeries) {
											// Check if kline series is in main chart
											const isKlineInMainPane = mainPaneSeries.some(
												(series) => series === klineSeries,
											);
											console.log("Is kline series in main chart:", isKlineInMainPane);
										} else {
											console.log("Kline series reference is null");
										}
									}
									console.groupEnd();
								}
							}}
						>
							<RefreshCw size={10} className="mr-1" />
							Check Kline
						</Button>
					</div>
				</div>

				{/* Operation instructions */}
				<div className="mb-3 p-2 bg-yellow-50 rounded-sm">
					<div className="flex items-center gap-2 mb-1">
						<Info size={12} className="text-yellow-600" />
						<span className="text-xs font-medium text-yellow-800">
							Delete Methods
						</span>
					</div>
					<div className="text-xs text-yellow-700 space-y-1">
						<div>🔴 Red trash: Delete config (recommended)</div>
						<div>🟠 Orange minimize: Only delete Pane (keep config)</div>
						<div>🟣 Purple layers: Clear Series in Pane (new approach)</div>
					</div>
				</div>

				<div className="space-y-2">
					{indicators.length === 0 ? (
						<p className="text-sm text-gray-500">No indicators</p>
					) : (
						indicators.map((indicator) => {
							const isVisible = getIndicatorVisibility(indicator.keyStr);
							const hasData = indicatorData[indicator.keyStr];
							const dataCount = hasData
								? Object.values(hasData).reduce(
										(total, arr) => total + arr.length,
										0,
									)
								: 0;

							return (
								<div
									key={indicator.keyStr}
									className="flex items-center justify-between p-2 border rounded-sm bg-gray-50"
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-xs font-medium truncate">
												{indicator.name}
											</span>
											<Badge
												variant={
													indicator.type === "main" ? "default" : "secondary"
												}
												className="text-xs"
											>
												{indicator.type === "main"
													? "Main"
													: `Sub ${(indicator.subChartIndex || 0) + 1}`}
											</Badge>
											{hasData && (
												<Badge variant="outline" className="text-xs">
													{dataCount} data
												</Badge>
											)}
										</div>
										<div className="text-xs text-gray-500 truncate">
											{indicator.keyStr}
										</div>
									</div>
									<div className="flex gap-1 ml-2">
										<Button
											variant="outline"
											size="sm"
											className="h-6 w-6 p-0 bg-green-50 border-green-200 hover:bg-green-100"
											title="Print indicator details"
											onClick={() => {
												console.group(`🔍 Indicator Details: ${indicator.name}`);
												console.log("Indicator key:", indicator.keyStr);
												console.log("Indicator type:", indicator.type);
												console.log("Visibility:", isVisible);
												if (hasData) {
													console.log(
														"Data details:",
														indicatorData[indicator.keyStr],
													);
													console.log("Data point count:", dataCount);
													Object.entries(
														indicatorData[indicator.keyStr],
													).forEach(([field, data]) => {
														console.log(`  ${field}:`, data.length, "data points");
													});
												} else {
													console.log("No data");
												}
												// Print Pane reference info (only for subchart indicators)
												if (indicator.type === "sub") {
													const paneRef = getSubChartPaneRef(indicator.keyStr);
													console.log("Pane reference:", paneRef);
												}
												console.groupEnd();
											}}
										>
											<Info size={10} className="text-green-600" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											className={`h-6 w-6 p-0 ${
												isVisible
													? "bg-blue-50 border-blue-200"
													: "bg-gray-100 border-gray-300"
											}`}
											title={isVisible ? "Hide indicator" : "Show indicator"}
											onClick={() =>
												toggleIndicatorVisibility(indicator.keyStr)
											}
										>
											{isVisible ? (
												<Eye size={10} className="text-blue-600" />
											) : (
												<EyeOff size={10} className="text-gray-500" />
											)}
										</Button>
										{/* Only delete Pane button - only shown for subchart indicators */}
										{indicator.type === "sub" && (
											<Button
												variant="outline"
												size="sm"
												className="h-6 w-6 p-0 bg-orange-50 border-orange-200 hover:bg-orange-100"
												title="Only delete Pane (keep config)"
												onClick={() => handleRemovePaneOnly(indicator.keyStr)}
											>
												<Minimize2 size={10} className="text-orange-600" />
											</Button>
										)}
										{/* Clear Series in Pane button - only shown for subchart indicators */}
										{indicator.type === "sub" && (
											<Button
												variant="outline"
												size="sm"
												className="h-6 w-6 p-0 bg-purple-50 border-purple-200 hover:bg-purple-100"
												title="Clear Series in Pane (new approach)"
												onClick={() => handleClearPaneSeries(indicator.keyStr)}
											>
												<Layers size={10} className="text-purple-600" />
											</Button>
										)}
										<Button
											variant="outline"
											size="sm"
											className="h-6 w-6 p-0 bg-red-50 border-red-200 hover:bg-red-100"
											title="Delete indicator"
											onClick={() => handleDeleteIndicator(indicator.keyStr)}
										>
											<Trash2 size={10} className="text-red-600" />
										</Button>
									</div>
								</div>
							);
						})
					)}
				</div>

				{indicators.length > 0 && (
					<>
						<Separator className="my-3" />
						<div className="space-y-2">
							<div className="text-xs text-gray-500">
								Total: {indicators.length} indicators
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									onClick={() => {
										indicators.forEach((indicator) => {
											if (!getIndicatorVisibility(indicator.keyStr)) {
												toggleIndicatorVisibility(indicator.keyStr);
											}
										});
									}}
								>
									<Eye size={12} className="mr-1" />
									Show All
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									onClick={() => {
										indicators.forEach((indicator) => {
											if (getIndicatorVisibility(indicator.keyStr)) {
												toggleIndicatorVisibility(indicator.keyStr);
											}
										});
									}}
								>
									<EyeOff size={12} className="mr-1" />
									Hide All
								</Button>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="h-7 text-xs w-full text-red-600 border-red-200 hover:bg-red-50"
								onClick={() => {
									if (confirm("Are you sure you want to delete all indicators? This action cannot be undone.")) {
										indicators.forEach((indicator) => {
											handleDeleteIndicator(indicator.keyStr);
										});
									}
								}}
							>
								<Trash2 size={12} className="mr-1" />
								Delete All
							</Button>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default IndicatorDebugPanel;
