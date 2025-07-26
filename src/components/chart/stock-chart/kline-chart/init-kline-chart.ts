import {
	AnnotationHoverModifier,
	CursorModifier,
	DateTimeNumericAxis,
	EAutoRange,
	EAxisAlignment,
	EDragMode,
	ENumericFormat,
	EResamplingMode,
	easing,
	FastCandlestickRenderableSeries,
	FastColumnRenderableSeries,
	FastLineRenderableSeries,
	HorizontalLineAnnotation,
	type IAnnotation,
	type IRenderableSeries,
	MouseWheelZoomModifier,
	NumberRange,
	NumericAxis,
	OhlcDataSeries,
	RolloverModifier,
	SciChartDefaults,
	SciChartSurface,
	type TTargetsSelector,
	XAxisDragModifier,
	XyDataSeries,
	YAxisDragModifier,
	ZoomExtentsModifier,
	ZoomPanModifier,
} from "scichart";
import type { KlineChartConfig } from "@/types/chart";
import type { IndicatorValue } from "@/types/indicator";
import { getIndicatorChartConfig } from "@/types/indicator/indicator-chart-config";
import { type Kline, KlineInterval } from "@/types/kline";
import type { VirtualOrder } from "@/types/order/virtual-order";
import type { IndicatorKey, KlineKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import { appTheme } from "../theme";
import { TradeAnnotation } from "../trade-marker-modifier";
import {
	getRolloverLegendTemplate,
	type KlineUpdateContext,
	processKlineData,
} from "../utils";
import { VolumePaletteProvider } from "./volumePaletteProvider";

SciChartDefaults.debugDisableResampling = false;
SciChartDefaults.performanceWarnings = false;

export const initKlineChart = async (
	rootElement: string | HTMLDivElement,
	klineChartConfig: KlineChartConfig,
) => {
	const klineKey = parseKey(klineChartConfig.klineKeyStr) as KlineKey;

	const chartInterval = klineKey.interval;

	const { sciChartSurface, wasmContext } = await SciChartSurface.create(
		rootElement,
		{
			theme: appTheme.SciChartJsTheme,
		},
	);

	// 添加时间类型的X轴
	const xAxis = new DateTimeNumericAxis(wasmContext, {
		drawMajorBands: false,
		drawMajorGridLines: false,
		drawMinorGridLines: false,
		drawLabels: false,
		cursorLabelFormat: ENumericFormat.Date_DDMMHHMM, // 设置光标标签格式
		// autoRange: EAutoRange.Always,
	});
	sciChartSurface.xAxes.add(xAxis);

	// 订阅x轴范围变化事件，实时打印x轴范围
	// xAxis.visibleRangeChanged.subscribe((args) => {
	//     if (args && args.visibleRange) {
	//         const minTimestamp = args.visibleRange.min;
	//         const maxTimestamp = args.visibleRange.max;
	//         const minDate = new Date(minTimestamp * 1000).toLocaleString();
	//         const maxDate = new Date(maxTimestamp * 1000).toLocaleString();
	//         // console.log(`x轴范围变化: ${minDate} - ${maxDate} (${minTimestamp} - ${maxTimestamp})`);
	//     }
	// });

	// 添加价格类型的Y轴
	const yAxis = new NumericAxis(wasmContext, {
		growBy: new NumberRange(0.1, 0.1),
		labelFormat: ENumericFormat.Decimal,
		labelPrecision: 2,
		// labelPrefix: "$",
		// autoRange: EAutoRange.Always,
		axisAlignment: EAxisAlignment.Right,

		drawMajorGridLines: false,
		drawMinorGridLines: false,
	});
	sciChartSurface.yAxes.add(yAxis);

	// 订阅y轴范围变化事件，实时打印y轴范围
	// yAxis.visibleRangeChanged.subscribe((args) => {
	//     if (args && args.visibleRange) {
	//         const minPrice = args.visibleRange.min;
	//         const maxPrice = args.visibleRange.max;
	//         // console.log(`y轴范围变化: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`);
	//     }
	// });

	// 添加成交量Y轴
	const Y_AXIS_VOLUME_ID = "Y_AXIS_VOLUME_ID";
	const volumeAxis = new NumericAxis(wasmContext, {
		id: Y_AXIS_VOLUME_ID,
		growBy: new NumberRange(0, 4),
		labelFormat: ENumericFormat.Decimal,
		isVisible: false,
		autoRange: EAutoRange.Always,
	});
	sciChartSurface.yAxes.add(volumeAxis);

	// 添加蜡烛图
	const candleDataSeries = new OhlcDataSeries(wasmContext, {
		dataSeriesName: klineKey.symbol + "/" + klineKey.interval,
	});

	const candlestickSeries = new FastCandlestickRenderableSeries(wasmContext, {
		dataSeries: candleDataSeries,
		stroke: appTheme.Black, // used by cursorModifier below
		strokeThickness: 1,
		// brushUp: appTheme.VividGreen,
		// brushDown: appTheme.Black,
		// strokeUp: appTheme.Black,
		// strokeDown: appTheme.Black,
		brushUp: appTheme.MutedRed,
		brushDown: appTheme.MutedGreen,
		strokeUp: appTheme.Black,
		strokeDown: appTheme.Black,
		resamplingMode: EResamplingMode.None,
	});

	sciChartSurface.renderableSeries.add(candlestickSeries);

	// 添加成交量图
	const volumeDataSeries = new XyDataSeries(wasmContext, {
		dataSeriesName: "Volume",
	});
	sciChartSurface.renderableSeries.add(
		new FastColumnRenderableSeries(wasmContext, {
			dataSeries: volumeDataSeries,
			stroke: appTheme.Black,
			strokeThickness: 0,
			// This is how we get volume to scale - on a hidden YAxis
			yAxisId: Y_AXIS_VOLUME_ID,
			// This is how we colour volume bars red or green
			paletteProvider: new VolumePaletteProvider(
				candleDataSeries,
				appTheme.MutedGreen + "77",
				appTheme.MutedRed + "77",
			),
		}),
	);

	// 建立指标键与数据系列的直接映射关系
	const indicatorDataSeriesMap = new Map<string, XyDataSeries>();
	const mainChartIndicatorRenderableSeries: IRenderableSeries[] = [];

	// 添加主图的指标
	// 如果主图指标不为空，则添加主图指标
	if (Object.keys(klineChartConfig.indicatorChartConfig).length > 0) {
		Object.entries(klineChartConfig.indicatorChartConfig).forEach(
			([indicatorKeyStr, indicatorChartConfig]) => {
				console.log(
					"indicatorChartConfig",
					indicatorKeyStr,
					indicatorChartConfig,
				);
				if (indicatorChartConfig) {
					const indicatorKey = parseKey(
						indicatorKeyStr,
					) as IndicatorKey;
					const indicatorDataSeries = new XyDataSeries(wasmContext, {
						dataSeriesName:
							indicatorKey.indicatorType.toUpperCase() +
							":" +
							indicatorKey.indicatorConfig.period,
					});
					// console.log("indicatorDataSeries", indicatorDataSeries);

					// 建立直接映射关系
					indicatorDataSeriesMap.set(indicatorKeyStr, indicatorDataSeries);

					mainChartIndicatorRenderableSeries.push(
						new FastLineRenderableSeries(wasmContext, {
							dataSeries: indicatorDataSeries,
							stroke:
								indicatorChartConfig.seriesConfigs[0].color ||
								appTheme.ForegroundColor,
							strokeThickness:
								indicatorChartConfig.seriesConfigs[0].strokeThickness || 2,
						}),
					);
					sciChartSurface.renderableSeries.add(
						mainChartIndicatorRenderableSeries[
							mainChartIndicatorRenderableSeries.length - 1
						],
					);
				}
			},
		);
	}

	const onNewIndicator = (newIndicators: Record<string, IndicatorValue>) => {
		Object.entries(newIndicators).forEach(
			([indicatorKeyStr, indicatorData]) => {
				const indicatorChartConfig = getIndicatorChartConfig(indicatorKeyStr);
				if (indicatorChartConfig) {
					// 通过key直接找到对应的数据系列
					const indicatorDataSeries =
						indicatorDataSeriesMap.get(indicatorKeyStr);
					if (indicatorDataSeries) {
						const value =
							indicatorData[
								indicatorChartConfig.seriesConfigs[0].indicatorValueKey
							];
						console.log("indicator_value", value);
						if (value !== undefined && value !== null && value !== 0) {
							const timestamp = indicatorData.timestamp / 1000;

							// 参考K线的更新方式：判断是新数据还是更新现有数据
							if (indicatorDataSeries.count() === 0) {
								// 没有数据，直接添加
								indicatorDataSeries.append(timestamp, value);
							} else {
								// 有数据，判断是否是相同时间戳的数据
								const currentIndex = indicatorDataSeries.count() - 1;
								const latestTimestamp = indicatorDataSeries
									.getNativeXValues()
									.get(currentIndex);

								if (timestamp === latestTimestamp) {
									// 相同时间戳，更新现有数据
									indicatorDataSeries.update(currentIndex, value);
									console.log(
										`更新指标数据: ${indicatorKeyStr}, timestamp: ${timestamp}, value: ${value}`,
									);
								} else {
									// 不同时间戳，追加新数据
									indicatorDataSeries.append(timestamp, value);
									console.log(
										`追加指标数据: ${indicatorKeyStr}, timestamp: ${timestamp}, value: ${value}`,
									);
								}
							}
						}
					} else {
						console.warn(`未找到指标 ${indicatorKeyStr} 对应的数据系列`);
					}
				}
			},
		);
	};

	// 添加图表控制器 modifiers
	// 添加缩放、平移、鼠标滚轮缩放、光标工具提示
	sciChartSurface.chartModifiers.add(
		new XAxisDragModifier(),
		new YAxisDragModifier({
			dragMode: EDragMode.Scaling,
		}),
		new ZoomExtentsModifier(),
		new ZoomPanModifier({ enableZoom: true }),
		new MouseWheelZoomModifier(),
		new CursorModifier({
			crosshairStroke: appTheme.Black,
			axisLabelFill: appTheme.Black,
			//设置宽度
			crosshairStrokeThickness: 0.5,
			showAxisLabels: true, // 显示x轴的标签
			// tooltipLegendTemplate: getCursorTooltipLegendTemplate,
		}),
		new RolloverModifier({
			rolloverLineStroke: appTheme.Black,
			rolloverLineStrokeThickness: 0.5,
			modifierGroup: "cursorGroup",
			showTooltip: false,

			tooltipLegendTemplate: getRolloverLegendTemplate,
		}),
	);
	const targetsSelector: TTargetsSelector<IAnnotation> = (modifer) => {
		return modifer.getAllTargets().filter((t) => "quantity" in t);
	};
	sciChartSurface.chartModifiers.add(
		new AnnotationHoverModifier({
			targets: targetsSelector,
		}),
	);

	// 添加一条水平线注释，显示最新价格
	const latestPriceAnnotation = new HorizontalLineAnnotation({
		isHidden: true,
		strokeDashArray: [2, 2],
		strokeThickness: 2,
		axisFontSize: 13,
		axisLabelStroke: appTheme.ForegroundColor,
		showLabel: true,
	});
	sciChartSurface.annotations.add(latestPriceAnnotation);

	const setKlineData = (symbolName: string, klines: Kline[]) => {
		console.log(
			`createCandlestickChart(): Setting data for ${symbolName}, ${klines.length} candles`,
		);

		// 将 Kline 映射为 scichart 期望的结构化数组
		const xValues: number[] = [];
		const openValues: number[] = [];
		const highValues: number[] = [];
		const lowValues: number[] = [];
		const closeValues: number[] = [];
		const volumeValues: number[] = [];
		klines.forEach((kline: Kline) => {
			xValues.push(kline.timestamp / 1000);
			openValues.push(kline.open);
			highValues.push(kline.high);
			lowValues.push(kline.low);
			closeValues.push(kline.close);
			volumeValues.push(kline.volume);
		});

		// 清除数据系列并重新添加数据
		candleDataSeries.clear();
		candleDataSeries.appendRange(
			xValues,
			openValues,
			highValues,
			lowValues,
			closeValues,
		);
		volumeDataSeries.clear();
		volumeDataSeries.appendRange(xValues, volumeValues);

		// 设置蜡烛数据系列名称（用于工具提示/图例）
		candleDataSeries.dataSeriesName = symbolName;

		// 更新最新价格注释
		// updateLatestPriceAnnotation(klines[klines.length - 1]);
	};

	// 回测相关的配置
	const MAX_VISIBLE_CANDLES = 500; // 最多显示500根K线
	let firstCandleTimestamp: number | null = null; // 第一根K线的时间戳
	const candleInterval: number =
		KlineInterval[klineKey.interval as unknown as keyof typeof KlineInterval]; // K线间隔（秒），默认1分钟，需要根据实际情况调整

	// 记录第一根K线的价格范围
	let firstKlineHighPrice: number | null = null;
	let firstKlineLowPrice: number | null = null;

	const onNewKline = (kline: Kline) => {
		// 构建K线更新上下文
		const context: KlineUpdateContext = {
			candleDataSeries,
			volumeDataSeries,
			xAxis,
			yAxis,
			latestPriceAnnotation,
			candleInterval,
			maxVisibleCandles: MAX_VISIBLE_CANDLES,
			firstCandleTimestamp,
			firstKlineHighPrice,
			firstKlineLowPrice,
		};

		// 使用工具函数处理K线数据
		const updatedContext = processKlineData(kline, context);

		// 更新局部变量
		firstCandleTimestamp = updatedContext.firstCandleTimestamp;
		firstKlineHighPrice = updatedContext.firstKlineHighPrice;
		firstKlineLowPrice = updatedContext.firstKlineLowPrice;
	};

	const onNewOrder = (order: VirtualOrder) => {
		console.log("onNewOrder", order);
		const orderTimestamp = new Date(order.createTime).getTime() / 1000;
		sciChartSurface.annotations.add(
			new TradeAnnotation(
				orderTimestamp,
				true,
				order.quantity,
				order.openPrice,
				order.openPrice,
				order.openPrice,
				order.createTime,
			),
		);
	};

	// 设置X轴范围
	const setXRange = (start: number, end: number) => {
		const dateDifference =
			10 *
			KlineInterval[chartInterval as unknown as keyof typeof KlineInterval];
		console.log("dateDifference", dateDifference);
		const range = new NumberRange(start - dateDifference, end + dateDifference);
		console.log(
			`createCandlestickChart(): Setting chart range to ${new Date((start - dateDifference) * 1000).toLocaleString()} - ${new Date((end + dateDifference) * 1000).toLocaleString()}`,
		);
		xAxis.visibleRange = range;
		xAxis.animateVisibleRange(range, 10, easing.inOutQuad, () => {
			console.log("x轴调整完成");
		});
	};

	// 批量设置指标数据
	const setIndicatorData = (
		indicatorKeyStr: string,
		indicatorValues: IndicatorValue[],
	) => {
		console.log(
			`setIndicatorData(): Setting data for ${indicatorKeyStr}, ${indicatorValues.length} values`,
		);

		const indicatorDataSeries = indicatorDataSeriesMap.get(indicatorKeyStr);
		const indicatorChartConfig =
			klineChartConfig.indicatorChartConfig[indicatorKeyStr];

		if (indicatorDataSeries && indicatorChartConfig) {
			// 清除现有数据
			indicatorDataSeries.clear();

			// 准备数据数组
			const xValues: number[] = [];
			const yValues: number[] = [];

			indicatorValues.forEach((indicatorValue) => {
				const value =
					indicatorValue[
						indicatorChartConfig.seriesConfigs[0].indicatorValueKey
					];
				if (value !== undefined && value !== null) {
					xValues.push(indicatorValue.timestamp / 1000);
					yValues.push(value);
				}
			});

			// 批量添加数据
			if (xValues.length > 0) {
				indicatorDataSeries.appendRange(xValues, yValues);
				console.log(
					`批量设置指标数据完成: ${indicatorKeyStr}, ${xValues.length} 个数据点`,
				);
			}
		} else {
			console.warn(`未找到指标 ${indicatorKeyStr} 对应的数据系列或配置`);
		}
	};

	const clearChartData = () => {
		candleDataSeries.clear();
		volumeDataSeries.clear();
		indicatorDataSeriesMap.forEach((indicatorDataSeries) => {
			indicatorDataSeries.clear();
		});
		sciChartSurface.annotations.clear();
	};

	return {
		wasmContext,
		sciChartSurface,
		controls: {
			setKlineData,
			onNewKline,
			onNewIndicator,
			onNewOrder,
			setXRange,
			setIndicatorData,
			clearChartData,
		},
	};
};
