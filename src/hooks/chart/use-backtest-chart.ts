import { useCallback, useEffect, useRef, useMemo, useState } from "react";
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
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import { SeriesType } from "@/types/chart";
import { useKlineLegend, type KlineLegendData } from "./use-kline-legend";
import type { MouseEventParams } from "lightweight-charts";
import type { KlineKeyStr } from "@/types/symbol-key";
import type { IndicatorChartConfig } from "@/types/chart";

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
        syncChartConfig,
        getIsDataInitialized,
    } = useBacktestChartStore(chartId);


    // 监听全局配置变化并同步到本地store
    const globalChartConfig = useBacktestChartConfigStore((state) => state.getChartConfig(chartId));

    // 使用ref来跟踪是否已经初始化
    const isInitializedRef = useRef(false);

    useEffect(() => {
        // 当全局配置发生变化时，同步到本地store
        if (globalChartConfig) {
            syncChartConfig();
        }
    }, [globalChartConfig, syncChartConfig]);

    const { legendData, onCrosshairMove } = useKlineLegend({chartId, klineKeyStr: chartConfig.klineChartConfig.klineKeyStr});

    // 获取播放索引并初始化数据
    const playIndex = useRef(0);

    // 获取播放索引,并初始化数据
    // const getChartInitialData = useCallback(() => {
    //     get_play_index(strategyId).then((index) => {
    //         playIndex.current = index;
    //         initChartData(playIndex.current);
    //     });
    // }, [strategyId, initChartData]);

    // 初始化数据
    // useEffect(() => {
    //     getChartInitialData();
    // }, [getChartInitialData]);

    // 创建K线系列的逻辑
    const createKlineSeries = useCallback((chart: IChartApi, klineKeyStr: KlineKeyStr) => {

        const candleSeries = chart.addSeries(CandlestickSeries);
        
        // 将蜡烛图系列存储到 store 中
        setKlineSeriesRef(klineKeyStr, candleSeries);
        
        return candleSeries;
    }, [setKlineSeriesRef]);

    // 清理现有的指标系列和子图pane
    const clearIndicatorSeries = useCallback((chart: IChartApi) => {
        // 清理所有子图pane
        // const panes = chart.panes();
        // // 保留主图pane（索引0），删除所有子图pane
        // for (let i = panes.length - 1; i > 0; i--) {
        //     chart.removePane(i);
        // }
        console.log("清除子图pane1");
        // chart.removePane(1);

        // 清理主图中的指标系列（保留K线系列）
        // const mainPane = panes[0];
        // if (mainPane) {
        //     const allSeries = mainPane.getSeries();
        //     // 获取K线系列引用
        //     const klineSeries = getKlineSeriesRef(chartConfig.klineChartConfig.klineKeyStr);

        //     // 删除所有不是K线的系列
        //     allSeries.forEach(series => {
        //         if (series !== klineSeries) {
        //             chart.removeSeries(series);
        //         }
        //     });
        // }
    }, [getKlineSeriesRef, chartConfig.klineChartConfig.klineKeyStr]);

    // 创建主图指标
    const createIndicatorSeries = useCallback((chart: IChartApi, indicatorChartConfigs: IndicatorChartConfig[], shouldClear = false) => {
        // 如果需要清理，先清理现有的指标系列
        if (shouldClear) {
            clearIndicatorSeries(chart);
        }

        indicatorChartConfigs.forEach(config => {
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

    }, [setIndicatorSeriesRef, setSubChartPaneRef, clearIndicatorSeries]);

    // 当配置变化时，重新创建指标系列（但不在初始化时）
    // 使用 useMemo 来稳定依赖项
    const chartConfigDeps = useMemo(() => ({
        klineKeyStr: chartConfig.klineChartConfig.klineKeyStr,
        indicatorConfigs: chartConfig.indicatorChartConfigs
    }), [chartConfig.klineChartConfig.klineKeyStr, chartConfig.indicatorChartConfigs]);

    useEffect(() => {
        const chart = getChartRef();
        if (chart && isInitializedRef.current) {
            createKlineSeries(chart, chartConfigDeps.klineKeyStr);
            // 重新创建指标系列，并清理现有的
            createIndicatorSeries(chart, chartConfigDeps.indicatorConfigs, true);
        }
    }, [getChartRef, createKlineSeries, createIndicatorSeries, chartConfigDeps]);


    const initializeBacktestChart = useCallback(() => {
        if (chartContainerRef.current && !getChartRef()) {
            const chart = createChart(chartContainerRef.current, chartOptions);
            setChartRef(chart);

            // 获取当前配置
            const currentConfig = chartConfig;

            // 创建K线系列
            const candleSeries = chart.addSeries(CandlestickSeries);
            setKlineSeriesRef(currentConfig.klineChartConfig.klineKeyStr, candleSeries);

            // 创建指标系列
            currentConfig.indicatorChartConfigs.forEach(config => {
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
                } else {
                    // 创建子图
                    const subChartPane = chart.addPane(false);
                    setSubChartPaneRef(config.indicatorKeyStr, subChartPane);

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

            // 🔑 只为 K线 legend 添加 crosshair 事件监听
            chart.subscribeCrosshairMove(onCrosshairMove);

            // 初始化 observer 订阅
            setTimeout(() => {
                initObserverSubscriptions();
                // 标记为已初始化
                setIsInitialized(true);
            }, 100);
        }
    }, 
    [
        chartOptions, 
        chartContainerRef, 
        onCrosshairMove, 
        chartConfig, 
        setIndicatorSeriesRef, 
        setSubChartPaneRef, 
        setKlineSeriesRef,
        setChartRef, 
        initObserverSubscriptions, 
        getChartRef,
    ]);

    // 图表初始化（只初始化一次）
    useEffect(() => {
        if (!isInitializedRef.current) {
            get_play_index(strategyId).then((index) => {
                playIndex.current = index;
                initChartData(playIndex.current).then(() => {
                    initializeBacktestChart();
                });
            });
        }
    }, [strategyId, initChartData, initializeBacktestChart]);

    // 使用状态追踪初始化状态，而不是 ref
    const [isInitialized, setIsInitialized] = useState(false);
    // 追踪数据是否已在图表中设置
    const [isChartDataSet, setIsChartDataSet] = useState(false);

    // 数据初始化 - 在图表创建后且数据可用时设置数据（仅初始化时）
    useEffect(() => {
        // 只在图表已初始化、数据已准备好、但数据还未在图表中设置时执行
        if (isInitialized && getChartRef() && getIsDataInitialized() && !isChartDataSet) {
            console.log("初始化设置数据到图表");
            
            // 初始化k线数据
            const klineSeries = getKlineSeriesRef(chartConfig.klineChartConfig.klineKeyStr);
            if (klineSeries) {
                const klineDataArray = klineData[chartConfig.klineChartConfig.klineKeyStr] as CandlestickData[];
                if (klineDataArray && klineDataArray.length > 0) {
                    klineSeries.setData(klineDataArray);
                }
            }

            // 初始化指标数据
            chartConfig.indicatorChartConfigs.forEach(config => {
                config.seriesConfigs.forEach(seriesConfig => {
                    const indicatorSeriesRef = getIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey);
                    if (indicatorSeriesRef) {
                        const indicatorDataArray = indicatorData[config.indicatorKeyStr];
                        if (indicatorDataArray) {
                            const indicatorSeriesDataArray = indicatorDataArray[seriesConfig.indicatorValueKey] as SingleValueData[];
                            if (indicatorSeriesDataArray && indicatorSeriesDataArray.length > 0) {
                                indicatorSeriesRef.setData(indicatorSeriesDataArray);
                            }
                        }
                    }
                });
            });
            
            // 标记数据已在图表中设置
            setIsChartDataSet(true);
        }
    }, [isInitialized, getIsDataInitialized, isChartDataSet, chartConfig, klineData, indicatorData, getChartRef, getKlineSeriesRef, getIndicatorSeriesRef]);

    // 初始化数据
    // useEffect(() => {
    //     // 初始化k线数据
    //     initKlineSeriesData();
    //     // 初始化指标数据
    //     initIndicatorSeriesData();
    // }, [initKlineSeriesData, initIndicatorSeriesData]);

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
