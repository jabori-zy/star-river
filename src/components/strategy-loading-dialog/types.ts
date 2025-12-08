import type {
	NodeStateLogEvent,
	StrategyStateLogEvent,
} from "@/types/strategy-event/strategy-state-log-event";

export interface StrategyLoadingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	logs: (StrategyStateLogEvent | NodeStateLogEvent)[];
	currentStage:
		| "strategy-check"
		| "node-init"
		| "completed"
		| "failed"
		| "stopping"
		| "stopped";
	title?: "Strategy Loading" | "Strategy Stopping"; // Optional title parameter
	onStrategyStateChange?: (state: "ready" | "failed") => void;
}

export type LogEvent = (StrategyStateLogEvent | NodeStateLogEvent) & {
	type: "strategy" | "node";
};
