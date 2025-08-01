import React, { useState, useCallback } from 'react';
import type { PaneApiRef } from 'lightweight-charts-react-components';

interface PaneHeightDebuggerProps {
	mainPaneRef: React.RefObject<PaneApiRef | null>;
	subPaneRefs: React.RefObject<(PaneApiRef | null)[]>;
	containerRef: React.RefObject<HTMLElement | null>;
}

export const PaneHeightDebugger: React.FC<PaneHeightDebuggerProps> = ({
	mainPaneRef,
	subPaneRefs,
	containerRef,
}) => {
	const [mainHeight, setMainHeight] = useState<string>('400');
	const [subHeights, setSubHeights] = useState<string[]>(['200', '200']);
	const [debugInfo, setDebugInfo] = useState<string>('');

	// 获取容器高度
	const getContainerHeight = useCallback(() => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			return rect.height || 0;
		}
		return 0;
	}, [containerRef]);

	// 应用主图高度
	const applyMainHeight = useCallback(() => {
		const height = parseInt(mainHeight);
		if (isNaN(height) || height <= 0) {
			setDebugInfo('❌ 主图高度无效');
			return;
		}

		const paneRef = mainPaneRef.current;
		if (!paneRef) {
			setDebugInfo('❌ 主图 Pane 引用未找到');
			return;
		}

		try {
			// 尝试不同的方式访问 pane API
			let paneApi: any = null;
			const paneRefAny = paneRef as any;

			if (paneRefAny?.api) {
				paneApi = paneRefAny.api;
			} else if (typeof paneRefAny?.setHeight === 'function') {
				paneApi = paneRefAny;
			} else {
				setDebugInfo(`❌ 无法找到 setHeight 方法。PaneRef 结构: ${JSON.stringify(Object.keys(paneRefAny || {}))}`);
				return;
			}

			if (typeof paneApi?.setHeight === 'function') {
				paneApi.setHeight(height);
				setDebugInfo(`✅ 主图高度设置为 ${height}px`);
			} else {
				setDebugInfo(`❌ paneApi 没有 setHeight 方法。API 结构: ${JSON.stringify(Object.keys(paneApi || {}))}`);
			}
		} catch (error) {
			setDebugInfo(`❌ 设置主图高度失败: ${error}`);
		}
	}, [mainHeight, mainPaneRef]);

	// 应用子图高度
	const applySubHeight = useCallback((index: number) => {
		const height = parseInt(subHeights[index] || '0');
		if (isNaN(height) || height <= 0) {
			setDebugInfo(`❌ 子图 ${index + 1} 高度无效`);
			return;
		}

		const subPaneRefsArray = subPaneRefs.current;
		if (!subPaneRefsArray || !subPaneRefsArray[index]) {
			setDebugInfo(`❌ 子图 ${index + 1} Pane 引用未找到`);
			return;
		}

		const paneRef = subPaneRefsArray[index];
		if (!paneRef) {
			setDebugInfo(`❌ 子图 ${index + 1} Pane 引用为空`);
			return;
		}

		try {
			// 尝试不同的方式访问 pane API
			let paneApi: any = null;
			const paneRefAny = paneRef as any;

			if (paneRefAny?.api) {
				paneApi = paneRefAny.api;
			} else if (typeof paneRefAny?.setHeight === 'function') {
				paneApi = paneRefAny;
			} else {
				setDebugInfo(`❌ 子图 ${index + 1} 无法找到 setHeight 方法。PaneRef 结构: ${JSON.stringify(Object.keys(paneRefAny || {}))}`);
				return;
			}

			if (typeof paneApi?.setHeight === 'function') {
				paneApi.setHeight(height);
				setDebugInfo(`✅ 子图 ${index + 1} 高度设置为 ${height}px`);
			} else {
				setDebugInfo(`❌ 子图 ${index + 1} paneApi 没有 setHeight 方法。API 结构: ${JSON.stringify(Object.keys(paneApi || {}))}`);
			}
		} catch (error) {
			setDebugInfo(`❌ 设置子图 ${index + 1} 高度失败: ${error}`);
		}
	}, [subHeights, subPaneRefs]);

	// 添加子图输入框
	const addSubPane = useCallback(() => {
		setSubHeights(prev => [...prev, '200']);
	}, []);

	// 移除子图输入框
	const removeSubPane = useCallback((index: number) => {
		setSubHeights(prev => prev.filter((_, i) => i !== index));
	}, []);

	// 获取调试信息
	const getDebugInfo = useCallback(() => {
		const containerHeight = getContainerHeight();
		const mainPaneRef_ = mainPaneRef.current;
		const subPaneRefs_ = subPaneRefs.current;

		let info = `📊 调试信息:\n`;
		info += `容器高度: ${containerHeight}px\n`;
		info += `主图 Pane 引用: ${mainPaneRef_ ? '✅ 已设置' : '❌ 未设置'}\n`;
		
		if (mainPaneRef_) {
			info += `主图 Pane 类型: ${typeof mainPaneRef_}\n`;
			info += `主图 Pane 属性: ${Object.keys(mainPaneRef_).join(', ')}\n`;
		}

		info += `子图 Pane 引用数量: ${subPaneRefs_?.length || 0}\n`;
		
		if (subPaneRefs_) {
			subPaneRefs_.forEach((ref, index) => {
				info += `子图 ${index + 1}: ${ref ? '✅ 已设置' : '❌ 未设置'}\n`;
			});
		}

		setDebugInfo(info);
	}, [mainPaneRef, subPaneRefs, getContainerHeight]);

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
			<h3 style={{ margin: '0 0 16px 0', color: '#007acc' }}>🔧 Pane 高度调试器</h3>
			
			{/* 容器信息 */}
			<div style={{ marginBottom: '16px' }}>
				<button 
					onClick={getDebugInfo}
					style={{
						padding: '8px 16px',
						backgroundColor: '#007acc',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer'
					}}
				>
					获取调试信息
				</button>
			</div>

			{/* 主图高度控制 */}
			<div style={{ marginBottom: '16px' }}>
				<label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
					📈 主图高度 (px):
				</label>
				<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
					<input
						type="number"
						value={mainHeight}
						onChange={(e) => setMainHeight(e.target.value)}
						style={{
							padding: '8px',
							border: '1px solid #ccc',
							borderRadius: '4px',
							width: '100px'
						}}
					/>
					<button
						onClick={applyMainHeight}
						style={{
							padding: '8px 16px',
							backgroundColor: '#28a745',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						应用主图高度
					</button>
				</div>
			</div>

			{/* 子图高度控制 */}
			<div style={{ marginBottom: '16px' }}>
				<div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
					<label style={{ fontWeight: 'bold', marginRight: '16px' }}>
						📊 子图高度 (px):
					</label>
					<button
						onClick={addSubPane}
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
						+ 添加子图
					</button>
				</div>
				
				{subHeights.map((height, index) => (
					<div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
						<span style={{ minWidth: '60px' }}>子图 {index + 1}:</span>
						<input
							type="number"
							value={height}
							onChange={(e) => {
								const newHeights = [...subHeights];
								newHeights[index] = e.target.value;
								setSubHeights(newHeights);
							}}
							style={{
								padding: '8px',
								border: '1px solid #ccc',
								borderRadius: '4px',
								width: '100px'
							}}
						/>
						<button
							onClick={() => applySubHeight(index)}
							style={{
								padding: '8px 16px',
								backgroundColor: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							应用
						</button>
						<button
							onClick={() => removeSubPane(index)}
							style={{
								padding: '8px 12px',
								backgroundColor: '#dc3545',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							删除
						</button>
					</div>
				))}
			</div>

			{/* 调试信息显示 */}
			{debugInfo && (
				<div style={{
					padding: '12px',
					backgroundColor: '#e9ecef',
					border: '1px solid #dee2e6',
					borderRadius: '4px',
					whiteSpace: 'pre-line',
					fontSize: '12px'
				}}>
					{debugInfo}
				</div>
			)}
		</div>
	);
};

export default PaneHeightDebugger;
