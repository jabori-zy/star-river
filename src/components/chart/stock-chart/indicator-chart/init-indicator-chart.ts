import { 
    SciChartSurface,
    NumericAxis,
    NumberRange,
    ENumericFormat,
    XyDataSeries,
    FastColumnRenderableSeries,
    ZoomExtentsModifier,
    ZoomPanModifier,
    MouseWheelZoomModifier,
    EAxisAlignment,
    IRenderableSeries,
    FastMountainRenderableSeries,
    RolloverModifier,
    FastLineRenderableSeries,
    CursorModifier,
    DateTimeNumericAxis,
    XAxisDragModifier,
    YAxisDragModifier,
    EDragMode,
    EResamplingMode,
    easing,
    EAutoRange
} from "scichart";
import { appTheme } from "../theme";
import { 
    SeriesType, 
    SeriesConfig,
    IndicatorChartConfig
} from "@/types/indicator/indicator-chart-config";
import { parseCacheKey } from "@/utils/parseCacheKey";
import { IndicatorCacheKey } from "@/types/cache";
import { INDICATOR_CHART_CONFIG_MAP } from "@/types/indicator/indicator-chart-config";
import { IndicatorValue } from "@/types/indicator";
import { getRolloverLegendTemplate } from "../utils";
import { SciChartDefaults } from "scichart";

SciChartDefaults.debugDisableResampling = false;
SciChartDefaults.performanceWarnings = false;

// 指标图表更新上下文接口
interface IndicatorUpdateContext {
    dataSeries: XyDataSeries[];
    xAxis: DateTimeNumericAxis;
    yAxis: NumericAxis;
    indicatorChartConfig: IndicatorChartConfig | null;
    firstDataTimestamp: number | null;
    maxVisibleDataPoints: number;
}

// 处理第一个指标数据点
const handleFirstIndicatorData = (
    data: IndicatorValue,
    context: IndicatorUpdateContext
): { firstDataTimestamp: number } => {
    const { dataSeries, xAxis, yAxis, indicatorChartConfig } = context;
    const timestamp = data.timestamp / 1000;
    
    // 添加数据到各个系列
    if (indicatorChartConfig && indicatorChartConfig.seriesConfigs.length > 0) {
        const seriesCount = indicatorChartConfig.seriesConfigs.length;
        
        for (let i = 0; i < seriesCount && i < dataSeries.length; i++) {
            const value = data[indicatorChartConfig.seriesConfigs[i].indicatorValueKey];
            if (value !== undefined && value !== null) {
                dataSeries[i].append(timestamp, value);
            }
        }
    }
    
    // 设置X轴初始范围 - 显示较少的时间间隔
    const displayRange = 20 * 60; // 20分钟的显示范围（假设是分钟级数据）
    const startTime = timestamp - displayRange / 2;
    const endTime = timestamp + displayRange / 2;
    const initialRange = new NumberRange(startTime, endTime);
    xAxis.animateVisibleRange(initialRange, 10, easing.inOutQuad);
    
    // 设置Y轴初始范围
    const values = indicatorChartConfig ? indicatorChartConfig.seriesConfigs.map((config: SeriesConfig) => (data as Record<string, number>)[config.indicatorValueKey])
        .filter((v: number | undefined) => v !== undefined && v !== null) : [];
    
    if (values.length > 0) {
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const range = maxValue - minValue;
        const buffer = range > 0 ? range * 0.1 : maxValue * 0.05;
        
        const yMin = minValue - buffer;
        const yMax = maxValue + buffer;
        const yRange = new NumberRange(yMin, yMax);
        yAxis.animateVisibleRange(yRange, 10, easing.inOutQuad);
    }
    
    console.log(`第一个指标数据点添加完成，设置初始范围: ${new Date(startTime * 1000).toLocaleString()} - ${new Date(endTime * 1000).toLocaleString()}`);
    
    return { firstDataTimestamp: timestamp };
};

// 调整指标图表Y轴范围
const adjustIndicatorYAxisRange = (
    data: IndicatorValue,
    yAxis: NumericAxis,
    indicatorChartConfig: IndicatorChartConfig
): void => {
    const currentYRange = yAxis.visibleRange;
    
    // 获取当前数据点的所有值
    const values = indicatorChartConfig.seriesConfigs.map((config: SeriesConfig) => (data as Record<string, number>)[config.indicatorValueKey])
        .filter((v: number | undefined) => v !== undefined && v !== null);
    
    if (values.length > 0) {
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        // 如果新数据超出当前Y轴范围，调整范围
        if (maxValue > currentYRange.max || minValue < currentYRange.min) {
            const range = maxValue - minValue;
            // buffer是range的10%
            const buffer = range > 0 ? range * 0.1 : Math.abs(maxValue) * 0.1;
            
            const newMin = Math.min(currentYRange.min, minValue - buffer);
            const newMax = Math.max(currentYRange.max, maxValue + buffer);
            const newYRange = new NumberRange(newMin, newMax);
            yAxis.animateVisibleRange(newYRange, 200, easing.inOutQuad);
            
            console.log(`调整指标Y轴范围: ${newMin.toFixed(2)} - ${newMax.toFixed(2)}`);
        }
    }
};

// 调整指标图表X轴范围（少量数据）
const adjustIndicatorXAxisRangeForFewData = (
    dataCount: number,
    timestamp: number,
    firstDataTimestamp: number,
    xAxis: DateTimeNumericAxis
): void => {
    const dataInterval = 60; // 假设数据间隔为1分钟
    const displayRange = Math.max(20, dataCount + 10) * dataInterval;
    
    const actualRange = timestamp - firstDataTimestamp;
    const padding = Math.max(displayRange - actualRange, 5 * dataInterval) / 2;
    
    const startTime = firstDataTimestamp - padding;
    const endTime = timestamp + padding;
    const newRange = new NumberRange(startTime, endTime);
    xAxis.animateVisibleRange(newRange, 10, easing.inOutQuad);
    
    console.log(`指标数据点数量: ${dataCount}, 重新计算X轴范围: ${new Date(startTime * 1000).toLocaleString()} - ${new Date(endTime * 1000).toLocaleString()}`);
};

// 调整指标图表X轴范围（大量数据）
const adjustIndicatorXAxisRangeForManyData = (
    dataCount: number,
    timestamp: number,
    latestDataTimestamp: number,
    maxVisibleDataPoints: number,
    xAxis: DateTimeNumericAxis
): void => {
    const dataInterval = 60; // 假设数据间隔为1分钟
    
    // 如果最新数据在视窗中，移动X轴
    if (xAxis.visibleRange.max > latestDataTimestamp) {
        const timeDifference = timestamp - latestDataTimestamp;
        const shiftedRange = new NumberRange(
            xAxis.visibleRange.min + timeDifference,
            xAxis.visibleRange.max + timeDifference
        );
        xAxis.animateVisibleRange(shiftedRange, 10, easing.inOutQuad);
    }
    
    // 如果数据点数量超过最大显示数量，开始滚动显示
    if (dataCount > maxVisibleDataPoints) {
        const startTime = timestamp - ((maxVisibleDataPoints - 1) * dataInterval);
        const endTime = timestamp + (10 * dataInterval);
        const scrollRange = new NumberRange(startTime, endTime);
        xAxis.visibleRange = scrollRange;
        console.log(`指标数据点数量超过${maxVisibleDataPoints}，开始滚动显示`);
    }
};

// 处理指标数据更新
const processIndicatorData = (
    data: IndicatorValue,
    context: IndicatorUpdateContext
): { firstDataTimestamp: number | null } => {
    const { dataSeries, xAxis, yAxis, indicatorChartConfig, maxVisibleDataPoints } = context;
    const timestamp = data.timestamp / 1000;
    
    console.log(`=== 指标数据更新 ===`);
    console.log(`时间戳: ${timestamp}, 格式化时间: ${new Date(timestamp * 1000).toLocaleString()}`);
    
    const updatedContext = {
        firstDataTimestamp: context.firstDataTimestamp
    };
    
    // 检查是否是第一个数据点
    if (dataSeries.length > 0 && dataSeries[0].count() === 0) {
        // 处理第一个数据点
        const firstDataResult = handleFirstIndicatorData(data, context);
        updatedContext.firstDataTimestamp = firstDataResult.firstDataTimestamp;
    } else {
        // 处理后续数据点
        const dataCount = dataSeries.length > 0 ? dataSeries[0].count() : 0;
        const latestDataTimestamp = dataCount > 0 ? dataSeries[0].getNativeXValues().get(dataCount - 1) : timestamp;
        
        // 添加数据到各个系列
        if (indicatorChartConfig && indicatorChartConfig.seriesConfigs.length > 0) {
            const seriesCount = indicatorChartConfig.seriesConfigs.length;
            
            for (let i = 0; i < seriesCount && i < dataSeries.length; i++) {
                const value = data[indicatorChartConfig.seriesConfigs[i].indicatorValueKey];
                if (value !== undefined && value !== null) {
                    dataSeries[i].append(timestamp, value);
                }
            }
        }
        
        // 调整Y轴范围
        if (indicatorChartConfig) {
            adjustIndicatorYAxisRange(data, yAxis, indicatorChartConfig);
        }
        
        // 调整X轴范围
        const newDataCount = dataCount + 1;
        if (newDataCount <= 10) {
            adjustIndicatorXAxisRangeForFewData(newDataCount, timestamp, context.firstDataTimestamp!, xAxis);
        } else {
            adjustIndicatorXAxisRangeForManyData(newDataCount, timestamp, latestDataTimestamp, maxVisibleDataPoints, xAxis);
        }
    }
    
    return updatedContext;
};

const initTestChart = async (rootElement: string | HTMLDivElement, indicatorKeyStr: string) => {
    console.log("initTestChart", indicatorKeyStr);
    
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, {
        theme: appTheme.SciChartJsTheme,
    });

    // 根据缓存键获取指标配置
    const indicatorKey = parseCacheKey(indicatorKeyStr) as IndicatorCacheKey;
    const indicatorChartConfig = INDICATOR_CHART_CONFIG_MAP[indicatorKey.indicatorType];
    console.log("指标的图表配置", indicatorChartConfig);
    const indicatorName = indicatorChartConfig?.name || "未知指标";

    // 添加时间类型的X轴
    const xAxis = new DateTimeNumericAxis(wasmContext, {
        drawMajorBands: false,
        drawMajorGridLines: false,
        drawMinorGridLines: false,
        // autoRange: EAutoRange.Always,
    });
    sciChartSurface.xAxes.add(xAxis);

    const yAxis = new NumericAxis(wasmContext, {
        growBy: new NumberRange(0.1, 0.1),
        labelFormat: ENumericFormat.Decimal,
        labelPrecision: 2,
        // labelPrefix: "$",
        autoRange: EAutoRange.Always,
        axisAlignment: EAxisAlignment.Right,
        drawMajorGridLines: false,
        drawMinorGridLines: false,
        // axisTitle: indicatorName,
    });
    sciChartSurface.yAxes.add(yAxis);

    // 存储数据系列和渲染系列
    const dataSeries: XyDataSeries[] = [];
    const renderableSeries: IRenderableSeries[] = [];

    // 根据指标配置创建数据系列和渲染系列
    if (indicatorChartConfig && indicatorChartConfig.seriesConfigs.length > 0) {
        indicatorChartConfig.seriesConfigs.forEach((seriesConfig: SeriesConfig) => {
            // 创建数据系列
            const dataSeriesInstance = new XyDataSeries(wasmContext, {
                dataSeriesName: seriesConfig.name,
            });
            dataSeries.push(dataSeriesInstance);

            // 根据系列类型创建对应的渲染系列
            let renderableSeriesInstance: IRenderableSeries;
            
            switch (seriesConfig.type) {
                case SeriesType.LINE:
                    renderableSeriesInstance = new FastLineRenderableSeries(wasmContext, {
                        dataSeries: dataSeriesInstance,
                        stroke: seriesConfig.color || appTheme.ForegroundColor,
                        strokeThickness: seriesConfig.strokeThickness || 2,
                        resamplingMode: EResamplingMode.None,
                    });
                    break;
                    
                case SeriesType.COLUMN:
                    renderableSeriesInstance = new FastColumnRenderableSeries(wasmContext, {
                        dataSeries: dataSeriesInstance,
                        fill: seriesConfig.color || appTheme.ForegroundColor,
                        stroke: seriesConfig.color || appTheme.ForegroundColor,
                        strokeThickness: 1,
                        resamplingMode: EResamplingMode.None,
                    });
                    break;
                    
                case SeriesType.MOUNTAIN:
                    renderableSeriesInstance = new FastMountainRenderableSeries(wasmContext, {
                        dataSeries: dataSeriesInstance,
                        fill: seriesConfig.color || appTheme.ForegroundColor,
                        stroke: seriesConfig.color || appTheme.ForegroundColor,
                        strokeThickness: seriesConfig.strokeThickness || 2,
                        resamplingMode: EResamplingMode.None,
                    });
                    break;
                    
                default:
                    // 默认使用折线图
                    renderableSeriesInstance = new FastLineRenderableSeries(wasmContext, {
                        dataSeries: dataSeriesInstance,
                        stroke: seriesConfig.color || appTheme.ForegroundColor,
                        strokeThickness: seriesConfig.strokeThickness || 2,
                        resamplingMode: EResamplingMode.None,
                    });
                    break;
            }
            
            renderableSeries.push(renderableSeriesInstance);
            sciChartSurface.renderableSeries.add(renderableSeriesInstance);
        });
    } else {
        // 如果没有配置，创建默认的单条折线图
        const defaultDataSeries = new XyDataSeries(wasmContext, {
            dataSeriesName: indicatorName,
        });
        const defaultRenderableSeries = new FastLineRenderableSeries(wasmContext, {
            dataSeries: defaultDataSeries,
            stroke: appTheme.ForegroundColor,
            strokeThickness: 2,
            resamplingMode: EResamplingMode.None,
        });
        
        dataSeries.push(defaultDataSeries);
        renderableSeries.push(defaultRenderableSeries);
        sciChartSurface.renderableSeries.add(defaultRenderableSeries);
    }

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
            // tooltipLegendTemplate: getCursorTooltipLegendTemplate,
        }),
        new RolloverModifier({
            modifierGroup: "cursorGroup",
            showTooltip: false,
            tooltipLegendTemplate: getRolloverLegendTemplate,
        })
    );

    // 指标图表状态变量
    const MAX_VISIBLE_DATA_POINTS = 500;
    let firstDataTimestamp: number | null = null;

    // 处理多系列数据更新
    const onNewData = (data: IndicatorValue) => {
        if (!data) return;
        
        // 构建指标更新上下文
        const context: IndicatorUpdateContext = {
            dataSeries,
            xAxis,
            yAxis,
            indicatorChartConfig,
            firstDataTimestamp,
            maxVisibleDataPoints: MAX_VISIBLE_DATA_POINTS,
        };
        
        // 使用工具函数处理指标数据
        const updatedContext = processIndicatorData(data, context);
        
        // 更新状态变量
        firstDataTimestamp = updatedContext.firstDataTimestamp;
    };

    return {
        sciChartSurface,
        wasmContext,
        controls: {
            onNewData,
            getDataSeries: () => dataSeries,
            getIndicatorConfig: () => indicatorChartConfig
        }
    };
}

export default initTestChart;