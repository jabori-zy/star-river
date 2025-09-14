import type React from "react";
import { useEffect, useState } from "react";
import { createBacktestStrategyStateLogStream, getStateLogConnectionState } from "@/hooks/obs/backtest-strategy-state-log-obs";
import { SSEConnectionState } from "@/hooks/obs/backtest-strategy-event-obs";
import type { StrategyStateLogEvent, NodeStateLogEvent } from "@/types/strategy-event/strategy-state-log-event";
import { LogLevel } from "@/types/strategy-event";
import StrategyLoadingDialog from "@/components/strategy-loading-dialog";

const TestPage: React.FC = () => {
	const [logs, setLogs] = useState<(StrategyStateLogEvent | NodeStateLogEvent)[]>([]);
	const [connectionState, setConnectionState] = useState<SSEConnectionState>(SSEConnectionState.DISCONNECTED);
	const [isEnabled, setIsEnabled] = useState(true);
	const [viewMode, setViewMode] = useState<'table' | 'terminal'>('terminal');
	const [terminalTheme, setTerminalTheme] = useState<'dark' | 'light'>('light');
	
	// 策略加载对话框状态
	const [showLoadingDialog, setShowLoadingDialog] = useState(false);

	useEffect(() => {
		if (!isEnabled) return;

		// 订阅连接状态
		const connectionSub = getStateLogConnectionState().subscribe(state => {
			setConnectionState(state);
		});

		// 订阅策略日志数据流
		const logSub = createBacktestStrategyStateLogStream(true).subscribe({
			next: (logEvent) => {
				console.log("收到策略日志:", logEvent);
				setLogs(prev => [logEvent, ...prev].slice(0, 100));
			},
			error: (error) => {
				console.error("策略日志流错误:", error);
			}
		});

		return () => {
			connectionSub.unsubscribe();
			logSub.unsubscribe();
		};
	}, [isEnabled]);

	const getConnectionStateText = (state: SSEConnectionState) => {
		switch (state) {
			case SSEConnectionState.DISCONNECTED:
				return "已断开";
			case SSEConnectionState.CONNECTING:
				return "连接中...";
			case SSEConnectionState.CONNECTED:
				return "已连接";
			case SSEConnectionState.ERROR:
				return "连接错误";
			default:
				return "未知状态";
		}
	};

	const getConnectionStateColor = (state: SSEConnectionState) => {
		switch (state) {
			case SSEConnectionState.DISCONNECTED:
				return "text-gray-500";
			case SSEConnectionState.CONNECTING:
				return "text-yellow-500";
			case SSEConnectionState.CONNECTED:
				return "text-green-500";
			case SSEConnectionState.ERROR:
				return "text-red-500";
			default:
				return "text-gray-500";
		}
	};

	const getLevelColor = (level: string | undefined) => {
		if (!level) return "text-gray-600 bg-gray-50";
		
		switch (level.toLowerCase()) {
			case "error":
				return "text-red-600 bg-red-50";
			case "warning":
				return "text-yellow-600 bg-yellow-50";
			case "info":
				return "text-blue-600 bg-blue-50";
			case "debug":
				return "text-gray-600 bg-gray-50";
			case "trace":
				return "text-purple-600 bg-purple-50";
			default:
				return "text-gray-600 bg-gray-50";
		}
	};

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">策略状态日志 SSE 测试页面</h1>
			
			{/* 连接控制 */}
			<div className="bg-white rounded-lg border p-4 mb-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<span className="text-sm font-medium">连接状态:</span>
						<span className={`text-sm font-medium ${getConnectionStateColor(connectionState)}`}>
							{getConnectionStateText(connectionState)}
						</span>
					</div>
					<div className="flex space-x-2">
						<button
							type="button"
							onClick={() => setShowLoadingDialog(true)}
							className="px-4 py-2 rounded text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
						>
							显示策略加载框
						</button>
						<button
							type="button"
							onClick={() => {
								// 模拟添加Ready状态的日志
								const readyLog: StrategyStateLogEvent = {
									strategyId: 1,
									strategyName: "测试策略",
									strategyState: StrategyState.Ready,
									strategyStateAction: "LogStrategyState",
									logLevel: LogLevel.INFO,
									errorCode: null,
									errorCodeChain: null,
									message: "策略已准备就绪",
									timestamp: Date.now()
								};
								setLogs(prev => [readyLog, ...prev]);
								setShowLoadingDialog(true); // 自动打开对话框
							}}
							className="px-4 py-2 rounded text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
						>
							模拟Ready状态
						</button>
						<button
							type="button"
							onClick={() => {
								setLogs([]);
								setShowLoadingDialog(true); // 重置后自动打开对话框
							}}
							className="px-4 py-2 rounded text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors"
						>
							重置状态
						</button>
						<button
							type="button"
							onClick={() => {
								// 添加多条测试日志
								const testLogs: StrategyStateLogEvent[] = [];
								for (let i = 0; i < 10; i++) {
									testLogs.push({
										strategyId: 1,
										strategyName: "测试策略",
										strategyState: i === 9 ? StrategyState.Ready : StrategyState.Checking,
										strategyStateAction: "LogStrategyState",
										logLevel: LogLevel.INFO,
										errorCode: null,
										errorCodeChain: null,
										message: `测试日志消息 ${i + 1}`,
										timestamp: Date.now() + i * 100
									});
								}
								setLogs(prev => [...testLogs, ...prev]);
								setShowLoadingDialog(true); // 自动打开对话框
							}}
							className="px-4 py-2 rounded text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors"
						>
							添加策略日志
						</button>
						<button
							type="button"
							onClick={() => {
								// 添加节点状态日志
								const nodeLog: NodeStateLogEvent = {
									strategyId: 1,
									strategyName: "测试策略",
									nodeId: "node_001",
									nodeName: "K线数据节点",
									nodeState: NodeState.Ready,
									nodeStateAction: "InitializeNode",
									logLevel: LogLevel.INFO,
									errorCode: null,
									errorCodeChain: null,
									message: "节点初始化完成",
									timestamp: Date.now()
								};
								setLogs(prev => [nodeLog, ...prev]);
								setShowLoadingDialog(true); // 自动打开对话框
							}}
							className="px-4 py-2 rounded text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
						>
							节点Ready(仍显示加载)
						</button>
						<button
							type="button"
							onClick={() => {
								// 快速添加多条日志测试自动滚动
								for (let i = 0; i < 5; i++) {
									setTimeout(() => {
										const log: StrategyStateLogEvent = {
											strategyId: 1,
											strategyName: "测试策略",
											strategyState: StrategyState.Checking,
											strategyStateAction: "LogStrategyState",
											logLevel: LogLevel.INFO,
											errorCode: null,
											errorCodeChain: null,
											message: `快速测试日志 ${i + 1}`,
											timestamp: Date.now()
										};
										setLogs(prev => [log, ...prev]);
									}, i * 500); // 每500ms添加一条
								}
								setShowLoadingDialog(true); // 自动打开对话框
							}}
							className="px-4 py-2 rounded text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors"
						>
							测试自动滚动(慢)
						</button>
						<button
							type="button"
							onClick={() => {
								// 快速连续添加日志测试优化后的滚动效果
								for (let i = 0; i < 10; i++) {
									setTimeout(() => {
										const log: StrategyStateLogEvent = {
											strategyId: 1,
											strategyName: "测试策略",
											strategyState: StrategyState.Checking,
											strategyStateAction: "LogStrategyState",
											logLevel: LogLevel.INFO,
											errorCode: null,
											errorCodeChain: null,
											message: `快速连续日志 ${i + 1} - 测试优化后的滚动响应速度`,
											timestamp: Date.now()
										};
										setLogs(prev => [log, ...prev]);
									}, i * 100); // 每100ms添加一条，更快速
								}
								setShowLoadingDialog(true); // 自动打开对话框
							}}
							className="px-4 py-2 rounded text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
						>
							快速滚动测试
						</button>
					</div>
					<div className="flex space-x-2 mt-2">
						<button
							type="button"
							onClick={() => {
								// 测试策略失败状态
								const failedLog: StrategyStateLogEvent = {
									strategyId: 1,
									strategyName: "测试策略",
									strategyState: StrategyState.Failed,
									strategyStateAction: "LogStrategyState",
									logLevel: LogLevel.ERROR,
									errorCode: "STRATEGY_CHECK_FAILED",
									errorCodeChain: ["VALIDATION_ERROR", "STRATEGY_CHECK_FAILED"],
									message: "策略检查失败：配置参数无效",
									timestamp: Date.now()
								};
								setLogs(prev => [failedLog, ...prev]);
								setShowLoadingDialog(true); // 自动打开对话框
							}}
							className="px-4 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
						>
							策略失败状态
						</button>
						<button
							type="button"
							onClick={() => {
								// 测试节点失败状态
								const failedNodeLog: NodeStateLogEvent = {
									strategyId: 1,
									strategyName: "测试策略",
									nodeId: "node_001",
									nodeName: "K线数据节点",
									nodeState: NodeState.Failed,
									nodeStateAction: "InitializeNode",
									logLevel: LogLevel.ERROR,
									errorCode: "NODE_INIT_FAILED",
									errorCodeChain: ["CONNECTION_ERROR", "NODE_INIT_FAILED"],
									message: "节点初始化失败：无法连接到数据源",
									timestamp: Date.now()
								};
								setLogs(prev => [failedNodeLog, ...prev]);
								setShowLoadingDialog(true); // 自动打开对话框
							}}
							className="px-4 py-2 rounded text-sm font-medium bg-red-700 hover:bg-red-800 text-white transition-colors"
						>
							节点失败状态
						</button>
						<button
							type="button"
							onClick={() => {
								// 测试节点BacktestComplete状态
								const completeNodeLog: NodeStateLogEvent = {
									strategyId: 1,
									strategyName: "测试策略",
									nodeId: "node_001",
									nodeName: "回测节点",
									nodeState: NodeState.BacktestComplete,
									nodeStateAction: "CompleteBacktest",
									logLevel: LogLevel.INFO,
									errorCode: null,
									errorCodeChain: null,
									message: "回测完成",
									timestamp: Date.now()
								};
								setLogs(prev => [completeNodeLog, ...prev]);
								setShowLoadingDialog(true); // 自动打开对话框
							}}
							className="px-4 py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
						>
							节点回测完成
						</button>
						<button
							type="button"
							onClick={() => setIsEnabled(!isEnabled)}
							className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
								isEnabled
									? "bg-red-500 hover:bg-red-600 text-white"
									: "bg-green-500 hover:bg-green-600 text-white"
							}`}
						>
							{isEnabled ? "断开连接" : "开始连接"}
						</button>
					</div>
				</div>
			</div>

			{/* 日志统计和视图模式切换 */}
			<div className="bg-white rounded-lg border p-4 mb-6">
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-600">
						已接收日志条数: <span className="font-medium text-gray-900">{logs.length}</span>
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<span className="text-sm text-gray-600">视图模式:</span>
							<button
								type="button"
								onClick={() => setViewMode('terminal')}
								className={`px-3 py-1 rounded text-sm transition-colors ${
									viewMode === 'terminal'
										? 'bg-blue-500 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
							>
								终端
							</button>
							<button
								type="button"
								onClick={() => setViewMode('table')}
								className={`px-3 py-1 rounded text-sm transition-colors ${
									viewMode === 'table'
										? 'bg-blue-500 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
							>
								表格
							</button>
						</div>
						{viewMode === 'terminal' && (
							<div className="flex items-center space-x-2">
								<span className="text-sm text-gray-600">终端主题:</span>
								<button
									type="button"
									onClick={() => setTerminalTheme('dark')}
									className={`px-3 py-1 rounded text-sm transition-colors ${
										terminalTheme === 'dark'
											? 'bg-gray-800 text-white'
											: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
									}`}
								>
									暗色
								</button>
								<button
									type="button"
									onClick={() => setTerminalTheme('light')}
									className={`px-3 py-1 rounded text-sm transition-colors ${
										terminalTheme === 'light'
											? 'bg-gray-100 text-gray-800 border border-gray-300'
											: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
									}`}
								>
									亮色
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* 日志显示区域 */}
			{viewMode === 'terminal' ? (
				<div className={`mb-6 rounded-lg shadow-lg outline outline-1 overflow-hidden ${
					terminalTheme === 'dark' 
						? 'bg-gray-900 outline-gray-700 shadow-gray-900/50' 
						: 'bg-white outline-gray-300 shadow-gray-400/20'
				}`}>
					{/* <XtermLogViewer logs={logs} theme={terminalTheme} /> */}
				</div>
			) : (
				<div className="bg-white rounded-lg border">
					<div className="p-4 border-b">
						<h3 className="text-lg font-medium">实时日志</h3>
						{logs.length > 0 && (
							<button
								type="button"
								onClick={() => setLogs([])}
								className="ml-4 text-sm text-red-500 hover:text-red-700"
							>
								清空日志
							</button>
						)}
					</div>
					<div className="max-h-96 overflow-y-auto">
						{logs.length === 0 ? (
							<div className="p-8 text-center text-gray-500">
								{isEnabled ? "等待接收日志数据..." : "点击\"开始连接\"按钮开始测试"}
							</div>
						) : (
							<div className="divide-y">
								{logs.map((log, index) => (
									<div key={`${log.timestamp}-${index}`} className="p-4 hover:bg-gray-50">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-1">
													<span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.logLevel)}`}>
														{(log.logLevel || 'UNKNOWN').toUpperCase()}
													</span>
													<span className="text-sm text-gray-500">
														策略ID: {log.strategyId || 'N/A'}
													</span>
													<span className="text-sm text-gray-500">
														节点: {'nodeName' in log ? log.nodeName || 'Unknown' : 'N/A'} ({'nodeId' in log ? log.nodeId || 'N/A' : 'N/A'})
													</span>
												</div>
												<div className="text-sm text-gray-900 mt-1">
													{log.message || 'No message'}
												</div>
											</div>
											<div className="text-xs text-gray-400 ml-4 flex-shrink-0">
												{new Date(log.timestamp).toLocaleString()}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
			
			{/* 策略加载对话框 */}
			<StrategyLoadingDialog
				open={showLoadingDialog}
				onOpenChange={setShowLoadingDialog}
				logs={logs}
				currentStage="strategy-check"
				onStrategyStateChange={(state) => {
					console.log("策略状态变化:", state);
					// 可以在这里处理策略状态变化
					if (state === "ready") {
						console.log("策略已就绪！");
					} else if (state === "failed") {
						console.log("策略失败！");
					}
				}}
			/>
		</div>
	);
};

export default TestPage;