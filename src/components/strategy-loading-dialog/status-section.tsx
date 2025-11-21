// import { CheckCircle, Loader2, XCircle } from "lucide-react";
// import type React from "react";
// import { useMemo } from "react";
// import { Card } from "@/components/ui/card";
// import { LogLevel } from "@/types/strategy-event";
// import type {
// 	NodeStateLogEvent,
// 	StrategyStateLogEvent,
// } from "@/types/strategy-event/strategy-state-log-event";
// import {
// 	NodeState,
// 	BacktestStrategyRunStatus,
// } from "@/types/strategy-event/strategy-state-log-event";
// import { translateStrategyState } from "./utils";

// interface StatusSectionProps {
// 	currentStage:
// 		| "strategy-check"
// 		| "node-init"
// 		| "completed"
// 		| "failed"
// 		| "stopping"
// 		| "stopped";
// 	logs: (StrategyStateLogEvent | NodeStateLogEvent)[];
// }

// const StatusSection: React.FC<StatusSectionProps> = ({
// 	currentStage,
// 	logs,
// }) => {
// 	// 获取最新的日志事件信息
// 	const latestEventInfo = useMemo(() => {
// 		if (logs.length === 0) {
// 			return {
// 				type: null,
// 				isReady: false,
// 				isStopped: false,
// 				displayText: null,
// 				statusText: null,
// 			};
// 		}

// 		// 获取最新的日志（按时间戳排序）
// 		const latestLog = logs.sort((a, b) => b.timestamp - a.timestamp)[0];

// 		if ("strategyState" in latestLog) {
// 			// strategy-state-log：只有策略状态为Ready时才是最终成功状态
// 			const strategyLog = latestLog as StrategyStateLogEvent;
// 			const isReady = strategyLog.strategyState === BacktestStrategyRunStatus.Ready;
// 			const isStopped = strategyLog.strategyState === BacktestStrategyRunStatus.Stopped;
// 			// 策略失败的判断条件：
// 			// 1. strategyState 明确为 Failed
// 			// 2. 或者有错误代码且日志级别为 error
// 			const isFailed =
// 				strategyLog.strategyState === BacktestStrategyRunStatus.Failed ||
// 				(strategyLog.error && strategyLog.logLevel === LogLevel.ERROR);

// 			return {
// 				type: "strategy-state-log-update",
// 				isReady,
// 				isStopped,
// 				isFailed,
// 				displayText: strategyLog.strategyName,
// 				statusText: translateStrategyState(strategyLog.strategyState),
// 			};
// 		} else {
// 			// node-state-log：显示节点名称+状态，但不算最终成功
// 			const nodeLog = latestLog as NodeStateLogEvent;
// 			// 节点失败的判断条件：
// 			// 1. nodeState 明确为 Failed
// 			// 2. 或者有错误代码且日志级别为 error
// 			const isFailed =
// 				nodeLog.nodeState === NodeState.Failed ||
// 				(nodeLog.errorCode && nodeLog.logLevel === LogLevel.ERROR);

// 			return {
// 				type: "node-state-log-update",
// 				isReady: false, // 节点状态永远不算最终成功
// 				isStopped: false, // 节点状态不涉及停止
// 				isFailed,
// 				displayText: nodeLog.nodeName,
// 				statusText: translateStrategyState(nodeLog.nodeState),
// 			};
// 		}
// 	}, [logs]);
// 	const renderTopStatus = () => {
// 		switch (currentStage) {
// 			case "strategy-check":
// 				return (
// 					<div className="flex items-center space-x-3">
// 						{latestEventInfo.isFailed ? (
// 							<XCircle className="w-5 h-5 text-red-500" />
// 						) : latestEventInfo.isReady ? (
// 							<CheckCircle className="w-5 h-5 text-green-500" />
// 						) : (
// 							<Loader2 className="w-5 h-5 animate-spin text-blue-500" />
// 						)}
// 						<div>
// 							<div className="font-medium">
// 								{latestEventInfo.type === "strategy-state-log-update" &&
// 									`策略: ${latestEventInfo.displayText}`}
// 								{latestEventInfo.type === "node-state-log-update" &&
// 									`节点: ${latestEventInfo.displayText}`}
// 								{!latestEventInfo.type && "等待策略加载..."}
// 							</div>
// 							{latestEventInfo.statusText && (
// 								<div
// 									className={`text-sm ${latestEventInfo.isFailed ? "text-red-600" : "text-gray-600"}`}
// 								>
// 									状态: {latestEventInfo.statusText}
// 								</div>
// 							)}
// 						</div>
// 					</div>
// 				);
// 			case "node-init":
// 				return (
// 					<div className="flex items-center space-x-3">
// 						{latestEventInfo.isFailed ? (
// 							<XCircle className="w-5 h-5 text-red-500" />
// 						) : latestEventInfo.isReady ? (
// 							<CheckCircle className="w-5 h-5 text-green-500" />
// 						) : (
// 							<Loader2 className="w-5 h-5 animate-spin text-green-500" />
// 						)}
// 						<div>
// 							<div className="font-medium">
// 								{latestEventInfo.type === "strategy-state-log-update" &&
// 									`策略: ${latestEventInfo.displayText}`}
// 								{latestEventInfo.type === "node-state-log-update" &&
// 									`节点: ${latestEventInfo.displayText}`}
// 								{!latestEventInfo.type && "等待日志..."}
// 							</div>
// 							{latestEventInfo.statusText && (
// 								<div
// 									className={`text-sm ${latestEventInfo.isFailed ? "text-red-600" : "text-gray-600"}`}
// 								>
// 									状态: {latestEventInfo.statusText}
// 								</div>
// 							)}
// 						</div>
// 					</div>
// 				);
// 			case "completed":
// 				return (
// 					<div className="flex items-center space-x-3">
// 						<CheckCircle className="w-5 h-5 text-green-500" />
// 						<div className="font-medium text-green-700">
// 							策略加载完成，准备启动...
// 						</div>
// 					</div>
// 				);
// 			case "failed":
// 				return (
// 					<div className="flex items-center space-x-3">
// 						<XCircle className="w-5 h-5 text-red-500" />
// 						<div className="font-medium text-red-700">策略加载失败</div>
// 					</div>
// 				);
// 			case "stopping":
// 				return (
// 					<div className="flex items-center space-x-3">
// 						<Loader2 className="w-5 h-5 animate-spin text-orange-500" />
// 						<div className="font-medium text-orange-700">正在停止策略...</div>
// 					</div>
// 				);
// 			case "stopped":
// 				return (
// 					<div className="flex items-center space-x-3">
// 						<CheckCircle className="w-5 h-5 text-green-500" />
// 						<div className="font-medium text-green-700">策略已安全停止</div>
// 					</div>
// 				);
// 			default:
// 				return null;
// 		}
// 	};

// 	return <Card className="p-4">{renderTopStatus()}</Card>;
// };

// export default StatusSection;
