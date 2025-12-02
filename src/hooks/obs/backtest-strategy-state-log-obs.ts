import { BehaviorSubject, Observable, Subject } from "rxjs";
import { share, takeUntil } from "rxjs/operators";
import type {
	NodeStateLogEvent,
	StrategyStateLogEvent,
} from "@/types/strategy-event/strategy-state-log-event";
import { BACKTEST_STRATEGY_STATE_LOG_URL } from ".";
import { SSEConnectionState } from "./backtest-strategy-event-obs";

/**
 * 回测策略状态日志Observable服务
 * 将SSE数据流包装成RxJS Observable，处理策略日志数据更新
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
	 * 获取连接状态Observable
	 */
	getConnectionState(): Observable<SSEConnectionState> {
		return this.connectionState$.asObservable();
	}

	/**
	 * 创建策略状态日志数据流Observable
	 * @param enabled 是否启用连接
	 * @returns 策略日志数据更新的Observable流
	 */
	createBacktestStrategyStateLogStream(
		enabled: boolean = true,
	): Observable<StrategyStateLogEvent | NodeStateLogEvent> {
		if (!enabled) {
			this.disconnect();
			return new Observable((subscriber) => {
				// 返回空的Observable
				subscriber.complete();
			});
		}

		// 如果已经连接，直接返回现有的数据流
		if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
			return this.logDataSubject
				.asObservable()
				.pipe(takeUntil(this.destroy$), share());
		}

		// 建立新连接
		this.connect();

		return this.logDataSubject
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
			this.eventSource = new EventSource(BACKTEST_STRATEGY_STATE_LOG_URL);

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
	 * 处理SSE消息
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
		this.logDataSubject.complete();
		this.connectionState$.complete();
	}
}

// 创建单例实例
const backtestStrategyStateLogObservableService =
	new BacktestStrategyStateLogObservableService();

export default backtestStrategyStateLogObservableService;

// 导出便捷函数
export const createBacktestStrategyStateLogStream = (enabled: boolean = true) =>
	backtestStrategyStateLogObservableService.createBacktestStrategyStateLogStream(
		enabled,
	);

// 连接管理
export const getStateLogConnectionState = () =>
	backtestStrategyStateLogObservableService.getConnectionState();

export const disconnectStateLogStream = () =>
	backtestStrategyStateLogObservableService.disconnect();
