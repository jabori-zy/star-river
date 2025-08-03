import type React from "react";
import { forwardRef } from "react";
import { Eye, EyeOff, Bolt, Trash2 } from "lucide-react";
import type { IChartApi } from "lightweight-charts";
import { Button } from "@/components/ui/button";
import type { IndicatorLegendData } from "./use-indicator-legend";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { useBacktestChartStore } from "../backtest-chart-store";

interface IndicatorLegendProps {
	indicatorLegendData: IndicatorLegendData;
	indicatorKeyStr: IndicatorKeyStr; // 新增指标键字符串，用于控制可见性
	chartConfig: BacktestChartConfig; // 新增图表配置，用于获取对应的store
	chartApiRef?: React.RefObject<IChartApi | null>; // 图表API引用，用于删除子图Pane
	className?: string;
	style?: React.CSSProperties;
}

const IndicatorLegend = forwardRef<HTMLDivElement, IndicatorLegendProps>(({
	indicatorLegendData,
	indicatorKeyStr,
	chartConfig,
	chartApiRef,
	className = "",
	style,
}, ref) => {
	// 使用当前图表的可见性状态管理
	const { getIndicatorVisibility, toggleIndicatorVisibility, removeIndicator } = useBacktestChartStore(chartConfig);

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

		// 检查是否是子图指标
		const isSubChartIndicator = chartConfig.subChartConfigs.some(
			subChart => subChart.indicatorChartConfigs[indicatorKeyStr]
		);

		if (isSubChartIndicator && chartApiRef?.current) {
			// 找到对应的子图索引
			const subChartIndex = chartConfig.subChartConfigs.findIndex(
				subChart => subChart.indicatorChartConfigs[indicatorKeyStr]
			);

			if (subChartIndex !== -1) {
				const subChartConfig = chartConfig.subChartConfigs[subChartIndex];

				// 如果子图只有这一个指标，删除整个Pane
				if (Object.keys(subChartConfig.indicatorChartConfigs).length === 1) {
					try {
						// 获取所有Panes
						const panes = chartApiRef.current.panes();

						// 子图的Pane索引 = 主图(0) + 子图索引 + 1
						const paneIndex = subChartIndex + 1;

						if (panes[paneIndex]) {
							chartApiRef.current.removePane(paneIndex);
						}
					} catch (error) {
						console.error('删除Pane失败:', error);
					}
				}
			}
		}

		// 从配置中删除指标
		removeIndicator(indicatorKeyStr);
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
						title="快速操作"
						onClick={(e) => {
							e.stopPropagation();
							// TODO: 实现快速操作功能
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
		</div>
	);
});

IndicatorLegend.displayName = 'IndicatorLegend';

export { IndicatorLegend };