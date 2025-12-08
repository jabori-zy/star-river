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

	// If searchKeys exist, select the first one by default
	const [selectedSearchKey, setSelectedSearchKey] = useState<string>(
		searchKeys?.[0] || "",
	);
	const [searchValue, setSearchValue] = useState<string>("");

	// Generate dropdown options based on searchKeys
	const searchOptions =
		searchKeys?.map((key) => {
			const column = table.getColumn(key);
			// Try to get column name from column.columnDef.header
			let label = key;
			if (column) {
				const header = column.columnDef.header;
				// If header is a string, use it directly
				if (typeof header === "string") {
					label = header;
				}
				// If meta.headerName exists, use it
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

	// When switching search column, clear search value and update filter
	const handleSearchKeyChange = (newKey: string) => {
		// Clear old column filter
		if (selectedSearchKey) {
			table.getColumn(selectedSearchKey)?.setFilterValue("");
		}
		setSelectedSearchKey(newKey);
		setSearchValue("");
	};

	// Handle search value changes
	const handleSearchValueChange = (value: string) => {
		setSearchValue(value);
		if (selectedSearchKey) {
			table.getColumn(selectedSearchKey)?.setFilterValue(value);
		}
	};

	// Get current selected column name for placeholder
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
