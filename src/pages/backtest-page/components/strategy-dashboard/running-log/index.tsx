import { DateTime } from "luxon";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { Subscription } from "rxjs";
import { LogTable } from "@/components/new-table/backtest/log-table";
import BacktestRunningLogTable from "@/components/table/backtest-running-log-table";
import { createBacktestStrategyRunningLogStream } from "@/hooks/obs/backtest-strategy-running-log-obs";
import { getStrategyRunningLog } from "@/service/backtest-strategy";
import type {
	NodeRunningLogEvent,
	StrategyRunningLogEvent,
} from "@/types/strategy-event/running-log-event";

interface RunningLogProps {
	strategyId: number;
}

export interface RunningLogRef {
	clearRunningLogs: () => void;
}

const RunningLog = forwardRef<RunningLogRef, RunningLogProps>(
	({ strategyId }, ref) => {
		const [logData, setLogData] = useState<
			(StrategyRunningLogEvent | NodeRunningLogEvent)[]
		>([]);
		const logStreamSubscriptionRef = useRef<Subscription | null>(null);

		// Expose method for clearing logs
		useImperativeHandle(
			ref,
			() => ({
				clearRunningLogs: () => {
					setLogData([]);
				},
			}),
			[],
		);

		// Initialize log data
		const getRunningLogData = useCallback(async () => {
			try {
				// Try to fetch data from API
				const logData = await getStrategyRunningLog(strategyId);

				setLogData(
					logData.sort(
						(a, b) =>
							DateTime.fromISO(b.datetime).toMillis() -
							DateTime.fromISO(a.datetime).toMillis(),
					),
				);
			} catch (error) {
				console.warn("获取策略运行日志失败", error);
				// Use mock data when API fails
			}
		}, [strategyId]);

		// Initialize log data
		useEffect(() => {
			getRunningLogData();
		}, [getRunningLogData]);

		// SSE real-time data subscription
		useEffect(() => {
			// Clean up previous subscription (if exists)
			if (logStreamSubscriptionRef.current) {
				logStreamSubscriptionRef.current.unsubscribe();
				logStreamSubscriptionRef.current = null;
			}

			// Create running log data stream subscription
			const logStream = createBacktestStrategyRunningLogStream(true);
			const subscription = logStream.subscribe((logEvent) => {
				// Only process logs for current strategy
				if (logEvent.strategyId === strategyId) {
					setLogData((prev) => {
						// Check if the same log already exists (based on timestamp and message to prevent duplicates)
						const exists = prev.some(
							(log) =>
								log.datetime === logEvent.datetime &&
								log.message === logEvent.message,
						);
						if (!exists) {
							// Insert in reverse order, newest logs first
							return [logEvent, ...prev];
						}
						return prev;
					});
				}
			});

			logStreamSubscriptionRef.current = subscription;

			return () => {
				logStreamSubscriptionRef.current?.unsubscribe();
				logStreamSubscriptionRef.current = null;
			};
		}, [strategyId]);

		return (
			<div className="flex flex-col h-full">
				<div className="h-full w-full">
					<LogTable data={logData} />
				</div>
			</div>
		);
	},
);

RunningLog.displayName = "RunningLog";

export default RunningLog;
