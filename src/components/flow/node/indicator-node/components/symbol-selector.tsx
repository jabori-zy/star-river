import { SelectedSymbol } from "@/types/node/kline-node";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface SymbolSelectorProps {
	symbolList: SelectedSymbol[];
	selectedSymbol: SelectedSymbol | null;
	onSymbolChange: (symbol: SelectedSymbol) => void;
}

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	symbolList,
	selectedSymbol,
	onSymbolChange,
}) => {
	console.log("symbolList", symbolList);
	const handleSymbolChange = (symbolId: string) => {
		const selected = symbolList.find(
			(symbol) => symbol.symbolId.toString() === symbolId,
		);
		if (selected) {
			onSymbolChange(selected);
		}
	};

	return (
		<div className="space-y-2">
			<Label htmlFor="symbol-select" className="text-sm font-medium">
				交易对选择
			</Label>
			<Select
				value={selectedSymbol?.symbolId.toString() || ""}
				onValueChange={handleSymbolChange}
			>
				<SelectTrigger id="symbol-select" className="w-full">
					<SelectValue placeholder="请选择交易对" />
				</SelectTrigger>
				<SelectContent>
					{symbolList.map((symbol) => (
						<SelectItem
							key={symbol.symbolId}
							value={symbol.symbolId.toString()}
						>
							<div className="flex items-center justify-between w-full">
								<span className="font-medium">{symbol.symbol}</span>
								<span className="text-sm text-muted-foreground ml-2">
									{symbol.interval}
								</span>
							</div>
						</SelectItem>
					))}
					{symbolList.length === 0 && (
						<SelectItem value="no-symbols" disabled>
							暂无可选交易对
						</SelectItem>
					)}
				</SelectContent>
			</Select>
		</div>
	);
};

export default SymbolSelector;
