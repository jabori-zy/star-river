import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/common-table/data-table-column-header";
import { TimeDisplay } from "@/components/time-display";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	getTransactionSideStyle,
	getTransactionSideText,
	type TransactionSide,
} from "@/types/transaction";
import type { VirtualTransaction } from "@/types/transaction/virtual-transaction";

// Virtual Transaction table column definition Hook
export const useTransactionColumns = (): ColumnDef<VirtualTransaction>[] => {
	const { t } = useTranslation();

	return useMemo(
		() => [
			{
				accessorKey: "transactionId",
				header: t("market.transaction.transactionId"),
				cell: ({ row }) => (
					<div
						className="truncate text-xs"
						title={String(row.getValue("transactionId"))}
					>
						{row.getValue("transactionId")}
					</div>
				),
				filterFn: (row, id, value) => {
					// For transaction ID, use exact match or prefix match
					const transactionId = String(row.getValue(id));
					return transactionId.startsWith(value);
				},
				size: 80,
				enableSorting: false,
			},
			{
				accessorKey: "orderId",
				header: t("market.transaction.orderId"),
				cell: ({ row }) => (
					<div className="truncate text-xs" title={row.getValue("orderId")}>
						{row.getValue("orderId")}
					</div>
				),
				filterFn: (row, id, value) => {
					// For order ID, use exact match or prefix match
					const orderId = String(row.getValue(id));
					return orderId.startsWith(value);
				},
				size: 80,
				enableSorting: false,
			},
			{
				accessorKey: "positionId",
				header: t("market.transaction.positionId"),
				cell: ({ row }) => (
					<div className="truncate text-xs" title={row.getValue("positionId")}>
						{row.getValue("positionId")}
					</div>
				),
				filterFn: (row, id, value) => {
					// For position ID, use exact match or prefix match
					const positionId = String(row.getValue(id));
					return positionId.startsWith(value);
				},
				size: 80,
				enableSorting: false,
			},
			{
				accessorKey: "nodeName",
				header: t("market.transaction.nodeName"),
				cell: ({ row }) => (
					<div className="truncate text-xs" title={row.getValue("nodeName")}>
						{row.getValue("nodeName")}
					</div>
				),
				size: 140,
				enableSorting: false,
			},
			{
				accessorKey: "exchange",
				header: t("market.transaction.exchange"),
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
				size: 100,
				enableSorting: false,
			},
			{
				accessorKey: "symbol",
				header: t("market.transaction.symbol"),
				cell: ({ row }) => (
					<div className="truncate text-xs" title={row.getValue("symbol")}>
						{row.getValue("symbol")}
					</div>
				),
				size: 100,
				enableSorting: false,
			},
			{
				accessorKey: "transactionSide",
				header: t("market.transaction.transactionSide"),
				cell: ({ row }) => {
					const side = row.getValue("transactionSide") as TransactionSide;
					return (
						<div className="flex justify-start">
							<Badge
								className={cn(
									getTransactionSideStyle(side),
									"text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full",
								)}
								title={getTransactionSideText(side, t)}
							>
								{getTransactionSideText(side, t)}
							</Badge>
						</div>
					);
				},
				size: 90,
				enableSorting: false,
			},
			{
				accessorKey: "quantity",
				header: t("market.transaction.quantity"),
				cell: ({ row }) => {
					const quantity = row.getValue("quantity") as number;
					return (
						<div className="text-sm">{quantity.toLocaleString("zh-CN")}</div>
					);
				},
				size: 90,
				enableSorting: false,
			},
			{
				accessorKey: "price",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.transaction.price")}
					/>
				),
				cell: ({ row }) => {
					const price = row.getValue("price") as number;
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
					headerName: t("market.transaction.price"),
				},
			},
			{
				accessorKey: "profit",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.transaction.profit")}
					/>
				),
				cell: ({ row }) => {
					const profit = row.getValue("profit") as number | null;
					if (profit === null || profit === undefined) {
						return <div className="text-sm text-gray-400">-</div>;
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
							className={`text-sm truncate ${
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
				meta: {
					headerName: t("market.transaction.profit"),
				},
			},
			{
				accessorKey: "createTime",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("market.transaction.createTime")}
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
							className="text-sm"
						/>
					);
				},
				size: 180,
				enableSorting: true,
				meta: {
					headerName: t("market.transaction.createTime"),
				},
			},
		],
		[t],
	);
};
