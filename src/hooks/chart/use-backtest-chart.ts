import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { LineSeries, CandlestickSeries, AreaSeries, HistogramSeries } from "lightweight-charts";
import type {
    CandlestickData,
    IChartApi,
    ChartOptions,
    DeepPartial,
    ISeriesApi,
    SingleValueData,
} from "lightweight-charts";
import { createChart } from "lightweight-charts";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { get_play_index } from "@/service/strategy-control/backtest-strategy-control";
import { useBacktestChartStore } from "@/components/chart/backtest-chart-new/backtest-chart-store";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import { SeriesType } from "@/types/chart";
import { useKlineLegend, type KlineLegendData } from "./use-kline-legend";
import type { IndicatorChartConfig } from "@/types/chart";
import { addChartSeries } from "./utils/add-chart-series";

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
        initIndicatorData,
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
        getSubChartPaneRef,
        removeIndicatorSeriesRef,
        removeSubChartPaneRef,
    } = useBacktestChartStore(chartId);


    // 使用状态追踪初始化状态，而不是 ref
    const [isInitialized, setIsInitialized] = useState(false);
    // 追踪数据是否已在图表中设置
    const [isChartDataSet, setIsChartDataSet] = useState(false);


    // 监听全局配置变化并同步到本地store  
    const { chartConfig: globalBacktestConfig, getChartConfig } = useBacktestChartConfigStore();
    
    const globalChartConfig = useMemo(() => {
        return getChartConfig(chartId);
    }, [getChartConfig, chartId, globalBacktestConfig]);

    // 使用ref来跟踪是否是第一次接收到globalChartConfig
    const isFirstGlobalConfigLoad = useRef(true);

    useEffect(() => {
        // 当全局配置发生变化时，同步到本地store
        if (globalChartConfig) {
            syncChartConfig();
        }
    }, [globalChartConfig, syncChartConfig]);

    const { legendData, onCrosshairMove } = useKlineLegend({chartId, klineKeyStr: chartConfig.klineChartConfig.klineKeyStr});

    // 获取播放索引并初始化数据
    const playIndex = useRef(0);

    // 更改series配置
    const changeSeriesConfig = useCallback(() => {
        // 切换蜡烛图可见性
        const klineSeries = getKlineSeriesRef(chartConfig.klineChartConfig.klineKeyStr);
        if (klineSeries) {
            klineSeries.applyOptions({
                visible: chartConfig.klineChartConfig.visible,
            });
        }
        // 根据indicatorChartConfig，获取seriesApi
        chartConfig.indicatorChartConfigs.forEach(config => {
            config.seriesConfigs.forEach(seriesConfig => {
                const seriesApi = getIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey);
                if (seriesApi) {
                    seriesApi.applyOptions({
                        visible: config.visible,
                        color: seriesConfig.color,
                    });
                }
            });
        });
    }, [getIndicatorSeriesRef, chartConfig.indicatorChartConfigs, getKlineSeriesRef, chartConfig.klineChartConfig.klineKeyStr, chartConfig.klineChartConfig.visible]);

    const deleteSeries = useCallback(() => {
        const chart = getChartRef();
        if (chart) {
            chartConfig.indicatorChartConfigs.forEach(config => {
                // 如果是主图指标，则removeSeries
                if (config.isInMainChart && config.isDelete) {
                    config.seriesConfigs.forEach(seriesConfig => {
                        const seriesApi = getIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey);
                        if (seriesApi) {
                            chart.removeSeries(seriesApi);
                        }
                    });
                    removeIndicatorSeriesRef(config.indicatorKeyStr);
                }
                // 如果是子图指标，则removePane
                else if (!config.isInMainChart && config.isDelete) {
                    const subChartPane = getSubChartPaneRef(config.indicatorKeyStr);
                    if (subChartPane) {
                        chart.removePane(subChartPane.paneIndex());
                        // 删除store中的paneApi
                        removeSubChartPaneRef(config.indicatorKeyStr);
                    }
                }
            });
        }
    }, 
    [getChartRef, chartConfig.indicatorChartConfigs, getIndicatorSeriesRef, getSubChartPaneRef, removeIndicatorSeriesRef, removeSubChartPaneRef]);

    // 添加series
    const addSeries = useCallback(async () => {
        const chart = getChartRef();
        if (chart) {
            // 检查哪些指标需要初始化数据
            const indicatorsNeedingData = chartConfig.indicatorChartConfigs.filter(config => {
                // 检查指标是否存在且未被删除，并且store中没有数据
                return !config.isDelete && !indicatorData[config.indicatorKeyStr];
            });

            // 并行初始化所有需要数据的指标
            if (indicatorsNeedingData.length > 0) {
                await Promise.all(
                    indicatorsNeedingData.map(config => 
                        initIndicatorData(config.indicatorKeyStr, playIndex.current)
                    )
                );
            }

            chartConfig.indicatorChartConfigs.forEach(config => {
                // 如果指标是主图指标，并且没有被删除，并且store中没有seriesRef，则添加series
                if (config.isInMainChart && !config.isDelete) {
                    config.seriesConfigs.forEach(seriesConfig => {
                        const seriesApi = getIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey);
                        if (!seriesApi) {
                            const newSeries = addChartSeries(chart, config, seriesConfig);
                            if (newSeries) {
                                setIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey, newSeries);
                                
                                // 为新创建的系列设置数据
                                const indicatorDataForSeries = indicatorData[config.indicatorKeyStr];
                                if (indicatorDataForSeries) {
                                    const seriesData = indicatorDataForSeries[seriesConfig.indicatorValueKey];
                                    if (seriesData && seriesData.length > 0) {
                                        newSeries.setData(seriesData);
                                    }
                                }
                            }
                        }
                    });
                }
                // 如果指标是子图指标，并且没有被删除，并且store中没有paneRef，则添加pane
                else if (!config.isInMainChart && !config.isDelete) {
                    const subChartPane = getSubChartPaneRef(config.indicatorKeyStr);
                    if (!subChartPane) {
                        const newPane = chart.addPane(false);
                        setSubChartPaneRef(config.indicatorKeyStr, newPane);
                        // 创建子图指标
                        config.seriesConfigs.forEach(seriesConfig => {
                            const subChartIndicatorSeries = addChartSeries(newPane, config, seriesConfig);
                            if (subChartIndicatorSeries) {
                                setIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey, subChartIndicatorSeries);
                            }
                            // 为新创建的系列设置数据
                            const subChartIndicatorData = indicatorData[config.indicatorKeyStr];
                            if (subChartIndicatorData) {
                                const seriesData = subChartIndicatorData[seriesConfig.indicatorValueKey];
                                if (seriesData && seriesData.length > 0) {
                                    subChartIndicatorSeries.setData(seriesData);
                                }
                            }
                        });
                    }
                }
            });
        }
    }, [chartConfig.indicatorChartConfigs, getChartRef, getIndicatorSeriesRef, setIndicatorSeriesRef, indicatorData, initIndicatorData]);

    // 创建指标系列
    const createIndicatorSeries = useCallback((chart: IChartApi, indicatorChartConfigs: IndicatorChartConfig[]) => {

        indicatorChartConfigs.forEach(config => {
            if (config.isInMainChart) {
                config.seriesConfigs.forEach(seriesConfig => {
                    const mainChartIndicatorSeries = addChartSeries(chart, config, seriesConfig);
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
                    const subChartIndicatorSeries = addChartSeries(subChartPane, config, seriesConfig);
                    if (subChartIndicatorSeries) {
                        setIndicatorSeriesRef(config.indicatorKeyStr, seriesConfig.indicatorValueKey, subChartIndicatorSeries);
                    }
                });

            }
        });

    }, [setIndicatorSeriesRef, setSubChartPaneRef]);


    useEffect(() => {
        if (globalChartConfig) {
            // 跳过第一次加载（初始化时），只在后续配置变化时重新创建
            if (isFirstGlobalConfigLoad.current) {
                isFirstGlobalConfigLoad.current = false;
                console.log("跳过第一次加载");
                return;
            }

            // 添加series (异步操作)
            addSeries().catch(error => {
                console.error("添加series时出错:", error);
            });

            // 修改series配置
            changeSeriesConfig();

            // 删除指标系列
            deleteSeries();

            
        }
    }, [globalChartConfig, addSeries, changeSeriesConfig, deleteSeries]);


    const initializeBacktestChart = useCallback(() => {
        if (chartContainerRef.current && !getChartRef()) {
            const chart = createChart(chartContainerRef.current, chartOptions);
            setChartRef(chart);

            // 获取当前配置
            const currentConfig = chartConfig;

            // 创建K线系列
            const candleSeries = chart.addSeries(CandlestickSeries);
            candleSeries.applyOptions({
                visible: currentConfig.klineChartConfig.visible ?? true,
            });
            setKlineSeriesRef(currentConfig.klineChartConfig.klineKeyStr, candleSeries);

            // 创建指标系列
            createIndicatorSeries(chart, currentConfig.indicatorChartConfigs);

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
        setChartRef, 
        setKlineSeriesRef,
        initObserverSubscriptions, 
        getChartRef,
        createIndicatorSeries,
    ]);

    // 图表系列初始化
    useEffect(() => {
        if (!isInitialized) {
            get_play_index(strategyId).then((index) => {
                playIndex.current = index;
                initChartData(playIndex.current).then(() => {
                    initializeBacktestChart();
                });
            });
        }
    }, [strategyId, initChartData, initializeBacktestChart, isInitialized]);

    

    // 图表数据初始化 - 在图表创建后且数据可用时设置数据
    useEffect(() => {
        // 只在图表已初始化、数据已准备好、但数据还未在图表中设置时执行
        if (isInitialized && getChartRef() && getIsDataInitialized() && !isChartDataSet) {
            
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
