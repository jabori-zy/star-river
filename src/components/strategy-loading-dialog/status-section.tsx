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
// 	// Get the latest log event information
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

// 		// Get the latest log (sorted by timestamp)
// 		const latestLog = logs.sort((a, b) => b.timestamp - a.timestamp)[0];

// 		if ("strategyState" in latestLog) {
// 			// strategy-state-log: Only when strategy state is Ready is it considered the final success state
// 			const strategyLog = latestLog as StrategyStateLogEvent;
// 			const isReady = strategyLog.strategyState === BacktestStrategyRunStatus.Ready;
// 			const isStopped = strategyLog.strategyState === BacktestStrategyRunStatus.Stopped;
// 			// Conditions for strategy failure:
// 			// 1. strategyState is explicitly Failed
// 			// 2. Or has error code and log level is error
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
// 			// node-state-log: Display node name + state, but not considered final success
// 			const nodeLog = latestLog as NodeStateLogEvent;
// 			// Conditions for node failure:
// 			// 1. nodeState is explicitly Failed
// 			// 2. Or has error code and log level is error
// 			const isFailed =
// 				nodeLog.nodeState === NodeState.Failed ||
// 				(nodeLog.errorCode && nodeLog.logLevel === LogLevel.ERROR);

// 			return {
// 				type: "node-state-log-update",
// 				isReady: false, // Node state is never considered final success
// 				isStopped: false, // Node state does not involve stopping
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
// 									`Strategy: ${latestEventInfo.displayText}`}
// 								{latestEventInfo.type === "node-state-log-update" &&
// 									`Node: ${latestEventInfo.displayText}`}
// 								{!latestEventInfo.type && "Waiting for strategy to load..."}
// 							</div>
// 							{latestEventInfo.statusText && (
// 								<div
// 									className={`text-sm ${latestEventInfo.isFailed ? "text-red-600" : "text-gray-600"}`}
// 								>
// 									Status: {latestEventInfo.statusText}
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
// 									`Strategy: ${latestEventInfo.displayText}`}
// 								{latestEventInfo.type === "node-state-log-update" &&
// 									`Node: ${latestEventInfo.displayText}`}
// 								{!latestEventInfo.type && "Waiting for logs..."}
// 							</div>
// 							{latestEventInfo.statusText && (
// 								<div
// 									className={`text-sm ${latestEventInfo.isFailed ? "text-red-600" : "text-gray-600"}`}
// 								>
// 									Status: {latestEventInfo.statusText}
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
// 							Strategy loaded, ready to start...
// 						</div>
// 					</div>
// 				);
// 			case "failed":
// 				return (
// 					<div className="flex items-center space-x-3">
// 						<XCircle className="w-5 h-5 text-red-500" />
// 						<div className="font-medium text-red-700">Strategy loading failed</div>
// 					</div>
// 				);
// 			case "stopping":
// 				return (
// 					<div className="flex items-center space-x-3">
// 						<Loader2 className="w-5 h-5 animate-spin text-orange-500" />
// 						<div className="font-medium text-orange-700">Stopping strategy...</div>
// 					</div>
// 				);
// 			case "stopped":
// 				return (
// 					<div className="flex items-center space-x-3">
// 						<CheckCircle className="w-5 h-5 text-green-500" />
// 						<div className="font-medium text-green-700">Strategy safely stopped</div>
// 					</div>
// 				);
// 			default:
// 				return null;
// 		}
// 	};

// 	return <Card className="p-4">{renderTopStatus()}</Card>;
// };

// export default StatusSection;
