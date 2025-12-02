import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/common-table/data-table-column-header";
import { TimeDisplay } from "@/components/time-display";
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
export const positionColumns: ColumnDef<VirtualPosition>[] = [
	{
		accessorKey: "positionId",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="仓位ID" />
		),
		cell: ({ row }) => (
			<div
				className="truncate font-mono text-xs pl-2"
				title={String(row.getValue("positionId"))}
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
		enableSorting: true,
		meta: {
			headerName: "仓位ID",
		},
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
		accessorKey: "positionSide",
		header: "方向",
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
		size: 80,
		enableSorting: false,
	},
	{
		accessorKey: "positionState",
		header: "状态",
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
		size: 90,
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
		accessorKey: "currentPrice",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="当前价" />
		),
		cell: ({ row }) => {
			const price = row.getValue("currentPrice") as number;
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
		accessorKey: "unrealizedProfit",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="未实现盈亏" />
		),
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
					className={`font-mono text-sm truncate ${
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
		size: 120,
		enableSorting: true,
	},
	{
		accessorKey: "roi",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="投资回报率" />
		),
		cell: ({ row }) => {
			const roi = (row.getValue("roi") as number) * 100;
			if (roi === null || roi === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(roi);
			return (
				<div className="font-mono text-sm truncate" title={formatted}>
					{formatted} %
				</div>
			);
		},
		size: 140,
		enableSorting: true,
	},
	{
		accessorKey: "forcePrice",
		header: "强制平仓价",
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
				<div className="font-mono text-sm truncate" title={formatted}>
					{formatted}
				</div>
			);
		},
		size: 140,
		enableSorting: false,
	},
	{
		accessorKey: "margin",
		header: "保证金",
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
				<div className="font-mono text-sm truncate" title={formatted}>
					{formatted}
				</div>
			);
		},
		size: 140,
		enableSorting: false,
	},
	{
		accessorKey: "marginRatio",
		header: "保证金比例",
		cell: ({ row }) => {
			const marginRatio = (row.getValue("marginRatio") as number) * 100;
			if (marginRatio === null || marginRatio === undefined) {
				return <div className="text-center text-gray-400 text-sm">-</div>;
			}
			const formatted = new Intl.NumberFormat("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 4,
			}).format(marginRatio);
			return (
				<div className="font-mono text-sm truncate" title={formatted}>
					{formatted} %
				</div>
			);
		},
		size: 140,
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
		minSize: 200,
		enableSorting: true,
	},
	{
		accessorKey: "updateTime",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="更新时间" />
		),
		minSize: 200,
		enableResizing: false,
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
