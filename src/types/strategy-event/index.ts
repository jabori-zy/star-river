export * from "./backtest-strategy-event";
export * from "./strategy-running-log-event";
export * from "./strategy-state-log-event";

export enum LogLevel {
	DEBUG = "Debug",
	INFO = "Info",
	WARNING = "Warning",
	ERROR = "Error",
	TRACE = "Trace",
}


export type BaseEventProps = {
	channel: string;
	eventType: string;
	event: string;
	datetime: string;
	fromNodeId: string;
	fromNodeName: string;
	fromNodeHandleId: string;
};
