import React, { useMemo } from "react";
import { SelectWithSearch } from "@/components/select-components/select-with-search";

export interface SymbolSelectorOption {
	value: string;
	label: string;
}

interface SymbolSelectorProps {
	value: string;
	onChange: (value: string | null) => void;
	options: SymbolSelectorOption[];
	allowEmpty?: boolean;
	disabled?: boolean;
	placeholder?: string;
	emptyMessage?: string;
}

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	value,
	onChange,
	options,
	allowEmpty = false,
	disabled = false,
	placeholder,
	emptyMessage,
}) => {
	const computedOptions = useMemo(() => {
		const baseOptions = [...options];

		if (
			value &&
			value !== "__EMPTY__" &&
			!baseOptions.some((option) => option.value === value)
		) {
			baseOptions.push({
				value,
				label: value,
			});
		}

		if (
			allowEmpty &&
			!baseOptions.some((option) => option.value === "__EMPTY__")
		) {
			baseOptions.unshift({
				value: "__EMPTY__",
				label: "不限制交易对",
			});
		}

		return baseOptions;
	}, [options, allowEmpty, value]);

	const normalizedValue =
		allowEmpty && (!value || value === "__EMPTY__") ? "__EMPTY__" : value;

	const handleValueChange = (selectedValue: string) => {
		if (selectedValue === "__EMPTY__" || selectedValue === "") {
			if (allowEmpty) {
				onChange(null);
			} else {
				onChange("");
			}
			return;
		}

		onChange(selectedValue);
	};

	return (
		<SelectWithSearch
			id="symbol"
			value={normalizedValue}
			onValueChange={handleValueChange}
			options={computedOptions}
			placeholder={
				placeholder ?? (allowEmpty ? "选择交易对 (可选)" : "选择交易对")
			}
			searchPlaceholder="搜索交易对"
			emptyMessage={emptyMessage ?? "未找到交易对"}
			disabled={disabled}
		/>
	);
};

export default SymbolSelector;
