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
	// 渲染展开行的内容
	renderExpandedRow?: (row: TData) => React.ReactNode;
	// 默认是否展开所有行
	defaultExpanded?: boolean;
}
