import type React from "react";
import { forwardRef } from "react";
import { Eye, Zap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IndicatorLegendData } from "./use-indicator-legend";

interface IndicatorLegendProps {
	indicatorLegendData: IndicatorLegendData | null;
	className?: string;
	style?: React.CSSProperties;
}

const IndicatorLegend = forwardRef<HTMLDivElement, IndicatorLegendProps>(({
	indicatorLegendData,
	className = "",
	style,
}, ref) => {
	if (indicatorLegendData === null) {
		return null;
	}

	return (
		<div
			ref={ref}
			className={`absolute top-0 left-0 z-10 hover:cursor-pointer hover:bg-gray-100 p-2 rounded-sm group ${className}`}
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
						className="h-6 w-6 p-0 border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-400"
						title="查看详情"
						onClick={(e) => {
							e.stopPropagation();
							// TODO: 实现查看详情功能
						}}
					>
						<Eye size={12} className="text-blue-600" />
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
						<Zap size={12} className="text-yellow-600" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-6 w-6 p-0 border-gray-300 bg-white hover:bg-red-50 hover:border-red-400"
						title="删除"
						onClick={(e) => {
							e.stopPropagation();
							// TODO: 实现删除功能
						}}
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