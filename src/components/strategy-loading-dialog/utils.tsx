import { AlertCircle, Info, XCircle } from "lucide-react";
import { LogLevel } from "@/types/strategy-event";
import type {
	NodeState,
	NodeStateLogEvent,
	StrategyState,
	StrategyStateLogEvent,
} from "@/types/strategy-event/strategy-state-log-event";
import type { LogEvent } from "./types";

// State translation mapping
export const translateStrategyState = (state: string | null) => {
	if (!state) return "Unknown state";

	const stateMap: Record<StrategyState, string> = {
		Checking: "Checking",
		Created: "Created",
		CheckPassed: "Check passed",
		Initializing: "Initializing",
		Ready: "Ready",
		Stopping: "Stopping",
		Stopped: "Stopped",
		Failed: "Failed",
	};
	return stateMap[state as StrategyState] || state;
};

export const translateAction = (action: string | null) => {
	if (!action) return "Unknown action";

	const actionMap: Record<NodeState, string> = {
		Checking: "Checking node config",
		Created: "Created",
		Initializing: "Initializing",
		Ready: "Ready",
		Backtesting: "Backtesting",
		BacktestComplete: "Backtest complete",
		Stopping: "Stopping",
		Stopped: "Stopped",
		Failed: "Failed",
	};
	return actionMap[action as NodeState] || action;
};

// Get log level color and icon
export const getLogLevelStyle = (level: LogLevel) => {
	switch (level) {
		case LogLevel.ERROR:
			return {
				badgeClass: "bg-red-100 text-red-800 hover:bg-red-100",
				bgClass: "bg-red-50",
				icon: <XCircle className="w-4 h-4 text-red-500" />,
			};
		case LogLevel.WARNING:
			return {
				badgeClass: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
				bgClass: "bg-yellow-50",
				icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
			};
		case LogLevel.INFO:
			return {
				badgeClass: "bg-blue-100 text-blue-800 hover:bg-blue-100",
				bgClass: "",
				icon: <Info className="w-4 h-4 text-blue-500" />,
			};
		default:
			return {
				badgeClass: "bg-gray-100 text-gray-800 hover:bg-gray-100",
				bgClass: "",
				icon: <Info className="w-4 h-4 text-gray-500" />,
			};
	}
};

// Merge and sort all logs, newest at bottom
export const mergeAndSortLogs = (
	strategyLogs: StrategyStateLogEvent[],
	nodeLogs: NodeStateLogEvent[],
): LogEvent[] => {
	const allLogs: LogEvent[] = [
		...strategyLogs.map((log) => ({ ...log, type: "strategy" as const })),
		...nodeLogs.map((log) => ({ ...log, type: "node" as const })),
	];
	return allLogs.sort((a, b) => a.timestamp - b.timestamp);
};
