import { Position } from "@xyflow/react";
import { Clock, TrendingUp } from "lucide-react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Badge } from "@/components/ui/badge";
import type { SelectedSymbol } from "@/types/node/kline-node";

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

export function SymbolItem({ symbol }: { symbol: SelectedSymbol }) {
	return (
		<div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative">
			<div className="flex flex-col gap-1 flex-1">
				<span className="text-sm font-medium">{symbol.symbol}</span>
				<div className="flex items-center gap-1">
					<Clock className="w-3 h-3 text-muted-foreground" />
					<span className="text-xs text-muted-foreground">
						{getIntervalLabel(symbol.interval)}
					</span>
				</div>
			</div>
			<Badge variant="outline" className="border-gray-400">
				K线 {symbol.configId}
			</Badge>
			<BaseHandle
				id={symbol.outputHandleId}
				type="source"
				position={Position.Right}
				handleColor="!bg-red-400"
				className="translate-x-2 translate-y-2"
			/>
		</div>
	);
}
