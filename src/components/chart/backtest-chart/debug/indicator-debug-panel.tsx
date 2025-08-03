import React, { useState } from "react";
import { Trash2, Eye, EyeOff, Bug, X, RefreshCw, Info, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { IChartApi } from "lightweight-charts";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorKeyStr } from "@/types/symbol-key";
import { useBacktestChartStore } from "../backtest-chart-store";
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";

interface IndicatorDebugPanelProps {
	chartConfig: BacktestChartConfig;
	chartApiRef?: React.RefObject<IChartApi | null>;
}

const IndicatorDebugPanel: React.FC<IndicatorDebugPanelProps> = ({
	chartConfig,
	chartApiRef,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const {
		getIndicatorVisibility,
		toggleIndicatorVisibility,
		indicatorData,
	} = useBacktestChartStore(chartConfig);

	// 使用全局配置store来删除指标
	const { removeIndicator } = useBacktestChartConfigStore();

	// 指标分类方法
	const getMainChartIndicators = () => {
		return (chartConfig.indicatorChartConfigs || []).filter(
			(indicatorConfig) => indicatorConfig.isInMainChart === true && !indicatorConfig.isDelete
		);
	};

	const getSubChartIndicators = () => {
		return (chartConfig.indicatorChartConfigs || []).filter(
			(indicatorConfig) => indicatorConfig.isInMainChart === false && !indicatorConfig.isDelete
		);
	};

	// 打印图表配置到控制台
	const printChartConfig = () => {
		const currentConfig = chartConfig;
		const mainIndicators = getMainChartIndicators();
		const subIndicators = getSubChartIndicators();

		console.group('🔧 图表配置调试信息');
		console.log('📊 完整配置:', currentConfig);
		console.log('🔑 图表ID:', currentConfig.id);
		console.log('📈 K线配置:', currentConfig.klineChartConfig);
		console.log('📊 所有指标配置:', currentConfig.indicatorChartConfigs);
		console.log('📈 主图指标:', mainIndicators);
		console.log('📉 子图指标:', subIndicators);
		console.log('📋 指标数据:', indicatorData);

		// 打印指标分类详细信息
		console.log(`📊 主图指标数量: ${mainIndicators.length}`);
		mainIndicators.forEach((indicator, index) => {
			console.log(`  主图指标${index + 1}:`, indicator);
		});

		console.log(`📉 子图指标数量: ${subIndicators.length}`);
		subIndicators.forEach((indicator, index) => {
			console.log(`  子图指标${index + 1}:`, indicator);
		});

		// 打印图表API信息
		if (chartApiRef?.current) {
			const chartApi = chartApiRef.current;
			console.log('🎯 图表API信息:');
			console.log('  - Panes数量:', chartApi.panes().length);
			console.log('  - 时间范围:', chartApi.timeScale().getVisibleRange());
			console.log('  - 图表尺寸:', chartApi.options());
		}

		console.groupEnd();

		// 同时将配置复制到剪贴板（如果支持）
		if (navigator.clipboard) {
			navigator.clipboard.writeText(JSON.stringify(currentConfig, null, 2))
				.then(() => {
					console.log('✅ 配置已复制到剪贴板');
				})
				.catch(() => {
					console.log('❌ 复制到剪贴板失败');
				});
		}
	};

	// 获取所有指标
	const getAllIndicators = () => {
		const indicators: Array<{
			keyStr: IndicatorKeyStr;
			name: string;
			type: 'main' | 'sub';
			subChartIndex?: number;
		}> = [];

		const mainIndicators = getMainChartIndicators();
		const subIndicators = getSubChartIndicators();

		// 主图指标
		mainIndicators.forEach(config => {
			indicators.push({
				keyStr: config.indicatorKeyStr,
				name: config.indicatorKeyStr, // 使用keyStr作为名称，或者可以解析出更友好的名称
				type: 'main'
			});
		});

		// 子图指标
		subIndicators.forEach((config, index) => {
			indicators.push({
				keyStr: config.indicatorKeyStr,
				name: config.indicatorKeyStr, // 使用keyStr作为名称，或者可以解析出更友好的名称
				type: 'sub',
				subChartIndex: index
			});
		});

		return indicators;
	};

	const handleDeleteIndicator = (indicatorKeyStr: IndicatorKeyStr) => {
		// 使用新的store方法获取指标信息
		const subIndicators = getSubChartIndicators();
		const targetIndicator = subIndicators.find(indicator => indicator.indicatorKeyStr === indicatorKeyStr);

		// 如果是子图指标，需要处理Pane删除逻辑
		if (targetIndicator && chartApiRef?.current) {
			// 找到该指标在子图中的索引
			const subChartIndex = subIndicators.findIndex(indicator => indicator.indicatorKeyStr === indicatorKeyStr);

			if (subChartIndex !== -1) {
				// 检查是否是该子图的唯一指标
				// 注意：现在每个子图指标都有自己的Pane，所以删除指标就是删除Pane
				try {
					// 获取所有Panes
					const panes = chartApiRef.current.panes();

					// 子图的Pane索引 = 主图(0) + 子图索引 + 1
					const paneIndex = subChartIndex + 1;

					if (panes[paneIndex]) {
						chartApiRef.current.removePane(paneIndex);
					}
				} catch (error) {
					console.error('删除Pane失败:', error);
				}
			}
		}

		// 从配置中删除指标
		removeIndicator(chartConfig.id, indicatorKeyStr);
	};

	const indicators = getAllIndicators();

	if (!isOpen) {
		return (
			<Button
				variant="outline"
				size="sm"
				className="fixed top-4 right-4 z-50 bg-white shadow-lg"
				onClick={() => setIsOpen(true)}
			>
				<Bug size={16} />
				调试面板
			</Button>
		);
	}

	return (
		<Card className="fixed top-4 right-4 z-50 w-80 max-h-96 overflow-auto bg-white shadow-lg">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm">指标调试面板</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0"
						onClick={() => setIsOpen(false)}
					>
						<X size={12} />
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{/* 图表信息 */}
				<div className="mb-3 p-2 bg-blue-50 rounded-sm">
					<div className="flex items-center gap-2 mb-1">
						<Info size={12} className="text-blue-600" />
						<span className="text-xs font-medium text-blue-800">图表信息</span>
					</div>
					<div className="text-xs text-blue-700 space-y-1">
						<div>图表ID: {chartConfig.id}</div>
						<div>主图指标: {getMainChartIndicators().length} 个</div>
						<div>子图指标: {getSubChartIndicators().length} 个</div>
						<div>总指标数: {chartConfig.indicatorChartConfigs?.length || 0} 个</div>
						{chartApiRef?.current && (
							<div>Pane数量: {chartApiRef.current.panes().length} 个</div>
						)}
					</div>
					<Button
						variant="outline"
						size="sm"
						className="h-6 text-xs mt-2 w-full"
						onClick={printChartConfig}
					>
						<FileText size={10} className="mr-1" />
						打印配置到控制台
					</Button>
				</div>

				<div className="space-y-2">
					{indicators.length === 0 ? (
						<p className="text-sm text-gray-500">暂无指标</p>
					) : (
						indicators.map((indicator) => {
							const isVisible = getIndicatorVisibility(indicator.keyStr);
							const hasData = indicatorData[indicator.keyStr];
							const dataCount = hasData ? Object.values(hasData).reduce((total, arr) => total + arr.length, 0) : 0;

							return (
								<div
									key={indicator.keyStr}
									className="flex items-center justify-between p-2 border rounded-sm bg-gray-50"
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-xs font-medium truncate">
												{indicator.name}
											</span>
											<Badge 
												variant={indicator.type === 'main' ? 'default' : 'secondary'}
												className="text-xs"
											>
												{indicator.type === 'main' ? '主图' : `子图${(indicator.subChartIndex || 0) + 1}`}
											</Badge>
											{hasData && (
												<Badge variant="outline" className="text-xs">
													{dataCount} 条数据
												</Badge>
											)}
										</div>
										<div className="text-xs text-gray-500 truncate">
											{indicator.keyStr}
										</div>
									</div>
									<div className="flex gap-1 ml-2">
										<Button
											variant="outline"
											size="sm"
											className="h-6 w-6 p-0 bg-green-50 border-green-200 hover:bg-green-100"
											title="打印指标详情"
											onClick={() => {
												console.group(`🔍 指标详情: ${indicator.name}`);
												console.log('指标键:', indicator.keyStr);
												console.log('指标类型:', indicator.type);
												console.log('可见性:', isVisible);
												if (hasData) {
													console.log('数据详情:', indicatorData[indicator.keyStr]);
													console.log('数据点数量:', dataCount);
													Object.entries(indicatorData[indicator.keyStr]).forEach(([field, data]) => {
														console.log(`  ${field}:`, data.length, '个数据点');
													});
												} else {
													console.log('暂无数据');
												}
												console.groupEnd();
											}}
										>
											<Info size={10} className="text-green-600" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											className={`h-6 w-6 p-0 ${
												isVisible
													? "bg-blue-50 border-blue-200"
													: "bg-gray-100 border-gray-300"
											}`}
											title={isVisible ? "隐藏指标" : "显示指标"}
											onClick={() => toggleIndicatorVisibility(indicator.keyStr)}
										>
											{isVisible ? (
												<Eye size={10} className="text-blue-600" />
											) : (
												<EyeOff size={10} className="text-gray-500" />
											)}
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="h-6 w-6 p-0 bg-red-50 border-red-200 hover:bg-red-100"
											title="删除指标"
											onClick={() => handleDeleteIndicator(indicator.keyStr)}
										>
											<Trash2 size={10} className="text-red-600" />
										</Button>
									</div>
								</div>
							);
						})
					)}
				</div>
				
				{indicators.length > 0 && (
					<>
						<Separator className="my-3" />
						<div className="space-y-2">
							<div className="text-xs text-gray-500">
								总计: {indicators.length} 个指标
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									onClick={() => {
										indicators.forEach(indicator => {
											if (!getIndicatorVisibility(indicator.keyStr)) {
												toggleIndicatorVisibility(indicator.keyStr);
											}
										});
									}}
								>
									<Eye size={12} className="mr-1" />
									全部显示
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									onClick={() => {
										indicators.forEach(indicator => {
											if (getIndicatorVisibility(indicator.keyStr)) {
												toggleIndicatorVisibility(indicator.keyStr);
											}
										});
									}}
								>
									<EyeOff size={12} className="mr-1" />
									全部隐藏
								</Button>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="h-7 text-xs w-full text-red-600 border-red-200 hover:bg-red-50"
								onClick={() => {
									if (confirm('确定要删除所有指标吗？此操作不可撤销。')) {
										indicators.forEach(indicator => {
											handleDeleteIndicator(indicator.keyStr);
										});
									}
								}}
							>
								<Trash2 size={12} className="mr-1" />
								删除全部
							</Button>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export default IndicatorDebugPanel;
