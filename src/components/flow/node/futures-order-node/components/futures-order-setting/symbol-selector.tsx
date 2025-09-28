import type React from "react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import { getSymbolList } from "@/service/market";
import type { MarketSymbol } from "@/types/market";

interface SymbolSelectorProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	accountId: number | undefined;
	error?: string;
}

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	value,
	onChange,
	disabled = false,
	accountId,
	error,
}) => {
	const [symbolList, setSymbolList] = useState<MarketSymbol[]>([]);

	useEffect(() => {
		if (accountId) {
			getSymbolList(accountId).then((data) => {
				setSymbolList(data);
			});
		}
	}, [accountId]);

	return (
		<div className="grid grid-cols-4 items-center gap-4">
			<Label htmlFor="symbol" className="text-right">
				交易对
			</Label>
			<div className="col-span-3">
				<SelectWithSearch
					id="symbol"
					options={symbolList.map((symbol) => ({
						value: symbol.name,
						label: symbol.name,
					}))}
					value={value}
					onValueChange={onChange}
					placeholder="选择交易对"
					searchPlaceholder="搜索交易对"
					emptyMessage="未找到交易对"
					disabled={disabled}
					error={!!error}
				/>
				{error && (
					<p className="text-xs text-red-500">{error}</p>
				)}
			</div>
		</div>
	);
};

export default SymbolSelector;
