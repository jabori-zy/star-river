import type { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import { Badge } from "@/components/ui/badge";
import { PositionSide, PositionState } from "@/types/position";
import type { VirtualPosition } from "@/types/position/virtual-position";

// 仓位方向样式
export const getPositionSideStyle = (side: PositionSide) => {
	switch (side) {
		case PositionSide.LONG:
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case PositionSide.SHORT:
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

// 仓位方向文本
export const getPositionSideText = (side: PositionSide) => {
	switch (side) {
		case PositionSide.LONG:
			return "多头";
		case PositionSide.SHORT:
			return "空头";
		default:
			return side;
	}
};

// 仓位状态样式
export const getPositionStateStyle = (state: PositionState) => {
	switch (state) {
		case PositionState.OPEN:
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
		case PositionState.CLOSE:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		case PositionState.PARTIALLY_CLOSED:
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
		case PositionState.FORCED_CLOSED:
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

// 仓位状态文本
export const getPositionStateText = (state: PositionState) => {
	switch (state) {
		case PositionState.OPEN:
			return "开仓";
		case PositionState.CLOSE:
			return "平仓";
		case PositionState.PARTIALLY_CLOSED:
			return "部分平仓";
		case PositionState.FORCED_CLOSED:
			return "强制平仓";
		default:
			return state;
	}
};

// Virtual Position 表格列定义
export const virtualPositionColumns: ColumnDef<VirtualPosition>[] = [
	{
		accessorKey: "positionId",
		header: "仓位ID",
		size: 50,
		minSize: 50,
		maxSize: 60,
		enableResizing: false,
		cell: ({ row }) => (
			<div
				className="text-left truncate font-mono text-xs pl-2"
				title={row.getValue("positionId")}
			>
				{row.getValue("positionId")}
			</div>
		),
	},
	{
		accessorKey: "orderId",
		header: "订单ID",
		size: 50,
		minSize: 50,
		maxSize: 80,
		enableResizing: false,
		cell: ({ row }) => (
			<div
				className="text-left truncate font-mono text-xs"
				title={row.getValue("orderId")}
			>
				{row.getValue("orderId")}
			</div>
		),
	},
	{
		accessorKey: "nodeId",
		header: "节点ID",
		size: 140,
		cell: ({ row }) => (
			<div
				className="text-left truncate font-mono text-xs"
				title={row.getValue("nodeId")}
			>
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
				<Badge
					variant="outline"
					className="text-xs justify-start font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
					title={exchange}
				>
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
			<div
				className="text-left truncate font-mono text-xs"
				title={row.getValue("symbol")}
			>
				{row.getValue("symbol")}
			</div>
		),
	},
	{
		accessorKey: "positionSide",
		header: "方向",
		size: 80,
		cell: ({ row }) => {
			const side = row.getValue("positionSide") as PositionSide;
			return (
				<div className="flex justify-start">
					<Badge
						className={`${getPositionSideStyle(side)} font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full`}
						title={getPositionSideText(side)}
					>
						{getPositionSideText(side)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "positionState",
		header: "状态",
		size: 90,
		cell: ({ row }) => {
			const state = row.getValue("positionState") as PositionState;
			return (
				<div className="flex justify-start">
					<Badge
						className={`${getPositionStateStyle(state)} text-xs px-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-full`}
						title={getPositionStateText(state)}
					>
						{getPositionStateText(state)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "quantity",
		header: "数量",
		size: 60,
		minSize: 60,
		maxSize: 60,
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
		accessorKey: "currentPrice",
		header: "当前价",
		size: 110,
		cell: ({ row }) => {
			const price = row.getValue("currentPrice") as number;
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
		accessorKey: "unrealizedProfit",
		header: "未实现盈亏",
		size: 120,
		cell: ({ row }) => {
			const profit = row.getValue("unrealizedProfit") as number;
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
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
					{isPositive ? "+" : ""}
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
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(tp);
			return (
				<div
					className="text-left font-mono text-green-600 dark:text-green-400 text-sm truncate"
					title={formatted}
				>
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
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(sl);
			return (
				<div
					className="text-left font-mono text-red-600 dark:text-red-400 text-sm truncate"
					title={formatted}
				>
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "forcePrice",
		header: "强制平仓价",
		size: 100,
		cell: ({ row }) => {
			const forcePrice = row.getValue("forcePrice") as number;
			if (forcePrice === null || forcePrice === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(forcePrice);
			return (
				<div className="text-left font-mono text-sm truncate" title={formatted}>
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "margin",
		header: "保证金",
		size: 100,
		cell: ({ row }) => {
			const margin = row.getValue("margin") as number;
			if (margin === null || margin === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(margin);
			return (
				<div className="text-left font-mono text-sm truncate" title={formatted}>
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "marginRatio",
		header: "保证金比例",
		size: 100,
		cell: ({ row }) => {
			const marginRatio = row.getValue("marginRatio") as number;
			if (marginRatio === null || marginRatio === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(marginRatio);
			return (
				<div className="text-left font-mono text-sm truncate" title={formatted}>
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "createTime",
		header: "创建时间",
		size: 160,
		cell: ({ row }) => {
			const datetime = row.getValue("createTime") as string;
			const timeStr = DateTime.fromISO(datetime).toFormat(
				"yyyy-MM-dd HH:mm:ss",
			);

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
		size: 160,
		cell: ({ row }) => {
			const datetime = row.getValue("updateTime") as string;
			const timeStr = DateTime.fromISO(datetime).toFormat(
				"yyyy-MM-dd HH:mm:ss",
			);
			return (
				<div className="text-sm font-mono truncate" title={timeStr}>
					{timeStr}
				</div>
			);
		},
	},
];
