import { TrendingUp, Clock } from "lucide-react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { SelectedSymbol } from "@/types/node/kline-node";

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
			<div className="flex items-center gap-2 ">
				<TrendingUp className="w-4 h-4 text-blue-500" />
				<span className="text-sm font-medium">{symbol.symbol}</span>
			</div>
			<div className="flex items-center gap-1">
				<Clock className="w-3 h-3 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">
					{getIntervalLabel(symbol.interval)}
				</span>
			</div>
			<BaseHandle
				id={symbol.outputHandleId}
				type="source"
				position={Position.Right}
				handleColor="!bg-red-400"
				className="translate-x-2 -translate-y-0.75"
			/>
		</div>
	);
}
