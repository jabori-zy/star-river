import {
	type CursorTooltipSvgAnnotation,
	type DateTimeNumericAxis,
	EDataSeriesType,
	ESeriesType,
	easing,
	FastMountainRenderableSeries,
	GradientParams,
	type HorizontalLineAnnotation,
	type IRenderableSeries,
	NumberRange,
	type NumericAxis,
	type OhlcDataSeries,
	type OhlcSeriesInfo,
	Point,
	type RolloverLegendSvgAnnotation,
	SciChartOverview,
	type SciChartSurface,
	type SeriesInfo,
	type XyDataSeries,
} from "scichart";
import type { Kline } from "@/types/kline";
import { appTheme } from "./theme";

// 重写渲染系列以在scichart概览中显示
const getOverviewSeries = (defaultSeries: IRenderableSeries) => {
	if (defaultSeries.type === ESeriesType.CandlestickSeries) {
		// Swap the default candlestick series on the overview chart for a mountain series. Same data
		// 将scichart概览图上的默认蜡烛图系列替换为山峰系列。相同数据
		return new FastMountainRenderableSeries(
			defaultSeries.parentSurface.webAssemblyContext2D,
			{
				dataSeries: defaultSeries.dataSeries,
				fillLinearGradient: new GradientParams(
					new Point(0, 0),
					new Point(0, 1),
					[
						{ color: appTheme.VividSkyBlue + "77", offset: 0 },
						{ color: "Transparent", offset: 1 },
					],
				),
				stroke: appTheme.VividSkyBlue,
			},
		);
	}
	// 隐藏所有其他系列
	return undefined;
};

const drawOverview =
	(mainSurface: SciChartSurface) =>
	async (rootElement: string | HTMLDivElement) => {
		const overview = await SciChartOverview.create(mainSurface, rootElement, {
			// prevent default size settings
			disableAspect: true,
			theme: appTheme.SciChartJsTheme,
			transformRenderableSeries: getOverviewSeries,
		});

		return { sciChartSurface: overview.overviewSciChartSurface };
	};

export { drawOverview, getOverviewSeries };

// 重写标准工具提示
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getCursorTooltipLegendTemplate = (
	seriesInfos: SeriesInfo[],
	_svgAnnotation: CursorTooltipSvgAnnotation,
) => {
	let outputSvgString = "";

	// 遍历seriesInfos，它由SciChart提供。这个包含关于系列的信息
	seriesInfos.forEach((seriesInfo, index) => {
		const y = 20 + index * 20;
		const textColor = seriesInfo.stroke;
		let legendText = seriesInfo.formattedYValue;
		let separator = ":";
		if (seriesInfo.dataSeriesType === EDataSeriesType.Ohlc) {
			const o = seriesInfo as OhlcSeriesInfo;
			legendText = `Open=${o.formattedOpenValue} High=${o.formattedHighValue} Low=${o.formattedLowValue} Close=${o.formattedCloseValue}`;
		}
		if (seriesInfo.dataSeriesType === EDataSeriesType.Xyz) {
			legendText = "";
			separator = "";
		}
		outputSvgString += `<text x="8" y="${y}" font-size="13" font-family="Verdana" fill="${textColor}">
            ${seriesInfo.seriesName}${separator} ${legendText}
        </text>`;
	});

	return `<svg width="100%" height="100%">
                ${outputSvgString}
            </svg>`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRolloverLegendTemplate = (
	seriesInfos: SeriesInfo[],
	_svgAnnotation: RolloverLegendSvgAnnotation,
) => {

	const groupedSeriesInfos = seriesInfos.reduce((acc, seriesInfo) => {
		// seriesName中是否包含 : ，如果包含，则取 : 前的字符串作为key
		const key = seriesInfo.seriesName.split(":")[0];

		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(seriesInfo);
		return acc;
	}, {} as Record<string, SeriesInfo[]>);
	let outputSvgString = "";

	// Foreach series there will be a seriesInfo supplied by SciChart. This contains info about the series under the house
	Object.keys(groupedSeriesInfos).forEach((key, index) => {
		const seriesInfos = groupedSeriesInfos[key];
		// 如果seriesInfos只有一个，说明是单系列，无需组合
		if (seriesInfos.length === 1) {
			const y = 20 + index * 20;
			const textColor = seriesInfos[0].stroke;
			let legendText = `${seriesInfos[0].formattedYValue}`;
			if (seriesInfos[0].dataSeriesType === EDataSeriesType.Ohlc) {
				const o = seriesInfos[0] as OhlcSeriesInfo;
				legendText = `Open=${o.formattedOpenValue} High=${o.formattedHighValue} Low=${o.formattedLowValue} Close=${o.formattedCloseValue}`;
			}
			outputSvgString += `<text x="10" y="${y}" font-size="13" font-family="Verdana" fill="${textColor}">
				${seriesInfos[0].seriesName}=${legendText}
			</text>`;
			return;
		} else {
			// 如果seriesInfos有多个，说明是组合指标,例如bbands
			console.log("key=", key, "seriesInfos", seriesInfos);
			const y = 20 + index * 20;
			// 组合指标的输出格式为：指标名称 : 指标值1=指标值1值 指标值2=指标值2值 指标值3=指标值3值
			let indicatorOutput = `${key} : `;
			seriesInfos.forEach((seriesInfo) => {
				const indicatorName = seriesInfo.seriesName.split(":")[1];
				let indicatorValue = `${seriesInfo.formattedYValue}`;
				indicatorOutput += `${indicatorName}=${indicatorValue} `;
				if (seriesInfo.dataSeriesType === EDataSeriesType.Ohlc) {
					const o = seriesInfo as OhlcSeriesInfo;
					indicatorValue = `Open=${o.formattedOpenValue} High=${o.formattedHighValue} Low=${o.formattedLowValue} Close=${o.formattedCloseValue}`;
				}
				
			});
			outputSvgString += `<text x="10" y="${y}" font-size="13" font-family="Verdana"">
				${indicatorOutput}
			</text>`;


		}

		
	});

	return `<svg width="100%" height="100%">
                ${outputSvgString}
            </svg>`;
};

// 更新最新价格注释的位置和颜色
export const updateLatestPriceAnnotation = (
	latestPriceAnnotation: HorizontalLineAnnotation,
	kline: Kline,
) => {
	latestPriceAnnotation.isHidden = false;
	latestPriceAnnotation.y1 = kline.close;
	latestPriceAnnotation.stroke =
		kline.close > kline.open ? appTheme.MutedRed : appTheme.MutedGreen;
	latestPriceAnnotation.axisLabelFill = latestPriceAnnotation.stroke;
};

// K线更新上下文接口
export interface KlineUpdateContext {
	candleDataSeries: OhlcDataSeries;
	volumeDataSeries: XyDataSeries;
	xAxis: DateTimeNumericAxis;
	yAxis: NumericAxis;
	latestPriceAnnotation: HorizontalLineAnnotation;
	candleInterval: number;
	maxVisibleCandles: number;
	firstCandleTimestamp: number | null;
	firstKlineHighPrice: number | null;
	firstKlineLowPrice: number | null;
}

// 处理第一根K线数据
export const handleFirstKlineData = (
	kline: Kline,
	context: KlineUpdateContext,
): {
	firstCandleTimestamp: number;
	firstKlineHighPrice: number;
	firstKlineLowPrice: number;
} => {
	const { candleDataSeries, volumeDataSeries, xAxis, yAxis, candleInterval } =
		context;
	const timestamp = kline.timestamp / 1000;

	// 添加数据
	candleDataSeries.append(
		timestamp,
		kline.open,
		kline.high,
		kline.low,
		kline.close,
	);
	volumeDataSeries.append(timestamp, kline.volume);

	// 设置X轴初始范围
	const displayRange = 20 * candleInterval;
	const startTime = timestamp - displayRange / 2;
	const endTime = timestamp + displayRange / 2;
	const initialRange = new NumberRange(startTime, endTime);
	xAxis.animateVisibleRange(initialRange, 10, easing.inOutQuad);

	// 设置Y轴初始范围
	const priceRange = kline.high - kline.low;
	const buffer = priceRange > 0 ? priceRange * 0.5 : kline.high * 0.05;
	const yMin = kline.low - buffer;
	const yMax = kline.high + buffer;
	const yRange = new NumberRange(yMin, yMax);
	yAxis.animateVisibleRange(yRange, 10, easing.inOutQuad);

	console.log(
		`第一根K线添加完成，设置初始x轴范围: ${new Date(startTime * 1000).toLocaleString()} - ${new Date(endTime * 1000).toLocaleString()}`,
	);
	console.log(
		`第一根K线添加完成，设置初始y轴范围: ${yMin.toFixed(2)} - ${yMax.toFixed(2)}`,
	);

	return {
		firstCandleTimestamp: timestamp,
		firstKlineHighPrice: kline.high,
		firstKlineLowPrice: kline.low,
	};
};

// 调整Y轴范围以适应K线价格
export const adjustYAxisRange = (
	kline: Kline,
	yAxis: NumericAxis,
	isUpdate: boolean = false,
): void => {
	const currentYRange = yAxis.visibleRange;
	const klineHigh = kline.high;
	const klineLow = kline.low;

	console.log(
		`${isUpdate ? "更新" : "添加"}K线-当前y轴范围: ${currentYRange.min.toFixed(2)} - ${currentYRange.max.toFixed(2)}, K线价格: ${klineLow.toFixed(2)} - ${klineHigh.toFixed(2)}`,
	);

	// 如果K线价格超出了y轴显示范围，需要调整y轴范围
	if (klineHigh > currentYRange.max || klineLow < currentYRange.min) {
		const buffer = (klineHigh - klineLow) * 0.1;
		const newMin = Math.min(currentYRange.min, klineLow - buffer);
		const newMax = Math.max(currentYRange.max, klineHigh + buffer);
		const newYRange = new NumberRange(newMin, newMax);
		yAxis.animateVisibleRange(newYRange, 200, easing.inOutQuad);

		console.log(
			`${isUpdate ? "更新" : "添加"}K线-调整y轴范围: ${newMin.toFixed(2)} - ${newMax.toFixed(2)}, K线价格: ${klineLow.toFixed(2)} - ${klineHigh.toFixed(2)}`,
		);
	}
};

// 调整X轴范围（处理少量K线的情况）
export const adjustXAxisRangeForFewCandles = (
	candleCount: number,
	timestamp: number,
	firstCandleTimestamp: number,
	candleInterval: number,
	xAxis: DateTimeNumericAxis,
): void => {
	const displayRange = Math.max(20, candleCount + 10) * candleInterval;
	const lastTimestamp = timestamp;

	// 以实际K线范围为基础，前后各留一些空间
	const actualRange = lastTimestamp - firstCandleTimestamp;
	const padding = Math.max(displayRange - actualRange, 5 * candleInterval) / 2;

	const startTime = firstCandleTimestamp - padding;
	const endTime = lastTimestamp + padding;
	const newRange = new NumberRange(startTime, endTime);
	xAxis.animateVisibleRange(newRange, 10, easing.inOutQuad);

	console.log(
		`K线数量: ${candleCount}, 重新计算范围: ${new Date(startTime * 1000).toLocaleString()} - ${new Date(endTime * 1000).toLocaleString()}`,
	);
};

// 调整X轴范围（处理大量K线的情况）
export const adjustXAxisRangeForManyCandles = (
	candleCount: number,
	timestamp: number,
	latestCandleTimestamp: number,
	candleInterval: number,
	maxVisibleCandles: number,
	xAxis: DateTimeNumericAxis,
): void => {
	// 如果最新的蜡烛在视窗中，就将x轴移动一个蜡烛的距离
	if (xAxis.visibleRange.max > latestCandleTimestamp) {
		const dateDifference = timestamp - latestCandleTimestamp;
		const shiftedRange = new NumberRange(
			xAxis.visibleRange.min + dateDifference,
			xAxis.visibleRange.max + dateDifference,
		);
		xAxis.animateVisibleRange(shiftedRange, 10, easing.inOutQuad);
	}

	// 如果K线数量超过最大显示数量，开始滚动显示
	if (candleCount > maxVisibleCandles) {
		const startTime = timestamp - (maxVisibleCandles - 1) * candleInterval;
		const endTime = timestamp + 10 * candleInterval;
		const scrollRange = new NumberRange(startTime, endTime);
		xAxis.visibleRange = scrollRange;
		console.log(`K线数量超过${maxVisibleCandles}，开始滚动显示`);
	}
};

// 处理更新现有K线数据
export const handleUpdateKlineData = (
	kline: Kline,
	currentIndex: number,
	context: KlineUpdateContext,
): void => {
	const { candleDataSeries, volumeDataSeries, yAxis } = context;
	const timestamp = kline.timestamp / 1000;
	const latestCandleTimestamp = candleDataSeries
		.getNativeXValues()
		.get(currentIndex);

	console.log(
		`更新K线: 时间戳=${timestamp}, 最后K线时间戳=${latestCandleTimestamp}, K线数量=${candleDataSeries.count()}`,
	);

	// 更新数据
	candleDataSeries.update(
		currentIndex,
		kline.open,
		kline.high,
		kline.low,
		kline.close,
	);
	volumeDataSeries.update(currentIndex, kline.volume);

	// 调整Y轴范围
	adjustYAxisRange(kline, yAxis, true);
};

// 处理添加新K线数据
export const handleNewKlineData = (
	kline: Kline,
	latestCandleTimestamp: number,
	context: KlineUpdateContext,
): void => {
	const {
		candleDataSeries,
		volumeDataSeries,
		yAxis,
		xAxis,
		candleInterval,
		maxVisibleCandles,
		firstCandleTimestamp,
	} = context;
	const timestamp = kline.timestamp / 1000;

	// 添加新数据
	candleDataSeries.append(
		timestamp,
		kline.open,
		kline.high,
		kline.low,
		kline.close,
	);
	volumeDataSeries.append(timestamp, kline.volume);

	const candleCount = candleDataSeries.count();

	// 调整Y轴范围
	adjustYAxisRange(kline, yAxis, false);

	// 根据K线数量调整X轴范围
	if (candleCount <= 10) {
		adjustXAxisRangeForFewCandles(
			candleCount,
			timestamp,
			firstCandleTimestamp!,
			candleInterval,
			xAxis,
		);
	} else {
		adjustXAxisRangeForManyCandles(
			candleCount,
			timestamp,
			latestCandleTimestamp,
			candleInterval,
			maxVisibleCandles,
			xAxis,
		);
	}
};

// 主要的K线数据处理函数
export const processKlineData = (
	kline: Kline,
	context: KlineUpdateContext,
): {
	firstCandleTimestamp: number | null;
	firstKlineHighPrice: number | null;
	firstKlineLowPrice: number | null;
} => {
	const { candleDataSeries, latestPriceAnnotation } = context;
	const timestamp = kline.timestamp / 1000;

	console.log(`=== onNewKlineData调用 ===`);
	console.log(`当前candleDataSeries.count(): ${candleDataSeries.count()}`);
	console.log(
		`K线时间戳: ${timestamp}, 格式化时间: ${new Date(timestamp * 1000).toLocaleString()}`,
	);
	console.log(
		`K线数据: 开盘=${kline.open}, 高=${kline.high}, 低=${kline.low}, 收盘=${kline.close}`,
	);

	let updatedContext = {
		firstCandleTimestamp: context.firstCandleTimestamp,
		firstKlineHighPrice: context.firstKlineHighPrice,
		firstKlineLowPrice: context.firstKlineLowPrice,
	};

	// 判断当前是否有数据
	if (candleDataSeries.count() === 0) {
		// 处理第一根K线
		const firstKlineData = handleFirstKlineData(kline, context);
		updatedContext = {
			firstCandleTimestamp: firstKlineData.firstCandleTimestamp,
			firstKlineHighPrice: firstKlineData.firstKlineHighPrice,
			firstKlineLowPrice: firstKlineData.firstKlineLowPrice,
		};
	} else {
		// 有数据，判断是否是新的蜡烛
		const currentIndex = candleDataSeries.count() - 1;
		const latestCandleTimestamp = candleDataSeries
			.getNativeXValues()
			.get(currentIndex);

		console.log(
			"最后一条蜡烛的时间戳",
			new Date(latestCandleTimestamp * 1000).toLocaleString(),
		);

		if (timestamp === latestCandleTimestamp) {
			// 更新现有K线
			handleUpdateKlineData(kline, currentIndex, context);
		} else {
			// 添加新K线
			handleNewKlineData(kline, latestCandleTimestamp, context);
		}
	}

	// 更新最新价格线注释
	updateLatestPriceAnnotation(latestPriceAnnotation, kline);

	return updatedContext;
};
