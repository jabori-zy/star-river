import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minimize2, Plus, RefreshCw, Info } from "lucide-react";
import type { IChartApi, SingleValueData, UTCTimestamp } from "lightweight-charts";
import {
	Chart,
	CandlestickSeries,
	Pane,
	LineSeries,
	HistogramSeries,
} from "lightweight-charts-react-components";
import { generateOHLCData } from "@/components/chart/backtest-chart/mock-data";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { IndicatorChartConfig } from "@/types/chart";
import type { SeriesType } from "@/types/chart";
import type { IndicatorKeyStr } from "@/types/symbol-key";

// 模拟指标配置结构，与真实配置保持一致
interface MockIndicatorConfig {
	indicatorKeyStr: IndicatorKeyStr;
	chartId: number;
	isInMainChart: boolean;
	isDelete: boolean;
	seriesConfigs: Array<{
		name: string;
		type: SeriesType;
		color: string;
		strokeThickness: number;
		indicatorValueKey: string;
	}>;
}

// 生成模拟指标数据
const generateMockIndicatorData = (length: number): SingleValueData[] => {
	const data: SingleValueData[] = [];
	const baseTime = Math.floor(Date.now() / 1000) - (length * 86400); // 从length天前开始

	for (let i = 0; i < length; i++) {
		data.push({
			time: (baseTime + i * 86400) as UTCTimestamp,
			value: Math.random() * 100 + 50, // 50-150之间的随机值
		});
	}

	return data;
};

// 生成模拟柱状图数据
const generateMockHistogramData = (length: number): SingleValueData[] => {
	const data: SingleValueData[] = [];
	const baseTime = Math.floor(Date.now() / 1000) - (length * 86400);

	for (let i = 0; i < length; i++) {
		data.push({
			time: (baseTime + i * 86400) as UTCTimestamp,
			value: (Math.random() - 0.5) * 20, // -10到10之间的随机值
		});
	}

	return data;
};

// 生成模拟指标数据
const generateIndicatorData = (length: number, baseValue: number = 50): SingleValueData[] => {
	const klineData = generateOHLCData(length);
	return klineData.map((candle, index) => ({
		time: candle.time,
		value: baseValue + Math.sin(index * 0.1) * 10 + Math.random() * 5 - 2.5,
	}));
};

const TestPaneDeletion: React.FC = () => {
	const chartApiRef = useRef<IChartApi | null>(null);
	const [klineData] = useState(() => generateOHLCData(100));
	// 使用与真实配置相同的结构
	const [chartConfig, setChartConfig] = useState<BacktestChartConfig>(() => ({
		id: 1,
		chartName: "测试图表",
		klineChartConfig: {
			klineKeyStr: "BTCUSDT_1h" as IndicatorKeyStr,
			upColor: "#26a69a",
			downColor: "#ef5350",
		},
		indicatorChartConfigs: [
			{
				indicatorKeyStr: "MA_5" as IndicatorKeyStr,
				chartId: 1,
				isInMainChart: true,
				isDelete: false,
				seriesConfigs: [{
					name: "MA5",
					type: "line" as SeriesType,
					color: "#FF6B6B",
					strokeThickness: 2,
					indicatorValueKey: "ma",
				}],
			},
			{
				indicatorKeyStr: "MA_20" as IndicatorKeyStr,
				chartId: 1,
				isInMainChart: true,
				isDelete: false,
				seriesConfigs: [{
					name: "MA20",
					type: "line" as SeriesType,
					color: "#4ECDC4",
					strokeThickness: 2,
					indicatorValueKey: "ma",
				}],
			},
			{
				indicatorKeyStr: "RSI_14" as IndicatorKeyStr,
				chartId: 1,
				isInMainChart: false,
				isDelete: false,
				seriesConfigs: [{
					name: "RSI",
					type: "line" as SeriesType,
					color: "#45B7D1",
					strokeThickness: 2,
					indicatorValueKey: "rsi",
				}],
			},
			{
				indicatorKeyStr: "MACD_12_26_9" as IndicatorKeyStr,
				chartId: 1,
				isInMainChart: false,
				isDelete: false,
				seriesConfigs: [{
					name: "MACD",
					type: "column" as SeriesType,
					color: "#96CEB4",
					strokeThickness: 1,
					indicatorValueKey: "histogram",
				}],
			},
			{
				indicatorKeyStr: "VOLUME" as IndicatorKeyStr,
				chartId: 1,
				isInMainChart: false,
				isDelete: false,
				seriesConfigs: [{
					name: "Volume",
					type: "column" as SeriesType,
					color: "#FFEAA7",
					strokeThickness: 1,
					indicatorValueKey: "volume",
				}],
			},
		],
	}));

	// 生成指标数据
	const [indicatorData] = useState(() => {
		const data: Record<string, SingleValueData[]> = {};
		chartConfig.indicatorChartConfigs.forEach(indicator => {
			if (indicator.isInMainChart) {
				data[indicator.indicatorKeyStr] = generateMockIndicatorData(100);
			} else {
				// 根据指标类型生成不同的数据
				if (indicator.seriesConfigs[0]?.type === "column") {
					data[indicator.indicatorKeyStr] = generateMockHistogramData(100);
				} else {
					data[indicator.indicatorKeyStr] = generateMockIndicatorData(100);
				}
			}
		});
		return data;
	});

	// 获取主图和子图指标
	const getMainChartIndicators = () => {
		return chartConfig.indicatorChartConfigs.filter(
			(indicatorConfig) => indicatorConfig.isInMainChart === true && !indicatorConfig.isDelete
		);
	};

	const getSubChartIndicators = () => {
		return chartConfig.indicatorChartConfigs.filter(
			(indicatorConfig) => indicatorConfig.isInMainChart === false && !indicatorConfig.isDelete
		);
	};

	const mainIndicators = getMainChartIndicators();
	const subIndicators = getSubChartIndicators();

	// 只删除 Pane（保留配置）
	const handleRemovePaneOnly = (indicatorKeyStr: IndicatorKeyStr) => {
		const targetIndicator = subIndicators.find(indicator => indicator.indicatorKeyStr === indicatorKeyStr);

		if (!targetIndicator || !chartApiRef.current) {
			console.warn('只有子图指标支持单独删除 Pane');
			return;
		}

		try {
			// 找到该指标在子图中的索引
			const subChartIndex = subIndicators.findIndex(indicator => indicator.indicatorKeyStr === indicatorKeyStr);

			if (subChartIndex === -1) return;

			const panes = chartApiRef.current.panes();
			console.log('当前 Panes:', panes.length, '个');
			console.log('要删除的子图索引:', subChartIndex);

			// 子图的 Pane 索引 = 主图(0) + 子图索引 + 1
			const paneIndex = subChartIndex + 1;

			if (panes[paneIndex]) {
				chartApiRef.current.removePane(paneIndex);
				console.log(`已删除 Pane ${paneIndex}，但保留配置`);
				console.log('删除后 Panes:', chartApiRef.current.panes().length, '个');
			} else {
				console.warn(`Pane ${paneIndex} 不存在`);
			}
		} catch (error) {
			console.error('删除 Pane 失败:', error);
		}
	};

	// 删除配置（让 React 自然卸载组件）
	const handleDeleteIndicator = (indicatorKeyStr: IndicatorKeyStr) => {
		setChartConfig(prev => ({
			...prev,
			indicatorChartConfigs: prev.indicatorChartConfigs.map(config =>
				config.indicatorKeyStr === indicatorKeyStr
					? { ...config, isDelete: true }
					: config
			)
		}));
		console.log(`已标记删除指标配置: ${indicatorKeyStr}`);
	};

	// 同时删除 Pane 和配置
	const handleDeleteBoth = (indicatorKeyStr: IndicatorKeyStr) => {
		const indicator = chartConfig.indicatorChartConfigs.find(config => config.indicatorKeyStr === indicatorKeyStr);
		if (indicator && !indicator.isInMainChart) {
			// 先删除 Pane
			handleRemovePaneOnly(indicatorKeyStr);
			// 延迟删除配置
			setTimeout(() => {
				handleDeleteIndicator(indicatorKeyStr);
			}, 100);
		} else {
			// 主图指标直接删除配置
			handleDeleteIndicator(indicatorKeyStr);
		}
	};

	// 恢复指标
	const handleRestoreIndicator = (indicatorKeyStr: IndicatorKeyStr) => {
		setChartConfig(prev => ({
			...prev,
			indicatorChartConfigs: prev.indicatorChartConfigs.map(config =>
				config.indicatorKeyStr === indicatorKeyStr
					? { ...config, isDelete: false }
					: config
			)
		}));
		console.log(`已恢复指标配置: ${indicatorKeyStr}`);
	};

	// 添加新指标
	const handleAddIndicator = () => {
		const timestamp = Date.now();
		const newIndicatorKeyStr = `TEST_${timestamp}` as IndicatorKeyStr;
		const isLine = Math.random() > 0.5;

		const newIndicator: IndicatorChartConfig = {
			indicatorKeyStr: newIndicatorKeyStr,
			chartId: 1,
			isInMainChart: false,
			isDelete: false,
			seriesConfigs: [{
				name: `Test ${timestamp.toString().slice(-4)}`,
				type: isLine ? "line" as SeriesType : "column" as SeriesType,
				color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
				strokeThickness: 2,
				indicatorValueKey: isLine ? "value" : "histogram",
			}],
		};

		setChartConfig(prev => ({
			...prev,
			indicatorChartConfigs: [...prev.indicatorChartConfigs, newIndicator]
		}));

		// 生成数据
		if (isLine) {
			indicatorData[newIndicatorKeyStr] = generateMockIndicatorData(100);
		} else {
			indicatorData[newIndicatorKeyStr] = generateMockHistogramData(100);
		}

		console.log(`已添加新指标: ${newIndicatorKeyStr}`);
	};

// 打印调试信息
const printDebugInfo = () => {
	console.group('🔧 Pane 删除测试 - 调试信息');
	console.log('📊 完整配置:', chartConfig);
	console.log('📈 主图指标:', mainIndicators);
	console.log('📉 子图指标:', subIndicators);
	console.log('📋 指标数据键:', Object.keys(indicatorData));

	if (chartApiRef.current) {
		const chartApi = chartApiRef.current;
		console.log('🎯 图表API信息:');
		console.log('  - Panes数量:', chartApi.panes().length);
		console.log('  - 时间范围:', chartApi.timeScale().getVisibleRange());

		// 打印每个 Pane 的详细信息
		chartApi.panes().forEach((pane, index) => {
			console.log(`  - Pane ${index}:`, pane);
		});
	}

	console.groupEnd();
};

	const chartOptions = {
		grid: {
			vertLines: { visible: false },
			horzLines: { visible: false },
		},
		layout: {
			panes: {
				separatorColor: "#080F25",
			},
		},
		timeScale: {
			visible: true,
			timeVisible: true,
		},
	};

	return (
		<div className="p-4 space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Pane 删除测试页面</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 mb-4">
						<p className="text-sm text-gray-600">
							测试不同的删除方式：
						</p>
						<ul className="text-sm text-gray-600 space-y-1">
							<li>🟠 只删除 Pane（保留配置）- 仅子图指标</li>
							<li>🔴 删除配置（React 自然卸载）</li>
							<li>⚫ 同时删除（先删 Pane 再删配置）</li>
						</ul>
					</div>

					{/* 状态信息 */}
					<div className="mb-4 p-2 bg-blue-50 rounded-sm">
						<div className="flex items-center gap-2 mb-1">
							<Info size={12} className="text-blue-600" />
							<span className="text-xs font-medium text-blue-800">图表状态</span>
						</div>
						<div className="text-xs text-blue-700 space-y-1">
							<div>图表ID: {chartConfig.id}</div>
							<div>主图指标: {mainIndicators.length} 个</div>
							<div>子图指标: {subIndicators.length} 个</div>
							<div>总指标数: {chartConfig.indicatorChartConfigs.length} 个</div>
							<div>已删除指标: {chartConfig.indicatorChartConfigs.filter(c => c.isDelete).length} 个</div>
							{chartApiRef.current && (
								<div>当前 Pane 数量: {chartApiRef.current.panes().length} 个</div>
							)}
						</div>
					</div>

					{/* 控制面板 */}
					<div className="flex gap-2 mb-4">
						<Button onClick={handleAddIndicator} size="sm">
							<Plus size={16} className="mr-1" />
							添加测试指标
						</Button>
						<Button onClick={printDebugInfo} size="sm" variant="outline">
							<Info size={16} className="mr-1" />
							打印调试信息
						</Button>
					</div>

					{/* 指标列表 */}
					<div className="space-y-2 mb-4">
						<h3 className="font-medium">当前指标：</h3>
						{chartConfig.indicatorChartConfigs.map(indicator => (
							<div key={indicator.indicatorKeyStr} className="flex items-center justify-between p-2 border rounded">
								<div className="flex items-center gap-2">
									<div
										className="w-4 h-4 rounded"
										style={{ backgroundColor: indicator.seriesConfigs[0]?.color || '#ccc' }}
									/>
									<span className={indicator.isDelete ? 'line-through text-gray-400' : ''}>
										{indicator.seriesConfigs[0]?.name || indicator.indicatorKeyStr}
										({indicator.isInMainChart ? '主图' : '子图'}) -
										{indicator.seriesConfigs[0]?.type || 'unknown'}
									</span>
									<Badge variant={indicator.isInMainChart ? 'default' : 'secondary'} className="text-xs">
										{indicator.indicatorKeyStr}
									</Badge>
								</div>
								<div className="flex gap-1">
									{!indicator.isDelete ? (
										<>
											{!indicator.isInMainChart && (
												<Button
													variant="outline"
													size="sm"
													className="h-6 w-6 p-0 bg-orange-50 border-orange-200"
													title="只删除 Pane"
													onClick={() => handleRemovePaneOnly(indicator.indicatorKeyStr)}
												>
													<Minimize2 size={10} className="text-orange-600" />
												</Button>
											)}
											<Button
												variant="outline"
												size="sm"
												className="h-6 w-6 p-0 bg-red-50 border-red-200"
												title="删除配置"
												onClick={() => handleDeleteIndicator(indicator.indicatorKeyStr)}
											>
												<Trash2 size={10} className="text-red-600" />
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="h-6 w-6 p-0 bg-gray-800 border-gray-600"
												title="同时删除"
												onClick={() => handleDeleteBoth(indicator.indicatorKeyStr)}
											>
												<Trash2 size={10} className="text-white" />
											</Button>
										</>
									) : (
										<Button
											variant="outline"
											size="sm"
											className="h-6 text-xs"
											onClick={() => handleRestoreIndicator(indicator.indicatorKeyStr)}
										>
											恢复
										</Button>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* 图表 */}
			<div className="h-96 border rounded">
				<Chart
					options={chartOptions}
					onInit={(chart) => {
						chartApiRef.current = chart;
						console.log('Chart initialized:', chart);
					}}
				>
					{/* K线图 */}
					<CandlestickSeries
						data={klineData}
						options={{
							upColor: '#26a69a',
							downColor: '#ef5350',
							borderVisible: false,
							wickUpColor: '#26a69a',
							wickDownColor: '#ef5350',
						}}
					/>

					{/* 主图指标 */}
					{mainIndicators.map(indicator => (
						<LineSeries
							key={indicator.indicatorKeyStr}
							data={indicatorData[indicator.indicatorKeyStr] || []}
							options={{
								color: indicator.seriesConfigs[0]?.color || '#ccc',
								lineWidth: indicator.seriesConfigs[0]?.strokeThickness || 2,
								lastValueVisible: false,
								priceLineVisible: false,
							}}
						/>
					))}

					{/* 子图指标 */}
					{subIndicators.map(indicator => (
						<Pane key={indicator.indicatorKeyStr}>
							{indicator.seriesConfigs[0]?.type === 'line' ? (
								<LineSeries
									data={indicatorData[indicator.indicatorKeyStr] || []}
									options={{
										color: indicator.seriesConfigs[0]?.color || '#ccc',
										lineWidth: indicator.seriesConfigs[0]?.strokeThickness || 2,
										lastValueVisible: false,
										priceLineVisible: false,
									}}
								/>
							) : (
								<HistogramSeries
									data={indicatorData[indicator.indicatorKeyStr] || []}
									options={{
										color: indicator.seriesConfigs[0]?.color || '#ccc',
										lastValueVisible: false,
										priceLineVisible: false,
									}}
								/>
							)}
						</Pane>
					))}
				</Chart>
			</div>
		</div>
	);
};

export default TestPaneDeletion;
