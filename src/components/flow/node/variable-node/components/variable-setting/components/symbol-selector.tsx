import type React from "react";
import { useMemo } from "react";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import { useTranslation } from "react-i18next";
export interface SymbolSelectorOption {
	value: string;
	label: string;
}

interface SymbolSelectorProps {
	value: string;
	onChange: (value: string) => void;
	options: SymbolSelectorOption[];
	disabled?: boolean;
	placeholder?: string;
	emptyMessage?: string;
}

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	value,
	onChange,
	options,
	disabled = false,
	placeholder,
	emptyMessage,
}) => {
	const { t } = useTranslation();
	const computedOptions = useMemo(() => {
		const baseOptions = [...options];

		// 如果当前值不在选项列表中，添加它
		if (value && !baseOptions.some((option) => option.value === value)) {
			baseOptions.push({
				value,
				label: value,
			});
		}

		return baseOptions;
	}, [options, value]);

	return (
		<SelectWithSearch
			id="symbol"
			value={value}
			onValueChange={onChange}
			options={computedOptions}
			placeholder={placeholder ?? t("variableNode.selectSymbol")}
			searchPlaceholder={t("variableNode.searchSymbol")}
			emptyMessage={emptyMessage ?? t("variableNode.emptySymbolMessage")}
			disabled={disabled}
		/>
	);
};

export default SymbolSelector;
