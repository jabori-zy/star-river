import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
// import { AlertCircle, AlertTriangle, Bug, Info, X } from "lucide-react";
import { DataTableColumnHeader } from "@/components/common-table/data-table-column-header";
import { TimeDisplay } from "@/components/time-display";
import { Badge } from "@/components/ui/badge";
import { LogLevel } from "@/types/strategy-event";
import type {
	NodeRunningLogEvent,
	StrategyRunningLogEvent,
} from "@/types/strategy-event/running-log-event";

// 日志级别图标映射
// const getLogLevelIcon = (logLevel: LogLevel) => {
// 	switch (logLevel) {
// 		case LogLevel.DEBUG:
// 			return <Bug className="w-4 h-4 text-gray-500" />;
// 		case LogLevel.INFO:
// 			return <Info className="w-4 h-4 text-blue-500" />;
// 		case LogLevel.WARN:
// 			return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
// 		case LogLevel.ERROR:
// 			return <X className="w-4 h-4 text-red-500" />;
// 		case LogLevel.TRACE:
// 			return <AlertCircle className="w-4 h-4 text-purple-500" />;
// 		default:
// 			return <Info className="w-4 h-4 text-gray-500" />;
// 	}
// };

// 日志级别样式映射
const getLogLevelStyle = (logLevel: LogLevel) => {
	switch (logLevel) {
		case LogLevel.DEBUG:
			return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";
		case LogLevel.INFO:
			return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
		case LogLevel.WARN:
			return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
		case LogLevel.ERROR:
			return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
		case LogLevel.TRACE:
			return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700";
		default:
			return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";
	}
};

// Log 表格列定义 Hook
export const useLogColumns = (): ColumnDef<
	StrategyRunningLogEvent | NodeRunningLogEvent
>[] => {
	const { t } = useTranslation();

	return useMemo(
		() => [
			{
				accessorKey: "logLevel",
				header: t("desktop.backtestPage.log.logLevel"),
				cell: ({ row }) => {
					const logLevel = row.getValue("logLevel") as LogLevel;
					return (
						<div className="flex justify-start items-center gap-2">
							{/* {getLogLevelIcon(logLevel)} */}
							<Badge
								className={`${getLogLevelStyle(logLevel)} text-xs px-2 py-1`}
							>
								{logLevel.toUpperCase()}
							</Badge>
						</div>
					);
				},
				size: 120,
				enableSorting: false,
				filterFn: "equals",
			},
			{
				accessorKey: "datetime",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("desktop.backtestPage.log.datetime")}
					/>
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
							className="text-sm"
						/>
					);
				},
				size: 180,
				enableSorting: true,
			},
			{
				accessorKey: "type",
				header: t("desktop.backtestPage.log.type"),
				cell: ({ row }) => {
					const type = row.getValue("type") as string;
					return (
						<Badge
							variant="outline"
							className="text-xs justify-start overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
							title={type}
						>
							{type}
						</Badge>
					);
				},
				size: 100,
				enableSorting: false,
				filterFn: "equals",
			},
			{
				accessorKey: "nodeName",
				header: t("desktop.backtestPage.log.nodeName"),
				cell: ({ row }) => (
					<div
						className="truncate font-medium text-sm"
						title={row.getValue("nodeName")}
					>
						{row.getValue("nodeName") || "-"}
					</div>
				),
				size: 140,
				enableSorting: false,
				filterFn: "equals",
			},
			{
				accessorKey: "message",
				header: t("desktop.backtestPage.log.message"),
				cell: ({ row }) => (
					<div
						className="text-sm leading-relaxed break-all"
						title={row.getValue("message")}
					>
						{row.getValue("message")}
					</div>
				),
				size: 600,
				enableSorting: false,
			},
		],
		[t],
	);
};
