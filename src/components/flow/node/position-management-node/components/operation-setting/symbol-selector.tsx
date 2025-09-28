import type React from "react";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import type { MarketSymbol } from "@/types/market";

interface SymbolSelectorProps {
	value: string;
	onChange: (value: string | null) => void;
	disabled?: boolean;
	allowEmpty?: boolean;
	symbolList: MarketSymbol[];
}

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	value,
	onChange,
	disabled = false,
	allowEmpty = false,
	symbolList,
}) => {

	// 构建选项列表，包含"不限制交易对"选项和从API获取的交易对
	const options = [
		...(allowEmpty ? [{ value: "__EMPTY__", label: "不限制交易对" }] : []),
		...symbolList.map((symbol) => ({
			value: symbol.name,
			label: symbol.name,
		})),
	];

	const handleValueChange = (selectedValue: string) => {
		if (selectedValue === "__EMPTY__" && allowEmpty) {
			onChange(null);
		} else {
			onChange(selectedValue);
		}
	};

	return (
		<SelectWithSearch
			id="symbol"
			options={options}
			value={value || "__EMPTY__"}
			onValueChange={handleValueChange}
			placeholder={allowEmpty ? "选择交易对 (可选)" : "选择交易对"}
			searchPlaceholder="搜索交易对"
			emptyMessage="未找到交易对"
			disabled={disabled}
		/>
	);
};

export default SymbolSelector;
