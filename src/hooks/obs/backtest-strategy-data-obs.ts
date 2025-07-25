import { Observable, Subject, BehaviorSubject } from "rxjs";
import { filter, map, share, takeUntil } from "rxjs/operators";
import {
	BacktestStrategyEvent,
	klineUpdateEvent,
	indicatorUpdateEvent,
	FuturesOrderFilledEvent,
} from "@/types/strategy-event/backtest-strategy-event";
import { BACKTESET_STRATEGY_SSE_URL } from "../sse/index";
import { Kline } from "@/types/kline";
import { IndicatorValue } from "@/types/indicator";
import { VirtualOrder } from "@/types/order/virtual-order";
import { KeyStr } from "@/types/symbol-key";

// SSE连接状态
export enum SSEConnectionState {
	DISCONNECTED = "disconnected",
	CONNECTING = "connecting",
	CONNECTED = "connected",
	ERROR = "error",
}

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
	private klineDataSubject = new Subject<klineUpdateEvent>();
	private indicatorDataSubject = new Subject<indicatorUpdateEvent>();
	private orderDataSubject = new Subject<FuturesOrderFilledEvent>();

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
	createKlineStream(enabled: boolean = true): Observable<klineUpdateEvent> {
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
	createIndicatorStream(
		enabled: boolean = true,
	): Observable<indicatorUpdateEvent> {
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
	): Observable<IndicatorValue[]> {
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
	createOrderStream(
		enabled: boolean = true,
	): Observable<FuturesOrderFilledEvent> {
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
	): Observable<VirtualOrder> {
		return this.createOrderStream(enabled).pipe(
			filter(
				(event) =>
					event.futuresOrder.exchange === exchange &&
					event.futuresOrder.symbol === symbol,
			),
			map((event) => event.futuresOrder),
			share(),
		);
	}

	/**
	 * 建立SSE连接
	 */
	private connect(): void {
		if (this.eventSource) {
			this.disconnect();
		}

		console.log("正在建立SSE连接...");
		this.connectionState$.next(SSEConnectionState.CONNECTING);

		try {
			this.eventSource = new EventSource(BACKTESET_STRATEGY_SSE_URL);

			// 连接成功
			this.eventSource.onopen = () => {
				console.log("SSE连接已建立");
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
			const strategyEvent = JSON.parse(event.data) as BacktestStrategyEvent;
			console.log("收到SSE消息:", strategyEvent);

			// 处理K线更新事件
			if (strategyEvent.event === "kline-update") {
				const klineEvent = strategyEvent as klineUpdateEvent;

				console.log("发送K线数据到Observable流:", klineEvent);
				this.klineDataSubject.next(klineEvent);
			}

			// 处理指标更新事件
			if (strategyEvent.event === "indicator-update") {
				const indicatorEvent = strategyEvent as indicatorUpdateEvent;

				console.log("发送指标数据到Observable流:", indicatorEvent);
				this.indicatorDataSubject.next(indicatorEvent);
			}

			// 处理订单成交事件
			if (strategyEvent.event === "futures-order-filled") {
				const orderEvent = strategyEvent as FuturesOrderFilledEvent;

				console.log("发送订单数据到Observable流:", orderEvent);
				this.orderDataSubject.next(orderEvent);
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
			console.log("正在断开SSE连接...");
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

// 连接管理
export const getConnectionState = () =>
	backtestStrategyDataObservableService.getConnectionState();

export const disconnectKlineStream = () =>
	backtestStrategyDataObservableService.disconnect();
