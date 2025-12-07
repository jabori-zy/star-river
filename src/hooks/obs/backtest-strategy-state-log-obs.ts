import { BehaviorSubject, Observable, Subject } from "rxjs";
import { share, takeUntil } from "rxjs/operators";
import type {
	NodeStateLogEvent,
	StrategyStateLogEvent,
} from "@/types/strategy-event/strategy-state-log-event";
import { getBacktestStrategyStateLogUrl } from ".";
import { SSEConnectionState } from "./backtest-strategy-event-obs";

/**
 * Backtest strategy state log Observable service
 * Wraps SSE data stream as RxJS Observable, handles strategy log data updates
 */
class BacktestStrategyStateLogObservableService {
	private eventSource: EventSource | null = null;
	private connectionState$ = new BehaviorSubject<SSEConnectionState>(
		SSEConnectionState.DISCONNECTED,
	);
	private destroy$ = new Subject<void>();
	private logDataSubject = new Subject<
		StrategyStateLogEvent | NodeStateLogEvent
	>();

	/**
	 * Get connection state Observable
	 */
	getConnectionState(): Observable<SSEConnectionState> {
		return this.connectionState$.asObservable();
	}

	/**
	 * Create strategy state log data stream Observable
	 * @param enabled Whether to enable connection
	 * @returns Observable stream of strategy log data updates
	 */
	createBacktestStrategyStateLogStream(
		enabled: boolean = true,
	): Observable<StrategyStateLogEvent | NodeStateLogEvent> {
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
			this.eventSource = new EventSource(getBacktestStrategyStateLogUrl());

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
				console.error("Strategy state log sse connection error:", error);
				this.connectionState$.next(SSEConnectionState.ERROR);
				this.handleError();
			};
		} catch (error) {
			console.error("Strategy state log sse connection failed:", error);
			this.connectionState$.next(SSEConnectionState.ERROR);
		}
	}

	/**
	 * Handle SSE messages
	 */
	private handleMessage(event: MessageEvent): void {
		try {
			const logEvent = JSON.parse(event.data) as
				| StrategyStateLogEvent
				| NodeStateLogEvent;
			this.logDataSubject.next(logEvent);
		} catch (error) {
			console.error("Parse strategy state log sse message failed:", error);
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
const backtestStrategyStateLogObservableService =
	new BacktestStrategyStateLogObservableService();

export default backtestStrategyStateLogObservableService;

// Export convenience functions
export const createBacktestStrategyStateLogStream = (enabled: boolean = true) =>
	backtestStrategyStateLogObservableService.createBacktestStrategyStateLogStream(
		enabled,
	);

// Connection management
export const getStateLogConnectionState = () =>
	backtestStrategyStateLogObservableService.getConnectionState();

export const disconnectStateLogStream = () =>
	backtestStrategyStateLogObservableService.disconnect();
