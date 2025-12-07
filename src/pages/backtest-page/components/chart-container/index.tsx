import React from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import ChartCard from "../chart-card";

interface ChartContainerProps {
	strategyChartConfig: BacktestStrategyChartConfig;
	strategyId: number;
	children?: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
	strategyChartConfig,
	strategyId,
	children,
}) => {
	// If there are children, use children; otherwise generate ChartCard based on strategyChartConfig.charts
	const chartElements = children
		? React.Children.toArray(children)
		: strategyChartConfig.charts.map((chartConfig) => (
				<ChartCard
					key={chartConfig.id}
					chartConfig={chartConfig}
					strategyId={strategyId}
				/>
			));

	const chartCount = chartElements.length;
	const layout = strategyChartConfig.layout;

	// If no charts, display empty state
	if (chartCount === 0) {
		return (
			<div className="w-full h-full flex items-center justify-center text-gray-500">
				Please select number of charts
			</div>
		);
	}

	// Grid layout
	if (layout === "grid" || layout === "grid-alt") {
		return renderGridLayout(
			chartElements,
			chartCount,
			layout,
			strategyChartConfig,
		);
	}

	// Horizontal layout (all charts arranged horizontally)
	if (layout === "horizontal") {
		return (
			<div className="w-full h-full p-2">
				<ResizablePanelGroup
					direction="horizontal"
					className="w-full h-full"
					id="horizontal-chart-group"
				>
					{chartElements.map((chart, index) => {
						// Use chart ID as key, fallback to index if not available
						const chartId =
							strategyChartConfig.charts[index]?.id || `chart-${index}`;
						return (
							<React.Fragment key={`horizontal-${chartId}`}>
								<ResizablePanel
									id={`horizontal-panel-${chartId}`}
									order={index}
									defaultSize={100 / chartCount}
									minSize={15}
									className={
										index < chartCount - 1 ? "pr-1" : index > 0 ? "pl-1" : ""
									}
								>
									{chart}
								</ResizablePanel>
								{index < chartCount - 1 && <ResizableHandle withHandle />}
							</React.Fragment>
						);
					})}
				</ResizablePanelGroup>
			</div>
		);
	}

	// Vertical layout (default, all charts arranged vertically)
	return (
		<div className="w-full h-full p-2">
			<ResizablePanelGroup
				direction="vertical"
				className="w-full h-full"
				id="vertical-chart-group"
			>
				{chartElements.map((chart, index) => {
					// Use chart ID as key, fallback to index if not available
					const chartId =
						strategyChartConfig.charts[index]?.id || `chart-${index}`;
					return (
						<React.Fragment key={`vertical-${chartId}`}>
							<ResizablePanel
								id={`vertical-panel-${chartId}`}
								order={index}
								defaultSize={100 / chartCount}
								minSize={15}
								className={
									index < chartCount - 1 ? "pb-1" : index > 0 ? "pt-1" : ""
								}
							>
								{chart}
							</ResizablePanel>
							{index < chartCount - 1 && <ResizableHandle withHandle />}
						</React.Fragment>
					);
				})}
			</ResizablePanelGroup>
		</div>
	);
};

ChartContainer.displayName = "ChartContainer";

export default ChartContainer;

// Grid layout rendering function
function renderGridLayout(
	chartElements: React.ReactNode[],
	chartCount: number,
	layoutMode: "grid" | "grid-alt",
	strategyChartConfig: BacktestStrategyChartConfig,
) {
	// Calculate grid dimensions
	const getGridDimensions = (count: number, isAlt: boolean) => {
		if (count === 1) return { rows: 1, cols: 1 };
		if (count === 2) return { rows: 1, cols: 2 };
		if (count === 3) return { rows: 2, cols: 2 }; // First row has 2, second row has 1 taking full width

		// For 4 or more charts
		if (count === 4) return { rows: 2, cols: 2 };

		if (isAlt) {
			// grid-alt: odd columns, even rows
			if (count <= 6) return { rows: 2, cols: 3 }; // 2 rows 3 columns
			if (count <= 12) return { rows: 3, cols: 4 }; // 3 rows 4 columns
			if (count <= 20) return { rows: 4, cols: 5 }; // 4 rows 5 columns
			// Handle more charts
			const cols =
				Math.ceil(Math.sqrt(count)) +
				(Math.ceil(Math.sqrt(count)) % 2 === 0 ? 1 : 0); // Ensure odd number of columns
			const rows = Math.ceil(count / cols);
			return { rows: rows % 2 === 0 ? rows : rows + 1, cols }; // Ensure even number of rows
		} else {
			// grid: even columns, odd rows (default)
			if (count <= 6) return { rows: 3, cols: 2 }; // 3 rows 2 columns
			if (count <= 8) return { rows: 3, cols: 4 }; // 3 rows 4 columns, but only uses 6-8 positions
			if (count === 9) return { rows: 3, cols: 3 }; // 3 rows 3 columns
			if (count <= 12) return { rows: 3, cols: 4 }; // 3 rows 4 columns
			if (count <= 16) return { rows: 5, cols: 4 }; // 5 rows 4 columns
			// Handle more charts
			const cols =
				Math.ceil(Math.sqrt(count)) +
				(Math.ceil(Math.sqrt(count)) % 2 === 1 ? 1 : 0); // Ensure even number of columns
			const rows = Math.ceil(count / cols);
			return { rows: rows % 2 === 0 ? rows + 1 : rows, cols }; // Ensure odd number of rows
		}
	};

	const { rows, cols } = getGridDimensions(
		chartCount,
		layoutMode === "grid-alt",
	);

	// Group charts into rows
	const chartRows: React.ReactNode[][] = [];
	for (let i = 0; i < rows; i++) {
		const startIndex = i * cols;
		const endIndex = Math.min(startIndex + cols, chartCount);
		if (startIndex < chartCount) {
			chartRows.push(chartElements.slice(startIndex, endIndex));
		}
	}

	return (
		<div className="w-full h-full">
			<ResizablePanelGroup
				direction="vertical"
				className="w-full h-full"
				id="grid-chart-group"
			>
				{chartRows.map((rowCharts, rowIndex) => {
					// Generate unique key for each row based on the first chart's ID in that row
					const firstChartIndex = rowIndex * cols;
					const firstChartId =
						strategyChartConfig.charts[firstChartIndex]?.id ||
						`row-${rowIndex}`;

					return (
						<React.Fragment key={`grid-row-${firstChartId}`}>
							<ResizablePanel
								id={`grid-row-panel-${firstChartId}`}
								order={rowIndex}
								defaultSize={100 / chartRows.length} // Use actual number of rows
								minSize={10}
								className={
									rowIndex < chartRows.length - 1
										? "pb-1"
										: rowIndex > 0
											? "pt-1"
											: ""
								}
							>
								{/* If the last row has only one chart and is not designed to be a separate row, let it fill the entire row */}
								{rowCharts.length === 1 &&
								rowIndex === chartRows.length - 1 &&
								chartCount > 2 &&
								chartCount !== 4 &&
								chartCount !== 9 ? (
									rowCharts[0]
								) : (
									<ResizablePanelGroup
										direction="horizontal"
										className="w-full h-full"
										id={`grid-row-${rowIndex}-group`}
									>
										{rowCharts.map((chart, colIndex) => {
											// Generate unique key for each column based on chart position in original array
											const chartIndex = rowIndex * cols + colIndex;
											const chartId =
												strategyChartConfig.charts[chartIndex]?.id ||
												`col-${rowIndex}-${colIndex}`;

											return (
												<React.Fragment key={`grid-col-${chartId}`}>
													<ResizablePanel
														id={`grid-col-panel-${chartId}`}
														order={colIndex}
														defaultSize={100 / rowCharts.length}
														minSize={10}
														className={
															colIndex < rowCharts.length - 1
																? "pr-1"
																: colIndex > 0
																	? "pl-1"
																	: ""
														}
													>
														{chart}
													</ResizablePanel>
													{colIndex < rowCharts.length - 1 && (
														<ResizableHandle withHandle />
													)}
												</React.Fragment>
											);
										})}
									</ResizablePanelGroup>
								)}
							</ResizablePanel>
							{rowIndex < chartRows.length - 1 && (
								<ResizableHandle withHandle />
							)}
						</React.Fragment>
					);
				})}
			</ResizablePanelGroup>
		</div>
	);
}
