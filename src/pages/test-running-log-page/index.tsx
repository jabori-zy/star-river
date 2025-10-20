import type React from "react";
import { useEffect, useState } from "react";
import BacktestRunningLogTable from "@/components/table/backtest-running-log-table";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LogLevel } from "@/types/strategy-event";
import type { StrategyRunningLogEvent } from "@/types/strategy-event/strategy-running-log-event";
import {
	StrategyRunningLogSource,
	StrategyRunningLogType,
} from "@/types/strategy-event/strategy-running-log-event";

// Mock 数据生成函数
const generateMockLogData = (): StrategyRunningLogEvent[] => {
	const mockLogs: StrategyRunningLogEvent[] = [
		{
			strategyId: 2,
			nodeId: "if_else_node_4",
			nodeName: "条件节点4",
			source: StrategyRunningLogSource.Node,
			logLevel: LogLevel.INFO,
			logType: StrategyRunningLogType.ConditionMatch,
			message: "[条件节点4] condition [1] matched",
			detail: [
				{
					comparisonSymbol: ">=",
					conditionId: 1,
					conditionResult: true,
					leftValue: 113765.41714285711,
					left: {
						nodeId: "indicator_node_3",
						nodeName: "指标节点3",
						outputHandleId: "indicator_node_3_output_1",
						varType: "variable",
						variable: "ma",
						variableConfigId: 1,
					},
					rightValue: 100000.0,
					right: {
						nodeId: null,
						nodeName: null,
						outputHandleId: null,
						varType: "constant",
						variable: "100000",
						variableConfigId: null,
					},
				},
			],
			errorCode: null,
			errorCodeChain: null,
			timestamp: 1757385426007,
		},
		{
			strategyId: 2,
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
			timestamp: 1757385425998,
		},
		{
			strategyId: 2,
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
			timestamp: 1757385426010,
		},
		{
			strategyId: 2,
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
			timestamp: 1757385426015,
		},
		{
			strategyId: 2,
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
			timestamp: 1757385425990,
		},
		{
			strategyId: 2,
			nodeId: "algorithm_node_7",
			nodeName: "算法节点7",
			source: StrategyRunningLogSource.Node,
			logLevel: LogLevel.TRACE,
			logType: StrategyRunningLogType.ConditionMatch,
			message: "执行算法计算: RSI(14) = 65.42, MACD = 123.45",
			detail: {
				rsi: 65.42,
				macd: 123.45,
				signal: 98.76,
				histogram: 24.69,
			},
			errorCode: null,
			errorCodeChain: null,
			timestamp: 1757385426000,
		},
		{
			strategyId: 2,
			nodeId: "stop_loss_node_8",
			nodeName: "止损节点8",
			source: StrategyRunningLogSource.VirtualTradingSystem,
			logLevel: LogLevel.ERROR,
			logType: StrategyRunningLogType.ConditionMatch,
			message: "止损单执行失败: 余额不足",
			detail: {
				orderId: "stop_order_67890",
				symbol: "BTCUSDT",
				side: "SELL",
				quantity: 1500,
				stopPrice: 110000,
				availableBalance: 50000,
				requiredBalance: 165000000,
			},
			errorCode: "INSUFFICIENT_BALANCE_001",
			errorCodeChain: ["BALANCE_001", "ORDER_001"],
			timestamp: 1757385426020,
		},
		{
			strategyId: 2,
			nodeId: "if_else_node_4",
			nodeName: "条件节点4",
			source: StrategyRunningLogSource.Node,
			logLevel: LogLevel.INFO,
			logType: StrategyRunningLogType.ConditionMatch,
			message:
				"[条件节点4] condition [2] not matched: 当前价格 112000 < 触发价格 115000",
			detail: {
				comparisonSymbol: ">=",
				conditionId: 2,
				conditionResult: false,
				leftValue: 112000,
				rightValue: 115000,
			},
			errorCode: null,
			errorCodeChain: null,
			timestamp: 1757385426025,
		},
	];

	// 生成更多随机数据
	const additionalLogs: StrategyRunningLogEvent[] = [];
	const logLevels = [
		LogLevel.DEBUG,
		LogLevel.INFO,
		LogLevel.WARNING,
		LogLevel.ERROR,
		LogLevel.TRACE,
	];
	const sources = [
		StrategyRunningLogSource.Node,
		StrategyRunningLogSource.VirtualTradingSystem,
	];

	for (let i = 0; i < 25; i++) {
		const randomLevel = logLevels[Math.floor(Math.random() * logLevels.length)];
		const randomSource = sources[Math.floor(Math.random() * sources.length)];
		const nodeNumber = Math.floor(Math.random() * 10) + 1;

		additionalLogs.push({
			strategyId: 2,
			nodeId: `random_node_${nodeNumber}`,
			nodeName: `随机节点${nodeNumber}`,
			source: randomSource,
			logLevel: randomLevel,
			logType: StrategyRunningLogType.ConditionMatch,
			message: `[随机节点${nodeNumber}] 随机生成的日志消息 ${i + 1}`,
			detail: {
				randomValue: Math.random() * 1000,
				iteration: i + 1,
			},
			errorCode: randomLevel === LogLevel.ERROR ? `ERROR_${i + 1}` : null,
			errorCodeChain:
				randomLevel === LogLevel.ERROR ? [`ERROR_${i + 1}`] : null,
			timestamp: Date.now() - Math.random() * 60000, // 随机过去1分钟内的时间
		});
	}

	return [...mockLogs, ...additionalLogs].sort(
		(a, b) => b.timestamp - a.timestamp,
	);
};

const TestRunningLogPage: React.FC = () => {
	const [logData, setLogData] = useState<StrategyRunningLogEvent[]>([]);
	const [isAutoRefresh, setIsAutoRefresh] = useState(false);

	// 初始化数据
	useEffect(() => {
		setLogData(generateMockLogData());
	}, []);

	// 自动刷新模拟
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isAutoRefresh) {
			interval = setInterval(() => {
				// 模拟新日志到达
				const newLog: StrategyRunningLogEvent = {
					strategyId: 2,
					nodeId: "auto_refresh_node",
					nodeName: "自动刷新节点",
					source:
						Math.random() > 0.5
							? StrategyRunningLogSource.Node
							: StrategyRunningLogSource.VirtualTradingSystem,
					logLevel: [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARNING][
						Math.floor(Math.random() * 3)
					],
					logType: StrategyRunningLogType.ConditionMatch,
					message: `自动生成的日志消息 - ${new Date().toLocaleTimeString()}`,
					detail: {
						autoGenerated: true,
						timestamp: Date.now(),
					},
					errorCode: null,
					errorCodeChain: null,
					timestamp: Date.now(),
				};

				setLogData((prev) => [newLog, ...prev]);
			}, 2000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isAutoRefresh]);

	const handleClearLogs = () => {
		setLogData([]);
	};

	const handleRegenerateLogs = () => {
		setLogData(generateMockLogData());
	};

	const handleToggleAutoRefresh = () => {
		setIsAutoRefresh(!isAutoRefresh);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>策略运行日志测试页面</CardTitle>
					<CardDescription>
						测试 BacktestRunningLogTable 组件的功能，包含各种日志级别和mock数据
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4 mb-6">
						<Button onClick={handleRegenerateLogs} variant="outline">
							重新生成数据
						</Button>
						<Button onClick={handleClearLogs} variant="outline">
							清空日志
						</Button>
						<Button
							onClick={handleToggleAutoRefresh}
							variant={isAutoRefresh ? "default" : "outline"}
						>
							{isAutoRefresh ? "停止自动刷新" : "开始自动刷新"}
						</Button>
					</div>

					<div className="text-sm text-muted-foreground mb-4">
						<p>• 包含所有日志级别：DEBUG, INFO, WARNING, ERROR, TRACE</p>
						<p>• 支持不同来源：Node, VirtualTradingSystem</p>
						<p>• 包含错误代码和错误链信息</p>
						<p>• 可测试分页、排序、筛选功能</p>
					</div>
				</CardContent>
			</Card>

			<BacktestRunningLogTable
				data={logData}
				title="策略运行日志"
				showTitle={true}
			/>
		</div>
	);
};

export default TestRunningLogPage;
