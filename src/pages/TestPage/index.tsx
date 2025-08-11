import React from "react";
import BacktestChart from "@/components/chart/backtest-chart";
import type { ColorValue } from "@/components/color-picker";
import { ColorPicker } from "@/components/color-picker";
import { BacktestOrderRecordTable } from "@/components/table/backtest-order-record-table";
import { generateMockVirtualOrders } from "@/components/table/backtest-order-record-table/mock-data";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SeriesType } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";

export default function TestDashboard() {
	// const { t } = useTranslation();

	// 表格测试状态
	const [tableData, setTableData] = React.useState(() => generateMockVirtualOrders(30));
	const [isRefreshing, setIsRefreshing] = React.useState(false);


	// 刷新表格数据
	const handleRefreshTableData = async () => {
		setIsRefreshing(true);
		// 模拟异步数据加载
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setTableData(generateMockVirtualOrders(Math.floor(Math.random() * 50) + 20));
		setIsRefreshing(false);
	};

	return (
		<div className="container mx-auto p-6 space-y-8">
			{/* 表格组件测试区域 */}
			<Card>
				<CardHeader>
					<CardTitle>回测订单记录表格测试</CardTitle>
					<CardDescription>测试虚拟订单记录表格组件功能</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<h3 className="text-lg font-semibold">虚拟订单记录表格</h3>
							<p className="text-sm text-muted-foreground">
								展示回测过程中产生的虚拟订单记录，支持排序、分页等功能
							</p>
						</div>
						<Button 
							onClick={handleRefreshTableData} 
							disabled={isRefreshing}
							variant="outline"
						>
							{isRefreshing ? "刷新中..." : "刷新数据"}
						</Button>
					</div>
					<div className="border rounded-lg">
						<BacktestOrderRecordTable 
							data={tableData}
							title="虚拟订单记录测试"
						/>
					</div>
				</CardContent>
			</Card>

		

		</div>

	);
}
