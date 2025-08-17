import { useEffect, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { useBacktestStatsChartStore } from "@/components/chart/backtest-stats-chart/backtest-stats-chart-store";
import { StatsLegend } from "@/components/chart/backtest-stats-chart/stats-legend";
import { useBacktestStatsChartConfigStore } from "@/store/use-backtest-stats-chart-config-store";
import type { StrategyStatsChartConfig } from "@/types/chart/backtest-strategy-stats-chart";
import type { StatsLegendData } from "./use-stats-legend";
import { useStatsLegend } from "./use-stats-legend";

interface UseSubchartStatsLegendProps {
	strategyId: number;
	statsChartConfig: StrategyStatsChartConfig;
}

/**
 * 用于在子图 Pane 中渲染统计 legend 的 hook
 */
export function useSubchartStatsLegend({
	strategyId,
	statsChartConfig,
}: UseSubchartStatsLegendProps) {
	const rootRef = useRef<Root | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const { getStatsPaneRef, getChartRef } = useBacktestStatsChartStore(
		strategyId,
		{ statsChartConfigs: [statsChartConfig] },
	);
	const { statsLegendData, onCrosshairMove } = useStatsLegend({
		strategyId,
		statsChartConfig,
	});
	
	// 获取配置store以监听可见性变化
	const { getStatsVisibility } = useBacktestStatsChartConfigStore();
	console.log("statsChartConfig", statsChartConfig)
	const statsName = statsChartConfig.seriesConfigs.statsName;
	const isVisible = getStatsVisibility(statsName);

	// 使用 useState 管理 legend 数据，参考 indicator-legend 的做法
	const [stableLegendData, setStableLegendData] =
		useState<StatsLegendData | null>(() => {
			return statsLegendData || null;
		});

	// 智能数据更新：只在数据真正变化时才更新，避免闪烁
	useEffect(() => {
		if (statsLegendData) {
			setStableLegendData((prev) => {
				if (!prev) return statsLegendData;

				// 深度比较数据内容，避免不必要的更新
				const timeChanged = prev.time !== statsLegendData.time;
				const nameChanged = prev.displayName !== statsLegendData.displayName;
				const valueChanged = prev.value !== statsLegendData.value;
				const colorChanged = prev.color !== statsLegendData.color;

				// 只有在真正有内容变化时才更新
				const shouldUpdate = nameChanged || valueChanged || colorChanged;

				// 如果只是时间变化但内容相同，不更新（避免闪烁）
				if (timeChanged && !shouldUpdate) {
					return prev;
				}

				return shouldUpdate ? statsLegendData : prev;
			});
		} else {
			setStableLegendData(null);
		}
	}, [statsLegendData]);

	// 订阅图表的鼠标移动事件，确保统计 legend 数据能够更新
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

	// 只在组件挂载时创建 legend 容器，避免重复创建
	useEffect(() => {
		// 如果已经有容器了，不要重复创建
		if (rootRef.current || containerRef.current) {
			return;
		}

		const statsName = statsChartConfig.seriesConfigs.statsName;

		const tryAddLegend = () => {
			// 获取子图Pane的引用
			const paneRef = getStatsPaneRef(statsName);
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
						console.warn(`无法获取子图 HTML 元素: ${statsName}`);
						return;
					}

					// 查找包含 canvas 元素的 div
					const canvasContainer = htmlElement.querySelector(
						'div[style*="width: 100%"][style*="height: 100%"][style*="position: relative"][style*="overflow: hidden"]',
					) as HTMLDivElement;

					if (!canvasContainer) {
						console.warn(`无法找到 canvas 容器元素: ${statsName}`);
						return;
					}

					// 检查是否已经存在我们的 legend 容器
					const existingLegend = canvasContainer.querySelector(
						`[data-stats-legend-key="${statsName}"]`,
					);
					if (existingLegend) {
						console.warn(`Stats Legend 容器已存在，清理旧容器: ${statsName}`);
						existingLegend.remove();
					}

					// 创建 legend 容器
					const legendContainer = document.createElement("div");
					legendContainer.style.position = "absolute";
					legendContainer.style.top = "0px";
					legendContainer.style.left = "0px";
					legendContainer.style.zIndex = "10";
					legendContainer.style.pointerEvents = "auto";
					legendContainer.style.width = "100%";
					// 添加标识符，防止重复创建
					legendContainer.setAttribute("data-stats-legend-key", statsName);

					// 将容器添加到包含 canvas 的 div 中
					canvasContainer.appendChild(legendContainer);

					// 保存容器引用
					containerRef.current = legendContainer;

					// 创建 React root
					const root = createRoot(legendContainer);
					rootRef.current = root;

					console.log(`成功创建子图 stats legend 容器: ${statsName}`);
				}, 100);
			} catch (error) {
				console.error(`添加子图统计 legend 失败: ${statsName}`, error);
			}
		};

		// 开始尝试创建 legend
		tryAddLegend();

		// 清理函数：只在组件卸载时清理
		return () => {
			const statsName = statsChartConfig.seriesConfigs.statsName;
			console.log(`清理子图 stats legend: ${statsName}`);

			// 清理 React root
			if (rootRef.current) {
				const currentRoot = rootRef.current;
				rootRef.current = null;

				setTimeout(() => {
					try {
						currentRoot.unmount();
					} catch (error) {
						console.warn(
							`清理子图统计 legend root 失败: ${statsName}`,
							error,
						);
					}
				}, 0);
			}

			// 清理 DOM 容器
			if (containerRef.current?.parentNode) {
				containerRef.current.parentNode.removeChild(containerRef.current);
				containerRef.current = null;
			}
		};
	}, [statsChartConfig, getStatsPaneRef]);

	// 防抖渲染逻辑：减少频繁重新渲染，避免闪烁
	useEffect(() => {
		if (!rootRef.current || !stableLegendData || !isVisible) return;

		// 使用 requestAnimationFrame 来优化渲染时机
		const renderFrame = requestAnimationFrame(() => {
			if (!rootRef.current) return;

			try {
				rootRef.current.render(
					<StatsLegend
						statsLegendData={stableLegendData}
					/>,
				);
			} catch (error) {
				const statsName = statsChartConfig.seriesConfigs.statsName;
				console.warn(`更新子图统计 legend 数据失败: ${statsName}`, error);
			}
		});

		// 清理函数：取消待执行的渲染
		return () => {
			cancelAnimationFrame(renderFrame);
		};
	}, [stableLegendData, statsChartConfig, isVisible]);

	return {
		// 可以返回一些状态或方法，目前暂时为空
	};
}