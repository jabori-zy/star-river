import { useEffect, useState } from "react"
import StrategyPerformanceReportComponent from "@/components/backtest/strategy-performance-report"
import { Button } from "@/components/ui/button"
import { getStrategyPerformanceReport } from "@/service/backtest-strategy/benchmark"
import type { StrategyPerformanceReport } from "@/types/strategy/strategy-benchmark"

export default function TestStrategyPerformanceReportPage() {
	const [data, setData] = useState<StrategyPerformanceReport | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const strategyId = 2 // K�(�Ve ID

	const fetchData = async () => {
		setIsLoading(true)
		setError(null)
		try {
			const result = await getStrategyPerformanceReport(strategyId)
            console.log("result", result)
			setData(result)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch data")
			console.error("Error fetching performance report:", err)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchData()
	}, [])

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Strategy Performance Report Test</h1>
					<p className="text-muted-foreground mt-2">
						Testing performance report component with Strategy ID: {strategyId}
					</p>
				</div>
				<Button onClick={fetchData} disabled={isLoading}>
					{isLoading ? "Loading..." : "Reload Data"}
				</Button>
			</div>

			{error && (
				<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
					<p className="font-semibold">Error</p>
					<p className="text-sm">{error}</p>
				</div>
			)}

			{data ? (
				<StrategyPerformanceReportComponent data={data} />
			) : (
				!isLoading && (
					<div className="text-center py-12 text-muted-foreground">
						No data loaded yet
					</div>
				)
			)}

			{isLoading && !data && (
				<div className="text-center py-12 text-muted-foreground">
					Loading performance report...
				</div>
			)}
		</div>
	)
}
