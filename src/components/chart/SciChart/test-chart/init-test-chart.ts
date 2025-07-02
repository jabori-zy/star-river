import { 
    SciChartSurface,
    DateTimeNumericAxis,
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
} from "scichart";
import { appTheme } from "../theme";
import { 
    getIndicatorConfigFromCacheKey, 
    SeriesType, 
    SeriesConfig
} from "@/types/indicator/indicator-chart-config";
import { parseCacheKey } from "@/utils/parseCacheKey";
import { IndicatorCacheKey } from "@/types/cache";
import { INDICATOR_CHART_CONFIG_MAP } from "@/types/indicator/indicator-chart-config";
import { IndicatorValue } from "@/types/indicator";

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
        drawMinorGridLines: false
    });
    sciChartSurface.xAxes.add(xAxis);

    const yAxis = new NumericAxis(wasmContext, {
        growBy: new NumberRange(0.1, 0.1),
        labelFormat: ENumericFormat.Decimal,
        labelPrecision: 2,
        // labelPrefix: "$",
        // autoRange: EAutoRange.Always,
        axisAlignment: EAxisAlignment.Right,
        drawMajorGridLines: false,
        drawMinorGridLines: false,
        axisTitle: indicatorName,
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
                    });
                    break;
                    
                case SeriesType.COLUMN:
                    renderableSeriesInstance = new FastColumnRenderableSeries(wasmContext, {
                        dataSeries: dataSeriesInstance,
                        fill: seriesConfig.color || appTheme.ForegroundColor,
                        stroke: seriesConfig.color || appTheme.ForegroundColor,
                        strokeThickness: 1,
                    });
                    break;
                    
                case SeriesType.MOUNTAIN:
                    renderableSeriesInstance = new FastMountainRenderableSeries(wasmContext, {
                        dataSeries: dataSeriesInstance,
                        fill: seriesConfig.color || appTheme.ForegroundColor,
                        stroke: seriesConfig.color || appTheme.ForegroundColor,
                        strokeThickness: seriesConfig.strokeThickness || 2,
                    });
                    break;
                    
                default:
                    // 默认使用折线图
                    renderableSeriesInstance = new FastLineRenderableSeries(wasmContext, {
                        dataSeries: dataSeriesInstance,
                        stroke: seriesConfig.color || appTheme.ForegroundColor,
                        strokeThickness: seriesConfig.strokeThickness || 2,
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
        });
        
        dataSeries.push(defaultDataSeries);
        renderableSeries.push(defaultRenderableSeries);
        sciChartSurface.renderableSeries.add(defaultRenderableSeries);
    }

    sciChartSurface.chartModifiers.add(new ZoomPanModifier({ enableZoom: true }));
    sciChartSurface.chartModifiers.add(new ZoomExtentsModifier());
    sciChartSurface.chartModifiers.add(new MouseWheelZoomModifier());
    sciChartSurface.chartModifiers.add(
        new RolloverModifier({
            modifierGroup: "cursorGroup",
            showTooltip: false,
        })
    );

    // 处理多系列数据更新
    const onNewData = (data: IndicatorValue) => {
        if (!data) return;
        
        // 下标0是时间戳
        const timestamp = data.timestamp;
        
        if (indicatorChartConfig && indicatorChartConfig.seriesConfigs.length > 0) {
            // 根据指标配置处理多系列数据
            const seriesCount = indicatorChartConfig.seriesConfigs.length;
            
            for (let i = 0; i < seriesCount && i < dataSeries.length; i++) {
                // 数据索引：timestamp在0位置，系列数据从1开始
                // const valueIndex = i + 1;
                // const valueIndex = indicatorChartConfig.seriesConfigs[i].indicatorValueKey;
                const value = data[indicatorChartConfig.seriesConfigs[i].indicatorValueKey];
                if (value) {
                    dataSeries[i].append(timestamp, value);
                }
            }
        } else {
            // 默认处理：只有一个系列，使用第二个数据点作为值
            if (dataSeries.length > 0) {
                const value = data[indicatorChartConfig.seriesConfigs[0].indicatorValueKey];
                if (value) {
                    dataSeries[0].append(timestamp, value);
                }
            }
        }
    };

    const setIndicatorName = (name: string) => {
        yAxis.axisTitle = name;
        // 如果只有一个系列，更新系列名称
        if (dataSeries.length === 1) {
            dataSeries[0].dataSeriesName = name;
        }
    };

    return {
        sciChartSurface,
        wasmContext,
        controls: {
            onNewData,
            setIndicatorName,
            getDataSeries: () => dataSeries,
            getRenderableSeries: () => renderableSeries,
            getIndicatorConfig: () => indicatorChartConfig
        }
    };
}

export default initTestChart;