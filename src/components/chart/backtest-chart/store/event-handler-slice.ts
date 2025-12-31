import type {
	CandlestickData,
	SingleValueData,
	UTCTimestamp,
} from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { Kline } from "@/types/kline";
import type { VirtualOrder } from "@/types/order";
import { OrderStatus, OrderType } from "@/types/order";
import type { VirtualPosition } from "@/types/position";
import type { KeyStr } from "@/types/symbol-key";
import {
	getChartAlignedUtcTimestamp,
	SlOrderToStopLossPriceLine,
	TpOrderToTakeProfitPriceLine,
	virtualOrderToLimitOrderPriceLine,
	virtualOrderToMarker,
	virtualPositionToOpenPositionPriceLine,
} from "../utls";
import type { EventHandlerSlice, SliceCreator, StoreContext } from "./types";

export const createEventHandlerSlice =
	(_context: StoreContext): SliceCreator<EventHandlerSlice> =>
	(_set, get) => ({
		onNewKline: (kline: Kline) => {
			const timestamp = getChartAlignedUtcTimestamp(
				kline.datetime,
			) as UTCTimestamp;

			const candlestickData: CandlestickData = {
				time: timestamp, // Convert to seconds-level timestamp
				open: kline.open,
				high: kline.high,
				low: kline.low,
				close: kline.close,
			};

			// Call series update method
			const klineSeries = get().getKlineSeriesRef();
			if (klineSeries) {
				klineSeries.update(candlestickData);
				// Trim data if exceeds limit
				get().trimKlineData();
			}
		},

		onNewIndicator: (
			indicatorKeyStr: KeyStr,
			indicator: Record<keyof IndicatorValueConfig, SingleValueData[]>,
		) => {
			Object.entries(indicator).forEach(([indicatorValueKey, newDataArray]) => {
				// Process each data point in the new data array
				newDataArray.forEach((newDataPoint, _) => {
					// // Get the last data point of the indicator value field
					// const lastData = existingData[existingData.length - 1];
					// Filter out 0 values for main chart indicators
					if (newDataPoint.value === 0 || newDataPoint.value === null) {
						return;
					}

					// update
					const indicatorSeriesRef = get().getIndicatorSeriesRef(
						indicatorKeyStr,
						indicatorValueKey,
					);
					if (indicatorSeriesRef) {
						indicatorSeriesRef.update(newDataPoint);
						// Trim data if exceeds limit
						get().trimIndicatorData(indicatorKeyStr, indicatorValueKey);
					}
				});
			});

			// Update state
			// set((prevState: BacktestChartStore) => ({
			// 	indicatorData: {
			// 		...prevState.indicatorData,
			// 		[indicatorKeyStr]: updatedIndicator,
			// 	},
			// }));
		},

		onNewOperation: (
			operationKeyStr: KeyStr,
			operation: Record<string, SingleValueData[]>,
		) => {
			Object.entries(operation).forEach(([outputKey, newDataArray]) => {
				// Process each data point in the new data array
				newDataArray.forEach((newDataPoint) => {
					// Filter out 0 values
					if (newDataPoint.value === 0 || newDataPoint.value === null) {
						return;
					}

					// update
					const operationSeriesRef = get().getOperationSeriesRef(
						operationKeyStr,
						outputKey,
					);
					if (operationSeriesRef) {
						operationSeriesRef.update(newDataPoint);
						// Trim data if exceeds limit
						get().trimOperationData(operationKeyStr, outputKey);
					}
				});
			});
		},

		onNewOrder: (newOrder: VirtualOrder) => {
			// Backend returns time, convert to timestamp: 2025-07-25T00:20:00Z -> timestamp
			// Open position order
			if (newOrder.orderStatus === OrderStatus.FILLED) {
				const markers = virtualOrderToMarker(newOrder);
				get().setOrderMarkers([...get().orderMarkers, ...markers]);
				// console.log("orderMarkers", get().getOrderMarkers());
				const orderMarkerSeriesRef = get().getOrderMarkerSeriesRef();
				if (orderMarkerSeriesRef) {
					orderMarkerSeriesRef.setMarkers(get().getOrderMarkers());
				}
			}

			// Limit order, when status is placed or created, create limit order price line
			else if (
				newOrder.orderType === OrderType.LIMIT &&
				(newOrder.orderStatus === OrderStatus.PLACED ||
					newOrder.orderStatus === OrderStatus.CREATED)
			) {
				// Create limit order price line
				const limitOrderPriceLine = virtualOrderToLimitOrderPriceLine(newOrder);
				if (limitOrderPriceLine) {
					get().setOrderPriceLine([
						...get().orderPriceLine,
						limitOrderPriceLine,
					]);
					const candleSeriesRef = get().getKlineSeriesRef();
					if (candleSeriesRef) {
						candleSeriesRef.createPriceLine(limitOrderPriceLine);
					}
				}
			}
			// tp order or stop order
			else if (
				newOrder.orderStatus === OrderStatus.CREATED &&
				(newOrder.orderType === OrderType.TAKE_PROFIT_MARKET ||
					newOrder.orderType === OrderType.STOP_MARKET)
			) {
				if (newOrder.orderType === OrderType.TAKE_PROFIT_MARKET) {
					const takeProfitPriceLine = TpOrderToTakeProfitPriceLine(newOrder);
					if (takeProfitPriceLine) {
						get().setOrderPriceLine([
							...get().orderPriceLine,
							takeProfitPriceLine,
						]);
					}
					const candleSeriesRef = get().getKlineSeriesRef();
					if (candleSeriesRef) {
						candleSeriesRef.createPriceLine(takeProfitPriceLine);
					}
				} else if (newOrder.orderType === OrderType.STOP_MARKET) {
					const stopLossPriceLine = SlOrderToStopLossPriceLine(newOrder);
					if (stopLossPriceLine) {
						get().setOrderPriceLine([
							...get().orderPriceLine,
							stopLossPriceLine,
						]);
					}
					const candleSeriesRef = get().getKlineSeriesRef();
					if (candleSeriesRef) {
						candleSeriesRef.createPriceLine(stopLossPriceLine);
					}
				}
			}
		},

		onOrderFilled(order: VirtualOrder) {
			if (order.orderStatus !== OrderStatus.FILLED) {
				return;
			}
			// limit order filled, remove price line and create a marker
			if (order.orderType === OrderType.LIMIT) {
				this.onLimitOrderFilled(order);
			} else if (order.orderType === OrderType.TAKE_PROFIT_MARKET) {
				this.onTpOrderFilled(order);
			} else if (order.orderType === OrderType.STOP_MARKET) {
				this.onSlOrderFilled(order);
			} else {
				const markers = virtualOrderToMarker(order);
				get().setOrderMarkers([...get().orderMarkers, ...markers]);
				// console.log("orderMarkers", get().getOrderMarkers());
				const orderMarkerSeriesRef = get().getOrderMarkerSeriesRef();
				if (orderMarkerSeriesRef) {
					orderMarkerSeriesRef.setMarkers(get().getOrderMarkers());
				}
			}
		},

		onOrderCreated: (order: VirtualOrder) => {
			if (order.orderStatus !== OrderStatus.CREATED) {
				return;
			}

			if (order.orderType === OrderType.TAKE_PROFIT_MARKET) {
				const takeProfitPriceLine = TpOrderToTakeProfitPriceLine(order);
				if (takeProfitPriceLine) {
					get().setOrderPriceLine([
						...get().orderPriceLine,
						takeProfitPriceLine,
					]);
				}
				const candleSeriesRef = get().getKlineSeriesRef();
				if (candleSeriesRef) {
					candleSeriesRef.createPriceLine(takeProfitPriceLine);
				}
			} else if (order.orderType === OrderType.STOP_MARKET) {
				const stopLossPriceLine = SlOrderToStopLossPriceLine(order);
				if (stopLossPriceLine) {
					get().setOrderPriceLine([...get().orderPriceLine, stopLossPriceLine]);
				}
				const candleSeriesRef = get().getKlineSeriesRef();
				if (candleSeriesRef) {
					candleSeriesRef.createPriceLine(stopLossPriceLine);
				}
			} else if (order.orderType === OrderType.LIMIT) {
				// Create limit order price line
				const limitOrderPriceLine = virtualOrderToLimitOrderPriceLine(order);
				if (limitOrderPriceLine) {
					get().setOrderPriceLine([
						...get().orderPriceLine,
						limitOrderPriceLine,
					]);
					const candleSeriesRef = get().getKlineSeriesRef();
					if (candleSeriesRef) {
						candleSeriesRef.createPriceLine(limitOrderPriceLine);
					}
				}
			}
		},

		onOrderCanceled(order) {
			if (order.orderStatus !== OrderStatus.CANCELED) {
				return;
			}
			if (order.orderType === OrderType.TAKE_PROFIT_MARKET) {
				const candleSeriesRef = get().getKlineSeriesRef();
				if (candleSeriesRef) {
					const readyToRemovePriceLines = candleSeriesRef
						.priceLines()
						.filter((priceLine) =>
							priceLine
								.options()
								.id?.includes(`${order.orderId.toString()}-take-profit`),
						);
					readyToRemovePriceLines.forEach((priceLine) => {
						const pricelineId = priceLine.options().id as string;
						candleSeriesRef.removePriceLine(priceLine);
						get().deleteOrderPriceLine(pricelineId);
					});
				}
			} else if (order.orderType === OrderType.STOP_MARKET) {
				const candleSeriesRef = get().getKlineSeriesRef();
				if (candleSeriesRef) {
					const readyToRemovePriceLines = candleSeriesRef
						.priceLines()
						.filter((priceLine) =>
							priceLine
								.options()
								.id?.includes(`${order.orderId.toString()}-stop-loss`),
						);
					readyToRemovePriceLines.forEach((priceLine) => {
						const pricelineId = priceLine.options().id as string;
						candleSeriesRef.removePriceLine(priceLine);
						get().deleteOrderPriceLine(pricelineId);
					});
				}
			}
		},

		onLimitOrderFilled: (limitOrder: VirtualOrder) => {
			// Delete limit order price line
			const candleSeriesRef = get().getKlineSeriesRef();
			if (candleSeriesRef) {
				const readyToRemovePriceLines = candleSeriesRef
					.priceLines()
					.filter((priceLine) =>
						priceLine
							.options()
							.id?.includes(`${limitOrder.orderId.toString()}-limit`),
					);
				readyToRemovePriceLines.forEach((priceLine) => {
					const pricelineId = priceLine.options().id as string;
					candleSeriesRef.removePriceLine(priceLine);
					get().deleteOrderPriceLine(pricelineId);
				});
			}
			// Create marker
			if (limitOrder.orderStatus === OrderStatus.FILLED) {
				const markers = virtualOrderToMarker(limitOrder);
				get().setOrderMarkers([...get().orderMarkers, ...markers]);
				// console.log("orderMarkers", get().getOrderMarkers());
				const orderMarkerSeriesRef = get().getOrderMarkerSeriesRef();
				if (orderMarkerSeriesRef) {
					orderMarkerSeriesRef.setMarkers(get().getOrderMarkers());
				}
			}
		},

		onTpOrderFilled: (tpOrder: VirtualOrder) => {
			const candleSeriesRef = get().getKlineSeriesRef();
			if (candleSeriesRef) {
				const readyToRemovePriceLines = candleSeriesRef
					.priceLines()
					.filter((priceLine) =>
						priceLine
							.options()
							.id?.includes(`${tpOrder.orderId.toString()}-take-profit`),
					);
				readyToRemovePriceLines.forEach((priceLine) => {
					const pricelineId = priceLine.options().id as string;
					candleSeriesRef.removePriceLine(priceLine);
					get().deleteOrderPriceLine(pricelineId);
				});
			}
			// Create marker
			if (tpOrder.orderStatus === OrderStatus.FILLED) {
				const markers = virtualOrderToMarker(tpOrder);
				get().setOrderMarkers([...get().orderMarkers, ...markers]);
				// console.log("orderMarkers", get().getOrderMarkers());
				const orderMarkerSeriesRef = get().getOrderMarkerSeriesRef();
				if (orderMarkerSeriesRef) {
					orderMarkerSeriesRef.setMarkers(get().getOrderMarkers());
				}
			}
		},

		onSlOrderFilled: (slOrder: VirtualOrder) => {
			const candleSeriesRef = get().getKlineSeriesRef();
			if (candleSeriesRef) {
				const readyToRemovePriceLines = candleSeriesRef
					.priceLines()
					.filter((priceLine) =>
						priceLine
							.options()
							.id?.includes(`${slOrder.orderId.toString()}-stop-loss`),
					);
				readyToRemovePriceLines.forEach((priceLine) => {
					const pricelineId = priceLine.options().id as string;
					candleSeriesRef.removePriceLine(priceLine);
					get().deleteOrderPriceLine(pricelineId);
				});
			}
			// Create marker
			if (slOrder.orderStatus === OrderStatus.FILLED) {
				const markers = virtualOrderToMarker(slOrder);
				get().setOrderMarkers([...get().orderMarkers, ...markers]);
				// console.log("orderMarkers", get().getOrderMarkers());
				const orderMarkerSeriesRef = get().getOrderMarkerSeriesRef();
				if (orderMarkerSeriesRef) {
					orderMarkerSeriesRef.setMarkers(get().getOrderMarkers());
				}
			}
		},

		onNewPosition: (position: VirtualPosition) => {
			const openPositionPriceLine =
				virtualPositionToOpenPositionPriceLine(position);

			const candleSeriesRef = get().getKlineSeriesRef();
			if (candleSeriesRef) {
				candleSeriesRef.createPriceLine(openPositionPriceLine);
			}
		},

		// Clear position price line after position closes
		onPositionClosed: (position: VirtualPosition) => {
			const candleSeriesRef = get().getKlineSeriesRef();
			if (candleSeriesRef) {
				const readyToRemovePriceLines = candleSeriesRef
					.priceLines()
					.filter((priceLine) =>
						priceLine.options().id?.includes(position.positionId.toString()),
					);
				readyToRemovePriceLines.forEach((priceLine) => {
					const pricelineId = priceLine.options().id as string;
					candleSeriesRef.removePriceLine(priceLine);
					get().deletePositionPriceLine(pricelineId);
				});
			}
		},
	});
