import React, { useState, useCallback } from 'react';
import type { IChartApi } from 'lightweight-charts';
import { autoApplyPaneHeights } from '../utils/pane-height-manager';

interface ChartApiDebuggerProps {
	chartApiRef: React.RefObject<IChartApi | null>;
	containerRef: React.RefObject<HTMLElement | null>;
}

export const ChartApiDebugger: React.FC<ChartApiDebuggerProps> = ({
	chartApiRef,
	containerRef,
}) => {
	const [debugInfo, setDebugInfo] = useState<string>('');
	const [isRetrying, setIsRetrying] = useState<boolean>(false);

	// 获取容器高度
	const getContainerHeight = useCallback(() => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			return rect.height || 0;
		}
		return 0;
	}, [containerRef]);

	// 获取调试信息
	const getDebugInfo = useCallback(() => {
		const containerHeight = getContainerHeight();
		const chartApi = chartApiRef.current;

		let info = `📊 Chart API 调试信息:\n`;
		info += `容器高度: ${containerHeight}px\n`;
		info += `Chart API Ref: ${chartApiRef ? '✅ Ref 存在' : '❌ Ref 不存在'}\n`;
		info += `Chart API Current: ${chartApi ? '✅ 已设置' : '❌ 未设置'}\n`;

		// 添加更详细的调试信息
		if (chartApiRef) {
			info += `Chart API Ref 类型: ${typeof chartApiRef}\n`;
			info += `Chart API Current 类型: ${typeof chartApi}\n`;
		}

		if (chartApi) {
			try {
				// 检查 chartApi 是否有 panes 方法
				info += `Chart API 有 panes 方法: ${typeof chartApi.panes === 'function' ? '✅ 是' : '❌ 否'}\n`;

				if (typeof chartApi.panes === 'function') {
					// 获取所有 Panes
					const panes = chartApi.panes();
					info += `Panes 数量: ${panes.length}\n`;

					panes.forEach((pane, index) => {
						info += `Pane ${index}:\n`;
						info += `  - 类型: ${typeof pane}\n`;
						info += `  - 有 getHeight 方法: ${typeof pane.getHeight === 'function' ? '✅' : '❌'}\n`;
						info += `  - 有 setHeight 方法: ${typeof pane.setHeight === 'function' ? '✅' : '❌'}\n`;

						if (typeof pane.getHeight === 'function') {
							try {
								info += `  - 高度: ${pane.getHeight()}px\n`;
							} catch (e) {
								info += `  - 高度获取失败: ${e}\n`;
							}
						}

						// 获取 pane 对象的所有方法
						const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(pane))
							.filter(name => typeof (pane as any)[name] === 'function');
						info += `  - 方法: ${methods.join(', ')}\n`;
					});

					// 获取图表选项
					try {
						const options = chartApi.options();
						info += `\n图表选项:\n`;
						info += `  - 宽度: ${options.width}\n`;
						info += `  - 高度: ${options.height}\n`;
						info += `  - 自动大小: ${options.autoSize}\n`;
					} catch (e) {
						info += `\n❌ 获取图表选项失败: ${e}\n`;
					}
				}

			} catch (error) {
				info += `❌ 获取 Panes 信息失败: ${error}\n`;
				info += `错误详情: ${error instanceof Error ? error.message : String(error)}\n`;
			}
		} else {
			info += `\n💡 提示: Chart API 未设置，可能的原因:\n`;
			info += `  1. 图表还未完全初始化\n`;
			info += `  2. onInit 回调未正确执行\n`;
			info += `  3. chartApiRef 未正确传递\n`;
			info += `\n正在自动重试...\n`;

			// 如果 Chart API 未设置，自动重试
			if (!isRetrying) {
				setIsRetrying(true);
				setTimeout(() => {
					setIsRetrying(false);
					getDebugInfo();
				}, 2000);
			}
		}

		setDebugInfo(info);
	}, [chartApiRef, getContainerHeight, isRetrying]);

	// 测试设置 Pane 高度
	const testSetPaneHeight = useCallback((paneIndex: number, height: number) => {
		const chartApi = chartApiRef.current;
		if (!chartApi) {
			setDebugInfo('❌ Chart API 未设置');
			return;
		}

		try {
			const panes = chartApi.panes();
			if (paneIndex >= panes.length) {
				setDebugInfo(`❌ Pane 索引 ${paneIndex} 超出范围，总共有 ${panes.length} 个 Panes`);
				return;
			}

			const pane = panes[paneIndex];
			const oldHeight = pane.getHeight();
			
			pane.setHeight(height);
			const newHeight = pane.getHeight();
			
			setDebugInfo(`✅ Pane ${paneIndex} 高度设置:\n旧高度: ${oldHeight}px\n新高度: ${newHeight}px\n设置值: ${height}px`);
		} catch (error) {
			setDebugInfo(`❌ 设置 Pane ${paneIndex} 高度失败: ${error}`);
		}
	}, [chartApiRef]);

	// 测试使用 setStretchFactor 设置所有 Pane 高度比例
	const testSetAllPaneHeights = useCallback(() => {
		const chartApi = chartApiRef.current;

		if (!chartApi) {
			setDebugInfo('❌ Chart API 未设置');
			return;
		}

		try {
			const panes = chartApi.panes();

			if (panes.length === 0) {
				setDebugInfo('❌ 没有找到 Panes');
				return;
			}

			let info = `🎯 使用 setStretchFactor 设置 Pane 高度比例:\n`;
			info += `Panes 数量: ${panes.length}\n\n`;

			// 根据 Pane 数量计算 stretch factor
			let mainStretchFactor = 80;
			let subStretchFactor = 20;

			if (panes.length === 2) {
				mainStretchFactor = 70;
				subStretchFactor = 30;
			} else if (panes.length === 3) {
				mainStretchFactor = 60;
				subStretchFactor = 20;
			} else if (panes.length > 3) {
				mainStretchFactor = 50;
				subStretchFactor = Math.round(50 / (panes.length - 1));
			}

			panes.forEach((pane, index) => {
				const oldHeight = pane.getHeight();
				let stretchFactor: number;

				if (index === 0) {
					// 主图
					stretchFactor = mainStretchFactor;
				} else {
					// 子图
					stretchFactor = subStretchFactor;
				}

				pane.setStretchFactor(stretchFactor);

				info += `Pane ${index} (${index === 0 ? '主图' : '子图'}):\n`;
				info += `  旧高度: ${oldHeight}px\n`;
				info += `  设置 stretchFactor: ${stretchFactor}\n`;
				info += `  比例: ${stretchFactor}%\n\n`;
			});

			// 延迟验证结果
			setTimeout(() => {
				let verifyInfo = info + '🔍 验证结果:\n';
				panes.forEach((pane, index) => {
					const actualHeight = pane.getHeight();
					verifyInfo += `Pane ${index}: 实际高度 ${actualHeight}px\n`;
				});
				setDebugInfo(verifyInfo);
			}, 200);

			setDebugInfo(info + '⏳ 正在验证结果...');
		} catch (error) {
			setDebugInfo(`❌ 设置 Pane stretchFactor 失败: ${error}`);
		}
	}, [chartApiRef]);

	// 测试自动高度配置
	const testAutoApplyHeights = useCallback(() => {
		const chartApi = chartApiRef.current;

		if (!chartApi) {
			setDebugInfo('❌ Chart API 未设置');
			return;
		}

		const success = autoApplyPaneHeights(chartApi, containerRef);

		if (success) {
			setDebugInfo('✅ 自动高度配置应用成功！\n请查看图表高度变化。');
		} else {
			setDebugInfo('❌ 自动高度配置应用失败，请查看控制台错误信息。');
		}
	}, [chartApiRef, containerRef]);

	// 测试逆序设置高度
	const testReverseSetHeights = useCallback(() => {
		const chartApi = chartApiRef.current;
		const containerHeight = getContainerHeight();

		if (!chartApi) {
			setDebugInfo('❌ Chart API 未设置');
			return;
		}

		if (containerHeight <= 0) {
			setDebugInfo('❌ 容器高度无效');
			return;
		}

		try {
			const panes = chartApi.panes();

			if (panes.length === 0) {
				setDebugInfo('❌ 没有找到 Panes');
				return;
			}

			let info = `🔄 测试逆序设置高度:\n`;
			info += `容器高度: ${containerHeight}px\n`;
			info += `Panes 数量: ${panes.length}\n\n`;

			// 计算高度
			const heights = [400, 200, 150]; // 固定高度用于测试

			// 逆序设置
			for (let i = panes.length - 1; i >= 0; i--) {
				const pane = panes[i];
				const height = heights[i] || 100;
				const oldHeight = pane.getHeight();

				pane.setHeight(height);
				const newHeight = pane.getHeight();

				info += `Pane ${i}: ${oldHeight}px → ${height}px (实际: ${newHeight}px)\n`;
			}

			setDebugInfo(info);
		} catch (error) {
			setDebugInfo(`❌ 逆序设置高度失败: ${error}`);
		}
	}, [chartApiRef, getContainerHeight]);

	// 测试子图自管理高度
	const testSubChartSelfManagement = useCallback(() => {
		const chartApi = chartApiRef.current;

		if (!chartApi) {
			setDebugInfo('❌ Chart API 未设置');
			return;
		}

		try {
			const panes = chartApi.panes();

			let info = `🎯 子图自管理高度测试:\n`;
			info += `总 Panes 数量: ${panes.length}\n`;
			info += `主图 (Pane 0): ${panes[0]?.getHeight() || 0}px\n`;

			// 显示所有子图的高度
			for (let i = 1; i < panes.length; i++) {
				const pane = panes[i];
				const height = pane.getHeight();
				info += `子图 ${i - 1} (Pane ${i}): ${height}px\n`;
			}

			info += `\n💡 子图高度由 SubChartIndicatorSeries 组件自管理\n`;
			info += `每个子图组件会根据自己的索引和总数计算高度\n`;

			setDebugInfo(info);
		} catch (error) {
			setDebugInfo(`❌ 测试子图自管理高度失败: ${error}`);
		}
	}, [chartApiRef]);

	return (
		<div style={{
			padding: '16px',
			border: '2px solid #007acc',
			borderRadius: '8px',
			backgroundColor: '#f8f9fa',
			marginBottom: '16px',
			fontFamily: 'monospace',
			fontSize: '14px'
		}}>
			<h3 style={{ margin: '0 0 16px 0', color: '#007acc' }}>🔧 Chart API 调试器</h3>
			
			{/* 获取调试信息 */}
			<div style={{ marginBottom: '16px' }}>
				<button
					onClick={getDebugInfo}
					style={{
						padding: '8px 16px',
						backgroundColor: '#007acc',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						marginRight: '8px'
					}}
				>
					{isRetrying ? '🔄 重试中...' : '📊 获取 Panes 信息'}
				</button>

				<button
					onClick={testSetAllPaneHeights}
					style={{
						padding: '8px 16px',
						backgroundColor: '#28a745',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						marginRight: '8px'
					}}
				>
					🎯 测试 setStretchFactor
				</button>

				<button
					onClick={testAutoApplyHeights}
					style={{
						padding: '8px 16px',
						backgroundColor: '#17a2b8',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						marginRight: '8px'
					}}
				>
					🚀 测试自动高度配置
				</button>

				<button
					onClick={testReverseSetHeights}
					style={{
						padding: '8px 16px',
						backgroundColor: '#e83e8c',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						marginRight: '8px'
					}}
				>
					🔄 测试逆序设置
				</button>

				<button
					onClick={testSubChartSelfManagement}
					style={{
						padding: '8px 16px',
						backgroundColor: '#6f42c1',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						marginRight: '8px'
					}}
				>
					🎯 测试子图自管理
				</button>

				<button
					onClick={() => {
						setDebugInfo('');
						setIsRetrying(false);
					}}
					style={{
						padding: '8px 16px',
						backgroundColor: '#6c757d',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer'
					}}
				>
					🗑️ 清空日志
				</button>
			</div>

			{/* 单个 Pane 高度测试 */}
			<div style={{ marginBottom: '16px' }}>
				<label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
					🎯 测试单个 Pane 高度:
				</label>
				<div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
					{[0, 1, 2, 3].map(paneIndex => (
						<div key={paneIndex} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
							<button
								onClick={() => testSetPaneHeight(paneIndex, 200)}
								style={{
									padding: '4px 8px',
									backgroundColor: '#17a2b8',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '12px'
								}}
							>
								Pane{paneIndex}=200px
							</button>
							<button
								onClick={() => testSetPaneHeight(paneIndex, 400)}
								style={{
									padding: '4px 8px',
									backgroundColor: '#ffc107',
									color: 'black',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '12px'
								}}
							>
								Pane{paneIndex}=400px
							</button>
						</div>
					))}
				</div>
			</div>

			{/* 调试信息显示 */}
			{debugInfo && (
				<div style={{
					padding: '12px',
					backgroundColor: '#e9ecef',
					border: '1px solid #dee2e6',
					borderRadius: '4px',
					whiteSpace: 'pre-line',
					fontSize: '12px',
					maxHeight: '300px',
					overflowY: 'auto'
				}}>
					{debugInfo}
				</div>
			)}
		</div>
	);
};

export default ChartApiDebugger;
