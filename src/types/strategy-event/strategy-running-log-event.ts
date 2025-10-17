import type { LogLevel } from "./index";

export enum StrategyRunningLogSource {
	VirtualTradingSystem = "VirtualTradingSystem",
	Node = "Node",
}

export enum StrategyRunningLogType {
	ConditionMatch = "ConditionMatch",
}

export type StrategyRunningLogEvent = {
	strategyId: number;

	nodeId: string;

	nodeName: string;

	source: StrategyRunningLogSource;

	logLevel: LogLevel;

	logType: StrategyRunningLogType;

	message: string;

	detail: object;

	errorCode: string | null;

	errorCodeChain: string[] | null;

	datetime: string;
};
