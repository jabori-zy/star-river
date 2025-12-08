import { Bolt, Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { KlineLegendData } from "@/hooks/chart/backtest-chart/use-kline-legend";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";

interface KlineLegendProps {
	klineSeriesData: KlineLegendData | null;
	chartId: number; // Chart ID for getting corresponding store
	className?: string;
}

const KlineLegend: React.FC<KlineLegendProps> = ({
	klineSeriesData,
	chartId,
	className = "",
}) => {
	// Use current chart's visibility state management
	const { getKlineVisibility, toggleKlineVisibility } =
		useBacktestChartConfigStore();

	// if (klineSeriesData === null) {
	// 	return null;
	// }

	// Get current kline visibility state
	const isVisible = getKlineVisibility(chartId);

	// Track maximum character length for each field value (for adaptive width)
	const maxLengthsRef = useRef<Record<string, number>>({});

	// Reset mechanism: reset max length when chartId changes
	useEffect(() => {
		maxLengthsRef.current = {};
	}, [chartId]);

	// Synchronously update max length during render phase to avoid flickering
	if (klineSeriesData) {
		const fields = ["open", "high", "low", "close", "change"] as const;
		fields.forEach((field) => {
			const value = klineSeriesData[field];
			if (value && value !== "----") {
				const currentLength = value.length;
				const maxLength = maxLengthsRef.current[field] || 0;
				if (currentLength > maxLength) {
					maxLengthsRef.current[field] = currentLength;
				}
			}
		});
	}

	// Get maximum width for specified field (using ch units)
	const getMaxWidth = (field: string): string => {
		const maxLength = maxLengthsRef.current[field];
		// Keep minimum width of 6ch, plus 0.5ch buffer
		return `${Math.max(maxLength || 6, 6) + 0.5}ch`;
	};

	// Handle visibility toggle
	const handleVisibilityToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		toggleKlineVisibility(chartId);
	};

	return (
		<div
			className={`absolute top-0 left-0 z-10 hover:cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-sm group ${className}`}
		>
			<div className="flex flex-wrap gap-2 text-xs items-center whitespace-pre">
				{/* Display time
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
							width: getMaxWidth("open"),
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
							width: getMaxWidth("high"),
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
							width: getMaxWidth("low"),
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
							width: getMaxWidth("close"),
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
							width: getMaxWidth("change"),
						}}
					>
						{klineSeriesData?.change || "----"}
					</span>
				)}

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
						title={isVisible ? "Hide Kline" : "Show Kline"}
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
						title="Quick Action"
						onClick={(e) => {
							e.stopPropagation();
							// TODO: Implement quick action functionality
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
