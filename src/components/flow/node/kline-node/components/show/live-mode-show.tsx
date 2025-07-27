import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { KlineNodeLiveConfig } from "@/types/node/kline-node";
import { SymbolItem } from "../index";

interface LiveModeShowProps {
	liveConfig: KlineNodeLiveConfig;
}

const LiveModeShow: React.FC<LiveModeShowProps> = ({ liveConfig }) => {
	const selectedAccount = liveConfig.selectedAccount;
	const selectedSymbols = liveConfig.selectedSymbols || [];

	return (
		<div className="space-y-2">
			{/* 交易对展示 */}
			<div className="space-y-2">
				{selectedSymbols.length === 0 ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-xm font-bold text-muted-foreground">
							交易对
						</Label>
						<span className="text-sm text-red-500">未配置</span>
					</div>
				) : (
					<div>
						<div className="flex items-center gap-2">
							<Label className="text-xm font-bold text-muted-foreground">
								交易对
							</Label>
							<Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
								{selectedSymbols.length}
							</Badge>
						</div>
						<div className="flex flex-col gap-2 mt-2">
							{selectedSymbols.map((symbol, index) => (
								<SymbolItem
									key={`${symbol.symbol}-${symbol.interval}-${index}`}
									symbol={symbol}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			{/* 账户展示 */}
			<div className="space-y-2">
				{!selectedAccount || !selectedAccount.accountName ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-xm font-bold text-muted-foreground">
							数据源
						</Label>
						<span className="text-sm text-red-500">未配置</span>
					</div>
				) : (
					<div>
						<Label className="text-xm font-bold text-muted-foreground">
							数据源
						</Label>
						<div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md mt-1">
							<span className="text-xs">
								{selectedAccount.accountName} ({selectedAccount.exchange})
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default LiveModeShow;
