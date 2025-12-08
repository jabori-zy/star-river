/**
 * Strategy Performance Benchmark Types
 * Corresponds to backend: star-river-core/src/strategy/strategy_benchmark.rs and node_benchmark.rs
 */

/**
 * Duration type (corresponds to Rust Duration)
 */
export interface Duration {
	secs: number;
	nanos: number;
}

/**
 * Phase duration tuple: [phase_name, duration]
 */
export type PhaseDuration = [string, Duration];

// ============================================================
// Node Performance Types
// ============================================================

/**
 * Node single cycle report
 */
export interface NodeCycleReport {
	nodeId: string;
	nodeName: string;
	playIndex: number;
	totalDuration: Duration;
	phaseDurations: PhaseDuration[];
}

/**
 * Node phase report (node-level phase statistics)
 */
export interface NodePhaseReport {
	phaseName: string;
	totalCycles: number;
	avgDuration: Duration;
	minDuration: Duration;
	maxDuration: Duration;
	totalDuration: Duration;
	avgDurationPercentage: number; // Average duration percentage
	p25: Duration;
	p50: Duration;
	p75: Duration;
	p95: Duration;
	p99: Duration;
}

/**
 * Strategy phase report (strategy-level phase statistics)
 */
export interface StrategyPhaseReport {
	phaseName: string;
	totalCycles: number;
	avgDuration: Duration;
	minDuration: Duration;
	maxDuration: Duration;
	totalDuration: Duration;
	durationPercentage: number; // Duration percentage
	p25: Duration;
	p50: Duration;
	p75: Duration;
	p95: Duration;
	p99: Duration;
}

/**
 * Node performance report
 */
export interface NodePerformanceReport {
	nodeId: string;
	nodeName: string;
	nodeType: string;
	totalCycles: number;
	totalDurationNs: number; // u128 in Rust, use number in TypeScript
	avgDuration: Duration;
	minDuration: Duration;
	maxDuration: Duration;
	stdDeviation: Duration;
	p25: Duration;
	p50: Duration;
	p75: Duration;
	p95: Duration;
	p99: Duration;
	recentAvg100: Duration;
	avgDurationPercentage: number; // Average duration percentage
	phaseReports: NodePhaseReport[];
}

// ============================================================
// Strategy Performance Types
// ============================================================

/**
 * Strategy single cycle report
 */
export interface StrategyCycleReport {
	playIndex: number;
	totalDuration: Duration;
	phaseDurations: PhaseDuration[];
	nodeCycleReports: NodeCycleReport[];
	nodeExecutePercentage: Array<[string, number]>;
}

/**
 * Strategy overall performance report
 */
export interface StrategyPerformanceReport {
	totalCycles: number;
	avgDuration: Duration;
	minDuration: Duration;
	maxDuration: Duration;
	stdDeviation: Duration;
	p25: Duration;
	p50: Duration;
	p75: Duration;
	p95: Duration;
	p99: Duration;
	recentAvg100: Duration;
	strategyPhaseReports: StrategyPhaseReport[];
	nodeReports: NodePerformanceReport[];
}

// ============================================================
// Utility Functions (for display only)
// ============================================================

/**
 * Convert Duration to milliseconds (for display)
 */
export function durationToMs(duration: Duration): number {
	return duration.secs * 1000 + duration.nanos / 1_000_000;
}

/**
 * Format Duration to human-readable string
 */
export function formatDuration(duration: Duration): string {
	const ms = durationToMs(duration);

	if (ms === 0) {
		return "0ms";
	}

	if (ms < 1) {
		const micros = duration.nanos / 1000;
		return `${micros.toFixed(2)}μs`;
	}

	if (ms < 1000) {
		return `${ms.toFixed(2)}ms`;
	}

	return `${(ms / 1000).toFixed(3)}s`;
}
