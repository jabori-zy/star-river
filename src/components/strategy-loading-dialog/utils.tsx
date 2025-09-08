import { XCircle, AlertCircle, Info } from "lucide-react";
import type { LogEvent } from "./types";
import type { StrategyStateLogEvent, NodeStateLogEvent } from "@/types/strategy-event/strategy-log-event";
import { LogLevel, type StrategyState, type NodeState } from "@/types/strategy-event/strategy-log-event";

// 状态翻译映射
export const translateStrategyState = (state: string | null) => {
    if (!state) return "未知状态";
    
    const stateMap: Record<StrategyState, string> = {
        "Checking": "检查中",
        "Created": "创建",
        "CheckPassed": "检查通过",
        "Initializing": "初始化中",
        "Ready": "就绪",
        "Stopping": "停止中",
        "Stopped": "停止",
        "Failed": "失败"
    };
    return stateMap[state as StrategyState] || state;
};

export const translateAction = (action: string | null) => {
    if (!action) return "未知操作";
    
    const actionMap: Record<NodeState, string> = {
        "Checking": "检查节点配置",
        "Created": "创建",
        "Initializing": "初始化",
        "Ready": "就绪",
        "Backtesting": "回测中",
        "BacktestComplete": "回测完成",
        "Stopping": "停止中",
        "Stopped": "停止",
        "Failed": "失败"
    };
    return actionMap[action as NodeState] || action;
};

// 获取日志级别颜色和图标
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

// 合并并排序所有日志，最新的在下方
export const mergeAndSortLogs = (
    strategyLogs: StrategyStateLogEvent[],
    nodeLogs: NodeStateLogEvent[]
): LogEvent[] => {
    const allLogs: LogEvent[] = [
        ...strategyLogs.map(log => ({ ...log, type: "strategy" as const })),
        ...nodeLogs.map(log => ({ ...log, type: "node" as const }))
    ];
    return allLogs.sort((a, b) => a.timestamp - b.timestamp);
};


