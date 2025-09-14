import { BehaviorSubject, Observable, Subject } from "rxjs";
import { filter, map, share, takeUntil } from "rxjs/operators";
import type { Kline } from "@/types/kline";
import type { VirtualOrderEvent } from "@/types/strategy-event/backtest-strategy-event";
import type {
	VirtualPositionEvent,
	IndicatorUpdateEvent,
	KlineUpdateEvent,
	BacktestStrategyStatsUpdateEvent,
	VirtualTransactionEvent,
} from "@/types/strategy-event/backtest-strategy-event";
import type { KeyStr } from "@/types/symbol-key";
import { BACKTESET_STRATEGY_EVENT_SSE_URL } from ".";
import { DateTime } from 'luxon';

// SSE连接状态
export enum SSEConnectionState {
	DISCONNECTED = "disconnected",
	CONNECTING = "connecting",
	CONNECTED = "connected",
	ERROR = "error",
}


const orderEvent = [
	"futures-order-filled-event",  // 订单成交
	"futures-order-created-event",  // 订单创建
	"futures-order-canceled-event",  // 订单取消
	"take-profit-order-created-event",  // 止盈单创建
	"stop-loss-order-created-event",  // 止损单创建
	"take-profit-order-filled-event",  // 止盈单成交
	"stop-loss-order-filled-event",  // 止损单成交
	"take-profit-order-canceled-event",  // 止盈单取消
	"stop-loss-order-canceled-event",  // 止损单取消
]

/**
 * 回测策略数据Observable服务
 * 将SSE数据流包装成RxJS Observable，处理K线、指标、订单等数据更新
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

	/**
	 * 获取连接状态Observable
	 */
	getConnectionState(): Observable<SSEConnectionState> {
		return this.connectionState$.asObservable();
	}

	/**
	 * 创建K线数据流Observable
	 * @param enabled 是否启用连接
	 * @returns K线数据更新的Observable流
	 */
	createKlineStream(enabled: boolean = true): Observable<KlineUpdateEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				// 返回空的Observable
				subscriber.complete();
			});
		}

		// 如果已经连接，直接返回现有的数据流
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.klineDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		// 建立新连接
		this.connect();

		return this.klineDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	/**
	 * 为特定缓存键创建过滤后的K线数据流
	 * @param keyStr 缓存键
	 * @param enabled 是否启用
	 * @returns 过滤后的K线数据流
	 */
	createKlineStreamFromKey(
		keyStr: KeyStr,
		enabled: boolean = true,
	): Observable<Kline[]> {
		return this.createKlineStream(enabled).pipe(
			filter((event) => event.klineKey === keyStr),
			map((event) => event.kline),
			share(),
		);
	}

	/**
	 * 创建指标数据流Observable
	 * @param enabled 是否启用连接
	 * @returns 指标数据更新的Observable流
	 */
	createIndicatorStream(enabled: boolean = true): Observable<IndicatorUpdateEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				// 返回空的Observable
				subscriber.complete();
			});
		}

		// 如果已经连接，直接返回现有的数据流
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.indicatorDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		// 建立新连接
		this.connect();

		return this.indicatorDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}


	/**
	 * 为特定缓存键创建过滤后的指标数据流
	 * @param keyStr 缓存键
	 * @param enabled 是否启用
	 * @returns 过滤后的指标数据流
	 */
	createIndicatorStreamFromKey(
		keyStr: KeyStr,
		enabled: boolean = true,
	): Observable<Record<string, number | string>[]> {
		return this.createIndicatorStream(enabled).pipe(
			filter((event) => event.indicatorKey === keyStr),
			map((event) => event.indicatorSeries),
			share(),
		);
	}

	/**
	 * 创建订单数据流Observable
	 * @param enabled 是否启用连接
	 * @returns 订单数据更新的Observable流
	 */
	createOrderStream(enabled: boolean = true): Observable<VirtualOrderEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				// 返回空的Observable
				subscriber.complete();
			});
		}

		// 如果已经连接，直接返回现有的数据流
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.orderDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		// 建立新连接
		this.connect();

		return this.orderDataSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$), share());
	}

	/**
	 * 为特定交易所和交易对创建过滤后的订单数据流
	 * @param exchange 交易所
	 * @param symbol 交易对
	 * @param enabled 是否启用
	 * @returns 过滤后的订单数据流
	 */
	createOrderStreamForSymbol(
		exchange: string,
		symbol: string,
		enabled: boolean = true,
	): Observable<VirtualOrderEvent> {
		return this.createOrderStream(enabled).pipe(
			filter((event) => event.futuresOrder.exchange === exchange && event.futuresOrder.symbol === symbol),
			// map((event) => event),
			share(),
		);
	}


	createTransactionStream(enabled: boolean = true): Observable<VirtualTransactionEvent> {
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

	createPositionStream(enabled: boolean = true): Observable<VirtualPositionEvent> {
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
			filter((event) => event.virtualPosition.exchange === exchange && event.virtualPosition.symbol === symbol),
			share(),
		);
	}

	createStatsStream(enabled: boolean = true): Observable<BacktestStrategyStatsUpdateEvent> {
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

	/**
	 * 建立SSE连接
	 */
	private connect(): void {
		if (this.eventSource) {
			this.disconnect();
		}

		this.connectionState$.next(SSEConnectionState.CONNECTING);

		try {
			this.eventSource = new EventSource(BACKTESET_STRATEGY_EVENT_SSE_URL);

			// 连接成功
			this.eventSource.onopen = () => {
				this.connectionState$.next(SSEConnectionState.CONNECTED);
			};

			// 接收消息
			this.eventSource.onmessage = (event) => {
				this.handleMessage(event);
			};

			// 连接错误
			this.eventSource.onerror = (error) => {
				console.error("SSE连接错误:", error);
				this.connectionState$.next(SSEConnectionState.ERROR);
				this.handleError();
			};
		} catch (error) {
			console.error("创建SSE连接失败:", error);
			this.connectionState$.next(SSEConnectionState.ERROR);
		}
	}

	/**
	 * 处理SSE消息
	 */
	private handleMessage(event: MessageEvent): void {
		try {
			const strategyEvent = JSON.parse(event.data);
			// console.log("收到SSE消息:", strategyEvent);

			// 处理K线更新事件
			if (strategyEvent.event === "kline-update-event") {
				// 类型安全的事件构建
					
				const klineEvent: KlineUpdateEvent = {
					channel: strategyEvent.channel,
					eventType: strategyEvent.eventType,
					event: strategyEvent.event,
					timestamp: strategyEvent.timestamp,
					fromNodeId: strategyEvent.fromNodeId,
					fromNodeName: strategyEvent.fromNodeName,
					fromNodeHandleId: strategyEvent.fromNodeHandleId,
					klineCacheIndex: strategyEvent.klineCacheIndex || 0,
					klineKey: strategyEvent.klineKey,
					kline: strategyEvent.kline,
				};
				this.klineDataSubject.next(klineEvent);
			}

			// 处理指标更新事件
			if (strategyEvent.event === "indicator-update-event") {
				const indicatorEvent = strategyEvent as IndicatorUpdateEvent;
				
				// 直接使用原始指标事件，datetime保持为string类型
				// console.log("发送指标数据到Observable流:", indicatorEvent);
				this.indicatorDataSubject.next(indicatorEvent);
			}

			// 处理订单成交事件
			if (orderEvent.includes(strategyEvent.event)) {
				const orderEvent = strategyEvent as VirtualOrderEvent;

				

				if (
					strategyEvent.event === "futures-order-filled-event" || 
					strategyEvent.event === "futures-order-created-event" || 
					strategyEvent.event === "futures-order-canceled-event"
				) {
					// 转换futuresOrder中的createTime和updateTime字符串为Date对象
					const orderUpdateEvent : VirtualOrderEvent = {
						...orderEvent,
						futuresOrder: orderEvent.futuresOrder
	
					}
					
					this.orderDataSubject.next(orderUpdateEvent);
				}
				if (
					strategyEvent.event === "take-profit-order-created-event" || 
					strategyEvent.event === "take-profit-order-filled-event" || 
					strategyEvent.event === "take-profit-order-canceled-event"
				) {
					// 转换futuresOrder中的createTime和updateTime字符串为Date对象
					const orderUpdateEvent : VirtualOrderEvent = {
						...orderEvent,
						futuresOrder: strategyEvent.takeProfitOrder
					};
					this.orderDataSubject.next(orderUpdateEvent);
				}
				if (
					strategyEvent.event === "stop-loss-order-created-event" ||
					strategyEvent.event === "stop-loss-order-filled-event" ||
					strategyEvent.event === "stop-loss-order-canceled-event"
				) {
					// 转换futuresOrder中的createTime和updateTime字符串为Date对象
					const orderUpdateEvent : VirtualOrderEvent = {
						...orderEvent,
						futuresOrder: strategyEvent.stopLossOrder
					};
					
					this.orderDataSubject.next(orderUpdateEvent);
				}
			}
			if (strategyEvent.event === "position-created-event" || 
				strategyEvent.event === "position-updated-event" || 
				strategyEvent.event === "position-closed-event"
			) {
				const positionEvent = strategyEvent as VirtualPositionEvent;
				
				// 转换virtualPosition中的createTime和updateTime字符串为Date对象
				const positionUpdateEvent : VirtualPositionEvent = {
					...positionEvent,
					virtualPosition: positionEvent.virtualPosition
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
		} catch (error) {
			console.error("解析SSE消息失败:", error);
		}
	}

	/**
	 * 处理连接错误
	 */
	private handleError(): void {
		this.disconnect();

		// 可以在这里添加重连逻辑
		// setTimeout(() => {
		//     if (this.connectionState$.value === SSEConnectionState.ERROR) {
		//         this.connect();
		//     }
		// }, 5000);
	}

	/**
	 * 断开SSE连接
	 */
	disconnect(): void {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
			this.connectionState$.next(SSEConnectionState.DISCONNECTED);
		}
	}

	/**
	 * 销毁服务，清理所有资源
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

// 创建单例实例
const backtestStrategyDataObservableService =
	new BacktestStrategyDataObservableService();

export default backtestStrategyDataObservableService;

// 导出便捷函数

// K线相关
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

// 指标相关
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

// 订单相关
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

// 仓位相关
export const createPositionStream = (enabled: boolean = true) =>
	backtestStrategyDataObservableService.createPositionStream(enabled);

// 仓位相关
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

// 连接管理
export const getConnectionState = () =>
	backtestStrategyDataObservableService.getConnectionState();

export const disconnectKlineStream = () =>
	backtestStrategyDataObservableService.disconnect();
