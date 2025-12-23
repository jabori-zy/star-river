import { Bolt, Eye, EyeOff, Trash2 } from "lucide-react";
import type React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { OperationLegendData } from "@/components/chart/backtest-chart/hooks/use-operation-legend";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { OperationKeyStr } from "@/types/symbol-key";
import { OperationLegendEditDialog } from "./operation-legend-edit-dialog";
import { parseSeriesName } from "./operation-legend-utils";

interface OperationLegendProps {
	operationLegendData: OperationLegendData | null;
	operationKeyStr: OperationKeyStr;
	chartId: number;
	className?: string;
	style?: React.CSSProperties;
}

const OperationLegend = forwardRef<HTMLDivElement, OperationLegendProps>(
	(
		{ operationLegendData, operationKeyStr, chartId, className = "", style },
		ref,
	) => {
		const {
			toggleOperationVisibility,
			getOperationVisibility,
			removeOperation,
		} = useBacktestChartConfigStore();

		// Edit dialog state
		const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

		// Get current operation visibility state
		const isVisible = getOperationVisibility(chartId, operationKeyStr);

		// Track maximum character length for each operation value (for adaptive width)
		const [maxWidths, setMaxWidths] = useState<Record<string, number>>({});

		// Track the previous operationKeyStr to detect changes
		const prevOperationKeyStrRef = useRef<OperationKeyStr>(operationKeyStr);

		// Calculate current data character length and update maximum value
		// Reset max length when operationKeyStr changes
		useEffect(() => {
			// Check if the operation key has changed
			if (prevOperationKeyStrRef.current !== operationKeyStr) {
				setMaxWidths({});
				prevOperationKeyStrRef.current = operationKeyStr;
				return;
			}

			if (!operationLegendData?.values) return;

			setMaxWidths((prev) => {
				let hasChanges = false;
				let next = prev;

				Object.entries(operationLegendData.values).forEach(
					([key, valueInfo]) => {
						const currentLength = valueInfo.value.length;
						const maxLength = prev[key] || 0;

						if (currentLength > maxLength) {
							if (!hasChanges) {
								next = { ...prev };
								hasChanges = true;
							}
							next[key] = currentLength;
						}
					},
				);

				return hasChanges ? next : prev;
			});
		}, [operationKeyStr, operationLegendData]);

		// Get maximum width for specified key (using ch units)
		const getMaxWidth = (key: string): string => {
			const maxLength = maxWidths[key];
			// Keep minimum width of 6ch, plus 0.5ch buffer
			return `${Math.max(maxLength || 6, 6) + 0.5}ch`;
		};

		const handleVisibilityToggle = (e: React.MouseEvent) => {
			e.stopPropagation();
			toggleOperationVisibility(chartId, operationKeyStr);
		};

		// Handle operation deletion
		const handleDeleteOperation = (e: React.MouseEvent) => {
			e.stopPropagation();
			removeOperation(chartId, operationKeyStr);
		};

		// Handle edit
		const handleEdit = (e: React.MouseEvent) => {
			e.stopPropagation();
			setIsEditDialogOpen(true);
		};

		return (
			<div
				ref={ref}
				className={`absolute top-0 left-0 z-10 hover:cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-sm group ${className}`}
				style={style}
			>
				<div className="flex flex-wrap gap-2 text-xs items-center">
					{/* Operation name */}
					<span className="font-medium text-gray-700">
						{operationLegendData?.operationName}
					</span>

					{/* Operation values */}
					{(() => {
						const valueEntries = Object.entries(
							operationLegendData?.values || {},
						);
						const isSingleValue = valueEntries.length === 1;

						return valueEntries.map(([key, valueInfo]) => (
							<span key={key} className="inline-flex items-center">
								{/* Single value: don't show field name, multiple values: show field name */}
								{isSingleValue ? (
									<span
										className="font-mono text-center inline-block"
										style={{
											color: valueInfo.color,
											width: getMaxWidth(key),
										}}
									>
										{valueInfo.value}
									</span>
								) : (
									<>
										{parseSeriesName(valueInfo.label)}:{" "}
										<span
											className="text-xs mr-2 font-mono text-center inline-block"
											style={{
												color: valueInfo.color,
												width: getMaxWidth(key),
											}}
										>
											{valueInfo.value}
										</span>
									</>
								)}
							</span>
						));
					})()}

					{/* Action icons - only visible on hover */}
					<div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<Button
							variant="outline"
							size="sm"
							className={`h-6 w-6 p-0 border-gray-300 bg-white transition-colors ${
								isVisible
									? "hover:bg-blue-50 hover:border-blue-400"
									: "hover:bg-gray-50 hover:border-gray-400 bg-gray-100"
							}`}
							title={isVisible ? "Hide Operation" : "Show Operation"}
							onClick={handleVisibilityToggle}
						>
							{isVisible ? (
								<Eye size={12} className="text-blue-600" />
							) : (
								<EyeOff size={12} className="text-gray-500" />
							)}
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-6 w-6 p-0 border-gray-300 bg-white hover:bg-yellow-50 hover:border-yellow-400"
							title="Edit"
							onClick={handleEdit}
						>
							<Bolt size={12} className="text-yellow-600" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-6 w-6 p-0 border-gray-300 bg-white hover:bg-red-50 hover:border-red-400"
							title="Delete"
							onClick={handleDeleteOperation}
						>
							<Trash2 size={12} className="text-red-600" />
						</Button>
					</div>
				</div>

				{/* Edit dialog */}
				<OperationLegendEditDialog
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
					chartId={chartId}
					operationKeyStr={operationKeyStr}
				/>
			</div>
		);
	},
);

OperationLegend.displayName = "OperationLegend";

export { OperationLegend };
