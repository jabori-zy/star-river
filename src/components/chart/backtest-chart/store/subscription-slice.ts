import type { SingleValueData, UTCTimestamp } from "lightweight-charts";
import type { Subscription } from "rxjs";
import {
	createIndicatorStreamFromKey,
	createKlineStreamFromKey,
	createOrderStreamForSymbol,
	createPositionStreamForSymbol,
} from "@/hooks/obs/backtest-strategy-event-obs";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { Kline } from "@/types/kline";
import { OrderType } from "@/types/order";
import type {
	VirtualOrderEvent,
	VirtualPositionEvent,
} from "@/types/strategy-event/backtest-strategy-event";
import type { KeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import { getChartAlignedUtcTimestamp } from "../utls";
import type { SliceCreator, SubscriptionSlice } from "./types";

export const createSubscriptionSlice: SliceCreator<SubscriptionSlice> = (
	set,
	get,
) => ({
	subscriptions: {},

	initObserverSubscriptions: () => {
		const state = get();

		// Clean up existing subscriptions
		state.cleanupSubscriptions();

		try {
			state.getKeyStr().forEach((keyStr: KeyStr) => {
				const key = parseKey(keyStr);
				if (key.type === "kline") {
					// Subscribe to K-line data stream
					const klineStream = createKlineStreamFromKey(keyStr, true);
					const klineSubscription = klineStream.subscribe({
						next: (klineData: Kline) => {
							// Update kline
							state.onNewKline(klineData);
						},
						error: (error: Error) => {
							console.error("K-line data stream subscription error:", error);
						},
					});
					state._addObserverSubscription(keyStr, klineSubscription);

					// Subscribe to order data stream related to this kline
					const orderStream = createOrderStreamForSymbol(
						key.exchange,
						key.symbol,
					);
					const orderSubscription = orderStream.subscribe(
						(virtualOrderEvent: VirtualOrderEvent) => {
							// Unified handling of order filled events
							if (
								virtualOrderEvent.event === "futures-order-filled-event" ||
								virtualOrderEvent.event === "take-profit-order-filled-event" ||
								virtualOrderEvent.event === "stop-loss-order-filled-event"
							) {
								state.onOrderFilled(virtualOrderEvent.futuresOrder);
							} else if (
								virtualOrderEvent.event === "futures-order-created-event" ||
								virtualOrderEvent.event === "take-profit-order-created-event" ||
								virtualOrderEvent.event === "stop-loss-order-created-event"
							) {
								state.onOrderCreated(virtualOrderEvent.futuresOrder);
							} else if (
								virtualOrderEvent.event === "futures-order-canceled-event" ||
								virtualOrderEvent.event ===
									"take-profit-order-canceled-event" ||
								virtualOrderEvent.event === "stop-loss-order-canceled-event"
							) {
								state.onOrderCanceled(virtualOrderEvent.futuresOrder);
							}
						},
					);
					state._addObserverSubscription(keyStr, orderSubscription);
					// Subscribe to position-related data stream
					const positionStream = createPositionStreamForSymbol(
						key.exchange,
						key.symbol,
					);
					const positionSubscription = positionStream.subscribe(
						(positionEvent: VirtualPositionEvent) => {
							if (positionEvent.event === "position-created-event") {
								state.onNewPosition(positionEvent.virtualPosition);
							} else if (positionEvent.event === "position-closed-event") {
								state.onPositionClosed(positionEvent.virtualPosition);
							}
						},
					);
					state._addObserverSubscription(keyStr, positionSubscription);
				} else if (key.type === "indicator") {
					const indicatorStream = createIndicatorStreamFromKey(keyStr, true);
					const indicatorSubscription = indicatorStream.subscribe({
						next: (
							indicatorData: Record<
								keyof IndicatorValueConfig,
								number | string
							>,
						) => {
							// Convert indicator data format to Record<keyof IndicatorValueConfig, SingleValueData[]>
							const indicator: Record<
								keyof IndicatorValueConfig,
								SingleValueData[]
							> = {};

							Object.entries(indicatorData).forEach(
								([indicatorValueKey, value]) => {
									// Skip datetime field, only process indicator values
									if (indicatorValueKey === "datetime") return;

									indicator[indicatorValueKey as keyof IndicatorValueConfig] = [
										...(indicator[
											indicatorValueKey as keyof IndicatorValueConfig
										] || []),
										{
											time: getChartAlignedUtcTimestamp(
												indicatorData.datetime as unknown as string,
											) as UTCTimestamp,
											value: value as number,
										} as SingleValueData,
									];
								},
							);
							// Update indicator
							state.onNewIndicator(keyStr, indicator);
						},
						error: (error: Error) => {
							console.error("Indicator data stream subscription error:", error);
						},
					});
					state._addObserverSubscription(keyStr, indicatorSubscription);
				}
			});
		} catch (error) {
			console.error("Error initializing Observer subscription:", error);
		}
	},

	unsubscribe: (keyStr: KeyStr) => {
		console.log("Unsubscribing:", keyStr);
		const state = get();
		state.subscriptions[keyStr]?.forEach((subscription) => {
			subscription.unsubscribe();
		});
	},

	subscribe: (keyStr: KeyStr) => {
		const state = get();
		// Check if keyStr is in state.subscriptions
		if (state.subscriptions[keyStr]) {
			return;
		}

		const key = parseKey(keyStr);
		if (key.type === "kline") {
			const klineStream = createKlineStreamFromKey(keyStr, true);
			const klineSubscription = klineStream.subscribe({
				next: (klineData: Kline) => {
					state.onNewKline(klineData);
				},
				error: (error: Error) => {
					console.error("K-line data stream subscription error:", error);
				},
			});
			state._addObserverSubscription(keyStr, klineSubscription);

			const orderStream = createOrderStreamForSymbol(key.exchange, key.symbol);
			const orderSubscription = orderStream.subscribe(
				(virtualOrderEvent: VirtualOrderEvent) => {
					console.log("virtualOrderEvent", virtualOrderEvent);
					if (
						virtualOrderEvent.event === "futures-order-filled-event" ||
						virtualOrderEvent.event === "take-profit-order-filled-event" ||
						virtualOrderEvent.event === "stop-loss-order-filled-event"
					) {
						if (
							virtualOrderEvent.event === "futures-order-filled-event" &&
							virtualOrderEvent.futuresOrder.orderType === OrderType.LIMIT
						) {
							state.onLimitOrderFilled(virtualOrderEvent.futuresOrder);
						} else {
							state.onNewOrder(virtualOrderEvent.futuresOrder);
						}
					} else if (
						virtualOrderEvent.event === "futures-order-created-event" &&
						virtualOrderEvent.futuresOrder.orderType === OrderType.LIMIT
					) {
						state.onNewOrder(virtualOrderEvent.futuresOrder);
					}
				},
			);
			state._addObserverSubscription(keyStr, orderSubscription);

			const positionStream = createPositionStreamForSymbol(
				key.exchange,
				key.symbol,
			);
			const positionSubscription = positionStream.subscribe(
				(positionEvent: VirtualPositionEvent) => {
					if (positionEvent.event === "position-created-event") {
						state.onNewPosition(positionEvent.virtualPosition);
					} else if (positionEvent.event === "position-closed-event") {
						state.onPositionClosed(positionEvent.virtualPosition);
					}
				},
			);
			state._addObserverSubscription(keyStr, positionSubscription);
		} else if (key.type === "indicator") {
			const indicatorStream = createIndicatorStreamFromKey(keyStr, true);
			const indicatorSubscription = indicatorStream.subscribe({
				next: (
					indicatorData: Record<keyof IndicatorValueConfig, number | string>,
				) => {
					// Convert indicator data format to Record<keyof IndicatorValueConfig, SingleValueData[]>
					const indicator: Record<
						keyof IndicatorValueConfig,
						SingleValueData[]
					> = {};

					Object.entries(indicatorData).forEach(
						([indicatorValueKey, value]) => {
							// Skip datetime field, only process indicator values
							if (indicatorValueKey === "datetime") return;

							indicator[indicatorValueKey as keyof IndicatorValueConfig] = [
								...(indicator[
									indicatorValueKey as keyof IndicatorValueConfig
								] || []),
								{
									time: getChartAlignedUtcTimestamp(
										indicatorData.datetime as unknown as string,
									) as UTCTimestamp,
									value: value as number,
								} as SingleValueData,
							];
						},
					);
					// Update indicator
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
					// console.log(`Subscription ${index} cleaned up`);
				} catch (error) {
					console.error(`Error cleaning up subscription ${index}:`, error);
				}
			});
		});

		set({ subscriptions: {} });
	},
});
