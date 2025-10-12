import { Bolt, Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
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

	// 追踪每个字段值的最大字符长度 (用于自适应宽度)
	const maxLengthsRef = useRef<Record<string, number>>({});

	// 重置机制：当 chartId 变化时，重置最大长度
	useEffect(() => {
		maxLengthsRef.current = {};
	}, [chartId]);

	// 计算当前数据的字符长度并更新最大值
	useEffect(() => {
		if (!klineSeriesData) return;

		let needsUpdate = false;
		const newMaxLengths = { ...maxLengthsRef.current };

		// 遍历所有字段：open, high, low, close, change
		const fields = ['open', 'high', 'low', 'close', 'change'] as const;

		fields.forEach((field) => {
			const value = klineSeriesData[field];
			if (value && value !== '----') {
				const currentLength = value.length;
				const maxLength = newMaxLengths[field] || 0;

				if (currentLength > maxLength) {
					newMaxLengths[field] = currentLength;
					needsUpdate = true;
				}
			}
		});

		if (needsUpdate) {
			maxLengthsRef.current = newMaxLengths;
		}
	}, [klineSeriesData]);

	// 获取指定字段的最大宽度（使用 ch 单位）
	const getMaxWidth = (field: string): string => {
		const maxLength = maxLengthsRef.current[field];
		// 至少保持 6ch 的最小宽度，加上 0.5ch 的缓冲
		return `${Math.max(maxLength || 6, 6) + 0.5}ch`;
	};

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

				<span className="inline-flex items-center">
					O:{" "}
					<span
						className="font-mono text-center inline-block"
						style={{
							color: klineSeriesData?.color,
							width: getMaxWidth('open'),
						}}
					>
						{klineSeriesData?.open || "----"}
					</span>
				</span>

				<span className="inline-flex items-center">
					H:{" "}
					<span
						className="font-mono text-center inline-block"
						style={{
							color: klineSeriesData?.color,
							width: getMaxWidth('high'),
						}}
					>
						{klineSeriesData?.high || "----"}
					</span>
				</span>

				<span className="inline-flex items-center">
					L:{" "}
					<span
						className="font-mono text-center inline-block"
						style={{
							color: klineSeriesData?.color,
							width: getMaxWidth('low'),
						}}
					>
						{klineSeriesData?.low || "----"}
					</span>
				</span>

				<span className="inline-flex items-center">
					C:{" "}
					<span
						className="font-mono text-center inline-block"
						style={{
							color: klineSeriesData?.color,
							width: getMaxWidth('close'),
						}}
					>
						{klineSeriesData?.close || "----"}
					</span>
				</span>

				{klineSeriesData?.change && (
					<span
						className="font-mono text-center inline-block"
						style={{
							color: klineSeriesData?.change?.startsWith("+")
								? "#22c55e"
								: "#ef4444",
							width: getMaxWidth('change'),
						}}
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
