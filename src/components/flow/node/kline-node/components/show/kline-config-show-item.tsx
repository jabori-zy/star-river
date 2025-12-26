import { Position } from "@xyflow/react";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Badge } from "@/components/ui/badge";
import { INTERVAL_LABEL_MAP } from "@/types/kline";
import type { SelectedSymbol } from "@/types/node/kline-node";

export function SymbolItem({
	symbol,
	handleColor,
}: {
	symbol: SelectedSymbol;
	handleColor: string;
}) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-row gap-8 items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative">
			<div className="flex flex-col gap-1 flex-1">
				<span className="text-sm font-medium">{symbol.symbol}</span>
				<div className="flex items-center gap-1">
					<Clock className="w-3 h-3 text-muted-foreground" />
					<span className="text-xs text-muted-foreground">
						{INTERVAL_LABEL_MAP[symbol.interval]}
					</span>
				</div>
			</div>
			<Badge variant="outline" className="border-gray-400">
				{t("klineNode.kline")} {symbol.configId}
			</Badge>
			<BaseHandle
				id={symbol.outputHandleId}
				type="source"
				position={Position.Right}
				handleColor={handleColor}
				className="translate-x-2 translate-y-2"
			/>
		</div>
	);
}
