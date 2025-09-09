import type { StrategyStateLogEvent, NodeStateLogEvent } from "@/types/strategy-event/strategy-state-log-event";

export interface StrategyLoadingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    logs: (StrategyStateLogEvent | NodeStateLogEvent)[];
    currentStage: "strategy-check" | "node-init" | "completed" | "failed" | "stopping" | "stopped";
    title?: "策略加载中" | "策略停止中"; // 可选的标题参数
    onStrategyStateChange?: (state: "ready" | "failed") => void;
}

export type LogEvent = (StrategyStateLogEvent | NodeStateLogEvent) & {
    type: "strategy" | "node";
};