import { useTranslation } from "react-i18next";
import { AppSidebar } from "@/components/app-sidebar-demo";
import { SiteHeader } from "@/components/app-sidebar-demo/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import BacktestChart from "@/components/chart/backtest-chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";

export default function TestDashboard() {
	// const { t } = useTranslation();

	return (
		<div>
			<div className="flex flex-col gap-4 p-4">
				<div className="text-2xl font-bold">Test</div>
			</div>
			<div className="flex flex-col gap-4 p-4">
				<BacktestChart strategyId={1} chartConfig={{} as BacktestChartConfig} />
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
