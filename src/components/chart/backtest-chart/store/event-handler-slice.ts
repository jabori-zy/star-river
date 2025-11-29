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
	TpOrderToTakeProfitPriceLine,
	SlOrderToStopLossPriceLine,
	virtualOrderToLimitOrderPriceLine,
	virtualOrderToMarker,
	virtualPositionToOpenPositionPriceLine,
} from "../utls";
import type { EventHandlerSlice, SliceCreator, StoreContext } from "./types";

const MAX_DATA_LENGTH = 500;

export const createEventHandlerSlice =
	(_context: StoreContext): SliceCreator<EventHandlerSlice> =>
	(_set, get) => ({
		onNewKline: (kline: Kline) => {
			const timestamp = getChartAlignedUtcTimestamp(
				kline.datetime,
			) as UTCTimestamp;

			const candlestickData: CandlestickData = {
				time: timestamp, // 转换为秒级时间戳
				open: kline.open,
				high: kline.high,
				low: kline.low,
				close: kline.close,
			};

			// 调用series的update方法
			const klineSeries = get().getKlineSeriesRef();
			if (klineSeries) {
				klineSeries.update(candlestickData);
				// 如果k线数据长度大于10， 则删除前5根k线
				const visibleLogicalRangeFrom = get().getVisibleLogicalRange();
				// console.log("visibleLogicalRangeFrom", visibleLogicalRangeFrom, "data length", klineSeries.data().length);
				// 如果可见逻辑范围逻辑起始点大于10， 并且k线数据长度大于200， 则删除前50根k线
				if (
					visibleLogicalRangeFrom &&
					visibleLogicalRangeFrom.from > 100 &&
					klineSeries.data().length > MAX_DATA_LENGTH
				) {
					// console.log("删除前50根k线");
					const newData = klineSeries.data().slice(50);
					klineSeries.setData(newData);
				}
			}
		},

		onNewIndicator: (
			indicatorKeyStr: KeyStr,
			indicator: Record<keyof IndicatorValueConfig, SingleValueData[]>,
		) => {

			Object.entries(indicator).forEach(([indicatorValueKey, newDataArray]) => {

				// 处理新数据数组中的每个数据点
				newDataArray.forEach((newDataPoint, _) => {
					// // 获取该指标值字段的最后一个数据点
					// const lastData = existingData[existingData.length - 1];
					// 过滤主图指标的0值
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

						// 如果指标数据长度大于10， 则删除前5根指标数据
						const visibleLogicalRangeFrom = get().getVisibleLogicalRange();
						if (
							visibleLogicalRangeFrom &&
							visibleLogicalRangeFrom.from > 100 &&
							indicatorSeriesRef.data().length > MAX_DATA_LENGTH
						) {
							// console.log("删除前50根指标数据", indicatorValueKey);
							const newData = indicatorSeriesRef.data().slice(50);
							indicatorSeriesRef.setData(newData);
						}
					}
				});
			});

			// 更新状态
			// set((prevState: BacktestChartStore) => ({
			// 	indicatorData: {
			// 		...prevState.indicatorData,
			// 		[indicatorKeyStr]: updatedIndicator,
			// 	},
			// }));
		},

		onNewOrder: (newOrder: VirtualOrder) => {
			// 后端返回时间，转换为时间戳：2025-07-25T00:20:00Z -> timestamp
			// 开仓订单
			if (newOrder.orderStatus === OrderStatus.FILLED) {
				const markers = virtualOrderToMarker(newOrder);
				get().setOrderMarkers([...get().orderMarkers, ...markers]);
				// console.log("orderMarkers", get().getOrderMarkers());
				const orderMarkerSeriesRef = get().getOrderMarkerSeriesRef();
				if (orderMarkerSeriesRef) {
					orderMarkerSeriesRef.setMarkers(get().getOrderMarkers());
				}
			}

			// 限价单, 状态为挂单和已创建时，创建限价单价格线
			else if (
				newOrder.orderType === OrderType.LIMIT &&
				(newOrder.orderStatus === OrderStatus.PLACED || newOrder.orderStatus === OrderStatus.CREATED)
			) {
				// 创建限价单价格线
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
			else if (newOrder.orderStatus === OrderStatus.CREATED && (newOrder.orderType === OrderType.TAKE_PROFIT_MARKET || newOrder.orderType===OrderType.STOP_MARKET)) {
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
				}
				else if (newOrder.orderType === OrderType.STOP_MARKET) {
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
			}
			
			else if (order.orderType === OrderType.TAKE_PROFIT_MARKET) {
				this.onTpOrderFilled(order);
			}

			else if (order.orderType === OrderType.STOP_MARKET) {
				this.onSlOrderFilled(order);
			}
			else {
				console.log("onOrderFilled", order);
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
			}
			else if (order.orderType === OrderType.STOP_MARKET) {
				const stopLossPriceLine = SlOrderToStopLossPriceLine(order);
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
			else if (
				order.orderType === OrderType.LIMIT
			) {
				// 创建限价单价格线
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
			}
			else if (order.orderType === OrderType.STOP_MARKET) {
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
			// 删除限价单价格线
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
			// 创建标记
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
			// 创建标记
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
			// 创建标记
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

		// 仓位关闭后，清除仓位价格线
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
