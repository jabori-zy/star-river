import type { Column, Table } from "@tanstack/react-table";

export interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	searchKeys?: string[];
	children?: React.ReactNode;
}

export interface DataTablePaginationProps<TData> {
	table: Table<TData>;
	pageSizeOptions?: number[];
}

export interface DataTableColumnHeaderProps<TData, TValue> {
	column: Column<TData, TValue>;
	title: string;
}

export interface CustomizeColumnOptionsProps<TData> {
	table: Table<TData>;
}

export interface DataTableExpandableProps<TData> {
	// Render content of expanded row
	renderExpandedRow?: (row: TData) => React.ReactNode;
	// Whether to expand all rows by default
	defaultExpanded?: boolean;
}
