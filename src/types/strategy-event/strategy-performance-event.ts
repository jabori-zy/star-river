import type { StrategyPerformanceReport } from "@/types/strategy/strategy-benchmark";

/**
 * Strategy performance update event
 */
export interface StrategyPerformanceUpdateEvent {
	channel: "strategy";
	eventType: "backtest-strategy";
	event: "strategy-performance-update-event";
	strategyId: number;
	report: StrategyPerformanceReport;
}
