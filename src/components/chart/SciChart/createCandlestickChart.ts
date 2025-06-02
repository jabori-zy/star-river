import {
    EAutoRange,
    easing,
    ECoordinateMode,
    EDataSeriesType,
    EHorizontalAnchorPoint,
    EAnnotationLayer,
    EStrokePaletteMode,
    ESeriesType,
    ENumericFormat,
    EVerticalAnchorPoint,
    CursorModifier,
    CursorTooltipSvgAnnotation,
    DateTimeNumericAxis,
    EllipsePointMarker,
    FastBubbleRenderableSeries,
    FastCandlestickRenderableSeries,
    FastColumnRenderableSeries,
    FastLineRenderableSeries,
    FastMountainRenderableSeries,
    FastOhlcRenderableSeries,
    GradientParams,
    HorizontalLineAnnotation,
    IPointMarkerPaletteProvider,
    IPointMetadata,
    IRenderableSeries,
    MouseWheelZoomModifier,
    NumberRange,
    NumericAxis,
    OhlcDataSeries,
    OhlcSeriesInfo,
    parseColorToUIntArgb,
    Point,
    SeriesInfo,
    SciChartOverview,
    SciChartSurface,
    TextAnnotation,
    TPointMarkerArgb,
    XyzDataSeries,
    XyDataSeries,
    XyMovingAverageFilter,
    ZoomExtentsModifier,
    ZoomPanModifier,
    SciChartVerticalGroup,
    EAxisAlignment,
    CategoryAxis,
    ELabelAlignment,
    YAxisDragModifier,
    XAxisDragModifier,
    EDragMode,
} from "scichart";

import { appTheme } from "./theme";
import { VolumePaletteProvider } from "./volumePaletteProvider";

export type TPriceBar = {
    date: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

// rootElement是HTML div元素

export const createCandlestickChart = async (rootElement: string | HTMLDivElement) => {
    // 使用group，将所有图表组合在一起
    const verticalGroup = new SciChartVerticalGroup();

    // 创建SciChartSurface
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

    // 添加均线
    sciChartSurface.renderableSeries.add(
        new FastLineRenderableSeries(wasmContext, {
            dataSeries: new XyMovingAverageFilter(candleDataSeries, {
                dataSeriesName: "Moving Average (20)",
                length: 20,
            }),
            stroke: appTheme.VividSkyBlue,
        })
    );

    sciChartSurface.renderableSeries.add(
        new FastLineRenderableSeries(wasmContext, {
            dataSeries: new XyMovingAverageFilter(candleDataSeries, {
                dataSeriesName: "Moving Average (50)",
                length: 50,
            }),
            stroke: appTheme.VividPink,
        })
    );

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

    const drawMacdChart = async (rootElement: string | HTMLDivElement) => {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, {
            theme: appTheme.SciChartJsTheme,
        });

        // macd的X轴
        const macdXAxis = new CategoryAxis(wasmContext, {
            drawLabels: false,
            drawMajorTickLines: false,
            drawMinorTickLines: false,

        })
        sciChartSurface.xAxes.add(macdXAxis);

        // macd的Y轴
        const macdYAxis = new NumericAxis(wasmContext, {
            autoRange: EAutoRange.Always,
            growBy: new NumberRange(0.1, 0.1),
            axisAlignment: EAxisAlignment.Right,
            labelPrecision: 2,
            cursorLabelPrecision: 2,
            labelStyle: { alignment: ELabelAlignment.Right },
            
        });
        yAxis.labelProvider.numericFormat = ENumericFormat.Decimal;
        sciChartSurface.yAxes.add(macdYAxis);

        const macdArray: number[] = [];
        const signalArray: number[] = [];
        const divergenceArray: number[] = [];
        


        
        
    }



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
        })
    );

    // 添加一条水平线注释，显示最新价格
    const latestPriceAnnotation = new HorizontalLineAnnotation({
        isHidden: true,
        strokeDashArray: [2, 2],
        strokeThickness: 1,
        axisFontSize: 13,
        axisLabelStroke: appTheme.ForegroundColor,
        showLabel: true,
    });
    sciChartSurface.annotations.add(latestPriceAnnotation);


    // 更新最新价格注释的位置和颜色
    const updateLatestPriceAnnotation = (priceBar: TPriceBar) => {
        latestPriceAnnotation.isHidden = false;
        latestPriceAnnotation.y1 = priceBar.close;
        latestPriceAnnotation.stroke = priceBar.close > priceBar.open ? appTheme.VividGreen : appTheme.MutedRed;
        latestPriceAnnotation.axisLabelFill = latestPriceAnnotation.stroke;
    };


    // 设置蜡烛图数据
    const setData = (symbolName: string, priceBars: TPriceBar[]) => {
        console.log(`createCandlestickChart(): Setting data for ${symbolName}, ${priceBars.length} candles`);

        // 将 TPriceBar 映射为 scichart 期望的结构化数组
        const xValues: number[] = [];
        const openValues: number[] = [];
        const highValues: number[] = [];
        const lowValues: number[] = [];
        const closeValues: number[] = [];
        const volumeValues: number[] = [];
        priceBars.forEach((priceBar: TPriceBar) => {
            xValues.push(priceBar.date);
            openValues.push(priceBar.open);
            highValues.push(priceBar.high);
            lowValues.push(priceBar.low);
            closeValues.push(priceBar.close);
            volumeValues.push(priceBar.volume);
        });


        // 清除数据系列并重新添加数据
        candleDataSeries.clear();
        candleDataSeries.appendRange(xValues, openValues, highValues, lowValues, closeValues);
        volumeDataSeries.clear();
        volumeDataSeries.appendRange(xValues, volumeValues);

        // 设置蜡烛数据系列名称（用于工具提示/图例）
        candleDataSeries.dataSeriesName = symbolName;

        // 更新最新价格注释
        updateLatestPriceAnnotation(priceBars[priceBars.length - 1]);
    };

        // 回测相关的配置
        const MAX_VISIBLE_CANDLES = 400; // 最多显示1000根K线
        let firstCandleTimestamp: number | null = null; // 第一根K线的时间戳
        let candleInterval: number = 60; // K线间隔（秒），默认1分钟，需要根据实际情况调整
    
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

    // 处理新交易
    const onNewTrade = (priceBar: TPriceBar) => {
        const timestamp = priceBar.date / 1000;
        
        // 记录第一根K线的时间戳
        if (firstCandleTimestamp === null) {
            firstCandleTimestamp = timestamp;
        }
        // 判断当前是否有数据
        if (candleDataSeries.count() === 0) {
            // 没有数据，直接添加
            candleDataSeries.append(priceBar.date / 1000, priceBar.open, priceBar.high, priceBar.low, priceBar.close);
            volumeDataSeries.append(priceBar.date / 1000, priceBar.volume);
        } else {
            // 有数据，判断是否是新的蜡烛
            const currentIndex = candleDataSeries.count() - 1;
            
            const getLatestCandleDate = candleDataSeries.getNativeXValues().get(currentIndex);
            if (priceBar.date / 1000 === getLatestCandleDate) {
                // 情况是交易所发送一个已经在图表上的蜡烛，更新它
                candleDataSeries.update(currentIndex, priceBar.open, priceBar.high, priceBar.low, priceBar.close);
                volumeDataSeries.update(currentIndex, priceBar.volume);
            } else {
                // 情况是交易所发送一个新的蜡烛，追加它
                candleDataSeries.append(priceBar.date / 1000, priceBar.open, priceBar.high, priceBar.low, priceBar.close);
                volumeDataSeries.append(priceBar.date / 1000, priceBar.volume);

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
                //     const dateDifference = priceBar.date / 1000 - getLatestCandleDate;
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
        updateLatestPriceAnnotation(priceBar);
    };




    // 设置X轴范围
    const setXRange = (startDate: Date, endDate: Date) => {
        console.log(`createCandlestickChart(): Setting chart range to ${startDate} - ${endDate}`);
        xAxis.visibleRange = new NumberRange(startDate.getTime() / 1000, endDate.getTime() / 1000);
    };

    return {
        sciChartSurface,
        sciChartOverview,
        controls: { setData, onNewTrade, setXRange },
    };








    

}



// 重写标准工具提示
const getTooltipLegendTemplate = (seriesInfos: SeriesInfo[], svgAnnotation: CursorTooltipSvgAnnotation) => {
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





// 重写渲染系列以在scichart概览中显示
const getOverviewSeries = (defaultSeries: IRenderableSeries) => {
    if (defaultSeries.type === ESeriesType.CandlestickSeries) {
        // Swap the default candlestick series on the overview chart for a mountain series. Same data
        // 将scichart概览图上的默认蜡烛图系列替换为山峰系列。相同数据
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