import type { StrategyPerformanceReport } from "@/types/strategy/strategy-benchmark"

/**
 * 策略性能更新事件
 */
export interface StrategyPerformanceUpdateEvent {
	channel: "strategy"
	eventType: "backtest-strategy"
	event: "strategy-performance-update-event"
	strategyId: number
	report: StrategyPerformanceReport
}
