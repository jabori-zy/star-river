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
import BacktestRunningLogTable from "@/components/table/backtest-running-log-table";
import { createBacktestStrategyRunningLogStream } from "@/hooks/obs/backtest-strategy-running-log-obs";
import { getStrategyRunningLog } from "@/service/backtest-strategy";
import type { StrategyRunningLogEvent } from "@/types/strategy-event/strategy-running-log-event";

interface RunningLogProps {
	strategyId: number;
}

export interface RunningLogRef {
	clearRunningLogs: () => void;
}

const RunningLog = forwardRef<RunningLogRef, RunningLogProps>(
	({ strategyId }, ref) => {
		const [logData, setLogData] = useState<StrategyRunningLogEvent[]>([]);
		const logStreamSubscriptionRef = useRef<Subscription | null>(null);

		// 暴露清空日志的方法
		useImperativeHandle(
			ref,
			() => ({
				clearRunningLogs: () => {
					setLogData([]);
				},
			}),
			[],
		);

		// 初始化日志数据
		const getRunningLogData = useCallback(async () => {
			try {
				// 尝试从API获取数据
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
				// API失败时使用mock数据
			}
		}, [strategyId]);

		// 初始化日志数据
		useEffect(() => {
			getRunningLogData();
		}, [getRunningLogData]);

		// SSE实时数据订阅
		useEffect(() => {
			// 清理之前的订阅（如果存在）
			if (logStreamSubscriptionRef.current) {
				logStreamSubscriptionRef.current.unsubscribe();
				logStreamSubscriptionRef.current = null;
			}

			// 创建运行日志数据流订阅
			const logStream = createBacktestStrategyRunningLogStream(true);
			const subscription = logStream.subscribe((logEvent) => {
				// 只处理当前策略的日志
				if (logEvent.strategyId === strategyId) {
					setLogData((prev) => {
						// 检查是否已存在相同的日志（基于timestamp和message防重复）
						const exists = prev.some(
							(log) =>
								log.datetime === logEvent.datetime &&
								log.message === logEvent.message,
						);
						if (!exists) {
							// 倒序插入，最新的日志在前面
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
					<BacktestRunningLogTable
						title="运行日志"
						showTitle={false}
						data={logData}
					/>
				</div>
			</div>
		);
	},
);

RunningLog.displayName = "RunningLog";

export default RunningLog;
