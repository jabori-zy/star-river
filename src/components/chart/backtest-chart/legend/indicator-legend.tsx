import { Bolt, Eye, EyeOff, Trash2 } from "lucide-react";
import type React from "react";
import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "../backtest-chart-store";
import { IndicatorLegendEditDialog } from "./indicator-legend-edit-dialog";
import type { IndicatorLegendData } from "./use-indicator-legend";

interface IndicatorLegendProps {
	indicatorLegendData: IndicatorLegendData;
	indicatorKeyStr: IndicatorKeyStr; // 新增指标键字符串，用于控制可见性
	chartConfig: BacktestChartConfig; // 新增图表配置，用于获取对应的store
	className?: string;
	style?: React.CSSProperties;
}

const IndicatorLegend = forwardRef<HTMLDivElement, IndicatorLegendProps>(
	(
		{
			indicatorLegendData,
			indicatorKeyStr,
			chartConfig,
			className = "",
			style,
		},
		ref,
	) => {
		// 使用当前图表的可见性状态管理
		const { getIndicatorVisibility, toggleIndicatorVisibility } =
			useBacktestChartStore(chartConfig.id);

		const { removeIndicator } = useBacktestChartConfigStore();

		// 编辑对话框状态
		const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

		// 获取当前指标的可见性状态
		const isVisible = getIndicatorVisibility(indicatorKeyStr);

		// 处理可见性切换
		const handleVisibilityToggle = (e: React.MouseEvent) => {
			e.stopPropagation();
			toggleIndicatorVisibility(indicatorKeyStr);
		};

		// 处理删除指标
		const handleDeleteIndicator = (e: React.MouseEvent) => {
			e.stopPropagation();

			// 只删除配置，让React自然地卸载组件和清理Pane
			// lightweight-charts-react-components会自动处理series和pane的清理
			removeIndicator(chartConfig.id, indicatorKeyStr);
		};

		return (
			<div
				ref={ref}
				className={`absolute top-0 left-0 z-10 hover:cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-sm group ${className}`}
				style={style}
			>
				<div className="flex flex-wrap gap-2 text-xs items-center">
					{/* 指标名称 */}
					<span className="font-medium text-gray-700">
						{indicatorLegendData.indicatorName}
					</span>

					{/* 指标值 */}
					{(() => {
						const valueEntries = Object.entries(indicatorLegendData.values);
						const isSingleValue = valueEntries.length === 1;

						return valueEntries.map(([key, valueInfo]) => (
							<span key={key}>
								{/* 单个值时不显示field字段，多个值时显示field字段 */}
								{isSingleValue ? (
									<span style={{ color: valueInfo.color }}>
										{valueInfo.value}
									</span>
								) : (
									<>
										{valueInfo.label}:{" "}
										<span style={{ color: valueInfo.color }}>
											{valueInfo.value}
										</span>
									</>
								)}
							</span>
						));
					})()}

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
							title={isVisible ? "隐藏指标" : "显示指标"}
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
							onClick={(e) => {
								e.stopPropagation();
								setIsEditDialogOpen(true);
							}}
						>
							<Bolt size={12} className="text-yellow-600" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-6 w-6 p-0 border-gray-300 bg-white hover:bg-red-50 hover:border-red-400"
							title="删除"
							onClick={handleDeleteIndicator}
						>
							<Trash2 size={12} className="text-red-600" />
						</Button>
					</div>
				</div>

				{/* 编辑对话框 */}
				<IndicatorLegendEditDialog
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
					chartId={chartConfig.id}
					indicatorKeyStr={indicatorKeyStr}
				/>
			</div>
		);
	},
);

IndicatorLegend.displayName = "IndicatorLegend";

export { IndicatorLegend };
