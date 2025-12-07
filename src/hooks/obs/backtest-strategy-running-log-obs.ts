import { BehaviorSubject, Observable, Subject } from "rxjs";
import { share, takeUntil } from "rxjs/operators";
import { ZodError } from "zod";
import type {
	NodeRunningLogEvent,
	StrategyRunningLogEvent,
} from "@/types/strategy-event/running-log-event";
import { RunningLogEventSchema } from "@/types/strategy-event/running-log-event";
import { getBacktestStrategyRunningLogUrl } from ".";
import { SSEConnectionState } from "./backtest-strategy-event-obs";

/**
 * Backtest strategy running log Observable service
 * Wraps SSE data stream as RxJS Observable, handles strategy running log data updates
 */
class BacktestStrategyRunningLogObservableService {
	private eventSource: EventSource | null = null;
	private connectionState$ = new BehaviorSubject<SSEConnectionState>(
		SSEConnectionState.DISCONNECTED,
	);
	private destroy$ = new Subject<void>();
	private logDataSubject = new Subject<
		StrategyRunningLogEvent | NodeRunningLogEvent
	>();

	/**
	 * Get connection state Observable
	 */
	getConnectionState(): Observable<SSEConnectionState> {
		return this.connectionState$.asObservable();
	}

	/**
	 * Create strategy running log data stream Observable
	 * @param enabled Whether to enable connection
	 * @returns Observable stream of strategy running log data updates
	 */
	createBacktestStrategyRunningLogStream(
		enabled: boolean = true,
	): Observable<StrategyRunningLogEvent | NodeRunningLogEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				// Return empty Observable
				subscriber.complete();
			});
		}

		// If already connected, return existing data stream directly
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.logDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		// Establish new connection
		this.connect();

		return this.logDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	/**
	 * Establish SSE connection
	 */
	private connect(): void {
		if (this.eventSource) {
			this.disconnect();
		}

		this.connectionState$.next(SSEConnectionState.CONNECTING);

		try {
			this.eventSource = new EventSource(getBacktestStrategyRunningLogUrl());

			// Connection successful
			this.eventSource.onopen = () => {
				this.connectionState$.next(SSEConnectionState.CONNECTED);
			};

			// Receive messages
			this.eventSource.onmessage = (event) => {
				this.handleMessage(event);
			};

			// Connection error
			this.eventSource.onerror = (error) => {
				console.error("Strategy running log SSE connection error:", error);
				this.connectionState$.next(SSEConnectionState.ERROR);
				this.handleError();
			};
		} catch (error) {
			console.error("Failed to create strategy running log SSE connection:", error);
			this.connectionState$.next(SSEConnectionState.ERROR);
		}
	}

	/**
	 * Handle SSE messages
	 * Uses Zod for runtime validation and data transformation
	 */
	private handleMessage(event: MessageEvent): void {
		try {
			const rawData = JSON.parse(event.data);

			// Use Zod to validate and parse the data
			const result = RunningLogEventSchema.safeParse(rawData);

			if (!result.success) {
				// Validation failed - log detailed error information
				console.error("strategy running log validation failed:", {
					raw: rawData,
					errors: result.error.format(), // Structured error info
					flatErrors: result.error.flatten(), // Flattened error info
				});
				return;
			}

			// Data is validated and transformed (e.g., logLevel converted from "warn" to LogLevel.WARNING)
			const logEvent = result.data;
			this.logDataSubject.next(logEvent);
		} catch (error) {
			if (error instanceof ZodError) {
				console.error("Zod validation error:", error.issues);
			} else {
				console.error("parse strategy running log SSE message failed:", error);
			}
		}
	}

	/**
	 * Handle connection errors
	 */
	private handleError(): void {
		this.disconnect();

		// Reconnection logic can be added here
		// setTimeout(() => {
		//     if (this.connectionState$.value === SSEConnectionState.ERROR) {
		//         this.connect();
		//     }
		// }, 5000);
	}

	/**
	 * Disconnect SSE connection
	 */
	disconnect(): void {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
			this.connectionState$.next(SSEConnectionState.DISCONNECTED);
		}
	}

	/**
	 * Destroy service and clean up all resources
	 */
	destroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.disconnect();
		this.logDataSubject.complete();
		this.connectionState$.complete();
	}
}

// Create singleton instance
const backtestStrategyRunningLogObservableService =
	new BacktestStrategyRunningLogObservableService();

export default backtestStrategyRunningLogObservableService;

// Export convenience functions
export const createBacktestStrategyRunningLogStream = (
	enabled: boolean = true,
) =>
	backtestStrategyRunningLogObservableService.createBacktestStrategyRunningLogStream(
		enabled,
	);

// Connection management
export const getRunningLogConnectionState = () =>
	backtestStrategyRunningLogObservableService.getConnectionState();

export const disconnectRunningLogStream = () =>
	backtestStrategyRunningLogObservableService.disconnect();
