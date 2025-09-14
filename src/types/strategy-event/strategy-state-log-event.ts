import type { NodeId, NodeName } from "../node";
import type { LogLevel } from "./index";

 



export type StrategyStateLogEvent = {
    strategyId: number,
    strategyName: string,
    strategyState: StrategyState,
    strategyStateAction: string | null,
    logLevel: LogLevel,
    errorCode: string | null,
    errorCodeChain: string[] | null,
    message: string,
    datetime: string,

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
    datetime: string,
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