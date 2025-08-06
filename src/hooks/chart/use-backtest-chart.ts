import { useCallback, useEffect, useRef } from "react";
import { LineSeries, CandlestickSeries, AreaSeries, HistogramSeries } from "lightweight-charts";
import type { 
    CandlestickData, 
    IChartApi, 
    ChartOptions, 
    DeepPartial, 
    ISeriesApi, 
    SingleValueData
} from "lightweight-charts";
import { createChart } from "lightweight-charts";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { get_play_index } from "@/service/strategy-control/backtest-strategy-control";
import { useBacktestChartStore } from "@/components/chart/backtest-chart-new/backtest-chart-store";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import { SeriesType } from "@/types/chart";
import { useKlineLegend, type KlineLegendData } from "./use-kline-legend";
import type { MouseEventParams } from "lightweight-charts";

interface UseBacktestChartProps {
    strategyId: number;
    chartId: number;
    chartContainerRef: React.RefObject<HTMLDivElement | null>;
    chartOptions: DeepPartial<ChartOptions>;
}

interface UseBacktestChartReturn {
    chartConfig: BacktestChartConfig;
    klineLegendData: KlineLegendData | null; // K线图例数据
    klineData: Record<string, CandlestickData[]>;
    indicatorData: Record<string, Record<string, SingleValueData[]>>;
    getChartRef: () => IChartApi | null;
}

export const useBacktestChart = ({
    strategyId,
    chartId,
    chartContainerRef,
    chartOptions
}: UseBacktestChartProps): UseBacktestChartReturn => {

    const resizeObserver = useRef<ResizeObserver>(null);
    
    // 图表数据和ref管理
    const {
        chartConfig,
        klineData,
        indicatorData,
        initChartData,
        setChartRef,
        getChartRef,
        setKlineSeriesRef,
        getKlineSeriesRef,
        setIndicatorSeriesRef,
        getIndicatorSeriesRef,
        initObserverSubscriptions,
        setSubChartPaneRef,
    } = useBacktestChartStore(chartId);

    const { legendData, onCrosshairMove } = useKlineLegend({chartId, klineKeyStr: chartConfig.klineChartConfig.klineKeyStr});

    // 获取播放索引并初始化数据
    const playIndex = useRef(0);

    // 获取播放索引,并初始化数据
    const getPlayIndex = useCallback(() => {
        get_play_index(strategyId).then((index) => {
            playIndex.current = index;
            initChartData(playIndex.current);
        });
    }, [strategyId, initChartData]);

    // 初始化数据
    useEffect(() => {
        getPlayIndex();
    }, [getPlayIndex]);

    // 创建K线系列的逻辑
    const createKlineSeries = useCallback((chart: IChartApi) => {
        const candleSeries = chart.addSeries(CandlestickSeries);
        
        // 将蜡烛图系列存储到 store 中
        const klineKeyStr = chartConfig.klineChartConfig.klineKeyStr;
        setKlineSeriesRef(klineKeyStr, candleSeries);
        
        return candleSeries;
    }, [chartConfig, setKlineSeriesRef]);

    // 创建主图指标
    const createIndicatorSeries = useCallback((chart: IChartApi) => {
        chartConfig.indicatorChartConfigs.forEach(config => {
            if (config.isInMainChart) {
                config.seriesConfigs.forEach(seriesConfig => {
                    let mainChartIndicatorSeries: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null = null;
                    switch (seriesConfig.type) {
                        case SeriesType.LINE:
                            mainChartIndicatorSeries = chart.addSeries(LineSeries,{},0);
                            break;
                        case SeriesType.COLUMN:
                            mainChartIndicatorSeries = chart.addSeries(HistogramSeries,{},0);
                            break;
                        case SeriesType.MOUNTAIN:
                            mainChartIndicatorSeries = chart.addSeries(AreaSeries,{},0);
                            break;
                        case SeriesType.DASH:
                            mainChartIndicatorSeries = chart.addSeries(LineSeries,{},0);
                            break;
                    }
                    if (mainChartIndicatorSeries) {
                        setIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey, mainChartIndicatorSeries);
                    }
                });

            }
            // 创建子图指标
            else {
                // 创建子图 Pane
                const subChartPane = chart.addPane(false);
                setSubChartPaneRef(config.indicatorKeyStr, subChartPane);

                // 使用 setTimeout 延迟获取 HTML 元素，因为 pane 还没有完全实例化
                setTimeout(() => {
                    console.log("创建pane时，获取html", subChartPane.getHTMLElement());
                }, 100);

                // 创建子图指标
                config.seriesConfigs.forEach(seriesConfig => {
                    let subChartIndicatorSeries: ISeriesApi<"Line"> | ISeriesApi<"Area"> | ISeriesApi<"Histogram"> | null = null;
                    switch (seriesConfig.type) {
                        case SeriesType.LINE:
                            subChartIndicatorSeries = subChartPane.addSeries(LineSeries);
                            break;
                        case SeriesType.COLUMN:
                            subChartIndicatorSeries = subChartPane.addSeries(HistogramSeries);
                            break;
                        case SeriesType.MOUNTAIN:
                            subChartIndicatorSeries = subChartPane.addSeries(AreaSeries);
                            break;
                        case SeriesType.DASH:
                            subChartIndicatorSeries = subChartPane.addSeries(LineSeries);
                            break;
                    }
                    if (subChartIndicatorSeries) {
                        setIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey, subChartIndicatorSeries);
                    }
                });

            }
        });
        
    }, [chartConfig.indicatorChartConfigs, setIndicatorSeriesRef, setSubChartPaneRef]);

    // 初始化k线数据
    const initKlineData = useCallback(() => {
        const klineSeries = getKlineSeriesRef(chartConfig.klineChartConfig.klineKeyStr);
        if (klineSeries) {
            const klineDataArray = klineData[chartConfig.klineChartConfig.klineKeyStr] as CandlestickData[];
            if (klineDataArray && klineDataArray.length > 0) {
                klineSeries.setData(klineDataArray);
            }
        }
    }, [chartConfig.klineChartConfig.klineKeyStr, klineData, getKlineSeriesRef]);

    const initIndicatorData = useCallback(() => {
        chartConfig.indicatorChartConfigs.forEach(config => {
            config.seriesConfigs.forEach(seriesConfig => {
                const indicatorSeriesRef = getIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey);
                if (indicatorSeriesRef) {
                    const indicatorDataArray = indicatorData[config.indicatorKeyStr]
                    if (indicatorDataArray) {
                        const indicatorSeriesDataArray = indicatorDataArray[seriesConfig.indicatorValueKey] as SingleValueData[];
                        if (indicatorSeriesDataArray && indicatorSeriesDataArray.length > 0) {
                            indicatorSeriesRef.setData(indicatorSeriesDataArray);
                        }
                    }
                }
            });
        });
    }, [chartConfig.indicatorChartConfigs, getIndicatorSeriesRef, indicatorData]);

    // 图表初始化（只初始化一次）
    useEffect(() => {
        if (chartContainerRef.current && !getChartRef()) {
            const chart = createChart(chartContainerRef.current, chartOptions);
            setChartRef(chart);

            // 创建K线系列
            createKlineSeries(chart);

            // 创建指标
            createIndicatorSeries(chart);

            // 🔑 只为 K线 legend 添加 crosshair 事件监听
            // 指标 legend 现在各自直接订阅事件
            chart.subscribeCrosshairMove(onCrosshairMove);

            // 获取pane
            const pane = chart.panes();
            console.log("panes", pane);

            // 初始化 observer 订阅
            setTimeout(() => {
                initObserverSubscriptions();
            }, 100);
        }
    }, [
        setChartRef, 
        getChartRef, 
        createKlineSeries, 
        initObserverSubscriptions, 
        chartOptions,
        chartContainerRef,
        createIndicatorSeries,
        onCrosshairMove,
    ]);

    // 初始化数据
    useEffect(() => {
        // 初始化k线数据
        initKlineData();
        // 初始化指标数据
        initIndicatorData();
    }, [initKlineData, initIndicatorData]);

    // 初始化指标数据

    // 处理图表 resize
    useEffect(() => {
        resizeObserver.current = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            const chart = getChartRef();
            chart?.applyOptions({ width, height });
            // setTimeout(() => {
            //     chart?.timeScale().fitContent();
            // }, 0);
        });

        if (chartContainerRef.current) {
            resizeObserver.current.observe(chartContainerRef.current);
        }

        return () => resizeObserver.current?.disconnect();
    }, [getChartRef, chartContainerRef]);

    return {
        chartConfig,
        klineData,
        indicatorData,
        klineLegendData: legendData || null,
        getChartRef,
    };
};
