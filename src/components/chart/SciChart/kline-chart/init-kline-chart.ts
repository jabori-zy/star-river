import { 
    SciChartSurface,
    DateTimeNumericAxis,
    NumericAxis,
    NumberRange,
    ENumericFormat,
    OhlcDataSeries,
    FastCandlestickRenderableSeries,
    XyDataSeries,
    FastColumnRenderableSeries,
    XAxisDragModifier,
    YAxisDragModifier,
    EDragMode,
    ZoomExtentsModifier,
    ZoomPanModifier,
    MouseWheelZoomModifier,
    CursorModifier,
    EAutoRange,
    SeriesInfo,
    CursorTooltipSvgAnnotation,
    EDataSeriesType,
    OhlcSeriesInfo,
    easing,
    EAxisAlignment,
    IRenderableSeries,
    ESeriesType,
    FastMountainRenderableSeries,
    GradientParams,
    Point,
    RolloverModifier,
    FastLineRenderableSeries,
} from "scichart";
import { appTheme } from "../theme";
import { Kline } from "@/types/kline";
import { VolumePaletteProvider } from "./volumePaletteProvider";
import { getIndicatorChartConfig } from "@/types/indicator/indicator-chart-config";
import { IndicatorValue } from "@/types/indicator";


// export const drawKlineChart = () => async (rootElement: string | HTMLDivElement) => {
//     const { sciChartSurface, controls } = await initKlineChart(rootElement);

//     const endDate = new Date(Date.now());
//     const startDate = new Date();
//     startDate.setMinutes(endDate.getMinutes() - 300);

//     return { 
//         sciChartSurface, 
//         controls 
//     };
// }; 


// 重写标准工具提示
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getTooltipLegendTemplate = (seriesInfos: SeriesInfo[], _svgAnnotation: CursorTooltipSvgAnnotation) => {
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





export const initKlineChart = async (rootElement: string | HTMLDivElement, mainChartIndicatorKeyStrs: string[]) => {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, {
        theme: appTheme.SciChartJsTheme,
    });

    // 添加时间类型的X轴
    const xAxis = new DateTimeNumericAxis(wasmContext, {
        drawMajorBands: false,
        drawMajorGridLines: false,
        drawMinorGridLines: false
    });
    sciChartSurface.xAxes.add(xAxis);

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
    const candleDataSeries = new OhlcDataSeries(wasmContext);
    const candlestickSeries = new FastCandlestickRenderableSeries(wasmContext, {
        dataSeries: candleDataSeries,
        stroke: appTheme.ForegroundColor, // used by cursorModifier below
        strokeThickness: 1,
        brushUp: appTheme.VividGreen,
        brushDown: appTheme.Black,
        strokeUp: appTheme.Black,
        strokeDown: appTheme.Black,
    });

    sciChartSurface.renderableSeries.add(candlestickSeries);


    // 添加成交量图
    const volumeDataSeries = new XyDataSeries(wasmContext, { dataSeriesName: "Volume" });
    sciChartSurface.renderableSeries.add(
        new FastColumnRenderableSeries(wasmContext, {
            dataSeries: volumeDataSeries,
            strokeThickness: 0,
            // This is how we get volume to scale - on a hidden YAxis
            yAxisId: Y_AXIS_VOLUME_ID,
            // This is how we colour volume bars red or green
            paletteProvider: new VolumePaletteProvider(
                candleDataSeries,
                appTheme.VividGreen + "77",
                appTheme.MutedRed + "77"
            ),
        })
    );

    // 建立指标键与数据系列的直接映射关系
    const indicatorDataSeriesMap = new Map<string, XyDataSeries>();
    const mainChartIndicatorRenderableSeries: IRenderableSeries[] = [];
    
    // 添加主图的指标
    // 如果主图指标不为空，则添加主图指标
    if (mainChartIndicatorKeyStrs.length > 0) {
        mainChartIndicatorKeyStrs.forEach((indicatorKeyStr, index) => {
            const indicatorChartConfig = getIndicatorChartConfig(indicatorKeyStr);
            console.log("indicatorChartConfig", indicatorKeyStr, indicatorChartConfig);
            if (indicatorChartConfig) {
                const indicatorDataSeries = new XyDataSeries(wasmContext, { dataSeriesName: indicatorChartConfig.name + index });
                console.log("indicatorDataSeries", indicatorDataSeries);
                
                // 建立直接映射关系
                indicatorDataSeriesMap.set(indicatorKeyStr, indicatorDataSeries);
                
                mainChartIndicatorRenderableSeries.push(
                    new FastLineRenderableSeries(wasmContext, { 
                        dataSeries: indicatorDataSeries,
                        stroke: indicatorChartConfig.seriesConfigs[0].color || appTheme.ForegroundColor,
                        strokeThickness: indicatorChartConfig.seriesConfigs[0].strokeThickness || 2,
                    })
                );
                sciChartSurface.renderableSeries.add(mainChartIndicatorRenderableSeries[mainChartIndicatorRenderableSeries.length - 1]);
            }
        });
    }


    const onNewIndicatorData = (newIndicators: Record<string, IndicatorValue>) => {
        console.log("onNewIndicatorData", newIndicators);
        Object.entries(newIndicators).forEach(([indicatorKeyStr, indicatorData]) => {
            const indicatorChartConfig = getIndicatorChartConfig(indicatorKeyStr);
            if (indicatorChartConfig) {
                // 通过key直接找到对应的数据系列
                const indicatorDataSeries = indicatorDataSeriesMap.get(indicatorKeyStr);
                if (indicatorDataSeries) {
                    const value = indicatorData[indicatorChartConfig.seriesConfigs[0].indicatorValueKey];
                    if (value !== undefined && value !== null) {
                        const timestamp = indicatorData.timestamp;
                        
                        // 参考K线的更新方式：判断是新数据还是更新现有数据
                        if (indicatorDataSeries.count() === 0) {
                            // 没有数据，直接添加
                            indicatorDataSeries.append(timestamp, value);
                        } else {
                            // 有数据，判断是否是相同时间戳的数据
                            const currentIndex = indicatorDataSeries.count() - 1;
                            const latestTimestamp = indicatorDataSeries.getNativeXValues().get(currentIndex);
                            
                            if (timestamp === latestTimestamp) {
                                // 相同时间戳，更新现有数据
                                indicatorDataSeries.update(currentIndex, value);
                                console.log(`更新指标数据: ${indicatorKeyStr}, timestamp: ${timestamp}, value: ${value}`);
                            } else {
                                // 不同时间戳，追加新数据
                                indicatorDataSeries.append(timestamp, value);
                                console.log(`追加指标数据: ${indicatorKeyStr}, timestamp: ${timestamp}, value: ${value}`);
                            }
                        }
                    }
                } else {
                    console.warn(`未找到指标 ${indicatorKeyStr} 对应的数据系列`);
                }
            }
        });
    }


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
            crosshairStroke: appTheme.Gray,
            axisLabelFill: appTheme.Black,
            //设置宽度
            crosshairStrokeThickness: 0.5,
            tooltipLegendTemplate: getTooltipLegendTemplate,
        }),
        new RolloverModifier({
            modifierGroup: "cursorGroup",
            showTooltip: false,
            // tooltipLegendTemplate: getTooltipLegendTemplate,
        })
    );

    

    const setData = (symbolName: string, klines: Kline[]) => {
        console.log(`createCandlestickChart(): Setting data for ${symbolName}, ${klines.length} candles`);

        // 将 Kline 映射为 scichart 期望的结构化数组
        const xValues: number[] = [];
        const openValues: number[] = [];
        const highValues: number[] = [];
        const lowValues: number[] = [];
        const closeValues: number[] = [];
        const volumeValues: number[] = [];
        klines.forEach((kline: Kline) => {
            xValues.push(kline.timestamp);
            openValues.push(kline.open);
            highValues.push(kline.high);
            lowValues.push(kline.low);
            closeValues.push(kline.close);
            volumeValues.push(kline.volume);
        });


        // 清除数据系列并重新添加数据
        candleDataSeries.clear();
        candleDataSeries.appendRange(xValues, openValues, highValues, lowValues, closeValues);
        volumeDataSeries.clear();
        volumeDataSeries.appendRange(xValues, volumeValues);

        // 设置蜡烛数据系列名称（用于工具提示/图例）
        candleDataSeries.dataSeriesName = symbolName;

        // 更新最新价格注释
        // updateLatestPriceAnnotation(klines[klines.length - 1]);
    };


    // 回测相关的配置
    const MAX_VISIBLE_CANDLES = 400; // 最多显示1000根K线
    let firstCandleTimestamp: number | null = null; // 第一根K线的时间戳
    const candleInterval: number = 60; // K线间隔（秒），默认1分钟，需要根据实际情况调整

    // 计算合适的X轴范围
    const calculateXAxisRange = (candleCount: number, latestTimestamp: number) => {
        if (candleCount <= MAX_VISIBLE_CANDLES) {
            // 如果K线数量少于最大显示数量，从第一根K线开始显示
            const startTime = firstCandleTimestamp || latestTimestamp;
            const endTime = startTime + (MAX_VISIBLE_CANDLES * candleInterval);
            return new NumberRange(startTime, endTime);
        } else {
            // 如果K线数量超过最大显示数量，显示最新的1000根
            const startTime = latestTimestamp - ((MAX_VISIBLE_CANDLES - 1) * candleInterval);
            const endTime = latestTimestamp + (50 * candleInterval); // 右侧留一些空间
            return new NumberRange(startTime, endTime);
        }
    };

    const onNewKlineData = (kline: Kline) => {
        console.log(`onNewTrade(): ${kline.timestamp}`);
        const timestamp = kline.timestamp;
        
        // 记录第一根K线的时间戳
        if (firstCandleTimestamp === null) {
            firstCandleTimestamp = timestamp;
        }
        // 判断当前是否有数据
        if (candleDataSeries.count() === 0) {
            // 没有数据，直接添加
            candleDataSeries.append(kline.timestamp, kline.open, kline.high, kline.low, kline.close);
            volumeDataSeries.append(kline.timestamp, kline.volume);
        } else {
            // 有数据，判断是否是新的蜡烛
            const currentIndex = candleDataSeries.count() - 1;
            
            const getLatestCandleDate = candleDataSeries.getNativeXValues().get(currentIndex);
            if (kline.timestamp === getLatestCandleDate) {
                // 情况是交易所发送一个已经在图表上的蜡烛，更新它
                candleDataSeries.update(currentIndex, kline.open, kline.high, kline.low, kline.close);
                volumeDataSeries.update(currentIndex, kline.volume);
            } else {
                // 情况是交易所发送一个新的蜡烛，追加它
                candleDataSeries.append(kline.timestamp, kline.open, kline.high, kline.low, kline.close);
                volumeDataSeries.append(kline.timestamp, kline.volume);

                const candleCount = candleDataSeries.count();
                // 视图控制逻辑
                if (candleCount <= MAX_VISIBLE_CANDLES) {
                    // K线数量未超过最大显示数量
                    const currentRange = xAxis.visibleRange;
                    
                    // 检查新K线是否接近右边界，如果是则扩展显示范围
                    if (timestamp > currentRange.max - (10 * candleInterval)) {
                        const newRange = new NumberRange(
                            currentRange.min,
                            currentRange.max + (50 * candleInterval)
                        );
                        xAxis.animateVisibleRange(newRange, 200, easing.inOutQuad);
                    }
                } else {
                    // K线数量超过最大显示数量，开始滚动显示最新的1000根
                    const newRange = calculateXAxisRange(candleCount, timestamp);
                    xAxis.animateVisibleRange(newRange, 200, easing.inOutQuad);
                }
                // #region ExampleA
                // 最新蜡烛是否在视图中？
                // if (xAxis.visibleRange.max > getLatestCandleDate) {
                //     // 如果是，则将x轴移动一个蜡烛
                //     const dateDifference = kline.date / 1000 - getLatestCandleDate;
                //     const shiftedRange = new NumberRange(
                //         xAxis.visibleRange.min + dateDifference,
                //         xAxis.visibleRange.max + dateDifference
                //     );
                //     xAxis.animateVisibleRange(shiftedRange, 250, easing.inOutQuad);
                // }
                // #endregion
            }
        }
        // 更新最新价格线注释
        // updateLatestPriceAnnotation(kline);
    };

    // 设置X轴范围
    const setXRange = (startDate: Date, endDate: Date) => {
        console.log(`createCandlestickChart(): Setting chart range to ${startDate} - ${endDate}`);
        xAxis.visibleRange = new NumberRange(startDate.getTime() / 1000, endDate.getTime() / 1000);
    };

    // 批量设置指标数据
    const setIndicatorData = (indicatorKeyStr: string, indicatorValues: IndicatorValue[]) => {
        console.log(`setIndicatorData(): Setting data for ${indicatorKeyStr}, ${indicatorValues.length} values`);
        
        const indicatorDataSeries = indicatorDataSeriesMap.get(indicatorKeyStr);
        const indicatorChartConfig = getIndicatorChartConfig(indicatorKeyStr);
        
        if (indicatorDataSeries && indicatorChartConfig) {
            // 清除现有数据
            indicatorDataSeries.clear();
            
            // 准备数据数组
            const xValues: number[] = [];
            const yValues: number[] = [];
            
            indicatorValues.forEach((indicatorValue) => {
                const value = indicatorValue[indicatorChartConfig.seriesConfigs[0].indicatorValueKey];
                if (value !== undefined && value !== null) {
                    xValues.push(indicatorValue.timestamp);
                    yValues.push(value);
                }
            });
            
            // 批量添加数据
            if (xValues.length > 0) {
                indicatorDataSeries.appendRange(xValues, yValues);
                console.log(`批量设置指标数据完成: ${indicatorKeyStr}, ${xValues.length} 个数据点`);
            }
        } else {
            console.warn(`未找到指标 ${indicatorKeyStr} 对应的数据系列或配置`);
        }
    };


    return {
        wasmContext, 
        sciChartSurface,
        controls: { setData, onNewKlineData, setXRange, onNewIndicatorData, setIndicatorData },
    };
}




// 重写渲染系列以在scichart概览中显示
const getOverviewSeries = (defaultSeries: IRenderableSeries) => {
    if (defaultSeries.type === ESeriesType.CandlestickSeries) {
        // Swap the default candlestick series on the overview chart for a mountain series. Same data
        // 将scichart概览图上的默认蜡烛图系列替换为山峰系列。相同数据
        console.log(`getOverviewSeries(): ${defaultSeries.dataSeries.count()}`);
        return new FastMountainRenderableSeries(defaultSeries.parentSurface.webAssemblyContext2D, {
            dataSeries: defaultSeries.dataSeries,
            fillLinearGradient: new GradientParams(new Point(0, 0), new Point(0, 1), [
                { color: appTheme.VividSkyBlue + "77", offset: 0 },
                { color: "Transparent", offset: 1 },
            ]),
            stroke: appTheme.VividSkyBlue,
        });
    }
    // 隐藏所有其他系列
    return undefined;
};

export const sciChartOverview = {
    theme: appTheme.SciChartJsTheme,
    transformRenderableSeries: getOverviewSeries,
};