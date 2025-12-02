import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/common-table/data-table-column-header";
import { TimeDisplay } from "@/components/time-display";
import { Badge } from "@/components/ui/badge";
import { TransactionSide } from "@/types/transaction";
import type { VirtualTransaction } from "@/types/transaction/virtual-transaction";

// 获取交易方向样式
const getTransactionSideStyle = (side: TransactionSide): string => {
	switch (side) {
		case TransactionSide.Long:
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case TransactionSide.Short:
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
	}
};

// 获取交易方向文本
const getTransactionSideText = (side: TransactionSide): string => {
	switch (side) {
		case TransactionSide.Long:
			return "开多";
		case TransactionSide.Short:
			return "开空";
		default:
			return side;
	}
};

// Virtual Transaction 表格列定义
export const transactionColumns: ColumnDef<VirtualTransaction>[] = [
	{
		accessorKey: "transactionId",
		header: "交易ID",
		cell: ({ row }) => (
			<div
				className="truncate font-mono text-xs"
				title={String(row.getValue("transactionId"))}
			>
				{row.getValue("transactionId")}
			</div>
		),
		filterFn: (row, id, value) => {
			// 对于交易ID，使用精确匹配或前缀匹配
			const transactionId = String(row.getValue(id));
			return transactionId.startsWith(value);
		},
		size: 80,
		enableSorting: false,
	},
	{
		accessorKey: "orderId",
		header: "订单ID",
		cell: ({ row }) => (
			<div
				className="truncate font-mono text-xs"
				title={row.getValue("orderId")}
			>
				{row.getValue("orderId")}
			</div>
		),
		filterFn: (row, id, value) => {
			// 对于订单ID，使用精确匹配或前缀匹配
			const orderId = String(row.getValue(id));
			return orderId.startsWith(value);
		},
		size: 80,
		enableSorting: false,
	},
	{
		accessorKey: "positionId",
		header: "仓位ID",
		cell: ({ row }) => (
			<div
				className="truncate font-mono text-xs"
				title={row.getValue("positionId")}
			>
				{row.getValue("positionId")}
			</div>
		),
		filterFn: (row, id, value) => {
			// 对于仓位ID，使用精确匹配或前缀匹配
			const positionId = String(row.getValue(id));
			return positionId.startsWith(value);
		},
		size: 80,
		enableSorting: false,
	},
	{
		accessorKey: "nodeName",
		header: "节点名称",
		cell: ({ row }) => (
			<div
				className="truncate font-mono text-xs"
				title={row.getValue("nodeName")}
			>
				{row.getValue("nodeName")}
			</div>
		),
		size: 140,
		enableSorting: false,
	},
	{
		accessorKey: "exchange",
		header: "交易所",
		cell: ({ row }) => {
			const exchange = row.getValue("exchange") as string;
			return (
				<Badge
					variant="outline"
					className="text-xs justify-start font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
					title={exchange}
				>
					{exchange}
				</Badge>
			);
		},
		size: 100,
		enableSorting: false,
	},
	{
		accessorKey: "symbol",
		header: "交易对",
		cell: ({ row }) => (
			<div
				className="truncate font-mono text-xs"
				title={row.getValue("symbol")}
			>
				{row.getValue("symbol")}
			</div>
		),
		size: 100,
		enableSorting: false,
	},
	{
		accessorKey: "transactionSide",
		header: "交易方向",
		cell: ({ row }) => {
			const side = row.getValue("transactionSide") as TransactionSide;
			return (
				<div className="flex justify-start">
					<Badge
						className={`${getTransactionSideStyle(side)} font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full`}
						title={getTransactionSideText(side)}
					>
						{getTransactionSideText(side)}
					</Badge>
				</div>
			);
		},
		size: 90,
		enableSorting: false,
	},
	{
		accessorKey: "quantity",
		header: "数量",
		cell: ({ row }) => {
			const quantity = row.getValue("quantity") as number;
			return (
				<div className="font-mono text-sm">
					{quantity.toLocaleString("zh-CN")}
				</div>
			);
		},
		size: 90,
		enableSorting: false,
	},
	{
		accessorKey: "price",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="成交价" />
		),
		cell: ({ row }) => {
			const price = row.getValue("price") as number;
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(price);
			return (
				<div className="font-mono text-sm truncate" title={formatted}>
					{formatted}
				</div>
			);
		},
		size: 110,
		enableSorting: true,
	},
	{
		accessorKey: "profit",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="收益" />
		),
		cell: ({ row }) => {
			const profit = row.getValue("profit") as number | null;
			if (profit === null || profit === undefined) {
				return <div className="font-mono text-sm text-gray-400">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
				signDisplay: "always",
			}).format(profit);
			const isPositive = profit > 0;
			const isNegative = profit < 0;

			return (
				<div
					className={`font-mono text-sm truncate ${
						isPositive
							? "text-green-600 dark:text-green-400"
							: isNegative
								? "text-red-600 dark:text-red-400"
								: "text-gray-600 dark:text-gray-400"
					}`}
					title={formatted}
				>
					{formatted}
				</div>
			);
		},
		size: 110,
		enableSorting: true,
	},
	{
		accessorKey: "createTime",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="创建时间" />
		),
		cell: ({ row }) => {
			const datetime = row.getValue("createTime") as string;
			return (
				<TimeDisplay
					date={datetime}
					displayOptions={{
						dateFormat: "full",
						showTimezone: false,
						timezoneFormat: "offset",
					}}
					tooltipOptions={{
						dateFormat: "full",
						showTimezone: true,
						timezoneFormat: "short",
					}}
					className="text-sm font-mono"
				/>
			);
		},
		size: 180,
		enableSorting: true,
	},
];
