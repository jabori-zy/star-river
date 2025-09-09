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
import { LogLevel } from "@/types/strategy-event";
import type { StrategyRunningLogEvent } from "@/types/strategy-event/strategy-running-log-event";
import {
	StrategyRunningLogSource,
	StrategyRunningLogType,
} from "@/types/strategy-event/strategy-running-log-event";

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

		// 生成mock数据
		const generateMockLogData = useCallback((): StrategyRunningLogEvent[] => {
			const mockLogs: StrategyRunningLogEvent[] = [
				{
					strategyId,
					nodeId: "if_else_node_4",
					nodeName: "条件节点4",
					source: StrategyRunningLogSource.Node,
					logLevel: LogLevel.INFO,
					logType: StrategyRunningLogType.ConditionMatch,
					message: "[条件节点4] condition [1] matched",
					detail: {
						comparisonSymbol: ">=",
						conditionId: 1,
						conditionResult: true,
						leftValue: 113765.41714285711,
						rightValue: 100000.0,
					},
					errorCode: null,
					errorCodeChain: null,
					timestamp: Date.now() - 1000,
				},
				{
					strategyId,
					nodeId: "indicator_node_3",
					nodeName: "指标节点3", 
					source: StrategyRunningLogSource.Node,
					logLevel: LogLevel.DEBUG,
					logType: StrategyRunningLogType.ConditionMatch,
					message: "[指标节点3] 计算移动平均线: MA(20) = 113765.42",
					detail: {
						period: 20,
						value: 113765.41714285711,
						calculation: "SMA",
					},
					errorCode: null,
					errorCodeChain: null,
					timestamp: Date.now() - 2000,
				},
				{
					strategyId,
					nodeId: "futures_order_node_5",
					nodeName: "期货下单节点5",
					source: StrategyRunningLogSource.VirtualTradingSystem,
					logLevel: LogLevel.INFO,
					logType: StrategyRunningLogType.ConditionMatch,
					message: "订单已创建: BTCUSDT BUY 1000 @ 113765.42",
					detail: {
						orderId: "order_12345",
						symbol: "BTCUSDT",
						side: "BUY",
						quantity: 1000,
						price: 113765.42,
					},
					errorCode: null,
					errorCodeChain: null,
					timestamp: Date.now() - 3000,
				},
				{
					strategyId,
					nodeId: "risk_management_node_6",
					nodeName: "风险管理节点6",
					source: StrategyRunningLogSource.Node,
					logLevel: LogLevel.WARNING,
					logType: StrategyRunningLogType.ConditionMatch,
					message: "仓位风险警告: 当前仓位已达到最大风险限额的80%",
					detail: {
						currentRisk: 0.8,
						maxRisk: 1.0,
						position: 8000,
						maxPosition: 10000,
					},
					errorCode: "RISK_WARNING_001",
					errorCodeChain: ["RISK_001", "POSITION_001"],
					timestamp: Date.now() - 4000,
				},
				{
					strategyId,
					nodeId: "data_source_node_1",
					nodeName: "数据源节点1",
					source: StrategyRunningLogSource.VirtualTradingSystem,
					logLevel: LogLevel.ERROR,
					logType: StrategyRunningLogType.ConditionMatch,
					message: "获取市场数据失败: 连接超时",
					detail: {
						symbol: "BTCUSDT",
						exchange: "binance",
						errorType: "TIMEOUT",
						retryCount: 3,
					},
					errorCode: "DATA_SOURCE_ERROR_001",
					errorCodeChain: ["NETWORK_001", "TIMEOUT_001"],
					timestamp: Date.now() - 5000,
				},
			];

			return mockLogs.sort((a, b) => b.timestamp - a.timestamp);
		}, [strategyId]);

		// 初始化日志数据
		const getRunningLogData = useCallback(async () => {
			try {
				// 尝试从API获取数据
				const logData = await getStrategyRunningLog(strategyId);
				setLogData(logData.sort((a, b) => b.timestamp - a.timestamp));
			} catch (error) {
				console.warn("获取策略运行日志失败，使用mock数据:", error);
				// API失败时使用mock数据
				const mockLogData = generateMockLogData();
				setLogData(mockLogData);
			}
		}, [strategyId, generateMockLogData]);

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
					console.log('收到运行日志:', logEvent);
					setLogData((prev) => {
						// 检查是否已存在相同的日志（基于timestamp和message防重复）
						const exists = prev.some(
							(log) => log.timestamp === logEvent.timestamp && log.message === logEvent.message
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