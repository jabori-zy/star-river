import type React from "react";
import type { LegendData } from "./useLegend";

interface KlineLegendProps {
	klineSeriesData: LegendData | null;
	className?: string;
}

const KlineLegend: React.FC<KlineLegendProps> = ({
	klineSeriesData: legendData,
	className = "",
}) => {
	if (legendData === null) {
		return null;
	}

	return (
		<div
			className={`absolute top-0 left-0 z-10 hover:cursor-pointer hover:bg-gray-100 p-2 rounded-sm ${className}`}
		>
			<div className="flex flex-wrap gap-2 text-xs">
				{legendData.open && (
					<span>
						O:{" "}
						<span style={{ color: legendData.color }}>{legendData.open}</span>
					</span>
				)}
				{legendData.high && (
					<span>
						H:{" "}
						<span style={{ color: legendData.color }}>{legendData.high}</span>
					</span>
				)}
				{legendData.low && (
					<span>
						L: <span style={{ color: legendData.color }}>{legendData.low}</span>
					</span>
				)}
				{legendData.close && (
					<span>
						C:{" "}
						<span style={{ color: legendData.color }}>{legendData.close}</span>
					</span>
				)}
				{legendData.change && (
					<span
						style={{
							color: legendData.change.startsWith("+") ? "#22c55e" : "#ef4444",
						}}
						className="text-xs"
					>
						{legendData.change}
					</span>
				)}
			</div>
		</div>
	);
};

export { KlineLegend };
