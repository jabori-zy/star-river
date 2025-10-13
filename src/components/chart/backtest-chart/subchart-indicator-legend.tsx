import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useIndicatorLegend } from "@/hooks/chart/backtest-chart/use-indicator-legend";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "./backtest-chart-store";
import { IndicatorLegend } from "./indicator-legend";

interface SubchartIndicatorLegendProps {
	chartId: number;
	indicatorKeyStr: IndicatorKeyStr;
}

/**
 * 🔑 优化后的子图指标 Legend 组件
 * 使用 React Portal 而不是 createRoot，简化渲染流程
 */
export function SubchartIndicatorLegend({
	chartId,
	indicatorKeyStr,
}: SubchartIndicatorLegendProps) {
	const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
		null,
	);
	const { 
		getSubChartPaneRef,
		getPaneVersion,
		getSubChartPaneHtmlElementRef,
		subChartPaneHtmlElementRef,
		chartRef,
		indicatorSeriesRef,
	} = useBacktestChartStore(chartId);

	const indicatorSeriesMap = indicatorSeriesRef[indicatorKeyStr] || {};

	// 🔑 获取当前的 pane 版本号，用于监听 pane 变化
	const paneVersion = getPaneVersion();

	// 🔑 获取 legend 数据和事件处理器
	const { legendData, onCrosshairMove, onSeriesDataUpdate } = useIndicatorLegend({
		chartId,
		indicatorKeyStr,
	});

	// 🔑 延迟订阅图表事件，确保图表完全初始化
	useEffect(() => {
		if (!chartRef || !onCrosshairMove) {
			return;
		}

		chartRef.subscribeCrosshairMove(onCrosshairMove);

		return () => {
			chartRef.unsubscribeCrosshairMove(onCrosshairMove);
		};
	}, [chartRef, indicatorKeyStr, onCrosshairMove]);

	useEffect(() => {
		const seriesList = Object.values(indicatorSeriesMap).filter(
			(seriesRef): seriesRef is NonNullable<typeof seriesRef> => Boolean(seriesRef),
		);

		if (seriesList.length === 0) {
			return;
		}

		seriesList.forEach((seriesRef) => {
			seriesRef.subscribeDataChanged(onSeriesDataUpdate);
		});

		return () => {
			seriesList.forEach((seriesRef) => {
				seriesRef.unsubscribeDataChanged(onSeriesDataUpdate);
			});
		};
	}, [indicatorSeriesMap, onSeriesDataUpdate]);

	// 🔑 创建 Portal 容器，响应 paneRef 的变化
	useEffect(() => {
		// 当pane被删除时版本号会变化，触发重新创建容器
		void paneVersion; // 引用paneVersion以消除ESLint警告
		void subChartPaneHtmlElementRef; // 引用subChartPaneHtmlElementRef以消除ESLint警告

		const createPortalContainer = () => {
			const paneRef = getSubChartPaneRef(indicatorKeyStr);

			if (!paneRef) {
				// 如果 pane 还没准备好，稍后重试
				setTimeout(createPortalContainer, 100);
				return;
			}

			setTimeout(() => {
				// console.log("subChartPaneHtmlElementRef", subChartPaneHtmlElementRef);
				const htmlElement = getSubChartPaneHtmlElementRef(indicatorKeyStr);
				if (!htmlElement) {
					console.warn(`无法获取子图 HTML 元素: ${indicatorKeyStr}`);
					return;
				}

				// 查找包含 canvas 元素的 div
				const canvasContainer = htmlElement.querySelector(
					'div[style*="width: 100%"][style*="height: 100%"][style*="position: relative"][style*="overflow: hidden"]',
				) as HTMLDivElement;

				if (!canvasContainer) {
					console.warn(`无法找到 canvas 容器元素: ${indicatorKeyStr}`);
					return;
				}

				// 检查是否已经存在容器
				let container = canvasContainer.querySelector(
					`[data-legend-key="${indicatorKeyStr}"]`,
				) as HTMLDivElement;

				if (!container) {
					// 创建 Portal 容器
					container = document.createElement("div");
					container.style.position = "absolute";
					container.style.top = "4px";
					container.style.left = "0px";
					container.style.zIndex = "10";
					container.style.pointerEvents = "auto";
					container.style.width = "100%";
					container.setAttribute("data-legend-key", indicatorKeyStr);

					canvasContainer.appendChild(container);
				}

				setPortalContainer(container);
			}, 50);
		};

		createPortalContainer();
		

		// 清理函数
		return () => {
			// 使用闭包捕获当前的 portalContainer 值
			setPortalContainer((currentContainer) => {
				if (currentContainer?.parentNode) {
					currentContainer.parentNode.removeChild(currentContainer);
				}
				return null;
			});
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [indicatorKeyStr, getSubChartPaneRef, paneVersion, getSubChartPaneHtmlElementRef, subChartPaneHtmlElementRef]); // 依赖 paneVersion，当 pane 被删除时会重新创建容器

	// 🔑 使用 Portal 渲染，简单直接
	if (!portalContainer || !legendData) {
		return null;
	}

	return createPortal(
		<IndicatorLegend
			indicatorLegendData={legendData}
			indicatorKeyStr={indicatorKeyStr}
			chartId={chartId}
		/>,
		portalContainer,
	);
}
