import { z } from "zod";
import { LogLevel } from "./index";

// ============ Zod Schemas ============

// Common schema for strategy running logs
const StrategyRunningLogCommonSchema = z.object({
	type: z.literal("strategy"),
	logLevel: z.string(), // Will be refined and transformed in specific schemas
	cycleId: z.number(),
	strategyId: z.number(),
	message: z.string(),
	datetime: z.string(),
	detail: z.any().nullable().optional().default(null),
	// Optional SSE metadata fields
	channel: z.string().optional(),
	event: z.string().optional(),
});

// Strategy Info Log
const StrategyRunningInfoLogSchema = StrategyRunningLogCommonSchema.extend({
	logLevel: z
		.string()
		.refine((val) => val.toLowerCase() === "info", {
			message: "logLevel must be 'info'",
		})
		.transform(() => LogLevel.INFO),
});

// Strategy Warn Log
const StrategyRunningWarnLogSchema = StrategyRunningLogCommonSchema.extend({
	logLevel: z
		.string()
		.refine(
			(val) => {
				const lower = val.toLowerCase();
				return lower === "warn";
			},
			{
				message: "logLevel must be 'warn' or 'warning'",
			},
		)
		.transform(() => LogLevel.WARN),
	errorCode: z.string().nullable(),
	errorCodeChain: z.array(z.string()).nullable(),
});

// Strategy Error Log
const StrategyRunningErrorLogSchema = StrategyRunningLogCommonSchema.extend({
	logLevel: z
		.string()
		.refine((val) => val.toLowerCase() === "error", {
			message: "logLevel must be 'error'",
		})
		.transform(() => LogLevel.ERROR),
	errorCode: z.string(),
	errorCodeChain: z.array(z.string()),
});

// Common schema for node running logs
const NodeRunningLogCommonSchema = z.object({
	type: z.literal("node"),
	logLevel: z.string(), // Will be refined and transformed in specific schemas
	cycleId: z.number(),
	strategyId: z.number(),
	nodeId: z.string(),
	nodeName: z.string(),
	message: z.string(),
	datetime: z.string(),
	detail: z.any().nullable().optional().default(null),
	// Optional SSE metadata fields
	channel: z.string().optional(),
	event: z.string().optional(),
});

// Node Info Log
const NodeRunningInfoLogSchema = NodeRunningLogCommonSchema.extend({
	logLevel: z
		.string()
		.refine((val) => val.toLowerCase() === "info", {
			message: "logLevel must be 'info'",
		})
		.transform(() => LogLevel.INFO),
});

// Node Warn Log
const NodeRunningWarnLogSchema = NodeRunningLogCommonSchema.extend({
	logLevel: z
		.string()
		.refine(
			(val) => {
				const lower = val.toLowerCase();
				return lower === "warn" || lower === "warning";
			},
			{
				message: "logLevel must be 'warn' or 'warning'",
			},
		)
		.transform(() => LogLevel.WARN),
	errorCode: z.string().nullable(),
	errorCodeChain: z.array(z.string()).nullable(),
});

// Node Error Log
const NodeRunningErrorLogSchema = NodeRunningLogCommonSchema.extend({
	logLevel: z
		.string()
		.refine((val) => val.toLowerCase() === "error", {
			message: "logLevel must be 'error'",
		})
		.transform(() => LogLevel.ERROR),
	errorCode: z.string(),
	errorCodeChain: z.array(z.string()),
});

// Union schemas for parsing
const StrategyRunningLogEventSchemaInternal = z.union([
	StrategyRunningInfoLogSchema,
	StrategyRunningWarnLogSchema,
	StrategyRunningErrorLogSchema,
]);

const NodeRunningLogEventSchemaInternal = z.union([
	NodeRunningInfoLogSchema,
	NodeRunningWarnLogSchema,
	NodeRunningErrorLogSchema,
]);

/**
 * Main schema for validating running log events from SSE
 * This will try to parse as either a strategy log or node log
 */
export const RunningLogEventSchema = z.union([
	StrategyRunningLogEventSchemaInternal,
	NodeRunningLogEventSchemaInternal,
]);

// ============ Type Definitions (inferred from Zod schemas) ============

// Infer types directly from Zod schemas to ensure type safety
export type StrategyRunningInfoLog = z.infer<
	typeof StrategyRunningInfoLogSchema
>;
export type StrategyRunningWarnLog = z.infer<
	typeof StrategyRunningWarnLogSchema
>;
export type StrategyRunningErrorLog = z.infer<
	typeof StrategyRunningErrorLogSchema
>;

export type NodeRunningInfoLog = z.infer<typeof NodeRunningInfoLogSchema>;
export type NodeRunningWarnLog = z.infer<typeof NodeRunningWarnLogSchema>;
export type NodeRunningErrorLog = z.infer<typeof NodeRunningErrorLogSchema>;

export type StrategyRunningLogEvent =
	| StrategyRunningInfoLog
	| StrategyRunningWarnLog
	| StrategyRunningErrorLog;

export type NodeRunningLogEvent =
	| NodeRunningInfoLog
	| NodeRunningWarnLog
	| NodeRunningErrorLog;

// ============ Type Guards ============

export function isStrategyRunningLogEvent(
	event: StrategyRunningLogEvent | NodeRunningLogEvent,
): event is StrategyRunningLogEvent {
	return event.type === "strategy";
}

export function isStrategyRunningInfoLog(
	event: StrategyRunningLogEvent,
): event is StrategyRunningInfoLog {
	return event.type === "strategy" && event.logLevel === LogLevel.INFO;
}

export function isStrategyRunningWarnLog(
	event: StrategyRunningLogEvent,
): event is StrategyRunningWarnLog {
	return event.type === "strategy" && event.logLevel === LogLevel.WARN;
}

export function isStrategyRunningErrorLog(
	event: StrategyRunningLogEvent,
): event is StrategyRunningErrorLog {
	return event.type === "strategy" && event.logLevel === LogLevel.ERROR;
}

export function isNodeRunningLogEvent(
	event: StrategyRunningLogEvent | NodeRunningLogEvent,
): event is NodeRunningLogEvent {
	return event.type === "node";
}

export function isNodeRunningInfoLog(
	event: NodeRunningLogEvent,
): event is NodeRunningInfoLog {
	return event.type === "node" && event.logLevel === LogLevel.INFO;
}

export function isNodeRunningWarnLog(
	event: NodeRunningLogEvent,
): event is NodeRunningWarnLog {
	return event.type === "node" && event.logLevel === LogLevel.WARN;
}

export function isNodeRunningErrorLog(
	event: NodeRunningLogEvent,
): event is NodeRunningErrorLog {
	return event.type === "node" && event.logLevel === LogLevel.ERROR;
}
