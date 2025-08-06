import { useRef, useEffect, useMemo, useCallback } from "react";
import type { IChartApi } from "lightweight-charts";
import { chartOptions } from "./chart-config";
import { useBacktestChart } from "@/hooks/chart";
import { useIndicatorLegend } from "@/hooks/chart";
import { SubchartIndicatorLegend } from "./subchart-indicator-legend";
import { KlineLegend } from "./kline-legend";
import { IndicatorLegend } from "./indicator-legend";
import { useBacktestChartStore } from "./backtest-chart-store";
import IndicatorDebugPanel from "./debug/indicator-debug-panel";


interface BacktestChartNewProps {
    strategyId: number;
    chartId: number
}

// 将主图指标图例组件提取到外部，避免在渲染时重新创建
interface MainChartIndicatorLegendProps {
    chartId: number;
    indicatorKeyStr: string;
    index: number;
}

const MainChartIndicatorLegend = ({ chartId, indicatorKeyStr, index }: MainChartIndicatorLegendProps) => {
    const { legendData: indicatorLegendData, onCrosshairMove } = useIndicatorLegend({
        chartId,
        indicatorKeyStr,
    });

    // 获取图表API引用 - 使用 useMemo 稳定引用
    const { getChartRef } = useBacktestChartStore(chartId);
    
    // 稳定的图表引用
    const chartRef = useMemo(() => getChartRef(), [getChartRef]);

    // 🔑 为主图指标订阅鼠标事件
    useEffect(() => {
        const chart = chartRef;
        if (!chart || !onCrosshairMove) return;

        // 订阅鼠标移动事件
        chart.subscribeCrosshairMove(onCrosshairMove);

        return () => {
            // 清理订阅
            chart.unsubscribeCrosshairMove(onCrosshairMove);
        };
    }, [chartRef, onCrosshairMove]);

    return (
        <IndicatorLegend
            indicatorLegendData={indicatorLegendData}
            indicatorKeyStr={indicatorKeyStr}
            chartId={chartId}
            style={{
                // 主图指标：从40px开始，每个间隔30px
                top: `${40 + index * 30}px`,
                left: '0px',
            }}
        />
    );
};

const BacktestChartNew = ({ strategyId, chartId }: BacktestChartNewProps) => {

    // 图表容器的引用
    const chartContainerRef = useRef<HTMLDivElement>(null);

    // 图表API引用，用于调试面板
    const chartApiRef = useRef<IChartApi | null>(null);

    // 使用 backtest chart hooks
    const { chartConfig, klineLegendData: legendData } = useBacktestChart({
        strategyId,
        chartId,
        chartContainerRef,
        chartOptions,
    });

    // 获取图表API引用 - 使用稳定的引用
    const { getChartRef } = useBacktestChartStore(chartId);
    
    // 使用 useCallback 稳定函数引用
    const updateChartApiRef = useCallback(() => {
        const chartApi = getChartRef();
        if (chartApi && chartApiRef.current !== chartApi) {
            chartApiRef.current = chartApi;
        }
    }, [getChartRef]);

    // 更新chartApiRef
    useEffect(() => {
        updateChartApiRef();
    }, [updateChartApiRef]);

	return (
        <div className="relative w-full h-full">
            {/* 图表容器div */}
            <div ref={chartContainerRef} id="chart-container" className="w-full h-full" />

            {/* K线图例 */}
            <KlineLegend
                klineSeriesData={legendData}
                klineKeyStr={chartConfig.klineChartConfig.klineKeyStr}
                chartId={chartId}
            />

            {/* 主图指标图例 */}
            {chartConfig.indicatorChartConfigs
                .filter(indicatorConfig => indicatorConfig.isInMainChart)
                .map((indicatorConfig, index) => (
                    <MainChartIndicatorLegend 
                        key={indicatorConfig.indicatorKeyStr}
                        chartId={chartId}
                        indicatorKeyStr={indicatorConfig.indicatorKeyStr}
                        index={index}
                    />
                ))}

            {/* 子图指标图例 - 使用 Portal 方式渲染到对应的 Pane 中 */}
            {chartConfig.indicatorChartConfigs
                .filter(config => !config.isInMainChart)
                .map((indicatorConfig) => (
                    <SubchartIndicatorLegend
                        key={indicatorConfig.indicatorKeyStr}
                        chartId={chartId}
                        indicatorKeyStr={indicatorConfig.indicatorKeyStr}
                    />
                ))}

            {/* 调试面板 */}
            <IndicatorDebugPanel
                chartConfig={chartConfig}
                chartApiRef={chartApiRef}
            />
        </div>
    );
};

export default BacktestChartNew;