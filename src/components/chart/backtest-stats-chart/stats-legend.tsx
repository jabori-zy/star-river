import { Bolt, Eye, EyeOff, Trash2 } from "lucide-react";
import type React from "react";
import { forwardRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { StatsLegendData } from "@/hooks/chart/backtest-stats-chart/use-stats-legend";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";
import type { StrategyStatsName } from "@/types/statistics";
import { StatsLegendEditDialog } from "./stats-legend-edit-dialog";

interface StatsLegendProps {
	statsLegendData: StatsLegendData | null;
	className?: string;
	style?: React.CSSProperties;
}

export const StatsLegend = forwardRef<HTMLDivElement, StatsLegendProps>(
	({ statsLegendData, className = "", style }, ref) => {
		// Use statistics chart configuration store
		const {
			getChartConfig,
			getStatsVisibility,
			toggleStatsVisibility,
			removeStats,
		} = useBacktestStatsChartConfigStore();

		// Edit dialog state
		const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

		// Current configuration count (excluding deleted ones)
		const [statsCount, setStatsCount] = useState(0);

		useEffect(() => {
			const chartConfig = getChartConfig();
			if (chartConfig) {
				setStatsCount(
					chartConfig.statsChartConfigs.filter(
						(statsChartConfig) => !statsChartConfig.isDelete,
					).length,
				);
			}
		}, [getChartConfig]);

		if (!statsLegendData) {
			return null;
		}

		// Get current statistics visibility state
		const isVisible = getStatsVisibility(
			statsLegendData.statsName as StrategyStatsName,
		);

		// Handle visibility toggle
		const handleVisibilityToggle = (e: React.MouseEvent) => {
			e.stopPropagation();
			toggleStatsVisibility(statsLegendData.statsName as StrategyStatsName);
		};

		// Handle delete statistics
		const handleDeleteStats = (e: React.MouseEvent) => {
			e.stopPropagation();
			removeStats(statsLegendData.statsName as StrategyStatsName);
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
				<div className="flex items-center gap-2 text-xs">
					{/* Statistics name */}
					<span className="font-medium text-gray-700">
						{statsLegendData.displayName}
					</span>

					{/* Statistics value */}
					<span className="font-mono" style={{ color: statsLegendData.color }}>
						{statsLegendData.value}
					</span>

					{/* Operation icons - visible only on hover */}
					<div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<Button
							variant="outline"
							size="sm"
							className={`h-6 w-6 p-0 border-gray-300 bg-white transition-colors ${
								isVisible
									? "hover:bg-blue-50 hover:border-blue-400"
									: "hover:bg-gray-50 hover:border-gray-400 bg-gray-100"
							}`}
							title={isVisible ? "Hide statistics" : "Show statistics"}
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
						{/* Don't show delete button if statsCount = 1 */}
						{statsCount > 1 && (
							<Button
								variant="outline"
								size="sm"
								className="h-6 w-6 p-0 border-gray-300 bg-white hover:bg-red-50 hover:border-red-400"
								title="Delete"
								onClick={handleDeleteStats}
							>
								<Trash2 size={12} className="text-red-600" />
							</Button>
						)}
					</div>
				</div>

				{/* Edit dialog */}
				<StatsLegendEditDialog
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
					statsName={statsLegendData.statsName as StrategyStatsName}
				/>
			</div>
		);
	},
);

StatsLegend.displayName = "StatsLegend";
