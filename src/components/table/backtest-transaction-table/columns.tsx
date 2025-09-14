import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { VirtualTransaction } from "@/types/transaction/virtual-transaction";
import { TransactionSide, TransactionType } from "@/types/transaction";
import { DateTime } from "luxon";

// 获取交易类型样式
const getTransactionTypeStyle = (type: TransactionType): string => {
	switch (type) {
		case TransactionType.Open:
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
		case TransactionType.Close:
			return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
	}
};

// 获取交易类型文本
const getTransactionTypeText = (type: TransactionType): string => {
	switch (type) {
		case TransactionType.Open:
			return "开仓";
		case TransactionType.Close:
			return "平仓";
		default:
			return type;
	}
};

// 获取交易方向样式
const getTransactionSideStyle = (side: TransactionSide): string => {
	switch (side) {
		case TransactionSide.OpenLong:
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case TransactionSide.OpenShort:
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		case TransactionSide.CloseLong:
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 opacity-75";
		case TransactionSide.CloseShort:
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 opacity-75";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
	}
};

// 获取交易方向文本
const getTransactionSideText = (side: TransactionSide): string => {
	switch (side) {
		case TransactionSide.OpenLong:
			return "开多";
		case TransactionSide.OpenShort:
			return "开空";
		case TransactionSide.CloseLong:
			return "平多";
		case TransactionSide.CloseShort:
			return "平空";
		default:
			return side;
	}
};

// Virtual Transaction 表格列定义
export const virtualTransactionColumns: ColumnDef<VirtualTransaction>[] = [
	{
		accessorKey: "transactionId",
		header: "交易ID",
		size: 50,
		minSize: 50,
		maxSize: 60,
		enableResizing: false,
		cell: ({ row }) => (
			<div className="text-left truncate font-mono text-xs pl-2" title={String(row.getValue("transactionId"))}>
				{row.getValue("transactionId")}
			</div>
		),
	},
	{
		accessorKey: "orderId",
		header: "订单ID",
		size: 50,
		minSize: 50,
		maxSize: 60,
		enableResizing: false,
		cell: ({ row }) => (
			<div className="text-left truncate font-mono text-xs" title={row.getValue("orderId")}>
				{row.getValue("orderId")}
			</div>
		),
	},
	{
		accessorKey: "positionId",
		header: "仓位ID",
		size: 50,
		minSize: 50,
		maxSize: 60,
		enableResizing: false,
		cell: ({ row }) => (
			<div className="text-left truncate font-mono text-xs" title={row.getValue("positionId")}>
				{row.getValue("positionId")}
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
		size: 100,
		cell: ({ row }) => {
			const exchange = row.getValue("exchange") as string;
			return (
				<Badge variant="outline" className="text-xs justify-start font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-full" title={exchange}>
					{exchange}
				</Badge>
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
		accessorKey: "transactionType",
		header: "交易类型",
		size: 90,
		cell: ({ row }) => {
			const type = row.getValue("transactionType") as TransactionType;
			return (
				<div className="flex justify-start">
					<Badge className={`${getTransactionTypeStyle(type)} font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full`} title={getTransactionTypeText(type)}>
						{getTransactionTypeText(type)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "transactionSide",
		header: "交易方向",
		size: 90,
		cell: ({ row }) => {
			const side = row.getValue("transactionSide") as TransactionSide;
			return (
				<div className="flex justify-start">
					<Badge className={`${getTransactionSideStyle(side)} font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full`} title={getTransactionSideText(side)}>
						{getTransactionSideText(side)}
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
		accessorKey: "price",
		header: "成交价",
		size: 110,
		cell: ({ row }) => {
			const price = row.getValue("price") as number;
			const formatted = new Intl.NumberFormat("zh-CN", {
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
		accessorKey: "profit",
		header: "收益",
		size: 100,
		cell: ({ row }) => {
			const profit = row.getValue("profit") as number | null;
			if (profit === null || profit === undefined) {
				return <div className="pl-2 text-left font-mono text-sm text-gray-400">-</div>;
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
					className={`text-left font-mono text-sm truncate ${
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
	},
	{
		accessorKey: "createTime",
		header: "创建时间",
		size: 140,
		cell: ({ row }) => {
			const datetime = row.getValue("createTime") as string;
			const timeStr = DateTime.fromISO(datetime).toFormat("yyyy-MM-dd HH:mm:ss");
			
			return (
				<div className="text-sm font-mono truncate" title={timeStr}>
					{timeStr}
				</div>
			);
		},
	},
];