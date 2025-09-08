import type { NodeId, NodeName } from "../node";




export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    TRACE = "trace",
}



export type StrategyStateLogEvent = {
    strategyId: number,
    strategyName: string,
    strategyState: StrategyState,
    strategyStateAction: string | null,
    logLevel: LogLevel,
    errorCode: string | null,
    errorCodeChain: string[] | null,
    message: string,
    timestamp: number,

}



export type NodeStateLogEvent = {
    strategyId: number,
    strategyName: string,
    nodeId: NodeId,
    nodeName: NodeName,
    nodeState: NodeState,
    nodeStateAction: string,
    logLevel: LogLevel,
    errorCode: string | null,
    errorCodeChain: string[] | null,
    message: string,
    timestamp: number,
}


export enum NodeState {
    Checking = "Checking",
    Created = "Created",        
    Initializing = "Initializing",   
    Ready = "Ready",       
    Backtesting = "Backtesting",   
    BacktestComplete = "BacktestComplete",   
    Stopping = "Stopping",     
    Stopped = "Stopped",     
    Failed = "Failed",   

}


export enum StrategyState {
    Created = "Created",
    Checking = "Checking",
    CheckPassed = "CheckPassed",
    Initializing = "Initializing",
    Ready = "Ready",
    Stopping = "Stopping",
    Stopped = "Stopped",
    Failed = "Failed",

}