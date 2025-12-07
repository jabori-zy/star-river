import { BehaviorSubject, Observable, Subject } from "rxjs";
import { filter, map, share, takeUntil } from "rxjs/operators";
import type { Kline } from "@/types/kline";
import type {
	BacktestStrategyStatsUpdateEvent,
	CustomVariableUpdateEvent,
	IndicatorUpdateEvent,
	KlineUpdateEvent,
	PlayFinishedEvent,
	SystemVariableUpdateEvent,
	VirtualOrderEvent,
	VirtualPositionEvent,
	VirtualTransactionEvent,
} from "@/types/strategy-event/backtest-strategy-event";
import type { KeyStr } from "@/types/symbol-key";
import { getBacktestStrategyEventSseUrl } from ".";

// SSE connection state
export enum SSEConnectionState {
	DISCONNECTED = "disconnected",
	CONNECTING = "connecting",
	CONNECTED = "connected",
	ERROR = "error",
}

const orderEvent = [
	"futures-order-filled-event", // Order filled
	"futures-order-created-event", // Order created
	"futures-order-canceled-event", // Order canceled
	"take-profit-order-created-event", // Take profit order created
	"stop-loss-order-created-event", // Stop loss order created
	"take-profit-order-filled-event", // Take profit order filled
	"stop-loss-order-filled-event", // Stop loss order filled
	"take-profit-order-canceled-event", // Take profit order canceled
	"stop-loss-order-canceled-event", // Stop loss order canceled
];

/**
 * Backtest strategy data Observable service
 * Wraps SSE data stream as RxJS Observable, handles Kline, indicator, order and other data updates
 */
class BacktestStrategyDataObservableService {
	private eventSource: EventSource | null = null;
	private connectionState$ = new BehaviorSubject<SSEConnectionState>(
		SSEConnectionState.DISCONNECTED,
	);
	private destroy$ = new Subject<void>();
	private klineDataSubject = new Subject<KlineUpdateEvent>();
	private indicatorDataSubject = new Subject<IndicatorUpdateEvent>();
	private orderDataSubject = new Subject<VirtualOrderEvent>();
	private positionDataSubject = new Subject<VirtualPositionEvent>();
	private statsDataSubject = new Subject<BacktestStrategyStatsUpdateEvent>();
	private transactionDataSubject = new Subject<VirtualTransactionEvent>();
	private playFinishedDataSubject = new Subject<PlayFinishedEvent>();
	private customVariableDataSubject = new Subject<CustomVariableUpdateEvent>();
	private systemVariableDataSubject = new Subject<SystemVariableUpdateEvent>();
	/**
	 * Get connection state Observable
	 */
	getConnectionState(): Observable<SSEConnectionState> {
		return this.connectionState$.asObservable();
	}

	/**
	 * Create Kline data stream Observable
	 * @param enabled Whether to enable connection
	 * @returns Observable stream of Kline data updates
	 */
	createKlineStream(enabled: boolean = true): Observable<KlineUpdateEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				// Return empty Observable
				subscriber.complete();
			});
		}

		// If already connected, return existing data stream directly
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.klineDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		// Establish new connection
		this.connect();

		return this.klineDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	/**
	 * Create filtered Kline data stream for specific cache key
	 * @param keyStr Cache key
	 * @param enabled Whether to enable
	 * @returns Filtered Kline data stream
	 */
	createKlineStreamFromKey(
		keyStr: KeyStr,
		enabled: boolean = true,
	): Observable<Kline> {
		return this.createKlineStream(enabled).pipe(
			filter((event) => event.klineKey === keyStr),
			map((event) => event.kline),
			share(),
		);
	}

	/**
	 * Create indicator data stream Observable
	 * @param enabled Whether to enable connection
	 * @returns Observable stream of indicator data updates
	 */
	createIndicatorStream(
		enabled: boolean = true,
	): Observable<IndicatorUpdateEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				// Return empty Observable
				subscriber.complete();
			});
		}

		// If already connected, return existing data stream directly
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.indicatorDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		// Establish new connection
		this.connect();

		return this.indicatorDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	/**
	 * Create filtered indicator data stream for specific cache key
	 * @param keyStr Cache key
	 * @param enabled Whether to enable
	 * @returns Filtered indicator data stream
	 */
	createIndicatorStreamFromKey(
		keyStr: KeyStr,
		enabled: boolean = true,
	): Observable<Record<string, number | string>> {
		return this.createIndicatorStream(enabled).pipe(
			filter((event) => event.indicatorKey === keyStr),
			map((event) => event.indicatorValue),
			share(),
		);
	}

	/**
	 * Create order data stream Observable
	 * @param enabled Whether to enable connection
	 * @returns Observable stream of order data updates
	 */
	createOrderStream(enabled: boolean = true): Observable<VirtualOrderEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				// Return empty Observable
				subscriber.complete();
			});
		}

		// If already connected, return existing data stream directly
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.orderDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		// Establish new connection
		this.connect();

		return this.orderDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	/**
	 * Create filtered order data stream for specific exchange and symbol
	 * @param exchange Exchange
	 * @param symbol Trading pair
	 * @param enabled Whether to enable
	 * @returns Filtered order data stream
	 */
	createOrderStreamForSymbol(
		exchange: string,
		symbol: string,
		enabled: boolean = true,
	): Observable<VirtualOrderEvent> {
		return this.createOrderStream(enabled).pipe(
			filter(
				(event) =>
					event.futuresOrder.exchange === exchange &&
					event.futuresOrder.symbol === symbol,
			),
			share(),
		);
	}

	createTransactionStream(
		enabled: boolean = true,
	): Observable<VirtualTransactionEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				subscriber.complete();
			});
		}

		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.transactionDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		this.connect();
		return this.transactionDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	createPositionStream(
		enabled: boolean = true,
	): Observable<VirtualPositionEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				subscriber.complete();
			});
		}

		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.positionDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		this.connect();

		return this.positionDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	createPositionStreamForSymbol(
		exchange: string,
		symbol: string,
		enabled: boolean = true,
	): Observable<VirtualPositionEvent> {
		return this.createPositionStream(enabled).pipe(
			filter((event) => {
				return (
					event.virtualPosition.exchange === exchange &&
					event.virtualPosition.symbol === symbol
				);
			}),
			share(),
		);
	}

	createStatsStream(
		enabled: boolean = true,
	): Observable<BacktestStrategyStatsUpdateEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				subscriber.complete();
			});
		}

		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.statsDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		this.connect();

		return this.statsDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	createPlayFinishedStream(
		enabled: boolean = true,
	): Observable<PlayFinishedEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				subscriber.complete();
			});
		}

		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.playFinishedDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		this.connect();

		return this.playFinishedDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	createCustomVariableStream(
		enabled: boolean = true,
	): Observable<CustomVariableUpdateEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				subscriber.complete();
			});
		}

		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.customVariableDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		this.connect();

		return this.customVariableDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	createSystemVariableStream(
		enabled: boolean = true,
	): Observable<SystemVariableUpdateEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				subscriber.complete();
			});
		}

		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.systemVariableDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		this.connect();

		return this.systemVariableDataSubject
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
			this.eventSource = new EventSource(getBacktestStrategyEventSseUrl());

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
				console.error("SSE connection error:", error);
				this.connectionState$.next(SSEConnectionState.ERROR);
				this.handleError();
			};
		} catch (error) {
			console.error("Failed to create SSE connection:", error);
			this.connectionState$.next(SSEConnectionState.ERROR);
		}
	}

	/**
	 * Handle SSE messages
	 */
	private handleMessage(event: MessageEvent): void {
		try {
			const strategyEvent = JSON.parse(event.data);
			// console.log("Received SSE message:", strategyEvent);

			// Handle Kline update event
			if (strategyEvent.event === "kline-update-event") {
				// Type-safe event construction
				const klineEvent: KlineUpdateEvent = {
					channel: strategyEvent.channel,
					event: strategyEvent.event,
					datetime: strategyEvent.datetime,
					cycleId: strategyEvent.cycleId,
					nodeId: strategyEvent.nodeId,
					nodeName: strategyEvent.nodeName,
					outputHandleId: strategyEvent.outputHandleId,
					klineKey: strategyEvent.klineKey,
					kline: strategyEvent.kline,
				};
				this.klineDataSubject.next(klineEvent);
			}

			// Handle indicator update event
			if (strategyEvent.event === "indicator-update-event") {
				const indicatorEvent = strategyEvent as IndicatorUpdateEvent;

				// Use raw indicator event directly, datetime remains as string type
				// console.log("Send indicator data to Observable stream:", indicatorEvent);
				this.indicatorDataSubject.next(indicatorEvent);
			}

			// Handle order filled event
			if (orderEvent.includes(strategyEvent.event)) {
				const orderEvent = strategyEvent as VirtualOrderEvent;

				if (
					strategyEvent.event === "futures-order-filled-event" ||
					strategyEvent.event === "futures-order-created-event" ||
					strategyEvent.event === "futures-order-canceled-event"
				) {
					// console.log("orderEvent", orderEvent);
					// Convert createTime and updateTime strings in futuresOrder to Date objects
					const orderUpdateEvent: VirtualOrderEvent = {
						...orderEvent,
						futuresOrder: orderEvent.futuresOrder,
					};

					this.orderDataSubject.next(orderUpdateEvent);
				}
				if (
					strategyEvent.event === "take-profit-order-created-event" ||
					strategyEvent.event === "take-profit-order-filled-event" ||
					strategyEvent.event === "take-profit-order-canceled-event"
				) {
					// Convert createTime and updateTime strings in futuresOrder to Date objects
					const orderUpdateEvent: VirtualOrderEvent = {
						...orderEvent,
						futuresOrder: strategyEvent.takeProfitOrder,
					};
					this.orderDataSubject.next(orderUpdateEvent);
				}
				if (
					strategyEvent.event === "stop-loss-order-created-event" ||
					strategyEvent.event === "stop-loss-order-filled-event" ||
					strategyEvent.event === "stop-loss-order-canceled-event"
				) {
					// Convert createTime and updateTime strings in futuresOrder to Date objects
					const orderUpdateEvent: VirtualOrderEvent = {
						...orderEvent,
						futuresOrder: strategyEvent.stopLossOrder,
					};

					this.orderDataSubject.next(orderUpdateEvent);
				}
			}
			if (
				strategyEvent.event === "position-created-event" ||
				strategyEvent.event === "position-updated-event" ||
				strategyEvent.event === "position-closed-event"
			) {
				const positionEvent = strategyEvent as VirtualPositionEvent;

				// Convert createTime and updateTime strings in virtualPosition to Date objects
				const positionUpdateEvent: VirtualPositionEvent = {
					...positionEvent,
					virtualPosition: positionEvent.virtualPosition,
				};

				this.positionDataSubject.next(positionUpdateEvent);
			}
			if (strategyEvent.event === "strategy-stats-updated-event") {
				const statsEvent = strategyEvent as BacktestStrategyStatsUpdateEvent;
				this.statsDataSubject.next(statsEvent);
			}
			if (strategyEvent.event === "transaction-created-event") {
				const transactionEvent = strategyEvent as VirtualTransactionEvent;
				this.transactionDataSubject.next(transactionEvent);
			}
			if (strategyEvent.event === "play-finished-event") {
				const playFinishedEvent = strategyEvent as PlayFinishedEvent;
				this.playFinishedDataSubject.next(playFinishedEvent);
			}

			if (strategyEvent.event === "custom-variable-update-event") {
				const customVariableEvent = strategyEvent as CustomVariableUpdateEvent;
				this.customVariableDataSubject.next(customVariableEvent);
			}
			if (strategyEvent.event === "sys-variable-update-event") {
				const systemVariableEvent = strategyEvent as SystemVariableUpdateEvent;
				this.systemVariableDataSubject.next(systemVariableEvent);
			}
		} catch (error) {
			console.error("Failed to parse SSE message:", error);
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
		this.klineDataSubject.complete();
		this.indicatorDataSubject.complete();
		this.orderDataSubject.complete();
		this.connectionState$.complete();
	}
}

// Create singleton instance
const backtestStrategyDataObservableService =
	new BacktestStrategyDataObservableService();

export default backtestStrategyDataObservableService;

// Export convenience functions

// Kline related
export const createKlineStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createKlineStream(enabled);

export const createKlineStreamFromKey = (
	keyStr: KeyStr,
	enabled: boolean = true,
) =>
	backtestStrategyDataObservableService.createKlineStreamFromKey(
		keyStr,
		enabled,
	);

// Indicator related
export const createIndicatorStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createIndicatorStream(enabled);

export const createIndicatorStreamFromKey = (
	keyStr: KeyStr,
	enabled: boolean = true,
) =>
	backtestStrategyDataObservableService.createIndicatorStreamFromKey(
		keyStr,
		enabled,
	);

// Order related
export const createOrderStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createOrderStream(enabled);

export const createOrderStreamForSymbol = (
	exchange: string,
	symbol: string,
	enabled: boolean = true,
) =>
	backtestStrategyDataObservableService.createOrderStreamForSymbol(
		exchange,
		symbol,
		enabled,
	);

export const createTransactionStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createTransactionStream(enabled);

// Position related
export const createPositionStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createPositionStream(enabled);

// Position related
export const createPositionStreamForSymbol = (
	exchange: string,
	symbol: string,
	enabled: boolean = true,
) =>
	backtestStrategyDataObservableService.createPositionStreamForSymbol(
		exchange,
		symbol,
		enabled,
	);

export const createStatsStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createStatsStream(enabled);

export const createPlayFinishedStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createPlayFinishedStream(enabled);

export const createCustomVariableStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createCustomVariableStream(enabled);

export const createSystemVariableStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createSystemVariableStream(enabled);

// Connection management
export const getConnectionState = () =>
	backtestStrategyDataObservableService.getConnectionState();

export const disconnectKlineStream = () =>
	backtestStrategyDataObservableService.disconnect();
