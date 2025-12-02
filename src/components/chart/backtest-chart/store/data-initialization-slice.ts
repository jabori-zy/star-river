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
import type { IndicatorKeyStr, KeyStr } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import {
	getChartAlignedUtcTimestamp,
	virtualOrderToLimitOrderPriceLine,
	virtualOrderToMarker,
	virtualPositionToOpenPositionPriceLine,
} from "../utls";
import type { DataInitializationSlice, SliceCreator } from "./types";

// 初始化k线长度
const INITIAL_DATA_LENGTH = 1000;

export const createDataInitializationSlice =
	(): SliceCreator<DataInitializationSlice> => (_set, get) => ({
		// 私有方法：处理K线数据
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

			// 安全检查：确保 initialKlines 存在且是数组
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

		// 私有方法：处理指标数据
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
			// 安全检查：确保指标数据存在
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
						// 跳过datetime字段，只处理指标值，并过滤value为0的数据和value为空的数据
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

		initChartData: async (
			datetime: string,
			circleId: number,
			strategyId: number,
		) => {
			const state = get();
			if (circleId === 0) {
				return;
			}
			// 使用 Promise.all 等待所有异步操作完成
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
					}
				} catch (error) {
					console.error(`Error loading data for keyStr: ${keyStr}`, error);
					return null;
				}
			});

			await state.initVirtualOrderData(strategyId);
			await state.initVirtualPositionData(strategyId);
			// 等待所有数据加载完成
			await Promise.all(promises);
			// 标记数据已初始化
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

				// 只处理指标类型的key
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

		initVirtualOrderData: async (strategyId: number) => {
			const virtualOrderData = await getVirtualOrder(strategyId);
			// 清除订单标记
			get().setOrderMarkers([]);
			// 清除限价单价格线
			get().setOrderPriceLine([]);

			// 按updateTime升序排序
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
				const klineKey = parseKey(klineKeyStr);
				const virtualPositionData = await getVirtualPosition(strategyId);
				const orderPriceLine: PositionPriceLine[] = [];
				// 获取当前symbol的仓位
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
