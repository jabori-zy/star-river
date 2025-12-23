import type {
	CandlestickData,
	SingleValueData,
	UTCTimestamp,
} from "lightweight-charts";
import { DateTime } from "luxon";
import {
	getVirtualOrder,
	getVirtualPosition,
} from "@/service/backtest-strategy";
import { getStrategyDataApi } from "@/service/backtest-strategy/get-strategy-data";
import type {
	OrderMarker,
	OrderPriceLine,
	PositionPriceLine,
} from "@/types/chart";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { Kline } from "@/types/kline";
import type { VirtualOrder } from "@/types/order";
import { OrderStatus, OrderType } from "@/types/order";
import type { VirtualPosition } from "@/types/position";
import type { IndicatorKeyStr, KeyStr, KlineKey, OperationKeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import {
	getChartAlignedUtcTimestamp,
	virtualOrderToLimitOrderPriceLine,
	virtualOrderToMarker,
	virtualPositionToOpenPositionPriceLine,
} from "../utls";
import type { DataInitializationSlice, SliceCreator } from "./types";

// Initial kline length
const INITIAL_DATA_LENGTH = 1000;

export const createDataInitializationSlice =
	(): SliceCreator<DataInitializationSlice> => (_set, get) => ({
		// Private method: process kline data
		_processKlineData: async (
			strategyId: number,
			klineKeyStr: KeyStr,
			datetime: string,
		) => {
			const initialKlines = (await getStrategyDataApi({
				strategyId,
				keyStr: klineKeyStr,
				datetime: datetime,
				limit: INITIAL_DATA_LENGTH,
			})) as Kline[];

			// Safety check: ensure initialKlines exists and is an array
			if (
				initialKlines &&
				Array.isArray(initialKlines) &&
				initialKlines.length > 0
			) {
				const klineData: CandlestickData[] = initialKlines.map((kline) => {
					const timestampInSeconds = getChartAlignedUtcTimestamp(
						kline.datetime,
					) as UTCTimestamp;
					return {
						time: timestampInSeconds,
						open: kline.open,
						high: kline.high,
						low: kline.low,
						close: kline.close,
					};
				});
				setTimeout(() => {
					const klineSeriesRef = get().getKlineSeriesRef();
					if (klineSeriesRef) {
						klineSeriesRef.setData(klineData);
					}
				}, 100);
			} else {
				console.warn(`No kline data received for keyStr: ${klineKeyStr}`);
			}
		},

		// Private method: process indicator data
		_processIndicatorData: async (
			strategyId: number,
			keyStr: KeyStr,
			datetime: string,
		) => {
			const state = get();
			// console.log("circleId: ", circleId);
			const initialIndicatorData = (await getStrategyDataApi({
				strategyId,
				keyStr,
				datetime,
				limit: INITIAL_DATA_LENGTH,
			})) as Record<keyof IndicatorValueConfig, number | Date>[];
			// Safety check: ensure indicator data exists
			if (
				initialIndicatorData &&
				Array.isArray(initialIndicatorData) &&
				initialIndicatorData.length > 0
			) {
				const indicatorData: Record<
					keyof IndicatorValueConfig,
					SingleValueData[]
				> = {};
				initialIndicatorData.forEach((item) => {
					Object.entries(item).forEach(([indicatorValueField, value]) => {
						// Skip datetime field, only process indicator values, and filter out zero and null values
						if (
							indicatorValueField !== "datetime" &&
							value !== 0 &&
							value !== null
						) {
							indicatorData[indicatorValueField as keyof IndicatorValueConfig] =
								[
									...(indicatorData[
										indicatorValueField as keyof IndicatorValueConfig
									] || []),
									{
										time: getChartAlignedUtcTimestamp(
											item.datetime as unknown as string,
										) as UTCTimestamp,
										value: value as number,
									} as SingleValueData,
								];
						}
					});
				});

				const currentChartConfig = get().chartConfig;
				const indicatorChartConfigs =
					currentChartConfig?.indicatorChartConfigs.find(
						(config) => config.indicatorKeyStr === keyStr,
					);
				setTimeout(() => {
					if (indicatorChartConfigs) {
						indicatorChartConfigs.seriesConfigs.forEach((seriesConfig) => {
							const indicatorSeriesRef = state.getIndicatorSeriesRef(
								indicatorChartConfigs.indicatorKeyStr,
								seriesConfig.indicatorValueKey,
							);
							if (indicatorSeriesRef) {
								indicatorSeriesRef.setData(
									indicatorData[
										seriesConfig.indicatorValueKey as keyof IndicatorValueConfig
									],
								);
							}
						});
					}
				}, 10);

				// state.setIndicatorData(keyStr, indicatorData);
				return indicatorData;
			} else {
				console.warn(`No indicator data received for keyStr: ${keyStr}`);
				return null;
			}
		},

		// Private method: process operation data
		_processOperationData: async (
			strategyId: number,
			keyStr: KeyStr,
			datetime: string,
		) => {
			const state = get();
			const initialOperationData = (await getStrategyDataApi({
				strategyId,
				keyStr,
				datetime,
				limit: INITIAL_DATA_LENGTH,
			})) as Record<string, number | Date>[];

			// Safety check: ensure operation data exists
			if (
				initialOperationData &&
				Array.isArray(initialOperationData) &&
				initialOperationData.length > 0
			) {
				const operationData: Record<string, SingleValueData[]> = {};
				initialOperationData.forEach((item) => {
					Object.entries(item).forEach(([outputKey, value]) => {
						// Skip datetime field, only process operation values, and filter out zero and null values
						if (outputKey !== "datetime" && value !== 0 && value !== null) {
							operationData[outputKey] = [
								...(operationData[outputKey] || []),
								{
									time: getChartAlignedUtcTimestamp(
										item.datetime as unknown as string,
									) as UTCTimestamp,
									value: value as number,
								} as SingleValueData,
							];
						}
					});
				});

				const currentChartConfig = get().chartConfig;
				const operationChartConfig =
					currentChartConfig?.operationChartConfigs.find(
						(config) => config.operationKeyStr === keyStr,
					);
				setTimeout(() => {
					if (operationChartConfig) {
						operationChartConfig.seriesConfigs.forEach((seriesConfig) => {
							const operationSeriesRef = state.getOperationSeriesRef(
								operationChartConfig.operationKeyStr,
								seriesConfig.outputSeriesKey,
							);
							if (operationSeriesRef) {
								operationSeriesRef.setData(
									operationData[seriesConfig.outputSeriesKey],
								);
							}
						});
					}
				}, 10);

				return operationData;
			} else {
				console.warn(`No operation data received for keyStr: ${keyStr}`);
				return null;
			}
		},

		initChartData: async (
			datetime: string,
			circleId: number,
			strategyId: number,
		) => {
			const state = get();
			if (circleId === 0) {
				return;
			}
			// Use Promise.all to wait for all async operations to complete
			const promises = state.getKeyStr().map(async (keyStr: KeyStr) => {
				try {
					const key = parseKey(keyStr);

					if (key.type === "kline") {
						await state._processKlineData(strategyId, keyStr, datetime);
					} else if (key.type === "indicator") {
						return await state._processIndicatorData(
							strategyId,
							keyStr,
							datetime,
						);
					} else if (key.type === "operation") {
						return await state._processOperationData(
							strategyId,
							keyStr,
							datetime,
						);
					}
				} catch (error) {
					console.error(`Error loading data for keyStr: ${keyStr}`, error);
					return null;
				}
			});

			await state.initVirtualOrderData(strategyId);
			await state.initVirtualPositionData(strategyId);
			// Wait for all data loading to complete
			await Promise.all(promises);
			// Mark data as initialized
			state.setIsDataInitialized(true);
		},

		initKlineData: async (
			datetime: string,
			circleId: number,
			strategyId: number,
		) => {
			if (circleId === 0) {
				return;
			}
			const state = get();
			const klineKeyStr = state.getKlineKeyStr();
			if (klineKeyStr) {
				await state._processKlineData(strategyId, klineKeyStr, datetime);
			}
		},

		initIndicatorData: async (
			strategyId: number,
			indicatorKeyStr: IndicatorKeyStr,
			datetime: string,
			circleId: number,
		) => {
			if (circleId === 0) {
				return;
			}
			const state = get();

			try {
				const key = parseKey(indicatorKeyStr);

				// Only process indicator type keys
				if (key.type === "indicator") {
					await state._processIndicatorData(
						strategyId,
						indicatorKeyStr,
						datetime,
					);
				} else {
					console.warn(`Key ${indicatorKeyStr} is not an indicator key`);
				}
			} catch (error) {
				console.error(
					`Error loading indicator data for keyStr: ${indicatorKeyStr}`,
					error,
				);
			}
		},

		initOperationData: async (
			strategyId: number,
			operationKeyStr: OperationKeyStr,
			datetime: string,
			circleId: number,
		) => {
			if (circleId === 0) {
				return;
			}
			const state = get();

			try {
				const key = parseKey(operationKeyStr);

				// Only process operation type keys
				if (key.type === "operation") {
					await state._processOperationData(
						strategyId,
						operationKeyStr,
						datetime,
					);
				} else {
					console.warn(`Key ${operationKeyStr} is not an operation key`);
				}
			} catch (error) {
				console.error(
					`Error loading operation data for keyStr: ${operationKeyStr}`,
					error,
				);
			}
		},

		initVirtualOrderData: async (strategyId: number) => {
			const virtualOrderData = await getVirtualOrder(strategyId);
			// Clear order markers
			get().setOrderMarkers([]);
			// Clear limit order price lines
			get().setOrderPriceLine([]);

			// Sort by updateTime in ascending order
			virtualOrderData.sort(
				(a: VirtualOrder, b: VirtualOrder) =>
					DateTime.fromISO(a.updateTime).toMillis() -
					DateTime.fromISO(b.updateTime).toMillis(),
			);
			const orderMarkers: OrderMarker[] = [];
			const limitOrderPriceLines: OrderPriceLine[] = [];
			virtualOrderData.forEach((order: VirtualOrder) => {
				if (order.orderStatus === OrderStatus.FILLED) {
					if (
						order.orderType === OrderType.LIMIT ||
						order.orderType === OrderType.MARKET ||
						order.orderType === OrderType.TAKE_PROFIT_MARKET ||
						order.orderType === OrderType.STOP_MARKET
					) {
						const markers = virtualOrderToMarker(order);
						orderMarkers.push(...markers);
					}
				} else if (
					order.orderType === OrderType.LIMIT &&
					(order.orderStatus === OrderStatus.PLACED ||
						order.orderStatus === OrderStatus.CREATED)
				) {
					const limitOrderPriceLine = virtualOrderToLimitOrderPriceLine(order);
					if (limitOrderPriceLine) {
						limitOrderPriceLines.push(limitOrderPriceLine);
					}
				}
			});
			get().setOrderMarkers(orderMarkers);
			get().setOrderPriceLine(limitOrderPriceLines);
		},

		initVirtualPositionData: async (strategyId: number) => {
			const chartConfig = get().chartConfig;
			const klineKeyStr = chartConfig?.klineChartConfig.klineKeyStr;
			if (klineKeyStr) {
				const klineKey = parseKey(klineKeyStr) as KlineKey;
				const virtualPositionData = await getVirtualPosition(strategyId);
				const orderPriceLine: PositionPriceLine[] = [];
				// Get current symbol positions
				const currentSymbolPosition: VirtualPosition[] =
					virtualPositionData.filter(
						(position: VirtualPosition) =>
							position.symbol === klineKey.symbol &&
							position.exchange === klineKey.exchange,
					);
				if (currentSymbolPosition.length > 0) {
					currentSymbolPosition.forEach((position: VirtualPosition) => {
						const openPositionPriceLine =
							virtualPositionToOpenPositionPriceLine(position);

						orderPriceLine.push(openPositionPriceLine);
					});
				}
				get().setPositionPriceLine(orderPriceLine);
			}
		},
	});
