import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/common-table/data-table-column-header";
import { TimeDisplay } from "@/components/time-display";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FuturesOrderSide, OrderStatus, OrderType } from "@/types/order";
import type { VirtualOrder } from "@/types/order/virtual-order";
import {
	getOrderSideStyle,
	getOrderSideText,
	getOrderStatusStyle,
	getOrderStatusText,
	getOrderTypeText,
} from "@/types/order/virtual-order";

export const useOrderColumns = (): ColumnDef<VirtualOrder>[] => {
	const { t } = useTranslation();

	return useMemo(
		() => [
			{
				accessorKey: "orderId",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.order.orderId")}
					/>
				),
				cell: ({ row }) => (
					<div
						className="truncate text-xs pl-2"
						title={String(row.getValue("orderId"))}
					>
						{row.getValue("orderId")}
					</div>
				),
				filterFn: (row, id, value) => {
					// For order ID, use exact match or prefix match
					const orderId = String(row.getValue(id));
					return orderId.startsWith(value);
				},
				size: 80,
				enableSorting: true,
				meta: {
					headerName: t("market.order.orderId"),
				},
			},
			{
				accessorKey: "nodeName",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.order.nodeName")}
					/>
				),
				cell: ({ row }) => (
					<div className="truncate text-xs" title={row.getValue("nodeName")}>
						{row.getValue("nodeName")}
					</div>
				),
				size: 140,
				enableSorting: false,
				meta: {
					headerName: t("market.order.nodeName"),
				},
			},
			{
				accessorKey: "exchange",
				header: t("market.order.exchange"),
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
						title={t("market.order.symbol")}
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
					headerName: t("market.order.symbol"),
				},
			},
			{
				accessorKey: "orderSide",
				header: t("market.order.orderSide"),
				cell: ({ row }) => {
					const side = row.getValue("orderSide") as FuturesOrderSide;
					return (
						<div className="flex justify-start">
							<Badge
								className={cn(
									getOrderSideStyle(side),
									"text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full",
								)}
								title={getOrderSideText(side, t)}
							>
								{getOrderSideText(side, t)}
							</Badge>
						</div>
					);
				},
				size: 80,
				enableSorting: false,
			},
			{
				accessorKey: "orderType",
				header: t("market.order.orderType"),
				cell: ({ row }) => {
					const type = row.getValue("orderType") as OrderType;
					return (
						<div className="flex justify-start">
							<Badge
								variant="outline"
								className="text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
								title={getOrderTypeText(type, t)}
							>
								{getOrderTypeText(type, t)}
							</Badge>
						</div>
					);
				},
				size: 90,
				enableSorting: false,
			},
			{
				accessorKey: "orderStatus",
				header: t("market.order.orderStatus"),
				cell: ({ row }) => {
					const status = row.getValue("orderStatus") as OrderStatus;
					return (
						<div className="flex justify-start">
							<Badge
								className={`${getOrderStatusStyle(status)} text-xs px-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-full`}
								title={getOrderStatusText(status, t)}
							>
								{getOrderStatusText(status, t)}
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
					<DataTableColumnHeader
						column={column}
						title={t("market.order.quantity")}
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
					headerName: t("market.order.quantity"),
				},
			},
			{
				accessorKey: "openPrice",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.order.openPrice")}
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
					headerName: t("market.order.openPrice"),
				},
			},
			{
				accessorKey: "tp",
				header: t("market.order.tp"),
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
							className="text-green-600 dark:text-green-400 text-sm truncate"
							title={formatted}
						>
							{formatted}
						</div>
					);
				},
				size: 100,
				enableSorting: false,
				meta: {
					headerName: t("market.order.tp"),
				},
			},
			{
				accessorKey: "sl",
				header: t("market.order.sl"),
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
							className="text-red-600 dark:text-red-400 text-sm truncate"
							title={formatted}
						>
							{formatted}
						</div>
					);
				},
				size: 100,
				enableSorting: false,
				meta: {
					headerName: t("market.order.sl"),
				},
			},
			{
				accessorKey: "createTime",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.order.createTime")}
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
				enableSorting: true,
				meta: {
					headerName: t("market.order.createTime"),
				},
			},
			{
				accessorKey: "updateTime",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.order.updateTime")}
					/>
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
							className="text-sm truncate"
						/>
					);
				},
				size: 140,
				enableSorting: true,
				meta: {
					headerName: t("market.order.updateTime"),
				},
			},
		],
		[t],
	);
};
