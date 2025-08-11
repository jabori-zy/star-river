import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { VirtualOrder } from "@/types/order/virtual-order";
import { formatDateTime, getOrderSideStyle, getOrderSideText, getOrderTypeText, getOrderStatusStyle, getOrderStatusText } from "@/types/order/virtual-order";


// Virtual Order 表格列定义
export const virtualOrderColumns: ColumnDef<VirtualOrder>[] = [
	{
		accessorKey: "orderId",
		header: "订单ID",
		size: 120,
		cell: ({ row }) => (
			<div className="text-left truncate font-mono text-xs" title={row.getValue("orderId")}>
				{row.getValue("orderId")}
			</div>
		),
	},
	// {
	// 	accessorKey: "strategyId",
	// 	header: "策略ID",
	// 	size: 120,
	// 	cell: ({ row }) => (
	// 		<div className="truncate font-mono text-xs" title={row.getValue("strategyId")}>
	// 			{row.getValue("strategyId")}
	// 		</div>
	// 	),
	// },
	{
		accessorKey: "nodeId",
		header: "节点ID",
		size: 100,
		cell: ({ row }) => (
			<div className="text-left truncate font-mono text-xs" title={row.getValue("nodeId")}>
				{row.getValue("nodeId")}
			</div>
		),
	},
	{
		accessorKey: "exchange",
		header: () => (
			<div className="text-left">交易所</div>
		),
		size: 80,
		cell: ({ row }) => {
			const exchange = row.getValue("exchange") as string;
			return (
				<div className="flex justify-left">
					<Badge variant="outline" className="text-xs">{exchange}</Badge>
				</div>
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
		header: () => (
			<div className="text-left">方向</div>
		),
		size: 80,
		cell: ({ row }) => {
			const side = row.getValue("orderSide") as string;
			return (
				<div className="flex justify-start">
					<Badge className={`${getOrderSideStyle(side)} font-mono text-xs`}>
						{getOrderSideText(side)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "orderType",
		header: () => (
			<div className="text-center">类型</div>
		),
		size: 90,
		cell: ({ row }) => {
			const type = row.getValue("orderType") as string;
			return (
				<div className="flex justify-start">
					<Badge variant="outline" className="text-xs">{getOrderTypeText(type)}</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "orderStatus",
		header: () => (
			<div className="text-center">状态</div>
		),
		size: 80,
		cell: ({ row }) => {
			const status = row.getValue("orderStatus") as string;
			return (
				<div className="flex justify-start">
					<Badge className={`${getOrderStatusStyle(status)} text-xs px-2`}>
						{getOrderStatusText(status)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "quantity",
		header: () => (
			<div className="text-left">数量</div>
		),
		size: 90,
		cell: ({ row }) => {
			const quantity = row.getValue("quantity") as number;
			return (
				<div className="text-left font-mono text-sm">
					{quantity.toLocaleString("zh-CN")}
				</div>
			);
		},
	},
	{
		accessorKey: "openPrice",
		header: () => (
			<div className="text-left">开仓价</div>
		),
		size: 110,
		cell: ({ row }) => {
			const price = row.getValue("openPrice") as number;
			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
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
		header: () => (
			<div className="text-left">止盈</div>
		),
		size: 100,
		cell: ({ row }) => {
			const tp = row.getValue("tp") as number | null;
			if (tp === null || tp === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
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
		header: () => (
			<div className="text-left">止损</div>
		),
		size: 100,
		cell: ({ row }) => {
			const sl = row.getValue("sl") as number | null;
			if (sl === null || sl === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
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