import React from "react";
import BacktestChart from "@/components/chart/backtest-chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { SeriesType } from "@/types/chart";
import { ColorPicker } from "@/components/color-picker";
import type { ColorValue } from "@/components/color-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TestDashboard() {
	// const { t } = useTranslation();

	// 颜色选择器测试状态
	const [selectedColor, setSelectedColor] = React.useState("#FF6B6B");
	const [colorWithAlpha, setColorWithAlpha] = React.useState("#00FF00");
	const [simpleColor, setSimpleColor] = React.useState("#0066FF");

	const handleColorChange = (color: string) => {
		setSelectedColor(color);
		console.log("颜色改变:", color);
	};

	const handleColorComplete = (colorValue: ColorValue) => {
		console.log("颜色选择完成:", colorValue);
	};

	const customPresetColors = [
		"#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
		"#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
		"#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA"
	];

	// 创建测试配置
	const testChartConfig: BacktestChartConfig = {
		id: 1,
		chartName: "测试图表",
		klineChartConfig: {
			klineKeyStr: "BTCUSDT_1h",
			upColor: "#26a69a",
			downColor: "#ef5350",
			indicatorChartConfig: {
				"MA_20": {
					isInMainChart: true,
					seriesConfigs: [
						{
							name: "MA20",
							type: SeriesType.LINE,
							color: "#2196F3",
							strokeThickness: 2,
							indicatorValueKey: "ma"
						}
					]
				},
				"MACD_12_26_9": {
					isInMainChart: false,
					seriesConfigs: [
						{
							name: "MACD",
							type: SeriesType.LINE,
							color: "#FF6B6B",
							strokeThickness: 2,
							indicatorValueKey: "macd"
						},
						{
							name: "Signal",
							type: SeriesType.DASH,
							color: "#4ECDC4",
							strokeThickness: 1,
							indicatorValueKey: "signal"
						},
						{
							name: "Histogram",
							type: SeriesType.COLUMN,
							color: "#45B7D1",
							strokeThickness: 1,
							indicatorValueKey: "histogram"
						}
					]
				}
			}
		},
		subChartConfigs: [
			{
				mainChartId: 1,
				subChartId: 2,
				indicatorChartConfigs: {
					"RSI_14": {
						isInMainChart: false,
						seriesConfigs: [
							{
								name: "RSI",
								type: SeriesType.LINE,
								color: "#9C27B0",
								strokeThickness: 2,
								indicatorValueKey: "rsi"
							}
						]
					}
				}
			},
			{
				mainChartId: 1,
				subChartId: 3,
				indicatorChartConfigs: {
					"VOLUME": {
						isInMainChart: false,
						seriesConfigs: [
							{
								name: "Volume",
								type: SeriesType.COLUMN,
								color: "#607D8B",
								strokeThickness: 1,
								indicatorValueKey: "volume"
							}
						]
					}
				}
			}
		]
	};

	return (
		<div className="container mx-auto p-6 space-y-8">
			{/* 颜色选择器测试区域 */}
			<Card>
				<CardHeader>
					<CardTitle>颜色选择器组件测试</CardTitle>
					<CardDescription>
						测试不同配置的颜色选择器组件功能
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* 基础颜色选择器 */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold">基础颜色选择器</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<ColorPicker
								value={selectedColor}
								onChange={handleColorChange}
								onChangeComplete={handleColorComplete}
								className="w-full"
							/>
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">当前选择的颜色:</p>
								<div
									className="w-full h-12 rounded border border-border"
									style={{ backgroundColor: selectedColor }}
								/>
								<p className="font-mono text-sm">{selectedColor}</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* 带透明度的颜色选择器 */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold">带透明度的颜色选择器</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<ColorPicker
								value={colorWithAlpha}
								onChange={setColorWithAlpha}
								showAlpha={true}
								className="w-full"
							/>
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">当前选择的颜色:</p>
								<div
									className="w-full h-12 rounded border border-border"
									style={{ backgroundColor: colorWithAlpha }}
								/>
								<p className="font-mono text-sm">{colorWithAlpha}</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* 自定义预设颜色的选择器 */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold">自定义预设颜色</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<ColorPicker
								value={simpleColor}
								onChange={setSimpleColor}
								showAlpha={false}
								presetColors={customPresetColors}
								className="w-full"
							/>
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">当前选择的颜色:</p>
								<div
									className="w-full h-12 rounded border border-border"
									style={{ backgroundColor: simpleColor }}
								/>
								<p className="font-mono text-sm">{simpleColor}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 原有的图表测试 */}
			<Card>
				<CardHeader>
					<CardTitle>动态 Series 测试</CardTitle>
					<CardDescription>
						测试动态图表系列功能
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-96">
						<BacktestChart strategyId={1} chartConfig={testChartConfig} />
					</div>
				</CardContent>
			</Card>
		</div>

			// <SidebarProvider className="flex flex-col">
			// 	<SiteHeader />
			// 	<div className="flex flex-1 p-2 bg-red-400">
			// 		<AppSidebar className="top-10" />
			// 		<div className="text-2xl font-bold">{t("createStrategy")}</div>

			// 		<SidebarInset>
			// 			<div className="flex flex-1 flex-col gap-4 p-4">
			// 				<div className="grid auto-rows-min gap-4 md:grid-cols-3">
			// 					<div className="aspect-video rounded-xl bg-muted/50" />
			// 					<div className="aspect-video rounded-xl bg-muted/50" />
			// 					<div className="aspect-video rounded-xl bg-muted/50" />
			// 				</div>
			// 				<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
			// 			</div>
			// 		</SidebarInset>
			// 	</div>
			// </SidebarProvider>
	);
}
