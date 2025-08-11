import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { VirtualOrder } from "@/types/order/virtual-order";

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
	if (!dateTimeStr) return "-";
	try {
		const date = new Date(dateTimeStr);
		return date
			.toLocaleString("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			})
			.replace(/\//g, "-");
	} catch {
		return dateTimeStr;
	}
};

// 订单方向样式
const getOrderSideStyle = (side: string) => {
	switch (side) {
		case "buy":
		case "BUY":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "sell":
		case "SELL":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

// 订单方向文本
const getOrderSideText = (side: string) => {
	switch (side) {
		case "buy":
		case "BUY":
			return "买入";
		case "sell":
		case "SELL":
			return "卖出";
		default:
			return side;
	}
};

// 订单状态样式
const getOrderStatusStyle = (status: string) => {
	switch (status) {
		case "FILLED":
		case "filled":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "PENDING":
		case "pending":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
		case "CANCELED":
		case "canceled":
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		case "FAILED":
		case "failed":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
	}
};

// 订单状态文本
const getOrderStatusText = (status: string) => {
	switch (status) {
		case "FILLED":
		case "filled":
			return "已成交";
		case "PENDING":
		case "pending":
			return "待成交";
		case "CANCELED":
		case "canceled":
			return "已取消";
		case "FAILED":
		case "failed":
			return "失败";
		default:
			return status;
	}
};

// 订单类型文本
const getOrderTypeText = (type: string) => {
	switch (type) {
		case "MARKET":
		case "market":
			return "市价单";
		case "LIMIT":
		case "limit":
			return "限价单";
		case "STOP":
		case "stop":
			return "止损单";
		case "STOP_LIMIT":
		case "stop_limit":
			return "止损限价单";
		default:
			return type;
	}
};

// Virtual Order 表格列定义
export const virtualOrderColumns: ColumnDef<VirtualOrder>[] = [
	{
		accessorKey: "orderId",
		header: "订单ID",
		cell: ({ row }) => (
			<div className="whitespace-nowrap font-mono text-xs">
				{row.getValue("orderId")}
			</div>
		),
	},
	{
		accessorKey: "strategyId",
		header: "策略ID",
		cell: ({ row }) => (
			<div className="whitespace-nowrap font-mono text-xs">
				{row.getValue("strategyId")}
			</div>
		),
	},
	{
		accessorKey: "nodeId",
		header: "节点ID",
		cell: ({ row }) => (
			<div className="whitespace-nowrap font-mono text-xs">
				{row.getValue("nodeId")}
			</div>
		),
	},
	{
		accessorKey: "exchange",
		header: "交易所",
		cell: ({ row }) => {
			const exchange = row.getValue("exchange") as string;
			return (
				<div className="whitespace-nowrap">
					<Badge variant="outline">{exchange}</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "symbol",
		header: "交易对",
		cell: ({ row }) => (
			<div className="whitespace-nowrap font-medium">
				{row.getValue("symbol")}
			</div>
		),
	},
	{
		accessorKey: "orderSide",
		header: "订单方向",
		cell: ({ row }) => {
			const side = row.getValue("orderSide") as string;
			return (
				<div className="whitespace-nowrap">
					<Badge className={getOrderSideStyle(side)}>
						{getOrderSideText(side)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "orderType",
		header: "订单类型",
		cell: ({ row }) => {
			const type = row.getValue("orderType") as string;
			return (
				<div className="whitespace-nowrap">
					<Badge variant="outline">{getOrderTypeText(type)}</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "orderStatus",
		header: "订单状态",
		cell: ({ row }) => {
			const status = row.getValue("orderStatus") as string;
			return (
				<div className="whitespace-nowrap">
					<Badge className={getOrderStatusStyle(status)}>
						{getOrderStatusText(status)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "quantity",
		header: "数量",
		cell: ({ row }) => {
			const quantity = row.getValue("quantity") as number;
			return (
				<div className="whitespace-nowrap text-right font-mono">
					{quantity.toLocaleString("zh-CN")}
				</div>
			);
		},
	},
	{
		accessorKey: "openPrice",
		header: "开仓价格",
		cell: ({ row }) => {
			const price = row.getValue("openPrice") as number;
			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 2,
				maximumFractionDigits: 8,
			}).format(price);
			return (
				<div className="whitespace-nowrap text-right font-mono">
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "tp",
		header: "止盈价格",
		cell: ({ row }) => {
			const tp = row.getValue("tp") as number | null;
			if (tp === null || tp === undefined) {
				return <div className="whitespace-nowrap text-center text-gray-400">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 2,
				maximumFractionDigits: 8,
			}).format(tp);
			return (
				<div className="whitespace-nowrap text-right font-mono text-green-600 dark:text-green-400">
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "sl",
		header: "止损价格",
		cell: ({ row }) => {
			const sl = row.getValue("sl") as number | null;
			if (sl === null || sl === undefined) {
				return <div className="whitespace-nowrap text-center text-gray-400">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 2,
				maximumFractionDigits: 8,
			}).format(sl);
			return (
				<div className="whitespace-nowrap text-right font-mono text-red-600 dark:text-red-400">
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "createTime",
		header: "创建时间",
		cell: ({ row }) => (
			<div className="whitespace-nowrap text-sm">
				{formatDateTime(row.getValue("createTime"))}
			</div>
		),
	},
	{
		accessorKey: "updateTime",
		header: "更新时间",
		cell: ({ row }) => (
			<div className="whitespace-nowrap text-sm">
				{formatDateTime(row.getValue("updateTime"))}
			</div>
		),
	},
];