/**
 * Pane 高度管理工具
 * 使用 IChartApi.panes() 方法动态管理主图和子图的高度
 */

import type { IChartApi } from 'lightweight-charts';

export interface PaneHeightConfig {
	mainPaneHeight: number; // 主图高度占比 (0-1)
	subPaneHeights: number[]; // 子图高度占比数组 (0-1)
}

/**
 * 根据子图数量计算各个 Pane 的高度占比
 * @param subChartCount 子图数量
 * @returns PaneHeightConfig 高度配置
 */
export function calculatePaneHeights(subChartCount: number): PaneHeightConfig {
	// 主图最小占比 50%
	const MIN_MAIN_PANE_RATIO = 0.5;

	let mainPaneHeight: number;
	let subPaneHeights: number[] = [];

	switch (subChartCount) {
		case 0:
			// 没有子图时，主图占100%
			mainPaneHeight = 1.0;
			break;

		case 1:
			// 1个子图时，主图80%，子图20%
			mainPaneHeight = 0.8;
			subPaneHeights = [0.2];
			break;

		case 2:
			// 2个子图时，主图70%，每个子图15%
			mainPaneHeight = 0.7;
			subPaneHeights = [0.15, 0.15];
			break;

		case 3: {
			// 3个子图时，主图60%，每个子图均分剩余40%
			mainPaneHeight = 0.6;
			const subPaneHeight = 0.4 / 3;
			subPaneHeights = [subPaneHeight, subPaneHeight, subPaneHeight];
			break;
		}

		default: {
			// 超过3个子图时，主图保持最小占比50%，子图均分剩余50%
			mainPaneHeight = MIN_MAIN_PANE_RATIO;
			const remainingHeight = 1 - MIN_MAIN_PANE_RATIO;
			const eachSubPaneHeight = remainingHeight / subChartCount;
			subPaneHeights = Array(subChartCount).fill(eachSubPaneHeight);
			break;
		}
	}

	return {
		mainPaneHeight,
		subPaneHeights,
	};
}

/**
 * 计算单个子图的高度（像素）
 * @param subChartIndex 子图索引（从0开始）
 * @param totalSubChartCount 总子图数量
 * @param containerHeight 容器总高度
 * @returns 子图高度（像素）
 */
export function calculateSubChartHeight(
	subChartIndex: number,
	totalSubChartCount: number,
	containerHeight: number
): number {
	const heightConfig = calculatePaneHeights(totalSubChartCount);

	if (subChartIndex >= heightConfig.subPaneHeights.length) {
		// 如果索引超出范围，返回默认高度
		return ratioToPixels(0.1, containerHeight);
	}

	const heightRatio = heightConfig.subPaneHeights[subChartIndex];
	return ratioToPixels(heightRatio, containerHeight);
}

/**
 * 将占比转换为像素高度
 * @param ratio 高度占比 (0-1)
 * @param containerHeight 容器总高度（像素）
 * @returns 像素高度
 */
export function ratioToPixels(ratio: number, containerHeight: number): number {
	return Math.floor(ratio * containerHeight);
}

/**
 * 获取容器的实际高度
 * @param containerRef 容器引用
 * @returns 容器高度（像素），如果获取失败返回默认值400
 */
export function getContainerHeight(containerRef: React.RefObject<HTMLElement | null>): number {
	if (containerRef.current) {
		const rect = containerRef.current.getBoundingClientRect();
		return rect.height || 400;
	}
	return 400; // 默认高度
}

/**
 * 使用 ChartApi 和 setStretchFactor 应用高度配置到所有 Panes
 * @param chartApi Chart API 实例
 * @returns 是否成功应用高度配置
 */
export function applyPaneHeightsWithChartApi(
	chartApi: IChartApi
): boolean {
	try {
		// 获取所有 Panes
		const panes = chartApi.panes();
		console.log('🎯 panes', panes);

		if (panes.length === 0) {
			console.warn('没有找到任何 Panes');
			return false;
		}

		// 计算子图数量（总数减去主图）
		const subChartCount = panes.length - 1;

		// 计算高度配置
		const heightConfig = calculatePaneHeights(subChartCount);
		console.log('🎯 heightConfig', heightConfig);

		// 使用最小延迟确保在下一个事件循环中执行，减少闪烁
		setTimeout(() => {
			console.log('🎯 开始使用 setStretchFactor 设置 Pane 高度比例...');

			// 将比例转换为 stretch factor（乘以100便于理解为百分比）
			panes.forEach((pane, index) => {
				let stretchFactor: number;

				if (index === 0) {
					// 第一个 Pane 是主图
					stretchFactor = Math.round(heightConfig.mainPaneHeight * 100);
				} else {
					// 其他 Pane 是子图
					const subPaneIndex = index - 1;
					const ratio = heightConfig.subPaneHeights[subPaneIndex] || 0.1; // 默认 10%
					stretchFactor = Math.round(ratio * 100);
				}

				pane.setStretchFactor(stretchFactor);
				console.log(`✅ 设置 Pane ${index} (${index === 0 ? '主图' : '子图'}) stretchFactor: ${stretchFactor} (${stretchFactor}%)`);
			});

			// 验证设置结果
			setTimeout(() => {
				console.log('🔍 验证 setStretchFactor 设置结果:');
				panes.forEach((pane, index) => {
					const actualHeight = pane.getHeight();
					console.log(`Pane ${index}: 实际高度 ${actualHeight}px`);
				});
			}, 50); // 从 200ms 减少到 50ms
		}, 0); // 从 100ms 减少到 0ms

		// 调试输出
		if (process.env.NODE_ENV === 'development') {
			logPaneHeights(heightConfig, 0); // containerHeight 不再需要
		}

		return true;
	} catch (error) {
		console.error('应用 Pane 高度配置失败:', error);
		return false;
	}
}

/**
 * 自动应用 Pane 高度配置
 * @param chartApi Chart API 实例
 * @param containerRef 容器引用（现在不需要容器高度，保留参数以兼容现有调用）
 * @returns 是否成功应用高度配置
 */
export function autoApplyPaneHeights(
	chartApi: IChartApi | null,
	containerRef?: React.RefObject<HTMLElement | null>
): boolean {
	if (!chartApi) {
		console.warn('Chart API 未设置，无法应用高度配置');
		return false;
	}

	return applyPaneHeightsWithChartApi(chartApi);
}

/**
 * 调试用：打印高度配置信息
 * @param heightConfig 高度配置
 * @param containerHeight 容器高度
 */
export function logPaneHeights(heightConfig: PaneHeightConfig, containerHeight: number): void {
	console.log('=== Pane Height Configuration ===');
	console.log(`Container Height: ${containerHeight}px`);
	console.log(`Main Pane: ${(heightConfig.mainPaneHeight * 100).toFixed(1)}% (${ratioToPixels(heightConfig.mainPaneHeight, containerHeight)}px)`);
	
	heightConfig.subPaneHeights.forEach((ratio, index) => {
		console.log(`Sub Pane ${index + 1}: ${(ratio * 100).toFixed(1)}% (${ratioToPixels(ratio, containerHeight)}px)`);
	});
	console.log('================================');
}
