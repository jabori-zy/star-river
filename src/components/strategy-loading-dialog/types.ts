import type { StrategyStateLogEvent, NodeStateLogEvent } from "@/types/strategy-event/strategy-log-event";

export interface StrategyLoadingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    logs: (StrategyStateLogEvent | NodeStateLogEvent)[];
    currentStage: "strategy-check" | "node-init" | "completed" | "failed";
    onStrategyStateChange?: (state: "ready" | "failed") => void;
}

export type LogEvent = (StrategyStateLogEvent | NodeStateLogEvent) & {
    type: "strategy" | "node";
};