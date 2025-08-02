import type { SingleValueData, MouseEventParams } from "lightweight-charts";
import type { IndicatorValueConfig } from "@/types/indicator/schemas";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import type { PaneApiRef } from "lightweight-charts-react-components";
import { IndicatorLegend, useIndicatorLegend } from "./legend";
import { useImperativeHandle, forwardRef, useState, useEffect, useRef } from "react";

interface SubChartIndicatorLegendProps {
	indicatorKeyStr: IndicatorKeyStr;
	data: Record<keyof IndicatorValueConfig, SingleValueData[]>;
	paneRef: React.RefObject<PaneApiRef | null>; // pane的ref，用于获取HTML元素
	paneInitialized: boolean; // pane是否已经完全初始化
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
			console.log(`⏳ 等待pane初始化完成:`, indicatorKeyStr);
			return;
		}

		let isMounted = true;
		let retryTimer: NodeJS.Timeout | null = null;

		const updatePaneElement = () => {
			if (!isMounted || !paneRef.current) return;

			try {
				// 通过paneRef.current.api()获取paneApi
				const paneApi = paneRef.current.api();

				if (paneApi && typeof paneApi.getHTMLElement === 'function') {
					const htmlElement = paneApi.getHTMLElement();

					if (htmlElement && isMounted) {
						console.log(`✅ 成功获取pane HTML元素 (pane已初始化):`, {
							indicatorKeyStr,
							element: htmlElement.tagName,
							rect: htmlElement.getBoundingClientRect()
						});
						setPaneElement(htmlElement);
						return; // 成功获取，停止重试
					}
				}

				// 如果没有获取到元素，快速重试（因为pane已经初始化，应该很快能获取到）
				console.log(`⏳ pane已初始化但未获取到HTML元素，50ms后重试:`, indicatorKeyStr);
				retryTimer = setTimeout(() => {
					if (isMounted) {
						updatePaneElement();
					}
				}, 50);

			} catch (error) {
				console.error(`获取pane HTML元素失败:`, error);

				// 即使出错也要重试
				retryTimer = setTimeout(() => {
					if (isMounted) {
						updatePaneElement();
					}
				}, 100);
			}
		};

		// pane已经初始化，立即尝试获取HTML元素
		console.log(`🎯 pane已初始化，开始获取HTML元素:`, indicatorKeyStr);
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

		const updatePosition = () => {
			if (!isMounted || !paneElement || !legendRef.current) return;

			try {
				const paneRect = paneElement.getBoundingClientRect();
				const legendElement = legendRef.current;

				// 验证pane位置是否有效
				if (paneRect.width === 0 || paneRect.height === 0) {
					console.warn(`⚠️ pane尺寸无效，跳过位置更新:`, {
						indicatorKeyStr,
						rect: paneRect
					});
					return;
				}

				// 验证pane是否在视口内
				if (paneRect.top < 0 || paneRect.left < 0) {
					console.warn(`⚠️ pane位置异常，可能还未正确渲染:`, {
						indicatorKeyStr,
						rect: paneRect
					});
				}

				// 设置legend相对于pane的固定位置
				legendElement.style.position = 'fixed';
				legendElement.style.top = `${paneRect.top + 8}px`;
				legendElement.style.left = `${paneRect.left + 8}px`;
				legendElement.style.zIndex = '1000';

				console.log(`📍 更新legend位置:`, {
					indicatorKeyStr,
					paneRect: {
						top: paneRect.top,
						left: paneRect.left,
						width: paneRect.width,
						height: paneRect.height
					},
					legendPosition: {
						top: paneRect.top + 8,
						left: paneRect.left + 8
					}
				});
			} catch (error) {
				console.error(`位置更新失败:`, error);
			}
		};

		// 延迟一点时间再更新位置，确保pane完全渲染
		const initialTimer = setTimeout(updatePosition, 50);

		// 使用ResizeObserver监听pane元素大小和位置变化
		let resizeObserver: ResizeObserver | null = null;
		if (window.ResizeObserver) {
			resizeObserver = new ResizeObserver(() => {
				// 添加防抖，避免频繁更新
				setTimeout(() => {
					if (isMounted) {
						updatePosition();
					}
				}, 10);
			});
			resizeObserver.observe(paneElement);
		}

		// 添加窗口resize监听作为备用
		const handleWindowResize = () => {
			setTimeout(updatePosition, 50);
		};
		window.addEventListener('resize', handleWindowResize);

		return () => {
			isMounted = false;
			clearTimeout(initialTimer);

			// 清理ResizeObserver
			if (resizeObserver) {
				resizeObserver.disconnect();
			}

			// 清理窗口监听
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [paneElement, indicatorKeyStr]);

	// 只有在成功获取到pane HTML元素时才渲染legend
	if (!paneElement) {
		console.log(`⏳ 等待pane HTML元素，暂不渲染legend:`, indicatorKeyStr);
		return null;
	}

	return (
		<IndicatorLegend
			ref={legendRef}
			indicatorLegendData={legendData}
		/>
	);
});

SubChartIndicatorLegend.displayName = 'SubChartIndicatorLegend';

export default SubChartIndicatorLegend;
