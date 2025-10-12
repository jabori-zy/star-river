import type { CandlestickData, SingleValueData, UTCTimestamp } from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { Kline } from "@/types/kline";
import type { KeyStr } from "@/types/symbol-key";
import type { VirtualOrder } from "@/types/order";
import type { VirtualPosition } from "@/types/position";
import { OrderStatus, OrderType } from "@/types/order";
import { getChartAlignedUtcTimestamp } from "../utls";
import {
	virtualOrderToMarker,
	virtualPositionToOpenPositionPriceLine,
	virtualPositionToTakeProfitPriceLine,
	virtualPositionToStopLossPriceLine,
	virtualOrderToLimitOrderPriceLine
} from "../utls";
import type { SliceCreator, EventHandlerSlice, BacktestChartStore, StoreContext } from "./types";




const MAX_DATA_LENGTH = 100;




export const createEventHandlerSlice = (
	context: StoreContext
): SliceCreator<EventHandlerSlice> => (set, get) => ({
	onNewKline: (kline: Kline) => {
		const timestamp = getChartAlignedUtcTimestamp(kline.datetime) as UTCTimestamp;

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
			const visibleLogicalRangeFrom = get().getVisibleLogicalRangeFrom();
			// console.log("visibleLogicalRangeFrom", visibleLogicalRangeFrom, "data length", klineSeries.data().length);
			// 如果可见逻辑范围逻辑起始点大于10， 并且k线数据长度大于200， 则删除前50根k线
			if (visibleLogicalRangeFrom && visibleLogicalRangeFrom > 100 && klineSeries.data().length > MAX_DATA_LENGTH) {
				// console.log("删除前50根k线");
				const newData = klineSeries.data().slice(50);
				klineSeries.setData(newData);
			}
			
		}

		

		// // 获取最后一根k线
		// const lastData = get().getLastKline(klineKeyStr);

		// // 如果最后一根k线的时间戳与新k线的时间戳相同，则替换最后一根k线
		// if (lastData && lastData.time === timestamp) {
		// 	const data = get().klineData;
		// 	// 创建新数组，替换最后一根k线
		// 	const newData = [...data.slice(0, -1), candlestickData];
		// 	get().setKlineData(newData);
		// } else {
		// 	const data = get().klineData;
		// 	// 说明策略还未开始，当前是第一根k线
		// 	if (!data) {
		// 		get().setKlineData([candlestickData]);
		// 	}

		// 	// 创建新数组，添加新k线
		// 	const newData = [...data, candlestickData];
		// 	get().setKlineData(newData);
		// }
	},

	onNewIndicator: (
		indicatorKeyStr: KeyStr,
		indicator: Record<keyof IndicatorValueConfig, SingleValueData[]>,
	) => {
		// const existingIndicatorData = get().indicatorData[indicatorKeyStr] || {};
		// const indicatorConfig = context.chartConfig.indicatorChartConfigs.find(
		// 	(config) => config.indicatorKeyStr === indicatorKeyStr,
		// );
		// const isInMainChart = indicatorConfig?.isInMainChart;

		// 处理每个指标值字段
		// const updatedIndicator: Record<keyof IndicatorValueConfig, SingleValueData[]> = { ...existingIndicatorData };

		Object.entries(indicator).forEach(([indicatorValueKey, newDataArray]) => {
			// const indicatorValueField = indicatorValueKey as keyof IndicatorValueConfig;
			// const existingData = existingIndicatorData[indicatorValueField] || [];

			// 处理新数据数组中的每个数据点
			newDataArray.forEach((newDataPoint, index) => {
				// // 获取该指标值字段的最后一个数据点
				// const lastData = existingData[existingData.length - 1];
				// 过滤主图指标的0值
				if ((newDataPoint.value === 0 || newDataPoint.value === null)) {
					return;
				}

				// update
				const indicatorSeriesRef = get().getIndicatorSeriesRef(indicatorKeyStr, indicatorValueKey);
				if (indicatorSeriesRef) {
					indicatorSeriesRef.update(newDataPoint);

					// 如果指标数据长度大于10， 则删除前5根指标数据
					const visibleLogicalRangeFrom = get().getVisibleLogicalRangeFrom();
					if (visibleLogicalRangeFrom && visibleLogicalRangeFrom > 100 && indicatorSeriesRef.data().length > MAX_DATA_LENGTH) {
						// console.log("删除前50根指标数据", indicatorValueKey);
						const newData = indicatorSeriesRef.data().slice(50);
						indicatorSeriesRef.setData(newData);
					}
				}

				// // 如果最后一个数据点的时间戳与新数据点的时间戳相同，则替换最后一个数据点
				// if (lastData && lastData.time === newDataPoint.time) {
				// 	// 创建新数组，替换最后一个数据点
				// 	updatedIndicator[indicatorValueField] = [
				// 		...existingData.slice(0, -1),
				// 		newDataPoint,
				// 	];
				// } else {
				// 	// 创建新数组，添加新数据点
				// 	updatedIndicator[indicatorValueField] = [
				// 		...existingData,
				// 		newDataPoint,
				// 	];
				// }
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
		// console.log("newOrder", newOrder);
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
		else if (newOrder.orderType === OrderType.LIMIT && (newOrder.orderStatus === OrderStatus.PLACED || newOrder.orderStatus === OrderStatus.CREATED)) {
			// 创建限价单价格线
			const limitOrderPriceLine = virtualOrderToLimitOrderPriceLine(newOrder);
			if (limitOrderPriceLine) {
				get().setLimitOrderPriceLine([...get().limitOrderPriceLine, limitOrderPriceLine]);
				const candleSeriesRef = get().getKlineSeriesRef();
				if (candleSeriesRef) {
					candleSeriesRef.createPriceLine(limitOrderPriceLine);
				}
			}
		}
	},

	onLimitOrderFilled: (limitOrder: VirtualOrder) => {
		// 删除限价单价格线
		const candleSeriesRef = get().getKlineSeriesRef();
		if (candleSeriesRef) {
			const readyToRemovePriceLines = candleSeriesRef.priceLines().filter((priceLine) =>
				priceLine.options().id?.includes(`${limitOrder.orderId.toString()}-limit`)
			);
			readyToRemovePriceLines.forEach((priceLine) => {
				const pricelineId = priceLine.options().id as string;
				candleSeriesRef.removePriceLine(priceLine);
				get().deleteLimitOrderPriceLine(pricelineId);
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

	onNewPosition: (position: VirtualPosition) => {
		const openPositionPriceLine = virtualPositionToOpenPositionPriceLine(position);
		const takeProfitPriceLine = virtualPositionToTakeProfitPriceLine(position);
		const stopLossPriceLine = virtualPositionToStopLossPriceLine(position);
		if (takeProfitPriceLine) {
			get().setPositionPriceLine([...get().positionPriceLine, takeProfitPriceLine]);
		}
		if (stopLossPriceLine) {
			get().setPositionPriceLine([...get().positionPriceLine, stopLossPriceLine]);
		}
		const candleSeriesRef = get().getKlineSeriesRef();
		if (candleSeriesRef) {
			candleSeriesRef.createPriceLine(openPositionPriceLine);
			if (takeProfitPriceLine) {
				candleSeriesRef.createPriceLine(takeProfitPriceLine);
			}
			if (stopLossPriceLine) {
				candleSeriesRef.createPriceLine(stopLossPriceLine);
			}
		}
	},

	// 仓位关闭后，清除仓位价格线
	onPositionClosed: (position: VirtualPosition) => {
		const candleSeriesRef = get().getKlineSeriesRef();
		if (candleSeriesRef) {
			const readyToRemovePriceLines = candleSeriesRef.priceLines().filter((priceLine) =>
				priceLine.options().id?.includes(position.positionId.toString())
			);
			readyToRemovePriceLines.forEach((priceLine) => {
				const pricelineId = priceLine.options().id as string;
				candleSeriesRef.removePriceLine(priceLine);
				get().deletePositionPriceLine(pricelineId);
			});
		}
	},
});