import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { SelectedSymbol } from "@/types/node/kline-node";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();
	const handleSymbolChange = (symbolId: string) => {
		const selected = symbolList.find(
			(symbol) => symbol.configId.toString() === symbolId,
		);
		if (selected) {
			onSymbolChange(selected);
		}
	};

	return (
		<div className="space-y-2">
			<Label htmlFor="symbol-select" className="text-sm font-medium">
				{t("indicatorNode.symbol")}
			</Label>
			<Select
				value={selectedSymbol?.configId.toString() || ""}
				onValueChange={handleSymbolChange}
			>
				<SelectTrigger id="symbol-select" className="w-full">
					<SelectValue placeholder={t("indicatorNode.selectSymbol")} />
				</SelectTrigger>
				<SelectContent>
					{symbolList.map((symbol) => (
						<SelectItem
							key={symbol.configId}
							value={symbol.configId.toString()}
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
							{t("indicatorNode.noSymbol")}
						</SelectItem>
					)}
				</SelectContent>
			</Select>
		</div>
	);
};

export default SymbolSelector;
