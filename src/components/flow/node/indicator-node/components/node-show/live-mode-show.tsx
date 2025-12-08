import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type {
	IndicatorNodeData,
	IndicatorNodeLiveConfig,
} from "@/types/node/indicator-node";
import { IndicatorConfigShowItem } from "./indicator-config-show-item";

interface LiveModeShowProps {
	id: string;
	data: IndicatorNodeData;
}

// Get Chinese label for time interval
const getIntervalLabel = (interval: string) => {
	const intervalMap: Record<string, string> = {
		"1m": "1分钟",
		"5m": "5分钟",
		"15m": "15分钟",
		"30m": "30分钟",
		"1h": "1小时",
		"4h": "4小时",
		"1d": "1天",
		"1w": "1周",
	};
	return intervalMap[interval] || interval;
};

const LiveModeShow: React.FC<LiveModeShowProps> = ({ data }) => {
	const { exchange, symbol, interval, selectedIndicators } =
		data.liveConfig as IndicatorNodeLiveConfig;

	return (
		<div className="space-y-3">
			{/* Indicator display */}
			<div className="space-y-2">
				{!selectedIndicators || selectedIndicators.length === 0 ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-sm font-bold text-muted-foreground">
							计算指标
						</Label>
						<span className="text-sm text-red-500">未配置</span>
					</div>
				) : (
					<div>
						<div className="flex items-center gap-2">
							<Label className="text-sm font-bold text-muted-foreground">
								计算指标
							</Label>
							<Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
								{selectedIndicators.length}
							</Badge>
						</div>
						<div className="flex flex-col gap-2 mt-2">
							{selectedIndicators.map((indicator) => (
								<IndicatorConfigShowItem
									key={indicator.outputHandleId}
									indicator={indicator}
									handleId={indicator.outputHandleId}
								/>
							))}
						</div>
					</div>
				)}
			</div>
			{/* Data source information */}
			<div className="space-y-2">
				{!exchange || !symbol || !interval ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-sm font-bold text-muted-foreground">
							数据源
						</Label>
						<span className="text-sm text-red-500">未配置</span>
					</div>
				) : (
					<div>
						<Label className="text-sm font-bold text-muted-foreground">
							数据源
						</Label>
						<div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md mt-1">
							<span className="text-xs">
								{exchange} | {symbol} | {getIntervalLabel(interval)}
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default LiveModeShow;
