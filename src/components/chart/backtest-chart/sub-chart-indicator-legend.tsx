import type { SingleValueData, MouseEventParams, IChartApi } from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import type { PaneApiRef } from "lightweight-charts-react-components";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { IndicatorLegend, useIndicatorLegend } from "./legend";
import { useImperativeHandle, forwardRef, useState, useEffect, useRef } from "react";

interface SubChartIndicatorLegendProps {
	indicatorKeyStr: IndicatorKeyStr;
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>;
	paneRef: React.RefObject<PaneApiRef | null>; // pane的ref，用于获取HTML元素
	paneInitialized: boolean; // pane是否已经完全初始化
	chartConfig: BacktestChartConfig; // 新增图表配置
	chartApiRef?: React.RefObject<IChartApi | null>; // 图表API引用
}

export interface SubChartIndicatorLegendRef {
	onCrosshairMove: (param: MouseEventParams) => void;
}

/**
 * 子图指标图例组件
 * 单独的组件确保hooks在正确的位置调用
 */
const SubChartIndicatorLegend = forwardRef<SubChartIndicatorLegendRef, SubChartIndicatorLegendProps>(({
	indicatorKeyStr,
	data,
	paneRef,
	paneInitialized,
	chartConfig,
	chartApiRef,
}, ref) => {
	const { legendData, onCrosshairMove: indicatorOnCrosshairMove } = useIndicatorLegend(indicatorKeyStr, data);
	const [paneElement, setPaneElement] = useState<HTMLElement | null>(null);
	const legendRef = useRef<HTMLDivElement>(null);

	// 暴露onCrosshairMove方法给父组件
	useImperativeHandle(ref, () => ({
		onCrosshairMove: indicatorOnCrosshairMove,
	}), [indicatorOnCrosshairMove]);

	// 监听paneInitialized状态，只有在pane完全初始化后才获取HTML元素
	useEffect(() => {
		// 只有在pane初始化完成后才开始获取HTML元素
		if (!paneInitialized) {
			return;
		}

		let isMounted = true;
		let retryTimer: NodeJS.Timeout | null = null;
		let retryCount = 0;
		const maxRetries = 20; // 最大重试次数

		const updatePaneElement = () => {
			if (!isMounted || !paneRef.current) return;

			try {
				// 通过paneRef.current.api()获取paneApi
				const paneApi = paneRef.current.api();

				if (paneApi && typeof paneApi.getHTMLElement === 'function') {
					const htmlElement = paneApi.getHTMLElement();

					if (htmlElement && isMounted) {
						// 验证HTML元素是否有效
						const rect = htmlElement.getBoundingClientRect();

						// 检查元素是否有有效的尺寸和位置
						if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0) {
							setPaneElement(htmlElement);
							return; // 成功获取，停止重试
						} else {
							console.warn(`⚠️ pane HTML元素尺寸或位置无效，继续重试:`, {
								indicatorKeyStr,
								rect: {
									top: rect.top,
									left: rect.left,
									width: rect.width,
									height: rect.height
								}
							});
						}
					}
				}

				// 如果没有获取到有效元素，进行重试
				retryCount++;
				if (retryCount < maxRetries) {
					const retryDelay = Math.min(50 + retryCount * 10, 200); // 递增延迟，最大200ms
					retryTimer = setTimeout(() => {
						if (isMounted) {
							updatePaneElement();
						}
					}, retryDelay);
				} else {
					console.error(`❌ 达到最大重试次数(${maxRetries})，放弃获取pane HTML元素:`, indicatorKeyStr);
				}

			} catch (error) {
				console.error(`获取pane HTML元素失败:`, error);

				// 即使出错也要重试
				retryCount++;
				if (retryCount < maxRetries) {
					retryTimer = setTimeout(() => {
						if (isMounted) {
							updatePaneElement();
						}
					}, 100);
				}
			}
		};

		// pane已经初始化，立即尝试获取HTML元素
		updatePaneElement();

		return () => {
			isMounted = false;
			if (retryTimer) {
				clearTimeout(retryTimer);
			}
		};
	}, [paneInitialized, paneRef, indicatorKeyStr]);

	// 基于pane元素计算legend的位置，并实时监听位置变化
	useEffect(() => {
		if (!paneElement || !legendRef.current) return;

		let isMounted = true;
		let updateTimer: NodeJS.Timeout | null = null;

		const updatePosition = () => {
			if (!isMounted || !paneElement || !legendRef.current) return;

			try {
				const paneRect = paneElement.getBoundingClientRect();
				const legendElement = legendRef.current;

				// 严格验证pane位置是否有效
				if (paneRect.width <= 0 || paneRect.height <= 0) {
					console.warn(`⚠️ pane尺寸无效，跳过位置更新:`, {
						indicatorKeyStr,
						rect: {
							top: paneRect.top,
							left: paneRect.left,
							width: paneRect.width,
							height: paneRect.height
						}
					});
					return;
				}

				// 验证pane是否在合理的视口位置
				if (paneRect.top < -100 || paneRect.left < -100 ||
					paneRect.top > window.innerHeight + 100 ||
					paneRect.left > window.innerWidth + 100) {
					console.warn(`⚠️ pane位置超出合理范围，可能还未正确渲染:`, {
						indicatorKeyStr,
						rect: {
							top: paneRect.top,
							left: paneRect.left,
							width: paneRect.width,
							height: paneRect.height
						},
						viewport: {
							width: window.innerWidth,
							height: window.innerHeight
						}
					});
					return;
				}

				// 设置legend相对于pane的固定位置
				legendElement.style.position = 'fixed';
				legendElement.style.top = `${paneRect.top + 8}px`;
				legendElement.style.left = `${paneRect.left + 8}px`;
				legendElement.style.zIndex = '1000';
			} catch (error) {
				console.error(`位置更新失败:`, error);
			}
		};

		// 防抖的位置更新函数
		const debouncedUpdatePosition = () => {
			if (updateTimer) {
				clearTimeout(updateTimer);
			}
			updateTimer = setTimeout(() => {
				if (isMounted) {
					updatePosition();
				}
			}, 16); // 约60fps的更新频率
		};

		// 延迟一点时间再更新位置，确保pane完全渲染
		const initialTimer = setTimeout(updatePosition, 100);

		// 使用ResizeObserver监听pane元素大小和位置变化
		let resizeObserver: ResizeObserver | null = null;
		if (window.ResizeObserver) {
			resizeObserver = new ResizeObserver(debouncedUpdatePosition);
			resizeObserver.observe(paneElement);
		}

		// 使用IntersectionObserver监听pane元素的可见性变化
		let intersectionObserver: IntersectionObserver | null = null;
		if (window.IntersectionObserver) {
			intersectionObserver = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// 当pane变为可见时，更新位置
						debouncedUpdatePosition();
					}
				});
			}, {
				threshold: 0.1 // 当10%的pane可见时触发
			});
			intersectionObserver.observe(paneElement);
		}

		// 添加窗口resize监听作为备用
		const handleWindowResize = debouncedUpdatePosition;
		window.addEventListener('resize', handleWindowResize);

		// 添加滚动监听，处理容器滚动的情况
		const handleScroll = debouncedUpdatePosition;
		window.addEventListener('scroll', handleScroll, true); // 使用捕获模式监听所有滚动事件

		return () => {
			isMounted = false;
			clearTimeout(initialTimer);
			if (updateTimer) {
				clearTimeout(updateTimer);
			}

			// 清理ResizeObserver
			if (resizeObserver) {
				resizeObserver.disconnect();
			}

			// 清理IntersectionObserver
			if (intersectionObserver) {
				intersectionObserver.disconnect();
			}

			// 清理窗口监听
			window.removeEventListener('resize', handleWindowResize);
			window.removeEventListener('scroll', handleScroll, true);
		};
	}, [paneElement, indicatorKeyStr]);

	// 只有在成功获取到pane HTML元素时才渲染legend
	if (!paneElement) {
		return null;
	}

	// 添加错误边界保护
	if (!legendData) {
		return null;
	}

	return (
		<IndicatorLegend
			ref={legendRef}
			indicatorLegendData={legendData}
			indicatorKeyStr={indicatorKeyStr}
			chartConfig={chartConfig}
			chartApiRef={chartApiRef}
		/>
	);
});

SubChartIndicatorLegend.displayName = 'SubChartIndicatorLegend';

export default SubChartIndicatorLegend;
