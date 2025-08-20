import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { VirtualOrder } from "@/types/order/virtual-order";
import { formatDateTime, getOrderSideStyle, getOrderSideText, getOrderTypeText, getOrderStatusStyle, getOrderStatusText } from "@/types/order/virtual-order";


// Virtual Order 表格列定义
export const virtualOrderColumns: ColumnDef<VirtualOrder>[] = [
	{
		accessorKey: "orderId",
		header: "订单ID",
		size: 80,
		cell: ({ row }) => (
			<div className="text-left truncate font-mono text-xs pl-2" title={row.getValue("orderId")}>
				{row.getValue("orderId")}
			</div>
		),
	},
	{
		accessorKey: "nodeId",
		header: "节点ID",
		size: 140,
		cell: ({ row }) => (
			<div className="text-left truncate font-mono text-xs" title={row.getValue("nodeId")}>
				{row.getValue("nodeId")}
			</div>
		),
	},
	{
		accessorKey: "exchange",
		header: "交易所",
		size: 140,
		cell: ({ row }) => {
			const exchange = row.getValue("exchange") as string;
			return (
				
				<Badge variant="outline" className="text-xs justify-start font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-full" title={exchange}>{exchange}</Badge>
				
			);
		},
	},
	{
		accessorKey: "symbol",
		header: "交易对",
		size: 100,
		cell: ({ row }) => (
			<div className="text-left truncate font-mono text-xs" title={row.getValue("symbol")}>
				{row.getValue("symbol")}
			</div>
		),
	},
	{
		accessorKey: "orderSide",
		header: "方向",
		size: 80,
		cell: ({ row }) => {
			const side = row.getValue("orderSide") as string;
			return (
				<div className="flex justify-start">
					<Badge className={`${getOrderSideStyle(side)} text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full`} title={getOrderSideText(side)}>
						{getOrderSideText(side)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "orderType",
		header: "类型",
		size: 90,
		cell: ({ row }) => {
			const type = row.getValue("orderType") as string;
			return (
				<div className="flex justify-start">
					<Badge variant="outline" className="text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full" title={getOrderTypeText(type)}>{getOrderTypeText(type)}</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "orderStatus",
		header: "状态",
		size: 80,
		cell: ({ row }) => {
			const status = row.getValue("orderStatus") as string;
			return (
				<div className="flex justify-start">
					<Badge className={`${getOrderStatusStyle(status)} text-xs px-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-full`} title={getOrderStatusText(status)}>
						{getOrderStatusText(status)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "quantity",
		header: "数量",
		size: 90,
		cell: ({ row }) => {
			const quantity = row.getValue("quantity") as number;
			return (
				<div className="text-left font-mono text-sm pl-2">
					{quantity.toLocaleString("zh-CN")}
				</div>
			);
		},
	},
	{
		accessorKey: "openPrice",
		header: "开仓价",
		size: 110,
		cell: ({ row }) => {
			const price = row.getValue("openPrice") as number;
			const formatted = new Intl.NumberFormat("zh-CN", {
				// style: "currency",
				// currency: "USD",
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(price);
			return (
				<div className="text-left font-mono text-sm truncate" title={formatted}>
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "tp",
		header: "止盈",
		size: 100,
		cell: ({ row }) => {
			const tp = row.getValue("tp") as number | null;
			if (tp === null || tp === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				// style: "currency",
				// currency: "USD",
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(tp);
			return (
				<div className="text-left font-mono text-green-600 dark:text-green-400 text-sm truncate" title={formatted}>
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "sl",
		header: "止损",
		size: 100,
		cell: ({ row }) => {
			const sl = row.getValue("sl") as number | null;
			if (sl === null || sl === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				// style: "currency",
				// currency: "USD",
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(sl);
			return (
				<div className="text-left font-mono text-red-600 dark:text-red-400 text-sm truncate" title={formatted}>
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "createTime",
		header: "创建时间",
		size: 140,
		cell: ({ row }) => {
			const timeStr = formatDateTime(row.getValue("createTime"));
			return (
				<div className="text-sm font-mono truncate" title={timeStr}>
					{timeStr}
				</div>
			);
		},
	},
	{
		accessorKey: "updateTime",
		header: "更新时间",
		size: 140,
		cell: ({ row }) => {
			const timeStr = formatDateTime(row.getValue("updateTime"));
			return (
				<div className="text-sm font-mono truncate" title={timeStr}>
					{timeStr}
				</div>
			);
		},
	},
];