import { BehaviorSubject, Observable, Subject } from "rxjs"
import { share, takeUntil } from "rxjs/operators"
import type { StrategyPerformanceUpdateEvent } from "@/types/strategy-event/strategy-performance-event"
import { getBacktestStrategyPerformanceUrl } from "."
import { SSEConnectionState } from "./backtest-strategy-event-obs"

class BacktestStrategyPerformanceObservableService {
	private eventSource: EventSource | null = null
	private connectionState$ = new BehaviorSubject<SSEConnectionState>(
		SSEConnectionState.DISCONNECTED,
	)
	private destroy$ = new Subject<void>()
	private performanceDataSubject = new Subject<StrategyPerformanceUpdateEvent>()

	/**
	 * Get connection state Observable
	 */
	getConnectionState(): Observable<SSEConnectionState> {
		return this.connectionState$.asObservable()
	}

	/**
	 * Create backtest strategy performance stream
	 * @param enabled Whether to enable
	 * @returns Backtest strategy performance stream
	 */
	createBacktestStrategyPerformanceStream(
		enabled: boolean = true,
	): Observable<StrategyPerformanceUpdateEvent> {
		if (!enabled) {
			this.disconnect()
			return new Observable((subscriber) => {
				// Complete Observable
				subscriber.complete()
			})
		}

		// If SSE connection is already open, return performance data Observable
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.performanceDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share())
		}

		// Connect SSE
		this.connect()

		return this.performanceDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share())
	}

	/**
	 * Handle SSE messages
	 */
	private connect(): void {
		if (this.eventSource) {
			this.disconnect()
		}

		this.connectionState$.next(SSEConnectionState.CONNECTING)

		try {
			this.eventSource = new EventSource(getBacktestStrategyPerformanceUrl())

			// Connection successful
			this.eventSource.onopen = () => {
				this.connectionState$.next(SSEConnectionState.CONNECTED)
			}

			// Handle messages
			this.eventSource.onmessage = (event) => {
				this.handleMessage(event)
			}

			// Handle errors
			this.eventSource.onerror = (error) => {
				console.error("SSE connection error:", error)
				this.connectionState$.next(SSEConnectionState.ERROR)
				this.handleError()
			}
		} catch (error) {
			console.error("SSE connection error:", error)
			this.connectionState$.next(SSEConnectionState.ERROR)
		}
	}

	/**
	 * Handle SSE messages
	 */
	private handleMessage(event: MessageEvent): void {
		try {
			const performanceEvent = JSON.parse(event.data) as StrategyPerformanceUpdateEvent
			this.performanceDataSubject.next(performanceEvent)
		} catch (error) {
			console.error("Handle SSE message error:", error)
		}
	}

	/**
	 * Handle SSE errors
	 */
	private handleError(): void {
		this.disconnect()

		// Retry connection
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
			this.eventSource.close()
			this.eventSource = null
			this.connectionState$.next(SSEConnectionState.DISCONNECTED)
		}
	}

	/**
	 * Destroy Observable
	 */
	destroy(): void {
		this.destroy$.next()
		this.destroy$.complete()
		this.disconnect()
		this.performanceDataSubject.complete()
		this.connectionState$.complete()
	}
}

// Create backtest strategy performance Observable service
const backtestStrategyPerformanceObservableService =
	new BacktestStrategyPerformanceObservableService()

export default backtestStrategyPerformanceObservableService

// Create backtest strategy performance stream
export const createBacktestStrategyPerformanceStream = (
	enabled: boolean = true,
) =>
	backtestStrategyPerformanceObservableService.createBacktestStrategyPerformanceStream(
		enabled,
	)

// Get performance connection state
export const getPerformanceConnectionState = () =>
	backtestStrategyPerformanceObservableService.getConnectionState()

export const disconnectPerformanceStream = () =>
	backtestStrategyPerformanceObservableService.disconnect()
