import { X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InputWithDropdown } from "@/components/input-components/input-with-dropdown";
import { Button } from "@/components/ui/button";
import { CustomizeColumnOptions } from "./customize-column-options";
import type { DataTableToolbarProps } from "./types";

export function DataTableToolbar<TData>({
	table,
	searchKeys,
	children,
}: DataTableToolbarProps<TData>) {
	const { t } = useTranslation();
	const isFiltered = table.getState().columnFilters.length > 0;

	// 如果有 searchKeys，默认选择第一个
	const [selectedSearchKey, setSelectedSearchKey] = useState<string>(
		searchKeys?.[0] || "",
	);
	const [searchValue, setSearchValue] = useState<string>("");

	// 根据 searchKeys 生成下拉选项
	const searchOptions =
		searchKeys?.map((key) => {
			const column = table.getColumn(key);
			// 尝试从 column.columnDef.header 获取列名
			let label = key;
			if (column) {
				const header = column.columnDef.header;
				// 如果 header 是字符串，直接使用
				if (typeof header === "string") {
					label = header;
				}
				// 如果有 meta.headerName，使用它
				else if (
					column.columnDef.meta &&
					"headerName" in column.columnDef.meta
				) {
					label = column.columnDef.meta.headerName as string;
				}
			}
			return {
				value: key,
				label: label,
			};
		}) || [];

	// 当切换搜索列时，清空搜索值并更新过滤
	const handleSearchKeyChange = (newKey: string) => {
		// 清除旧列的过滤
		if (selectedSearchKey) {
			table.getColumn(selectedSearchKey)?.setFilterValue("");
		}
		setSelectedSearchKey(newKey);
		setSearchValue("");
	};

	// 处理搜索值变化
	const handleSearchValueChange = (value: string) => {
		setSearchValue(value);
		if (selectedSearchKey) {
			table.getColumn(selectedSearchKey)?.setFilterValue(value);
		}
	};

	// 获取当前选中列的名称用于 placeholder
	const selectedColumnLabel =
		searchOptions.find((opt) => opt.value === selectedSearchKey)?.label ||
		selectedSearchKey;

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				{searchKeys && searchKeys.length > 0 && (
					<InputWithDropdown
						type="text"
						value={searchValue}
						onChange={handleSearchValueChange}
						placeholder={`${t("component.table.search")}${selectedColumnLabel}`}
						dropdownValue={selectedSearchKey}
						dropdownOptions={searchOptions}
						onDropdownChange={handleSearchKeyChange}
						className="h-8 w-[200px] lg:w-[300px]"
					/>
				)}
				{children}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => {
							table.resetColumnFilters();
							setSearchValue("");
						}}
						className="h-8 px-2 lg:px-3"
					>
						{t("component.table.reset")}
						<X className="ml-2 size-4" />
					</Button>
				)}
			</div>
			<CustomizeColumnOptions table={table} />
		</div>
	);
}
