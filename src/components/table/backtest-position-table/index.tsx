import {
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { VirtualPosition } from "@/types/position/virtual-position";
import { virtualPositionColumns } from "./columns";

interface BacktestPositionTableProps {
	data?: VirtualPosition[];
	title?: string;
	showTitle?: boolean;
}

// 持仓记录表
export function BacktestPositionTable({
	data,
	title = "持仓记录",
	showTitle = true,
}: BacktestPositionTableProps) {
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [rowSelection, setRowSelection] = React.useState({});
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const table = useReactTable({
		data: data || [],
		columns: virtualPositionColumns,
		state: {
			sorting,
			columnFilters,
			rowSelection,
			pagination,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		columnResizeMode: "onChange",
	});

	// 计算总页数
	const pageCount = table.getPageCount();

	return (
		<div className="flex w-full min-w-0 flex-col justify-center">
			{/* 标题 */}
			{showTitle && (
				<div className="flex items-center justify-between px-4">
					<div className="flex items-center gap-2">
						<h1 className="text-xl font-semibold">{title}</h1>
						<div className="text-sm text-muted-foreground">
							({data?.length || 0} 条记录)
						</div>
					</div>
				</div>
			)}

			{/* 表格 */}
			<div className="relative flex flex-col gap-4 w-full min-w-0 px-4">
				<div className="w-full min-w-0 overflow-hidden rounded-lg border mx-0">
					<div className="w-full min-w-0 overflow-x-auto">
						<Table className="w-full table-fixed">
							<TableHeader className="sticky top-0 z-10 bg-muted">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<TableHead
												key={header.id}
												colSpan={header.colSpan}
												style={{
													width: header.getSize(),
													minWidth: header.column.columnDef.minSize || 60,
													maxWidth: header.column.columnDef.maxSize || 300,
												}}
												className="px-3"
											>
												{header.isPlaceholder ? null : (
													<div
														{...(header.column.getCanSort()
															? {
																	className:
																		"cursor-pointer select-none hover:bg-accent/50 rounded px-1 py-1 text-xs",
																	onClick:
																		header.column.getToggleSortingHandler(),
																}
															: { className: "text-xs px-1" })}
													>
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
														{{
															asc: " ▲",
															desc: " ▼",
														}[header.column.getIsSorted() as string] ?? null}
													</div>
												)}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											className="border-b transition-colors hover:bg-muted/50"
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													style={{
														width: cell.column.getSize(),
														minWidth: cell.column.columnDef.minSize || 60,
														maxWidth: cell.column.columnDef.maxSize || 300,
													}}
													className="px-3 py-2"
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={virtualPositionColumns.length}
											className="h-24 text-center"
										>
											无数据
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>

				{/* 分页 */}
				<div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row px-0">
					<div className="flex w-full flex-col-reverse items-center gap-4 md:flex-row md:w-auto">
						<div className="flex items-center gap-2">
							<Label htmlFor="rows-per-page" className="text-sm font-medium">
								每页条数
							</Label>
							<Select
								value={`${table.getState().pagination.pageSize}`}
								onValueChange={(value) => {
									table.setPageSize(Number(value));
								}}
							>
								<SelectTrigger className="w-[80px]" id="rows-per-page">
									<SelectValue
										placeholder={table.getState().pagination.pageSize}
									/>
								</SelectTrigger>
								<SelectContent side="top">
									{[5, 10, 15, 20, 25, 30, 50, 100].map((pageSize) => (
										<SelectItem key={pageSize} value={`${pageSize}`}>
											{pageSize}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="flex items-center gap-6 lg:gap-8">
						<div className="flex items-center justify-center text-sm font-medium">
							第 {table.getState().pagination.pageIndex + 1} 页 共 {pageCount}{" "}
							页
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">首页</span>
								<ChevronsLeftIcon />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">上一页</span>
								<ChevronLeftIcon />
							</Button>
							<div className="flex items-center gap-2">
								{/* 页码显示逻辑 - 当页面数量较少时： */}
								{pageCount <= 10 ? (
									Array.from({ length: pageCount }, (_, i) => {
										const pageNumber = i + 1;
										return (
											<Button
												key={`page-${pageNumber}`}
												variant={
													i === table.getState().pagination.pageIndex
														? "default"
														: "outline"
												}
												className="h-8 w-8 p-0"
												onClick={() => table.setPageIndex(i)}
											>
												{pageNumber}
											</Button>
										);
									})
								) : (
									<>
										{/* 页面较多时：只显示5页 */}
										{[...Array(Math.min(5, pageCount))].map((_, idx) => {
											let pageIdx: number;
											const currentPage = table.getState().pagination.pageIndex;

											// 分页页码计算
											if (currentPage < 3) {
												// 当前页靠近开头：显示前5页
												pageIdx = idx;
											} else if (currentPage > pageCount - 4) {
												// 当前页靠近结尾：显示后5页
												pageIdx = pageCount - 5 + idx;
											} else {
												// 当前页处于中间：显示当前页的前后2个页
												pageIdx = currentPage - 2 + idx;
											}

											const pageNumber = pageIdx + 1;

											return (
												<Button
													key={`complex-page-${pageNumber}`}
													variant={
														pageIdx === currentPage ? "default" : "outline"
													}
													className="h-8 w-8 p-0 hidden sm:flex"
													onClick={() => table.setPageIndex(pageIdx)}
												>
													{pageNumber}
												</Button>
											);
										})}
									</>
								)}
							</div>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">下一页</span>
								<ChevronRightIcon />
							</Button>
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								size="icon"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">尾页</span>
								<ChevronsRightIcon />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BacktestPositionTable;
