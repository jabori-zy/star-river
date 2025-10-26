import type { StrategyPerformanceReport } from "@/types/strategy/strategy-benchmark"
import { formatDuration } from "@/types/strategy/strategy-benchmark"
import MetricCard from "./metric-card"
import StrategyPerformanceTable from "./strategy-performance-table"
import NodePerformanceTable from "./node-performance-table"

interface StrategyPerformanceReportProps {
	data: StrategyPerformanceReport | null
}

export default function StrategyPerformanceReportComponent({
	data,
}: StrategyPerformanceReportProps) {
	const hasData = data !== null && data.totalCycles > 0

	return (
		<div className="w-full space-y-4">
			{/* Key Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
				<MetricCard
					label="Total Cycles"
					value={data?.totalCycles.toLocaleString() ?? "0"}
				/>
				<MetricCard
					label="Avg Duration"
					value={hasData ? formatDuration(data.avgDuration) : "N/A"}
				/>
				<MetricCard
					label="Min"
					value={hasData ? formatDuration(data.minDuration) : "N/A"}
				/>
				<MetricCard
					label="Max"
					value={hasData ? formatDuration(data.maxDuration) : "N/A"}
				/>
			</div>

			{/* Duration Statistics Table */}
			<StrategyPerformanceTable
				hasData={hasData}
				avgDuration={data?.avgDuration}
				p25={data?.p25}
				p50={data?.p50}
				p75={data?.p75}
				minDuration={data?.minDuration}
				maxDuration={data?.maxDuration}
				p95={data?.p95}
				p99={data?.p99}
				recentAvg100={data?.recentAvg100}
				stdDeviation={data?.stdDeviation}
			/>

			{/* Node Performance Table */}
			<NodePerformanceTable nodeReports={data?.nodeReports ?? []} />
		</div>
	)
}
