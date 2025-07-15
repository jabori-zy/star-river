import { parseKey } from "@/utils/parse-key";
import { getIndicatorChartConfig } from "@/utils/getIndicatorChartConfig";
import * as Highcharts from "highcharts/highstock";
import { IndicatorKey, IndicatorKeyStr, KlineKey, KlineKeyStr } from "@/types/symbol-key";

// 获取基础图表配置（无数据）
export function getBaseChartOptions(): Highcharts.Options {
    return {
        chart: {
            reflow: true,
            // width: '100%'
            height: '40%'
        },
        time: {
            timezone: 'Asia/Shanghai'
        },
        rangeSelector: {
            enabled: false,
            selected: 1,
        },
        navigator:{
            enabled: true,
            height: 30,
            margin: 10,
            series: {
                color: '#000000',      // 导航器中图表的颜色
                fillOpacity: 0.5,      // 填充透明度
                lineWidth: 1           // 线条宽度
            },
        },
        // title: {
        //     text: chartTitle
        // },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%Y-%m-%d %H:%M:%S',
                week: '%Y-%m-%d %H:%M:%S',
                month: '%Y-%m-%d %H:%M:%S',
                year: '%Y-%m-%d %H:%M:%S'
            },
            overscroll: 500000, // 右侧的偏移量
            // gridLineWidth: 1,
            gridLineColor: '#E0E0E0',
        },
        yAxis: [{
            title: {
                text: '价格'
            },
            labels: {
                align: 'left'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
                enabled: true
            },
            // crosshair: {
            //     label: {
            //         enabled: true,
            //     }
            // }
        },
        {
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }
    ],
        tooltip:{
            valueDecimals: 2,
            xDateFormat: '%Y-%m-%d %H:%M:%S',
            shared: false,
            // formatter: function() {
            //     const date = Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x + 8*60*60*1000);
            //     return `${date}<br/>BTC价格:${this.y}`;
                
            // },
            // shape: 'square',
            headerShape: 'callout',
            borderWidth: 0,
            shadow: true,
            // fixed: true
        },
        accessibility: {
            enabled: false
        },
        series: []
    };
}

// 设置K线数据
export function setKlineData(options: Highcharts.Options, klineData: number[][], klineCacheKeyStr: KlineKeyStr): Highcharts.Options {
    const newOptions = { ...options };

    const klineCacheKey = parseKey(klineCacheKeyStr) as KlineKey;
    const symbol = klineCacheKey.symbol;
    
    // 检查是否已存在K线系列
    const klineSeriesIndex = newOptions.series?.findIndex(s => s.id === 'kline');
    const volumeSeriesIndex = newOptions.series?.findIndex(s => s.id === 'volume');
    
    // 获取成交量数据
    const volumeSeries = klineData.map(item => [item[0], item[5]]);
    
    // k线系列配置
    const klineSeriesOption: Highcharts.SeriesCandlestickOptions = {
        type: 'candlestick',
        lastPrice: {
            enabled: true,
            label: {
                enabled: true,
                backgroundColor: '#FF7F7F'
            }
        },
        
        upColor: '#90EE90',
        color: '#797271',
        name: `${symbol} Price`,
        id: 'kline',
        // 关闭数据分组功能
        dataGrouping: {
            enabled: false
        },
        data: klineData
    };

    // 成交量系列配置
    const volumeSeriesOption: Highcharts.SeriesColumnOptions = {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: volumeSeries,
        yAxis: 1,
        dataGrouping: {
            enabled: false
        },
    };



    
    if (klineSeriesIndex !== undefined && klineSeriesIndex >= 0) {
        // 更新现有K线系列
        if (newOptions.series) {
            newOptions.series[klineSeriesIndex] = klineSeriesOption;
        }
    } else {
        // 添加新的K线系列
        if (!newOptions.series) {
            newOptions.series = [];
        }
        newOptions.series.push(klineSeriesOption);
    }

    if (volumeSeriesIndex !== undefined && volumeSeriesIndex >= 0) {
        // 更新现有成交量系列
        if (newOptions.series) {
            newOptions.series[volumeSeriesIndex] = volumeSeriesOption;
        }
    } else {
        // 添加新的成交量系列
        if (!newOptions.series) {
            newOptions.series = [];
        }
        newOptions.series.push(volumeSeriesOption);
    }
    return newOptions;
}

// 设置指标数据
export function setIndicatorData(options: Highcharts.Options, indicatorData: Record<IndicatorKeyStr, number[][]>): Highcharts.Options {
    const newOptions = { ...options };
    if (!newOptions.series) {
        newOptions.series = [];
    }
    
    // 循环indicatorData，将指标数据添加到options中
    Object.keys(indicatorData).forEach(key => {
        // 将string类型的key转换为IndicatorCacheKey类型
        const indicatorCacheKey = parseKey(key) as IndicatorKey;
        // 获取指标图表中的数据系列配置
        const indicatorSeriesConfig = getIndicatorChartConfig(indicatorCacheKey);
        
        if (indicatorSeriesConfig) {
            // 检查是否已存在该指标系列
            const seriesIndex = newOptions.series?.findIndex(s => s.id === indicatorSeriesConfig.id);
            
            if (seriesIndex !== undefined && seriesIndex >= 0) {
                // 更新现有指标系列
                if (newOptions.series) {
                    newOptions.series[seriesIndex] = { 
                        ...indicatorSeriesConfig, 
                        data: indicatorData[key] 
                    };
                }
            } else {
                // 添加新的指标系列
                newOptions.series?.push({ 
                    ...indicatorSeriesConfig, 
                    data: indicatorData[key] 
                });
            }
        }
    });
    
    return newOptions;
}

// 图表配置工厂函数
export function createChartOptions(
    klineCacheKey: KlineKeyStr,
    initialKlineData: number[][], 
    initialIndicatorData: Record<IndicatorKeyStr, number[][]>
): Highcharts.Options {
    let options = getBaseChartOptions();
    
    // 设置K线数据（如果有）
    if (initialKlineData && initialKlineData.length > 0) {
        options = setKlineData(options, initialKlineData, klineCacheKey);
    }
    
    // 设置指标数据（如果有）
    if (Object.keys(initialIndicatorData).length > 0) {
        options = setIndicatorData(options, initialIndicatorData);
    }
    
    return options;
}