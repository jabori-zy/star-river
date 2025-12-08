import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { Subscription } from "rxjs";
import StrategyPerformanceReportComponent from "@/components/backtest/strategy-performance-report";
import { createBacktestStrategyPerformanceStream } from "@/hooks/obs/backtest-strategy-performance-obs";
import { getStrategyPerformanceReport } from "@/service/backtest-strategy/benchmark";
import type { StrategyPerformanceReport } from "@/types/strategy/strategy-benchmark";

interface StrategyBenchmarkProps {
	strategyId: number;
}

export interface StrategyBenchmarkRef {
	clearPerformanceData: () => void;
}

const StrategyBenchmark = forwardRef<
	StrategyBenchmarkRef,
	StrategyBenchmarkProps
>(({ strategyId }, ref) => {
	const [data, setData] = useState<StrategyPerformanceReport | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const performanceStreamSubscriptionRef = useRef<Subscription | null>(null);

	// Fetch initial data
	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await getStrategyPerformanceReport(strategyId);
			console.log("result", result);
			setData(result);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to fetch performance report",
			);
			console.error("Error fetching performance report:", err);
		} finally {
			setIsLoading(false);
		}
	}, [strategyId]);

	// Expose method for clearing performance data
	useImperativeHandle(
		ref,
		() => ({
			clearPerformanceData: () => {
				setData(null);
			},
		}),
		[],
	);

	// Initialize performance data
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// SSE real-time data subscription
	useEffect(() => {
		// Clean up previous subscription (if exists)
		if (performanceStreamSubscriptionRef.current) {
			performanceStreamSubscriptionRef.current.unsubscribe();
			performanceStreamSubscriptionRef.current = null;
		}

		// Create performance data stream subscription
		const performanceStream = createBacktestStrategyPerformanceStream(true);
		const subscription = performanceStream.subscribe((performanceEvent) => {
			// Only process performance data for current strategy
			if (performanceEvent.strategyId === strategyId) {
				setData(performanceEvent.report);
			}
		});

		performanceStreamSubscriptionRef.current = subscription;

		return () => {
			performanceStreamSubscriptionRef.current?.unsubscribe();
			performanceStreamSubscriptionRef.current = null;
		};
	}, [strategyId]);

	if (error) {
		return (
			<div className="flex items-center justify-center h-full p-4">
				<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded max-w-md">
					<p className="font-semibold">Error loading performance report</p>
					<p className="text-sm mt-1">{error}</p>
				</div>
			</div>
		);
	}

	if (isLoading && !data) {
		return (
			<div className="flex items-center justify-center h-full text-muted-foreground">
				Loading performance report...
			</div>
		);
	}

	return (
		<div className="h-full overflow-y-auto pr-2">
			<StrategyPerformanceReportComponent data={data} />
		</div>
	);
});

StrategyBenchmark.displayName = "StrategyBenchmark";

export default StrategyBenchmark;
