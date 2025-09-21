import type { Subscription } from "rxjs";
import type { UTCTimestamp, SingleValueData } from "lightweight-charts";
import {
	createIndicatorStreamFromKey,
	createKlineStreamFromKey,
	createOrderStreamForSymbol,
	createPositionStreamForSymbol,
} from "@/hooks/obs/backtest-strategy-event-obs";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { Kline } from "@/types/kline";
import type { KeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import type { VirtualOrderEvent, VirtualPositionEvent } from "@/types/strategy-event/backtest-strategy-event";
import { OrderStatus, OrderType } from "@/types/order";
import { getChartAlignedUtcSeconds } from "@/utils/datetime-offset";
import type { SliceCreator, SubscriptionSlice } from "./types";

export const createSubscriptionSlice: SliceCreator<SubscriptionSlice> = (set, get) => ({
	subscriptions: {},

	initObserverSubscriptions: () => {
		const state = get();

		// 清理现有订阅
		state.cleanupSubscriptions();

		try {
			state.getKeyStr().forEach((keyStr: KeyStr) => {
				const key = parseKey(keyStr);
				if (key.type === "kline") {
					// 订阅K线数据流
					const klineStream = createKlineStreamFromKey(keyStr, true);
					const klineSubscription = klineStream.subscribe({
						next: (klineData: Kline) => {
							// 更新kline
							state.onNewKline(keyStr, klineData);
						},
						error: (error: Error) => {
							console.error("K线数据流订阅错误:", error);
						},
					});
					state._addObserverSubscription(keyStr, klineSubscription);

					// 订阅与该k线相关的订单数据流
					const orderStream = createOrderStreamForSymbol(key.exchange, key.symbol);
					const orderSubscription = orderStream.subscribe((virtualOrderEvent: VirtualOrderEvent) => {
						// console.log("virtualOrderEvent", virtualOrderEvent);
						// 统一处理订单成交事件
						if (
							virtualOrderEvent.event === "futures-order-filled-event" ||
							virtualOrderEvent.event === "take-profit-order-filled-event" ||
							virtualOrderEvent.event === "stop-loss-order-filled-event"
						) {
							if (virtualOrderEvent.event === "futures-order-filled-event" && virtualOrderEvent.futuresOrder.orderType === OrderType.LIMIT) {
								state.onLimitOrderFilled(virtualOrderEvent.futuresOrder);
							} else {
								state.onNewOrder(virtualOrderEvent.futuresOrder);
							}
						}
						else if (virtualOrderEvent.event === "futures-order-created-event" && virtualOrderEvent.futuresOrder.orderType === OrderType.LIMIT) {
							state.onNewOrder(virtualOrderEvent.futuresOrder);
						}

					});
					state._addObserverSubscription(keyStr, orderSubscription);
					// 订阅与仓位相关的数据流
					const positionStream = createPositionStreamForSymbol(key.exchange, key.symbol);
					const positionSubscription = positionStream.subscribe((positionEvent: VirtualPositionEvent) => {

						if (positionEvent.event === "position-created-event") {
							state.onNewPosition(positionEvent.virtualPosition);
						}
						else if (positionEvent.event === "position-closed-event") {
							state.onPositionClosed(positionEvent.virtualPosition);
						}

					});
					state._addObserverSubscription(keyStr, positionSubscription);
				} else if (key.type === "indicator") {
					const indicatorStream = createIndicatorStreamFromKey(keyStr, true);
					const indicatorSubscription = indicatorStream.subscribe({
						next: (
							indicatorData: Record<keyof IndicatorValueConfig, number | string>,
						) => {
							// 转换指标数据格式为 Record<keyof IndicatorValueConfig, SingleValueData[]>
							const indicator: Record<
								keyof IndicatorValueConfig,
								SingleValueData[]
							> = {};

							Object.entries(indicatorData).forEach(([indicatorValueKey, value]) => {
									// 跳过datetime字段，只处理指标值
									if (indicatorValueKey === 'datetime') return;

									indicator[indicatorValueKey as keyof IndicatorValueConfig] =
										[
											...(indicator[
												indicatorValueKey as keyof IndicatorValueConfig
											] || []),
											{
												time: getChartAlignedUtcSeconds(indicatorData.datetime as unknown as string) as UTCTimestamp,
												value: value as number,
										} as SingleValueData,
									];
							});
							// 更新indicator
							state.onNewIndicator(keyStr, indicator);
						},
						error: (error: Error) => {
							console.error("指标数据流订阅错误:", error);
						},
					});
					state._addObserverSubscription(keyStr, indicatorSubscription);
				}
			});
		} catch (error) {
			console.error("初始化 Observer 订阅时出错:", error);
		}
	},

	unsubscribe: (keyStr: KeyStr) => {
		console.log("取消订阅:", keyStr);
		const state = get();
		state.subscriptions[keyStr]?.forEach((subscription) => {
			subscription.unsubscribe();
		});
	},

	subscribe: (keyStr: KeyStr) => {
		console.log("新增订阅:", keyStr);
		const state = get();
		// 判断keyStr是否在state.subscriptions中
		if (state.subscriptions[keyStr]) {
			return;
		}

		const key = parseKey(keyStr);
		if (key.type === "kline") {
			const klineStream = createKlineStreamFromKey(keyStr, true);
			const klineSubscription = klineStream.subscribe({
				next: (klineData: Kline) => {
					// 更新kline
					state.onNewKline(keyStr, klineData);
				},
				error: (error: Error) => {
					console.error("K线数据流订阅错误:", error);
				},
			});
			state._addObserverSubscription(keyStr, klineSubscription);

			// 订阅与该k线相关的订单数据流
			const orderStream = createOrderStreamForSymbol(key.exchange, key.symbol);
			const orderSubscription = orderStream.subscribe((virtualOrderEvent: VirtualOrderEvent) => {
				console.log("virtualOrderEvent", virtualOrderEvent);
				if (
					virtualOrderEvent.event === "futures-order-filled-event" ||
					virtualOrderEvent.event === "take-profit-order-filled-event" ||
					virtualOrderEvent.event === "stop-loss-order-filled-event"
				) {
					console.log("virtualOrderEvent", virtualOrderEvent);
					state.onNewOrder(virtualOrderEvent.futuresOrder);
				}

			});
			state._addObserverSubscription(keyStr, orderSubscription);
		}
		else if (key.type === "indicator") {
			const indicatorStream = createIndicatorStreamFromKey(keyStr, true);
			const indicatorSubscription = indicatorStream.subscribe({
				next: (
					indicatorData: Record<keyof IndicatorValueConfig, number | string>,
				) => {
					// 转换指标数据格式为 Record<keyof IndicatorValueConfig, SingleValueData[]>
					const indicator: Record<keyof IndicatorValueConfig, SingleValueData[]> = {};

					Object.entries(indicatorData).forEach(([indicatorValueKey, value]) => {
							// 跳过datetime字段，只处理指标值
							if (indicatorValueKey === 'datetime') return;

							indicator[indicatorValueKey as keyof IndicatorValueConfig] =
								[
									...(indicator[
										indicatorValueKey as keyof IndicatorValueConfig
									] || []),
									{
										time: getChartAlignedUtcSeconds(indicatorData.datetime as unknown as string) as UTCTimestamp,
										value: value as number,
								} as SingleValueData,
							];
					});
					// 更新indicator
					state.onNewIndicator(keyStr, indicator);
				},
			});
			state._addObserverSubscription(keyStr, indicatorSubscription);
		}
	},

	_addObserverSubscription: (keyStr: KeyStr, subscription: Subscription) => {
		set({
			subscriptions: {
				...get().subscriptions,
				[keyStr]: [...(get().subscriptions[keyStr] || []), subscription],
			},
		});
	},

	cleanupSubscriptions: () => {
		const state = get();

		Object.entries(state.subscriptions).forEach(([_, subscriptions]) => {
			subscriptions.forEach((subscription, index) => {
				try {
					subscription.unsubscribe();
					// console.log(`订阅 ${index} 已清理`);
				} catch (error) {
					console.error(`清理订阅 ${index} 时出错:`, error);
				}
			});
		});

		set({ subscriptions: {} });
	},
});