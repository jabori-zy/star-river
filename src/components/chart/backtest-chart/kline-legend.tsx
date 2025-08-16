import { Bolt, Eye, EyeOff } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { KlineLegendData } from "@/hooks/chart/backtest-chart/use-kline-legend";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";


interface KlineLegendProps {
	klineSeriesData: KlineLegendData | null;
	chartId: number; // 图表ID，用于获取对应的store
	className?: string;
}

const KlineLegend: React.FC<KlineLegendProps> = ({
	klineSeriesData,
	chartId,
	className = "",
}) => {
	// 使用当前图表的可见性状态管理
	const { getKlineVisibility, toggleKlineVisibility } =
		useBacktestChartConfigStore();

	// if (klineSeriesData === null) {
	// 	return null;
	// }

	// 获取当前K线的可见性状态
	const isVisible = getKlineVisibility(chartId);

	// 处理可见性切换
	const handleVisibilityToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		toggleKlineVisibility(chartId);
	};

	return (
		<div
			className={`absolute top-0 left-0 z-10 hover:cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-sm group ${className}`}
		>
			<div className="flex flex-wrap gap-2 text-xs items-center">
				{/* 显示时间
                {klineSeriesData.timeString && (
                    <span className="font-medium text-gray-700">
                        {klineSeriesData.timeString}
                    </span>
                )} */}
				
					<span>
						O:{" "}
						<span style={{ color: klineSeriesData?.color }}>
							{klineSeriesData?.open || "----"}
						</span>
					</span>
				
				
					<span>
						H:{" "}
						<span style={{ color: klineSeriesData?.color }}>
							{klineSeriesData?.high || "----"}
						</span>
					</span>
				
				
					<span>
						L:{" "}
						<span style={{ color: klineSeriesData?.color }}>
							{klineSeriesData?.low || "----"}
						</span>
					</span>
				
				
				<span>
					C:{" "}
					<span style={{ color: klineSeriesData?.color }}>
						{klineSeriesData?.close || "----"}
					</span>
				</span>
				
				{klineSeriesData?.change && (
					<span
						style={{
							color: klineSeriesData?.change?.startsWith("+")
								? "#22c55e"
								: "#ef4444",
						}}
						className="text-xs"
					>
						{klineSeriesData?.change || "----"}
					</span>
				)}

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
						title={isVisible ? "隐藏K线" : "显示K线"}
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
				</div>
			</div>
		</div>
	);
};

export { KlineLegend };
