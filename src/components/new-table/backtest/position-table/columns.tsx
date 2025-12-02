import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/common-table/data-table-column-header";
import { TimeDisplay } from "@/components/time-display";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	getPositionSideDisplayName,
	getPositionStateDisplayName,
	PositionSide,
	PositionState,
} from "@/types/position";
import type { VirtualPosition } from "@/types/position/virtual-position";

// 仓位方向样式
export const getPositionSideStyle = (side: PositionSide) => {
	switch (side) {
		case PositionSide.Long:
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case PositionSide.Short:
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

// 仓位状态样式
export const getPositionStateStyle = (state: PositionState) => {
	switch (state) {
		case PositionState.Open:
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
		case PositionState.Close:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		case PositionState.PartiallyClosed:
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
		case PositionState.ForceClosed:
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

// Virtual Position 表格列定义 Hook
export const usePositionColumns = (): ColumnDef<VirtualPosition>[] => {
	const { t } = useTranslation();

	return useMemo(
		() => [
			{
				accessorKey: "positionId",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.position.positionId")}
					/>
				),
				cell: ({ row }) => (
					<div
						className="truncate text-xs pl-2"
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
					headerName: t("market.position.positionId"),
				},
			},
			{
				accessorKey: "exchange",
				header: t("market.position.exchange"),
				cell: ({ row }) => {
					const exchange = row.getValue("exchange") as string;
					const capitalizedExchange =
						exchange.charAt(0).toUpperCase() + exchange.slice(1);
					return (
						<Badge
							variant="outline"
							className="text-xs justify-start overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
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
					<DataTableColumnHeader
						column={column}
						title={t("market.position.symbol")}
					/>
				),
				cell: ({ row }) => (
					<div className="truncate text-xs" title={row.getValue("symbol")}>
						{row.getValue("symbol")}
					</div>
				),
				size: 100,
				enableSorting: true,
				meta: {
					headerName: t("market.position.symbol"),
				},
			},
			{
				accessorKey: "positionSide",
				header: t("market.position.positionSide"),
				cell: ({ row }) => {
					const side = row.getValue("positionSide") as PositionSide;
					return (
						<div className="flex justify-start">
							<Badge
								className={cn(
									getPositionSideStyle(side),
									"text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full",
								)}
								title={getPositionSideDisplayName(side, t)}
							>
								{getPositionSideDisplayName(side, t)}
							</Badge>
						</div>
					);
				},
				size: 80,
				enableSorting: false,
			},
			{
				accessorKey: "positionState",
				header: t("market.position.positionState"),
				cell: ({ row }) => {
					const state = row.getValue("positionState") as PositionState;
					console.log("position state", state);
					return (
						<div className="flex justify-start">
							<Badge
								className={cn(
									getPositionStateStyle(state),
									"text-xs px-2 overflow-hidden text-ellipsis whitespace-nowwrap max-w-full",
								)}
								title={getPositionStateDisplayName(state, t)}
							>
								{getPositionStateDisplayName(state, t)}
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
					<DataTableColumnHeader
						column={column}
						title={t("market.position.quantity")}
					/>
				),
				cell: ({ row }) => {
					const quantity = row.getValue("quantity") as number;
					return (
						<div className="text-sm pl-2">
							{quantity.toLocaleString("zh-CN")}
						</div>
					);
				},
				size: 90,
				enableSorting: true,
				meta: {
					headerName: t("market.position.quantity"),
				},
			},
			{
				accessorKey: "openPrice",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.position.openPrice")}
					/>
				),
				cell: ({ row }) => {
					const price = row.getValue("openPrice") as number;
					const formatted = new Intl.NumberFormat("zh-CN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 4,
					}).format(price);
					return (
						<div className="text-sm truncate" title={formatted}>
							{formatted}
						</div>
					);
				},
				size: 110,
				enableSorting: true,
				meta: {
					headerName: t("market.position.openPrice"),
				},
			},
			{
				accessorKey: "currentPrice",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.position.currentPrice")}
					/>
				),
				cell: ({ row }) => {
					const price = row.getValue("currentPrice") as number;
					const formatted = new Intl.NumberFormat("zh-CN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 4,
					}).format(price);
					return (
						<div className="text-sm truncate" title={formatted}>
							{formatted}
						</div>
					);
				},
				minSize: 160,
				enableSorting: true,
				meta: {
					headerName: t("market.position.currentPrice"),
				},
			},
			{
				accessorKey: "unrealizedProfit",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.position.unrealizedProfit")}
					/>
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
							className={`text-sm truncate ${
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
				minSize: 160,
				enableSorting: true,
				meta: {
					headerName: t("market.position.unrealizedProfit"),
				},
			},
			{
				accessorKey: "roi",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.position.roi")}
					/>
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
						<div className="text-sm truncate" title={formatted}>
							{formatted} %
						</div>
					);
				},
				minSize: 160,
				enableSorting: true,
				meta: {
					headerName: t("market.position.roi"),
				},
			},
			{
				accessorKey: "forcePrice",
				header: t("market.position.forcePrice"),
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
						<div className="text-sm truncate" title={formatted}>
							{formatted}
						</div>
					);
				},
				minSize: 160,
				enableSorting: false,
				meta: {
					headerName: t("market.position.forcePrice"),
				},
			},
			{
				accessorKey: "margin",
				header: t("market.position.margin"),
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
						<div className="text-sm truncate" title={formatted}>
							{formatted}
						</div>
					);
				},
				minSize: 160,
				enableSorting: false,
				meta: {
					headerName: t("market.position.margin"),
				},
			},
			{
				accessorKey: "marginRatio",
				header: t("market.position.marginRatio"),
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
						<div className="text-sm truncate" title={formatted}>
							{formatted} %
						</div>
					);
				},
				size: 140,
				enableSorting: false,
				meta: {
					headerName: t("market.position.marginRatio"),
				},
			},
			{
				accessorKey: "createTime",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.position.createTime")}
					/>
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
							className="text-sm truncate"
						/>
					);
				},
				size: 140,
				minSize: 200,
				enableSorting: true,
				meta: {
					headerName: t("market.position.createTime"),
				},
			},
			{
				accessorKey: "updateTime",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.position.updateTime")}
					/>
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
							className="text-sm truncate"
						/>
					);
				},
				size: 140,
				enableSorting: true,
				meta: {
					headerName: t("market.position.updateTime"),
				},
			},
		],
		[t],
	);
};
