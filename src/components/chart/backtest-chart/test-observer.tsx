import type { KlineChartConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import BacktestChart from "./index";

// 测试组件，用于验证 observer 数据流更新功能
const TestObserverChart = () => {
	// 示例 K线缓存键 - 根据实际项目中的格式调整
	const testKlineKeyStr = "binance:BTCUSDT:1m";

	// 创建测试用的 KlineChartConfig
	const testKlineChartConfig: KlineChartConfig = {
		klineKeyStr: testKlineKeyStr,
		upColor: "#22c55e",
		downColor: "#ef4444",
		indicatorChartConfig: {},
	};

	// 创建测试用的 BacktestChartConfig
	const testChartConfig: BacktestChartConfig = {
		id: 1,
		chartName: "测试图表",
		klineChartConfig: testKlineChartConfig,
		subChartConfigs: [],
	};

	return (
		<div className="p-4">
			<h2 className="text-xl font-bold mb-4">BacktestChart 测试</h2>
			<div className="space-y-4">
				{/* 使用 Observer 数据流的图表 */}
				<div>
					<h3 className="text-lg font-semibold mb-2">K线图表 - Legend 测试</h3>
					<p className="text-sm text-gray-600 mb-2">
						K线缓存键: {testKlineKeyStr}
					</p>
					<p className="text-sm text-blue-600 mb-2">
						请移动鼠标到图表上查看数据提示是否正常更新
					</p>
					<p className="text-sm text-green-600 mb-2">
						✅ 修复：Legend 现在使用时间戳进行比较，支持分钟级数据更新
					</p>
					<p className="text-sm text-purple-600 mb-2">
						✅ 新增：Crosshair 时间线格式为 YYYY-MM-DD HH:mm
					</p>
					<p className="text-sm text-indigo-600 mb-2">
						✅ 优化：时间轴刻度智能显示 - 缩小显示日期，放大显示时间
					</p>
					<BacktestChart strategyId={1} chartConfig={testChartConfig} />
				</div>
			</div>
		</div>
	);
};

export default TestObserverChart;
