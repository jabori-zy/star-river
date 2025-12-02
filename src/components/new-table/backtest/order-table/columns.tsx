import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/common-table/data-table-column-header";
import { TimeDisplay } from "@/components/time-display";
import { Badge } from "@/components/ui/badge";
import type { FuturesOrderSide } from "@/types/order";
import type { VirtualOrder } from "@/types/order/virtual-order";
import {
	getOrderSideStyle,
	getOrderSideText,
	getOrderStatusStyle,
	getOrderStatusText,
	getOrderTypeText,
} from "@/types/order/virtual-order";

export const orderColumns: ColumnDef<VirtualOrder>[] = [
	{
		accessorKey: "orderId",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="订单ID" />
		),
		cell: ({ row }) => (
			<div
				className="truncate font-mono text-xs pl-2"
				title={String(row.getValue("orderId"))}
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
		enableSorting: true,
		meta: {
			headerName: "订单ID",
		},
	},
	{
		accessorKey: "nodeName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="节点名称" />
		),
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
			const capitalizedExchange =
				exchange.charAt(0).toUpperCase() + exchange.slice(1);
			return (
				<Badge
					variant="outline"
					className="text-xs justify-start font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
					title={capitalizedExchange}
				>
					{capitalizedExchange}
				</Badge>
			);
		},
		size: 140,
		enableSorting: false,
	},
	{
		accessorKey: "symbol",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="交易对" />
		),
		cell: ({ row }) => (
			<div
				className="truncate font-mono text-xs"
				title={row.getValue("symbol")}
			>
				{row.getValue("symbol")}
			</div>
		),
		size: 100,
		enableSorting: true,
		meta: {
			headerName: "交易对",
		},
	},
	{
		accessorKey: "orderSide",
		header: "方向",
		cell: ({ row }) => {
			const side = row.getValue("orderSide") as FuturesOrderSide;
			return (
				<div className="flex justify-start">
					<Badge
						className={`${getOrderSideStyle(side)} text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full`}
						title={getOrderSideText(side)}
					>
						{getOrderSideText(side)}
					</Badge>
				</div>
			);
		},
		size: 80,
		enableSorting: false,
	},
	{
		accessorKey: "orderType",
		header: "类型",
		cell: ({ row }) => {
			const type = row.getValue("orderType") as string;
			return (
				<div className="flex justify-start">
					<Badge
						variant="outline"
						className="text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
						title={getOrderTypeText(type)}
					>
						{getOrderTypeText(type)}
					</Badge>
				</div>
			);
		},
		size: 90,
		enableSorting: false,
	},
	{
		accessorKey: "orderStatus",
		header: "状态",
		cell: ({ row }) => {
			const status = row.getValue("orderStatus") as string;
			return (
				<div className="flex justify-start">
					<Badge
						className={`${getOrderStatusStyle(status)} text-xs px-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-full`}
						title={getOrderStatusText(status)}
					>
						{getOrderStatusText(status)}
					</Badge>
				</div>
			);
		},
		size: 80,
		enableSorting: false,
	},
	{
		accessorKey: "quantity",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="数量" />
		),
		cell: ({ row }) => {
			const quantity = row.getValue("quantity") as number;
			return (
				<div className="font-mono text-sm pl-2">
					{quantity.toLocaleString("zh-CN")}
				</div>
			);
		},
		size: 90,
		enableSorting: true,
	},
	{
		accessorKey: "openPrice",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="开仓价" />
		),
		cell: ({ row }) => {
			const price = row.getValue("openPrice") as number;
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
		accessorKey: "tp",
		header: "止盈",
		cell: ({ row }) => {
			const tp = row.getValue("tp") as number | null;
			if (tp === null || tp === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(tp);
			return (
				<div
					className="font-mono text-green-600 dark:text-green-400 text-sm truncate"
					title={formatted}
				>
					{formatted}
				</div>
			);
		},
		size: 100,
		enableSorting: false,
	},
	{
		accessorKey: "sl",
		header: "止损",
		cell: ({ row }) => {
			const sl = row.getValue("sl") as number | null;
			if (sl === null || sl === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(sl);
			return (
				<div
					className="font-mono text-red-600 dark:text-red-400 text-sm truncate"
					title={formatted}
				>
					{formatted}
				</div>
			);
		},
		size: 100,
		enableSorting: false,
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
					className="text-sm font-mono truncate"
				/>
			);
		},
		size: 140,
		enableSorting: true,
	},
	{
		accessorKey: "updateTime",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="更新时间" />
		),
		cell: ({ row }) => {
			const datetime = row.getValue("updateTime") as string;
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
					className="text-sm font-mono truncate"
				/>
			);
		},
		size: 140,
		enableSorting: true,
	},
];
