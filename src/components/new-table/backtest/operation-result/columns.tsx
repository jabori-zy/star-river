import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/common-table/data-table-column-header";
import { TimeDisplay } from "@/components/time-display";
import type { OperationResultData } from "./index";

export const useOperationResultColumns = (
	fieldMap: Map<string, string>,
): ColumnDef<OperationResultData>[] => {
	const { t } = useTranslation();

	return useMemo(() => {
		const columns: ColumnDef<OperationResultData>[] = [
			{
				accessorKey: "datetime",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title={t("desktop.backtestPage.operationResult.datetime")} />
				),
				cell: ({ row }) => {
					const datetime = row.getValue("datetime") as string;
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
				size: 160,
				enableSorting: true,
				meta: {
					headerName: t("desktop.backtestPage.operationResult.datetime"),
				},
			},
		];

		// Add dynamic columns based on field map
		for (const [key, fieldName] of fieldMap.entries()) {
			columns.push({
				accessorKey: key,
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title={fieldName} />
				),
				cell: ({ row }) => {
					const value = row.getValue(key) as number | undefined;
					if (value === undefined || value === null) {
						return <div className="text-center text-gray-400 text-sm">-</div>;
					}
					const formatted = new Intl.NumberFormat("zh-CN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 6,
					}).format(value);
					return (
						<div className="text-sm truncate pl-2" title={formatted}>
							{formatted}
						</div>
					);
				},
				size: 120,
				enableSorting: true,
				meta: {
					headerName: fieldName,
				},
			});
		}

		return columns;
	}, [t, fieldMap]);
};
