import { BehaviorSubject, Observable, Subject } from "rxjs"
import { share, takeUntil } from "rxjs/operators"
import type { ReceivedEventUpdate } from "@/types/strategy-event/event-received-event"
import { SSEConnectionState } from "./backtest-strategy-event-obs"
import { getBacktestEventTestUrl } from ".";

class BacktestEventTestObservableService {
	private eventSource: EventSource | null = null
	private connectionState$ = new BehaviorSubject<SSEConnectionState>(
		SSEConnectionState.DISCONNECTED,
	)
	private destroy$ = new Subject<void>()
	private eventTestDataSubject = new Subject<ReceivedEventUpdate>()

	/**
	 * Get connection state Observable
	 */
	getConnectionState(): Observable<SSEConnectionState> {
		return this.connectionState$.asObservable()
	}

	/**
	 * Create backtest event test stream
	 * @param enabled Whether to enable
	 * @returns Backtest event test stream
	 */
	createBacktestEventTestStream(
		enabled: boolean = true,
	): Observable<ReceivedEventUpdate> {
		if (!enabled) {
			this.disconnect()
			return new Observable((subscriber) => {
				// Complete Observable
				subscriber.complete()
			})
		}

		// If SSE connection is already open, return event test data Observable
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.eventTestDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share())
		}

		// Connect SSE
		this.connect()

		return this.eventTestDataSubject
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
			this.eventSource = new EventSource(getBacktestEventTestUrl())

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
			const receivedEvent = JSON.parse(event.data) as ReceivedEventUpdate
			this.eventTestDataSubject.next(receivedEvent)
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
		this.eventTestDataSubject.complete()
		this.connectionState$.complete()
	}
}

// Create backtest strategy performance Observable service
const backtestEventTestObservableService =
	new BacktestEventTestObservableService()

export default backtestEventTestObservableService

// Create backtest strategy performance stream
export const createBacktestEventTestStream = (
	enabled: boolean = true,
) =>
	backtestEventTestObservableService.createBacktestEventTestStream(
		enabled,
	)

// Get performance connection state
export const getEventTestConnectionState = () =>
	backtestEventTestObservableService.getConnectionState()

export const disconnectEventTestStream = () =>
	backtestEventTestObservableService.disconnect()
