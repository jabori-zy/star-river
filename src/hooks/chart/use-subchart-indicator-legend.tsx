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

    const { getSubChartPaneRef } = useBacktestChartStore(chartId);
    const { legendData: rawLegendData } = useIndicatorLegend({ chartId, indicatorKeyStr });

    // 🔑 关键修复：使用 useState 管理 legend 数据，参考 kline-legend 的做法
    // 这样可以避免每次 rawLegendData 变化都触发重新渲染
    const [stableLegendData, setStableLegendData] = useState<IndicatorLegendData | null>(() => {
        return rawLegendData || null;
    });

    // 🔑 智能数据更新：只在数据真正变化时才更新，参考 kline-legend 的策略
    useEffect(() => {
        if (rawLegendData) {
            setStableLegendData((prev) => {
                // 只有在时间或关键数据不同时才更新，避免不必要的渲染
                const shouldUpdate = prev?.time !== rawLegendData.time || prev?.timeString !== rawLegendData.timeString;
                return shouldUpdate ? rawLegendData : prev;
            });
        } else {
            setStableLegendData(null);
        }
    }, [rawLegendData]);

    useEffect(() => {
        let isMounted = true;
        let retryCount = 0;
        const maxRetries = 10;

        // 🔑 关键修复：使用重试机制而不是固定延迟
        // 问题：原来使用固定的400ms延迟，但图表初始化时间不确定，可能导致Pane还未准备好
        // 解决：改为立即尝试 + 重试机制，确保在Pane准备好后能成功添加legend
        const tryAddLegend = () => {
            if (!isMounted) return;

            const paneRef = getSubChartPaneRef(indicatorKeyStr);

            // 🔑 关键检查：确保Pane引用存在且可用
            if (!paneRef || typeof paneRef.getHTMLElement !== 'function') {
                console.warn(`未找到子图 Pane 引用: ${indicatorKeyStr}, 重试次数: ${retryCount}`);

                // 🔑 关键重试逻辑：如果Pane未准备好，每200ms重试一次
                // 这解决了测试元素能显示但legend不显示的核心问题
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(tryAddLegend, 200); // 每200ms重试一次，比固定延迟更可靠
                }
                return;
            }

            try {
                const htmlElement = paneRef.getHTMLElement();
                console.log("Legend - htmlElement", htmlElement);

                // 🔑 关键检查：确保HTML元素已经创建
                // 即使Pane引用存在，HTML元素也可能还未创建完成
                if (!htmlElement) {
                    console.warn(`子图 Pane HTML 元素为 null: ${indicatorKeyStr}, 重试次数: ${retryCount}`);

                    // 🔑 关键重试：HTML元素未准备好时也需要重试
                    // 这确保了DOM完全初始化后才添加legend
                    if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(tryAddLegend, 200);
                    }
                    return;
                }

                console.log(`Legend - 准备在子图中添加指标 legend: ${indicatorKeyStr}`, {
                    tagName: htmlElement.tagName,
                    className: htmlElement.className,
                    retryCount: retryCount
                });

                // 查找正确的容器 - 寻找具有 position: relative 的 div
                let targetContainer = htmlElement;
                console.log("Legend - targetContainer (初始)", targetContainer);

                // 如果当前元素是 td，查找其中的 div 容器
                if (htmlElement.tagName.toLowerCase() === 'td') {
                    const divContainer = htmlElement.querySelector('div[style*="position: relative"]');
                    if (divContainer) {
                        targetContainer = divContainer as HTMLElement;
                        console.log(`Legend - 找到子图目标容器:`, targetContainer);
                    } else {
                        console.warn(`Legend - 未找到具有 position: relative 的 div 容器: ${indicatorKeyStr}`);
                    }
                }
                
                // 确保目标容器有相对定位
                if (targetContainer.style.position !== 'relative') {
                    targetContainer.style.position = 'relative';
                }

                // 创建安全的CSS类名标识符（移除特殊字符）
                const safeIndicatorId = indicatorKeyStr.replace(/[^a-zA-Z0-9-_]/g, '-');

                // 移除已存在的同名指标容器
                const existingContainer = targetContainer.querySelector(`.indicator-legend-${safeIndicatorId}`);
                if (existingContainer) {
                    existingContainer.remove();
                }

                // 为当前指标创建专用容器，直接添加到目标容器中
                const indicatorContainer = document.createElement('div');
                indicatorContainer.className = `indicator-legend-${safeIndicatorId}`;
                indicatorContainer.setAttribute('data-indicator-key', indicatorKeyStr); // 保存原始key用于识别
                indicatorContainer.style.cssText = `
                    position: absolute;
                    top: 6px;
                    left: 0px;
                    z-index: 100;
                    pointer-events: auto;
                    width: 100%;
                `;

                targetContainer.appendChild(indicatorContainer);
                containerRef.current = indicatorContainer;

                // 创建 React root（渲染逻辑移到单独的 effect 中）
                if (!rootRef.current && isMounted) {
                    rootRef.current = createRoot(indicatorContainer);
                }

                console.log(`✅ 子图指标 legend 已添加: ${indicatorKeyStr}`, {
                    targetContainer,
                    indicatorContainer
                });

            } catch (error) {
                console.error(`添加子图指标 legend 失败: ${indicatorKeyStr}`, error);
            }
        };

        // 🔑 关键执行：立即开始尝试，而不是等待固定延迟
        // 原来：setTimeout(callback, 400) - 固定延迟，可能过早或过晚
        // 现在：立即尝试 + 智能重试 - 响应更快，成功率更高
        tryAddLegend();

        // 清理函数
        return () => {
            isMounted = false;

            // 异步清理 React root，避免同步卸载导致的竞态条件
            if (rootRef.current) {
                const currentRoot = rootRef.current;
                rootRef.current = null;

                // 使用 setTimeout 异步卸载
                setTimeout(() => {
                    try {
                        currentRoot.unmount();
                    } catch (error) {
                        console.warn(`清理子图指标 legend 失败: ${indicatorKeyStr}`, error);
                    }
                }, 0);
            }

            if (containerRef.current?.parentNode) {
                containerRef.current.parentNode.removeChild(containerRef.current);
                containerRef.current = null;
            }
        };
    }, [indicatorKeyStr, getSubChartPaneRef]);

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
