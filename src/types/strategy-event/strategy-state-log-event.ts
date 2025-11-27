import type { NodeId, NodeName, NodeType } from "../node";
import { LogLevel } from "./index";
import type { StrategyRunState } from "@/types/strategy";
import type { BacktestNodeRunState } from "@/types/strategy/backtest-strategy";


export type StrategyStateLogEvent = StrategyStateInfoLog | StrategyStateWarnLog | StrategyStateErrorLog;


export type StrategyStateInfoLog = {
	channel: string;
	event: string;
	logLevel: LogLevel;
    strategyId: number;
    strategyName: string;
    strategyState: StrategyRunState;
    strategyStateAction: string | null;
    message: string;
    datetime: string;
}

export type StrategyStateWarnLog = {
	channel: string;
	event: string;
	logLevel: LogLevel;
    strategyId: number;
    strategyName: string;
    strategyState: StrategyRunState;
    strategyStateAction: string | null;
    errorCode: string | null;
    errorCodeChain: string[] | null;
    message: string;
    datetime: string;
}


export type StrategyStateErrorLog = {
	channel: string;
	event: string;
	logLevel: LogLevel;
    strategyId: number;
    strategyName: string;
    strategyState: StrategyRunState;
    strategyStateAction: string | null;
    errorCode: string | null;
    errorCodeChain: string[] | null;
    message: string;
    datetime: string;
}

export function isStrategyStateInfoLog(event: StrategyStateLogEvent | NodeStateLogEvent): event is StrategyStateInfoLog {
	return event.event === "strategy-state-log-update-event" && event.logLevel === LogLevel.INFO;
}

export function isStrategyStateWarnLog(event: StrategyStateLogEvent | NodeStateLogEvent): event is StrategyStateWarnLog {
	return event.event === "strategy-state-log-update-event" && event.logLevel === LogLevel.WARNING;
}

export function isStrategyStateErrorLog(event: StrategyStateLogEvent | NodeStateLogEvent): event is StrategyStateErrorLog {
	return event.event === "strategy-state-log-update-event" && event.logLevel === LogLevel.ERROR;
}




export type NodeStateLogEvent = NodeStateInfoLog | NodeStateWarnLog | NodeStateErrorLog;




export type NodeStateInfoLog = {
	channel: string;
	event: string;
	strategyId: number;
	strategyName: string;
	nodeId: NodeId;
	nodeName: NodeName;
	nodeState: BacktestNodeRunState;
	nodeType: NodeType;
	nodeStateAction: string;
	logLevel: LogLevel;
	message: string;
	datetime: string;
}



export type NodeStateWarnLog = {
	channel: string;
	event: string;
	strategyId: number;
	nodeId: NodeId;
	nodeName: NodeName;
	nodeState: BacktestNodeRunState;
	nodeType: NodeType;
	nodeStateAction: string;
	logLevel: LogLevel;
	errorCode: string | null;
	errorCodeChain: string[] | null;
	message: string;
	datetime: string;
}


export type NodeStateErrorLog = {
	channel: string;
	event: string;
	strategyId: number;
	nodeId: NodeId;
	nodeName: NodeName;
	nodeState: BacktestNodeRunState;
	nodeType: NodeType;
	nodeStateAction: string;
	logLevel: LogLevel;
	message: string;
	errorCode: string | null;
	errorCodeChain: string[] | null;
	datetime: string;
}


export function isNodeStateInfoLog(event: NodeStateLogEvent | StrategyStateLogEvent): event is NodeStateInfoLog {
	return event.event === "node-state-log-update-event" && event.logLevel === LogLevel.INFO;
}

export function isNodeStateWarnLog(event: NodeStateLogEvent | StrategyStateLogEvent): event is NodeStateWarnLog {
	return event.event === "node-state-log-update-event" && event.logLevel === LogLevel.WARNING;
}

export function isNodeStateErrorLog(event: NodeStateLogEvent | StrategyStateLogEvent): event is NodeStateErrorLog {
	return event.event === "node-state-log-update-event" && event.logLevel === LogLevel.ERROR;
}