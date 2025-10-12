import { Bolt, Eye, EyeOff, Trash2 } from "lucide-react";
import type React from "react";
import { forwardRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { IndicatorLegendData } from "@/hooks/chart/backtest-chart/use-indicator-legend";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import { IndicatorLegendEditDialog } from "./indicator-legend-edit-dialog";

interface IndicatorLegendProps {
	indicatorLegendData: IndicatorLegendData | null;
	indicatorKeyStr: IndicatorKeyStr; // 指标键字符串，用于控制可见性
	chartId: number; // 图表ID，用于获取对应的store
	className?: string;
	style?: React.CSSProperties;
}

const IndicatorLegend = forwardRef<HTMLDivElement, IndicatorLegendProps>(
	(
		{ indicatorLegendData, indicatorKeyStr, chartId, className = "", style },
		ref,
	) => {
		// 使用当前图表的可见性状态管理
		// const { getIndicatorVisibility, toggleIndicatorVisibility } = useBacktestChartStore(chartId);
		// 使用全局图表配置store， 切换时直接修改配置
		const {
			toggleIndicatorVisibility,
			getIndicatorVisibility,
			removeIndicator, // 软删除指标
		} = useBacktestChartConfigStore();

		// 编辑对话框状态
		const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

		// 获取当前指标的可见性状态
		const isVisible = getIndicatorVisibility(chartId, indicatorKeyStr);

		// 追踪每个指标值的最大字符长度 (用于自适应宽度)
		const [maxWidths, setMaxWidths] = useState<Record<string, number>>({});

		// 重置机制：当 indicatorKeyStr 变化时，重置最大长度
		useEffect(() => {
			setMaxWidths({});
		}, [indicatorKeyStr]);

		// 计算当前数据的字符长度并更新最大值
		useEffect(() => {
			if (!indicatorLegendData?.values) return;

			setMaxWidths((prev) => {
				let hasChanges = false;
				let next = prev;

				Object.entries(indicatorLegendData.values).forEach(([key, valueInfo]) => {
					const currentLength = valueInfo.value.length;
					const maxLength = prev[key] || 0;

					if (currentLength > maxLength) {
						if (!hasChanges) {
							next = { ...prev };
							hasChanges = true;
						}
						next[key] = currentLength;
					}
				});

				return hasChanges ? next : prev;
			});
		}, [indicatorLegendData]);

		// 获取指定 key 的最大宽度（使用 ch 单位）
		const getMaxWidth = (key: string): string => {
			const maxLength = maxWidths[key];
			// 至少保持 6ch 的最小宽度，加上 0.5ch 的缓冲
			return `${Math.max(maxLength || 6, 6) + 0.5}ch`;
		};

		//
		const handleVisibilityToggle = (e: React.MouseEvent) => {
			e.stopPropagation();
			toggleIndicatorVisibility(chartId, indicatorKeyStr);
		};

		// 处理删除指标
		const handleDeleteIndicator = (e: React.MouseEvent) => {
			e.stopPropagation();
			removeIndicator(chartId, indicatorKeyStr);
		};

		// 处理编辑 - 暂时只是占位，不实现功能
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
					{/* 指标名称 */}
					<span className="font-medium text-gray-700">
						{indicatorLegendData?.indicatorName}
					</span>

					{/* 指标值 */}
					{(() => {
						const valueEntries = Object.entries(
							indicatorLegendData?.values || {},
						);
						const isSingleValue = valueEntries.length === 1;

						return valueEntries.map(([key, valueInfo]) => (
							<span key={key} className="inline-flex items-center">
								{/* 单个值时不显示field字段，多个值时显示field字段 */}
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
										{valueInfo.label}:{" "}
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
							onClick={handleEdit}
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
					chartId={chartId}
					indicatorKeyStr={indicatorKeyStr}
				/>
			</div>
		);
	},
);

IndicatorLegend.displayName = "IndicatorLegend";

export { IndicatorLegend };
