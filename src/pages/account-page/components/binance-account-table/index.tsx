import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	MeasuringStrategy,
	MouseSensor,
	TouchSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import type { BinanceAccount } from "@/types/account";
import { TableItem } from "../account-table/table-item";
import { binanceColumns } from "./columns";

interface BinanceAccountTableProps {
	tableData: BinanceAccount[];
	title?: string;
}

// Binance账户表格
export function BinanceAccountTable({
	tableData: initialTableData,
	title = "Binance账户",
}: BinanceAccountTableProps) {
	const [tableData, setTableData] = React.useState<BinanceAccount[]>(
		() => initialTableData,
	);

	// 当initialTableData变化时更新tableData
	React.useEffect(() => {
		setTableData(initialTableData);
	}, [initialTableData]);

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [rowSelection, setRowSelection] = React.useState({});
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	// 生成唯一ID用于DndContext
	const dndId = React.useId();

	// 配置传感器，添加激活约束以避免误触
	const sensors = useSensors(
		useSensor(MouseSensor, {
			// 鼠标拖动需要移动一定距离才激活
			activationConstraint: {
				distance: 10, // 需要移动10像素才能开始拖动
			},
		}),
		useSensor(TouchSensor, {
			// 触摸拖动需要长按才激活
			activationConstraint: {
				delay: 250, // 需要按住250毫秒才能开始拖动
				tolerance: 5, // 在等待期间允许5像素的移动容差
			},
		}),
		useSensor(KeyboardSensor, {}),
	);

	// 获取所有数据的ID列表
	const dataIds = React.useMemo<UniqueIdentifier[]>(
		() => tableData.map((item) => item.id),
		[tableData],
	);

	const table = useReactTable({
		data: tableData,
		columns: binanceColumns,
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
	});

	// 处理拖拽结束
	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			setTableData((items) => {
				const oldIndex = dataIds.indexOf(active.id);
				const newIndex = dataIds.indexOf(over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	}

	// 总页数
	const pageCount = table.getPageCount();

	return (
		<div className="flex w-full flex-col justify-start gap-6">
			<div className="flex items-center justify-between px-4 lg:px-6">
				<div className="flex items-center gap-2">
					<h1 className="text-xl font-semibold">{title}</h1>
				</div>
			</div>
			<div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
				<div className="overflow-hidden rounded-lg border">
					<div className="overflow-x-auto">
						<DndContext
							id={dndId}
							sensors={sensors}
							collisionDetection={closestCenter}
							modifiers={[restrictToVerticalAxis]}
							onDragEnd={handleDragEnd}
							measuring={{
								droppable: {
									strategy: MeasuringStrategy.Always,
								},
							}}
						>
							<Table>
								<TableHeader className="sticky top-0 z-10 bg-muted">
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => (
												<TableHead key={header.id} colSpan={header.colSpan}>
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
										<SortableContext
											items={dataIds}
											strategy={verticalListSortingStrategy}
										>
											{table.getRowModel().rows.map((row) => (
												<TableItem key={row.id} row={row} />
											))}
										</SortableContext>
									) : (
										<TableRow>
											<TableCell
												colSpan={binanceColumns.length}
												className="h-24 text-center"
											>
												暂无数据
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</DndContext>
					</div>
				</div>
				<div className="flex flex-col-reverse items-center justify-between gap-4 px-2 md:flex-row">
					<div className="flex w-full flex-col-reverse items-center gap-4 md:flex-row md:w-auto">
						<div className="flex items-center gap-2">
							<Label htmlFor="rows-per-page" className="text-sm font-medium">
								每页行数
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
							第 {table.getState().pagination.pageIndex + 1} 页，共 {pageCount}{" "}
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
								{/* 页码按钮显示逻辑 - 最多显示5个页码 */}
								{pageCount <= 10 ? (
									Array.from({ length: pageCount }, (_, i) => (
										<Button
											key={i}
											variant={
												i === table.getState().pagination.pageIndex
													? "default"
													: "outline"
											}
											className="h-8 w-8 p-0"
											onClick={() => table.setPageIndex(i)}
										>
											{i + 1}
										</Button>
									))
								) : (
									<>
										{/* 页码较多时只显示5个页码 */}
										{[...Array(Math.min(5, pageCount))].map((_, idx) => {
											let pageIdx: number;
											const currentPage = table.getState().pagination.pageIndex;

											// 计算要显示的页码
											if (currentPage < 3) {
												// 当前页靠前时显示前5页
												pageIdx = idx;
											} else if (currentPage > pageCount - 4) {
												// 当前页靠后时显示后5页
												pageIdx = pageCount - 5 + idx;
											} else {
												// 当前页居中时显示当前页为中间的2页
												pageIdx = currentPage - 2 + idx;
											}

											return (
												<Button
													key={pageIdx}
													variant={
														pageIdx === currentPage ? "default" : "outline"
													}
													className="h-8 w-8 p-0 hidden sm:flex"
													onClick={() => table.setPageIndex(pageIdx)}
												>
													{pageIdx + 1}
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
								<span className="sr-only">末页</span>
								<ChevronsRightIcon />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BinanceAccountTable;
