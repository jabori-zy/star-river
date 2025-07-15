import * as Highcharts from "highcharts/highstock";
import { HighchartsReact } from "highcharts-react-official";
import { useRef, useEffect, useState } from "react";
import useChartResize from "@/hooks/use-chartResize";
import { getInitialChartData } from "@/service/chart";
import { useStrategyEventStore } from "@/store/useStrategyEventStore"
import { IndicatorKeyStr, KlineKeyStr, IndicatorKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import { getIndicatorChartConfig } from "@/utils/getIndicatorChartConfig";
import { getBaseChartOptions, createChartOptions } from "./options";

interface SingleKlineChartProps extends HighchartsReact.Props {
    id: string; // 唯一标识
    // chartTitle: string; // 图表标题
    klineCacheKey: KlineKeyStr; // k线缓存键，只能有一个
    indicatorCacheKeys: IndicatorKeyStr[]; // 指标缓存键， 可以有多个，周期必须与k线缓存键的周期一致。
}

// 更新指标数据的函数
function updateIndicatorData(
    chart: Highcharts.Chart, 
    cacheKey: IndicatorKey, 
    values: number[][]
): void {
    const indicatorSeriesConfig = getIndicatorChartConfig(cacheKey);
    const seriesId = indicatorSeriesConfig?.id;
    
    if (seriesId) {
        const newIndicatorPoint = values[values.length - 1] as number[];
        const series = chart.get(seriesId) as Highcharts.Series;
        
        if (series && series.visible) {
            // 如果指标系列没有数据，直接添加
            if (series.points.length === 0) {
                series.addPoint(newIndicatorPoint);
            } else {
                // 时间戳不同，添加新点
                const lastPoint = series.points[series.points.length - 1];
                if (lastPoint.x !== newIndicatorPoint[0]) {
                    series.addPoint(newIndicatorPoint);
                }
                // 时间戳相同，更新现有点
                else {
                    // 使用类型安全的方式获取数据
                    const currentData = (series.options as Highcharts.SeriesOptionsType & { data: number[][] }).data || [];
                    currentData[currentData.length - 1] = newIndicatorPoint;
                    series.setData(currentData);
                }
            }
        }
    }
}

// 更新K线数据的函数
function updateKlineData(
    chart: Highcharts.Chart, 
    values: number[][]
): void {
    // 最新的数据
    const newKlinePoint = values[values.length - 1] as number[];
    const newVolumePoint = [newKlinePoint[0], newKlinePoint[5]] as number[];
    // 获取k线系列
    const klineSeries = chart.get("kline") as Highcharts.Series;
    // 获取成交量系列
    const volumeSeries = chart.get("volume") as Highcharts.Series;
    
    if (klineSeries && klineSeries.visible) {
        // 如果没有数据，直接添加
        if (klineSeries.points.length === 0) {
            klineSeries.addPoint(newKlinePoint);
            volumeSeries.addPoint(newVolumePoint);
        // 如果有数据，则判断时间戳
        } else {
            // 时间戳不同，添加新点
            const lastPoint = klineSeries.points[klineSeries.points.length - 1];
            if (lastPoint.x !== newKlinePoint[0]) {
                klineSeries.addPoint(newKlinePoint);
                volumeSeries.addPoint(newVolumePoint);
            }
            // 时间戳相同，更新现有点
            else {
                const currentKlineSeriesData = (klineSeries.options as Highcharts.SeriesOptionsType & { data: number[][] }).data || [];
                currentKlineSeriesData[currentKlineSeriesData.length - 1] = newKlinePoint;
                klineSeries.setData(currentKlineSeriesData);
                const currentVolumeSeriesData = (volumeSeries.options as Highcharts.SeriesOptionsType & { data: number[][] }).data || [];
                currentVolumeSeriesData[currentVolumeSeriesData.length - 1] = newVolumePoint;
                volumeSeries.setData(currentVolumeSeriesData);
            }

        }
    }
}

// 单k线图表组件
function SingleKlineChart(lineChartProps: SingleKlineChartProps) {
    // 图表组件引用
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
    // 初始化图表配置
    const [options, setOptions] = useState<Highcharts.Options>(getBaseChartOptions());
    // 是否可以更新数据
    const [canProcessUpdates, setCanProcessUpdates] = useState<boolean>(false);

    // 获取最新事件
    const latestStrategyEvent = useStrategyEventStore(
        state => state.getLatestEvent('strategy-data-update')
    );

    // 初始化数据
    useEffect(() => {
        console.log("图表当前的cacheKey", lineChartProps.klineCacheKey, lineChartProps.indicatorCacheKeys);
        // 获取初始k线数据
        const fetchInitialData = async () => {

            // 获取k线缓存数据
            const initialKlineData = await getInitialChartData(lineChartProps.klineCacheKey);
            // console.log("initial_kline", initial_kline);
            
            // 判断指标缓存键的个数
            const indicatorDataMap: Record<IndicatorKeyStr, []> = {};
            if (lineChartProps.indicatorCacheKeys.length > 0) {
                console.log("指标缓存键：", lineChartProps.indicatorCacheKeys);
                for (const indicatorCacheKey of lineChartProps.indicatorCacheKeys) {
                    const indicatorData = await getInitialChartData(indicatorCacheKey);
                    indicatorDataMap[indicatorCacheKey] = indicatorData;
                    // console.log("indicatorDataMap", indicatorDataMap);
                }
            }

            const chartOptions = createChartOptions(lineChartProps.klineCacheKey, initialKlineData, indicatorDataMap);
            console.log("chartOptions", chartOptions);
            setOptions(chartOptions);
            
            // 获取初始数据后，等待1秒钟再允许处理更新
            setTimeout(() => {
                setCanProcessUpdates(true);
                console.log("图表已准备好接收更新数据");
            }, 1000);
        };
        fetchInitialData();
    }, [lineChartProps.klineCacheKey, lineChartProps.indicatorCacheKeys]);

    // 处理数据更新
    useEffect(() => {
        // 如果不能处理更新数据，或者没有最新事件，或者k线缓存键为空，则返回
        if (!canProcessUpdates || !latestStrategyEvent || lineChartProps.klineCacheKey.length === 0) return;
        
        // 获取最新事件数据
        const newValues = latestStrategyEvent.data;
        // 获取图表组件
        const chart = chartComponentRef.current?.chart;
        
        // 如果图表组件存在，并且有数据
        if (chart && newValues) {
            // 遍历newValues(Record<CacheKeyStr, []>)
            for (const [cacheKeyStr, values] of Object.entries(newValues)) {
                const cacheKey = parseKey(cacheKeyStr);
                
                // 根据数据类型调用相应的更新函数
                if ("indicator_type" in cacheKey) {
                    updateIndicatorData(chart, cacheKey as IndicatorKey, values);
                } else {
                    updateKlineData(chart, values);
                }
            }
        }
    }, [latestStrategyEvent, lineChartProps.klineCacheKey, canProcessUpdates]);

    useChartResize(chartComponentRef);

    return (
        <HighchartsReact
            highcharts={Highcharts}
            constructorType={'stockChart'}
            options={options}
            ref={chartComponentRef}
            {...lineChartProps}
        />
    );
}

export default SingleKlineChart;
