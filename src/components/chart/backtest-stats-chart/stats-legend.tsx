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
		// 使用统计图表配置store
		const { getChartConfig,getStatsVisibility, toggleStatsVisibility, removeStats } =
			useBacktestStatsChartConfigStore();

		// 编辑对话框状态
		const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

		// 当前配置个数(不包括被删除的)
		const [statsCount, setStatsCount] = useState(0);

		useEffect(() => {
			const chartConfig = getChartConfig();
			if (chartConfig) {
				setStatsCount(chartConfig.statsChartConfigs.filter((statsChartConfig) => !statsChartConfig.isDelete).length);
			}
		}, [getChartConfig]);

		useEffect(() => {
			console.log("statsCount", statsCount)
		}, [statsCount]);

		if (!statsLegendData) {
			return null;
		}

		// 获取当前统计的可见性状态
		const isVisible = getStatsVisibility(statsLegendData.statsName as StrategyStatsName);

		// 处理可见性切换
		const handleVisibilityToggle = (e: React.MouseEvent) => {
			e.stopPropagation();
			toggleStatsVisibility(statsLegendData.statsName as StrategyStatsName);
		};

		// 处理删除统计
		const handleDeleteStats = (e: React.MouseEvent) => {
			e.stopPropagation();
			removeStats(statsLegendData.statsName as StrategyStatsName);
		};

		// 处理编辑
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
					{/* 统计名称 */}
					<span className="font-medium text-gray-700">
						{statsLegendData.displayName}
					</span>

					{/* 统计值 */}
					<span className="font-mono" style={{ color: statsLegendData.color }}>
						{statsLegendData.value}
					</span>

					{/* 操作图标 - 仅鼠标悬浮可见 */}
					<div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<Button
							variant="outline"
							size="sm"
							className={`h-6 w-6 p-0 border-gray-300 bg-white transition-colors ${
								isVisible
									? "hover:bg-blue-50 hover:border-blue-400"
									: "hover:bg-gray-50 hover:border-gray-400 bg-gray-100"
							}`}
							title={isVisible ? "隐藏统计" : "显示统计"}
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
							title="编辑"
							onClick={handleEdit}
						>
							<Bolt size={12} className="text-yellow-600" />
						</Button>
						{/* 如果statsCount = 1,则不显示删除按钮 */}
						{statsCount > 1 && (
							<Button
								variant="outline"
								size="sm"
								className="h-6 w-6 p-0 border-gray-300 bg-white hover:bg-red-50 hover:border-red-400"
								title="删除"
								onClick={handleDeleteStats}
							>
									<Trash2 size={12} className="text-red-600" />
								</Button>
							)}
					</div>
				</div>

				{/* 编辑对话框 */}
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
