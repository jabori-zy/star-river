import { Bolt, Eye, EyeOff } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { KlineKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "../backtest-chart-store";
import type { KlineLegendData } from "./use-kline-legend";

interface KlineLegendProps {
	klineSeriesData: KlineLegendData | null;
	klineKeyStr: KlineKeyStr; // 新增K线键字符串，用于控制可见性
	chartConfig: BacktestChartConfig; // 新增图表配置，用于获取对应的store
	className?: string;
}

const KlineLegend: React.FC<KlineLegendProps> = ({
	klineSeriesData,
	klineKeyStr,
	chartConfig,
	className = "",
}) => {
	// 使用当前图表的可见性状态管理
	const { getKlineVisibility, toggleKlineVisibility } =
		useBacktestChartStore(chartConfig);

	if (klineSeriesData === null) {
		return null;
	}

	// 获取当前K线的可见性状态
	const isVisible = getKlineVisibility(klineKeyStr);

	// 处理可见性切换
	const handleVisibilityToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		toggleKlineVisibility(klineKeyStr);
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
				{klineSeriesData.open && (
					<span>
						O:{" "}
						<span style={{ color: klineSeriesData.color }}>
							{klineSeriesData.open}
						</span>
					</span>
				)}
				{klineSeriesData.high && (
					<span>
						H:{" "}
						<span style={{ color: klineSeriesData.color }}>
							{klineSeriesData.high}
						</span>
					</span>
				)}
				{klineSeriesData.low && (
					<span>
						L:{" "}
						<span style={{ color: klineSeriesData.color }}>
							{klineSeriesData.low}
						</span>
					</span>
				)}
				{klineSeriesData.close && (
					<span>
						C:{" "}
						<span style={{ color: klineSeriesData.color }}>
							{klineSeriesData.close}
						</span>
					</span>
				)}
				{klineSeriesData.change && (
					<span
						style={{
							color: klineSeriesData.change.startsWith("+")
								? "#22c55e"
								: "#ef4444",
						}}
						className="text-xs"
					>
						{klineSeriesData.change}
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
					{/* <Button
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
					</Button> */}
				</div>
			</div>
		</div>
	);
};

export { KlineLegend };
