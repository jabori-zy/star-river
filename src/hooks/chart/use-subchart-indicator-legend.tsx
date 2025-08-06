import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { IndicatorLegend } from "@/components/chart/backtest-chart-new/indicator-legend";
import { useBacktestChartStore } from "@/components/chart/backtest-chart-new/backtest-chart-store";
import { useIndicatorLegend } from "./use-indicator-legend";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import type { IndicatorLegendData } from "./use-indicator-legend";

interface UseSubchartIndicatorLegendProps {
    chartId: number;
    indicatorKeyStr: IndicatorKeyStr;
}

/**
 * 用于在子图 Pane 中渲染指标 legend 的 hook
 */
export function useSubchartIndicatorLegend({
    chartId,
    indicatorKeyStr,
}: UseSubchartIndicatorLegendProps) {
    const rootRef = useRef<Root | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const { getSubChartPaneRef, getChartRef } = useBacktestChartStore(chartId);
    const { legendData: indicatorLegendData, onCrosshairMove } = useIndicatorLegend({ chartId, indicatorKeyStr });

    // 🔑 关键修复：使用 useState 管理 legend 数据，参考 kline-legend 的做法
    // 这样可以避免每次 rawLegendData 变化都触发重新渲染
    const [stableLegendData, setStableLegendData] = useState<IndicatorLegendData | null>(() => {
        return indicatorLegendData || null;
    });

    // 🔑 智能数据更新：只在数据真正变化时才更新，参考 kline-legend 的策略
    useEffect(() => {
        if (indicatorLegendData) {
            setStableLegendData((prev) => {
                // 只有在时间或关键数据不同时才更新，避免不必要的渲染
                const shouldUpdate = prev?.time !== indicatorLegendData.time || prev?.timeString !== indicatorLegendData.timeString;
                return shouldUpdate ? indicatorLegendData : prev;
            });
        } else {
            setStableLegendData(null);
        }
    }, [indicatorLegendData]);

    // 🔑 关键修复：订阅图表的鼠标移动事件，确保指标 legend 数据能够更新
    useEffect(() => {
        const chart = getChartRef();
        if (!chart || !onCrosshairMove) return;

        // 订阅鼠标移动事件
        chart.subscribeCrosshairMove(onCrosshairMove);

        // 清理函数：取消订阅
        return () => {
            chart.unsubscribeCrosshairMove(onCrosshairMove);
        };
    }, [getChartRef, onCrosshairMove]);

    // 🔑 关键修复：只在组件挂载时创建 legend 容器，避免重复创建
    useEffect(() => {
        // 如果已经有容器了，不要重复创建
        if (rootRef.current || containerRef.current) {
            return;
        }

        const tryAddLegend = () => {
            // 获取子图Pane的引用
            const paneRef = getSubChartPaneRef(indicatorKeyStr);
            // 如果子图Pane的引用不存在，则返回
            if (!paneRef) {
                // 如果 pane 还没准备好，稍后重试
                setTimeout(tryAddLegend, 100);
                return;
            }

            try {
                setTimeout(() => {
                    // 再次检查是否已经创建了容器（防止竞态条件）
                    if (rootRef.current || containerRef.current) {
                        return;
                    }

                    const htmlElement = paneRef.getHTMLElement();

                    if (!htmlElement) {
                        console.warn(`无法获取子图 HTML 元素: ${indicatorKeyStr}`);
                        return;
                    }

                    // 查找包含 canvas 元素的 div
                    const canvasContainer = htmlElement.querySelector('div[style*="width: 100%"][style*="height: 100%"][style*="position: relative"][style*="overflow: hidden"]') as HTMLDivElement;

                    if (!canvasContainer) {
                        console.warn(`无法找到 canvas 容器元素: ${indicatorKeyStr}`);
                        return;
                    }

                    // 检查是否已经存在我们的 legend 容器
                    const existingLegend = canvasContainer.querySelector(`[data-legend-key="${indicatorKeyStr}"]`);
                    if (existingLegend) {
                        console.warn(`Legend 容器已存在，清理旧容器: ${indicatorKeyStr}`);
                        existingLegend.remove();
                    }

                    // 创建 legend 容器
                    const legendContainer = document.createElement('div');
                    legendContainer.style.position = 'absolute';
                    legendContainer.style.top = '0px';
                    legendContainer.style.left = '0px';
                    legendContainer.style.zIndex = '10';
                    legendContainer.style.pointerEvents = 'auto';
                    legendContainer.style.width = '100%';
                    // 添加标识符，防止重复创建
                    legendContainer.setAttribute('data-legend-key', indicatorKeyStr);

                    // 将容器添加到包含 canvas 的 div 中
                    canvasContainer.appendChild(legendContainer);

                    // 保存容器引用
                    containerRef.current = legendContainer;

                    // 创建 React root
                    const root = createRoot(legendContainer);
                    rootRef.current = root;

                    console.log(`成功创建子图 legend 容器: ${indicatorKeyStr}`);
                }, 0);

            } catch (error) {
                console.error(`添加子图指标 legend 失败: ${indicatorKeyStr}`, error);
            }
        };

        // 开始尝试创建 legend
        tryAddLegend();

        // 清理函数：只在组件卸载时清理
        return () => {
            console.log(`清理子图 legend: ${indicatorKeyStr}`);

            // 清理 React root
            if (rootRef.current) {
                const currentRoot = rootRef.current;
                rootRef.current = null;

                setTimeout(() => {
                    try {
                        currentRoot.unmount();
                    } catch (error) {
                        console.warn(`清理子图指标 legend root 失败: ${indicatorKeyStr}`, error);
                    }
                }, 0);
            }

            // 清理 DOM 容器
            if (containerRef.current?.parentNode) {
                containerRef.current.parentNode.removeChild(containerRef.current);
                containerRef.current = null;
            }
        };
    }, [indicatorKeyStr, getSubChartPaneRef]); // 依赖 indicatorKeyStr 和 getSubChartPaneRef

    // 🔑 简化渲染逻辑：使用稳定的数据源，避免频繁重新渲染
    // 参考 kline-legend 的做法，stableLegendData 已经过滤了重复更新
    useEffect(() => {
        if (!rootRef.current || !stableLegendData) return;

        try {
            rootRef.current.render(
                <IndicatorLegend
                    indicatorLegendData={stableLegendData}
                    indicatorKeyStr={indicatorKeyStr}
                    chartId={chartId}
                />
            );
        } catch (error) {
            console.warn(`更新子图指标 legend 数据失败: ${indicatorKeyStr}`, error);
        }
    }, [stableLegendData, indicatorKeyStr, chartId]);

    return {
        // 可以返回一些状态或方法，目前暂时为空
    };
}
