import BacktestChart from "@/components/chart/backtest-chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import { SeriesType } from "@/types/chart";

export default function TestDashboard() {
	// const { t } = useTranslation();

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
		subChartConfigs: []
	};

	return (
		<div>
			<div className="flex flex-col gap-4 p-4">
				<div className="text-2xl font-bold">动态 Series 测试</div>
			</div>
			<div className="flex flex-col gap-4 p-4 h-96">
				<BacktestChart strategyId={1} chartConfig={testChartConfig} />
			</div>
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
