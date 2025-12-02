export * from "./backtest-strategy-event";
export * from "./running-log-event";
export * from "./strategy-state-log-event";

export enum LogLevel {
	DEBUG = "Debug",
	INFO = "Info",
	WARN = "Warn",
	ERROR = "Error",
	TRACE = "Trace",
}

export type BaseEventProps = {
	channel: string;
	event: string;
	datetime: string;
	cycleId: number;
	nodeId: string;
	nodeName: string;
	outputHandleId: string;
};
