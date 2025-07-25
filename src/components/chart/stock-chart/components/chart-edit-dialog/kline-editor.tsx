import { KlineChartConfig } from "@/types/chart";

interface KlineEditorProps {
	klineChartConfig: KlineChartConfig;
}

const KlineEditor = ({ klineChartConfig }: KlineEditorProps) => {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900">K线配置</h3>
			<div className="bg-gray-50 p-4 rounded-lg">
				<div className="space-y-3">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							K线缓存键
						</label>
						<div className="text-sm text-gray-600 bg-white p-2 rounded border">
							{klineChartConfig.klineKeyStr}
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							上涨颜色
						</label>
						<div className="text-sm text-gray-600 bg-white p-2 rounded border">
							{klineChartConfig.upColor || "默认颜色"}
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							下跌颜色
						</label>
						<div className="text-sm text-gray-600 bg-white p-2 rounded border">
							{klineChartConfig.downColor || "默认颜色"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default KlineEditor;
