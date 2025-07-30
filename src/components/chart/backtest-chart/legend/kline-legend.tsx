import type React from "react";
import type { KlineLegendData } from "./use-kline-legend";

interface KlineLegendProps {
	klineSeriesData: KlineLegendData | null;
	className?: string;
}

const KlineLegend: React.FC<KlineLegendProps> = ({
	klineSeriesData,
	className = "",
}) => {
	if (klineSeriesData === null) {
		return null;
	}

	return (
		<div
			className={`absolute top-0 left-0 z-10 hover:cursor-pointer hover:bg-gray-100 p-2 rounded-sm ${className}`}
		>
			<div className="flex flex-wrap gap-2 text-xs">
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
			</div>
		</div>
	);
};

export { KlineLegend };
