import {
	type ColumnDef,
	type ColumnFiltersState,
	type ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	// 功能开关
	enableSorting?: boolean;
	enableFiltering?: boolean;
	enablePagination?: boolean;
	enableRowSelection?: boolean;
	enableRowExpansion?: boolean;
	// 搜索配置
	searchKeys?: string[];
	// 分页配置
	pageSize?: number;
	pageSizeOptions?: number[];
	// 样式配置
	enableCompactMode?: boolean;
	compactThreshold?: number;
	// 自定义工具栏内容
	toolbarChildren?: React.ReactNode;
	// 展开功能配置
	renderExpandedRow?: (row: TData) => React.ReactNode;
	defaultExpanded?: boolean;
	// 回调
	onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	enableSorting = true,
	enableFiltering = true,
	enablePagination = true,
	enableRowSelection = false,
	enableRowExpansion = false,
	searchKeys,
	pageSize = 10,
	pageSizeOptions = [10, 20, 50, 100],
	enableCompactMode = true,
	compactThreshold = 800,
	toolbarChildren,
	renderExpandedRow,
	defaultExpanded = false,
	onRowClick,
}: DataTableProps<TData, TValue>) {
	const { t } = useTranslation();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [expanded, setExpanded] = React.useState<ExpandedState>(
		defaultExpanded ? true : {},
	);
	const [isCompact, setIsCompact] = React.useState(false);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize,
	});

	const containerRef = React.useRef<HTMLDivElement>(null);

	// ResizeObserver 监听容器宽度变化
	React.useEffect(() => {
		if (!enableCompactMode || !containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			const width = entries[0].contentRect.width;
			setIsCompact(width < compactThreshold);
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [enableCompactMode, compactThreshold]);

	// 动态生成 columns：如果启用展开功能，自动在第一列插入展开按钮列
	const enhancedColumns = React.useMemo(() => {
		if (!enableRowExpansion || !renderExpandedRow) {
			return columns;
		}

		// 创建展开按钮列
		const expanderColumn: ColumnDef<TData, TValue> = {
			id: "expander",
			header: "",
			size: 50,
			minSize: 50,
			maxSize: 50,
			enableSorting: false,
			enableResizing: false,
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						row.toggleExpanded();
					}}
					className="h-6 w-6 p-0 hover:bg-gray-200"
				>
					{row.getIsExpanded() ? (
						<ChevronDown className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
				</Button>
			),
		};

		return [expanderColumn, ...columns];
	}, [enableRowExpansion, renderExpandedRow, columns]);

	const table = useReactTable({
		data,
		columns: enhancedColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: enablePagination
			? getPaginationRowModel()
			: undefined,
		getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
		getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
		getExpandedRowModel: enableRowExpansion ? getExpandedRowModel() : undefined,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
		onExpandedChange: enableRowExpansion ? setExpanded : undefined,
		onPaginationChange: enablePagination ? setPagination : undefined,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			expanded,
			pagination: enablePagination ? pagination : undefined,
		},
	});

	return (
		<div ref={containerRef} className="space-y-4">
			{(enableFiltering || searchKeys) && (
				<DataTableToolbar table={table} searchKeys={searchKeys}>
					{toolbarChildren}
				</DataTableToolbar>
			)}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={cn(
											"sticky top-0 z-10 bg-muted",
											isCompact && "p-1 text-xs",
										)}
										style={{
											width: header.getSize(),
											minWidth: header.column.columnDef.minSize,
											maxWidth: header.column.columnDef.maxSize,
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<Fragment key={row.id}>
									<TableRow
										data-state={row.getIsSelected() && "selected"}
										onClick={() => onRowClick?.(row.original)}
										className={cn(onRowClick && "cursor-pointer")}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className={cn(isCompact && "p-1 text-xs")}
												style={{
													width: cell.column.getSize(),
													minWidth: cell.column.columnDef.minSize,
													maxWidth: cell.column.columnDef.maxSize,
												}}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
									{/* 展开行 */}
									{enableRowExpansion &&
										row.getIsExpanded() &&
										renderExpandedRow && (
											<TableRow>
												<TableCell
													colSpan={enhancedColumns.length}
													className="p-0 bg-muted/30"
												>
													<div className="py-2 px-4">
														{renderExpandedRow(row.original)}
													</div>
												</TableCell>
											</TableRow>
										)}
								</Fragment>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={enhancedColumns.length}
									className="h-24 text-center"
								>
									{t("component.table.noData")}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{enablePagination && (
				<DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
			)}
		</div>
	);
}
