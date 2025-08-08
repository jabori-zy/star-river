import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useIndicatorLegend } from "@/hooks/chart/use-indicator-legend";
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
	const { getSubChartPaneRef, getChartRef, getPaneVersion } = useBacktestChartStore(chartId);

	// 🔑 获取当前的 pane 版本号，用于监听 pane 变化
	const paneVersion = getPaneVersion();

	// 🔑 获取 legend 数据和事件处理器
	const { legendData, onCrosshairMove } = useIndicatorLegend({
		chartId,
		indicatorKeyStr,
	});

	// 🔑 延迟订阅图表事件，确保图表完全初始化
	useEffect(() => {
		// 使用 setTimeout 确保在图表完全初始化后再订阅
		const timer = setTimeout(() => {
			const chart = getChartRef();
			// 确保图表存在、回调函数存在、并且有legend数据
			if (!chart || !onCrosshairMove || !legendData) return;
			// 直接订阅图表的鼠标移动事件
			chart.subscribeCrosshairMove(onCrosshairMove);
		}, 10); // 延迟150ms，确保图表初始化完成

		return () => {
			clearTimeout(timer);
			const chart = getChartRef();
			if (chart && onCrosshairMove) {
				chart.unsubscribeCrosshairMove(onCrosshairMove);
			}
		};
	}, [getChartRef, onCrosshairMove, legendData]); // 添加legendData作为依赖

	// 🔑 创建 Portal 容器，响应 paneRef 的变化
	useEffect(() => {
		// 当pane被删除时版本号会变化，触发重新创建容器
		void paneVersion; // 引用paneVersion以消除ESLint警告

		const createPortalContainer = () => {
			const paneRef = getSubChartPaneRef(indicatorKeyStr);

			if (!paneRef) {
				// 如果 pane 还没准备好，稍后重试
				setTimeout(createPortalContainer, 100);
				return;
			}

			setTimeout(() => {
				const htmlElement = paneRef.getHTMLElement();
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
			}, 0);
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
	}, [indicatorKeyStr, getSubChartPaneRef, paneVersion]); // 依赖 paneVersion，当 pane 被删除时会重新创建容器

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
