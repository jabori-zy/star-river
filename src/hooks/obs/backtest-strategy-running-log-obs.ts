import { BehaviorSubject, Observable, Subject } from "rxjs";
import { share, takeUntil } from "rxjs/operators";
import type { StrategyRunningLogEvent } from "@/types/strategy-event/strategy-running-log-event";
import { SSEConnectionState } from "./backtest-strategy-data-obs";
import { BACKTEST_STRATEGY_RUNNING_LOG_URL } from ".";

/**
 * 回测策略运行日志Observable服务
 * 将SSE数据流包装成RxJS Observable，处理策略运行日志数据更新
 */
class BacktestStrategyRunningLogObservableService {
	private eventSource: EventSource | null = null;
	private connectionState$ = new BehaviorSubject<SSEConnectionState>(
		SSEConnectionState.DISCONNECTED,
	);
	private destroy$ = new Subject<void>();
	private logDataSubject = new Subject<StrategyRunningLogEvent>();

	/**
	 * 获取连接状态Observable
	 */
	getConnectionState(): Observable<SSEConnectionState> {
		return this.connectionState$.asObservable();
	}

	/**
	 * 创建策略运行日志数据流Observable
	 * @param enabled 是否启用连接
	 * @returns 策略运行日志数据更新的Observable流
	 */
	createBacktestStrategyRunningLogStream(enabled: boolean = true): Observable<StrategyRunningLogEvent> {
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
			this.eventSource = new EventSource(BACKTEST_STRATEGY_RUNNING_LOG_URL);

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
				console.error("策略运行日志SSE连接错误:", error);
				this.connectionState$.next(SSEConnectionState.ERROR);
				this.handleError();
			};
		} catch (error) {
			console.error("创建策略运行日志SSE连接失败:", error);
			this.connectionState$.next(SSEConnectionState.ERROR);
		}
	}

	/**
	 * 处理SSE消息
	 */
	private handleMessage(event: MessageEvent): void {
		try {
			const logEvent = JSON.parse(event.data) as StrategyRunningLogEvent;
			
			// 验证数据结构
			if (this.isValidRunningLogEvent(logEvent)) {
				console.log('策略运行日志:', logEvent.logLevel, logEvent.message);
				this.logDataSubject.next(logEvent);
			} else {
				console.warn('无效的运行日志事件数据:', logEvent);
			}
		} catch (error) {
			console.error("解析策略运行日志SSE消息失败:", error);
		}
	}

	/**
	 * 验证是否为有效的运行日志事件
	 */
	private isValidRunningLogEvent(event: any): event is StrategyRunningLogEvent {
		return (
			typeof event === 'object' &&
			event !== null &&
			typeof event.strategyId === 'number' &&
			typeof event.nodeId === 'string' &&
			typeof event.nodeName === 'string' &&
			typeof event.source === 'string' &&
			typeof event.logLevel === 'string' &&
			typeof event.logType === 'string' &&
			typeof event.message === 'string' &&
			typeof event.detail === 'object' &&
			typeof event.timestamp === 'number'
		);
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
const backtestStrategyRunningLogObservableService =
	new BacktestStrategyRunningLogObservableService();

export default backtestStrategyRunningLogObservableService;

// 导出便捷函数
export const createBacktestStrategyRunningLogStream = (enabled: boolean = true) =>
	backtestStrategyRunningLogObservableService.createBacktestStrategyRunningLogStream(enabled);

// 连接管理
export const getRunningLogConnectionState = () =>
	backtestStrategyRunningLogObservableService.getConnectionState();

export const disconnectRunningLogStream = () =>
	backtestStrategyRunningLogObservableService.disconnect();