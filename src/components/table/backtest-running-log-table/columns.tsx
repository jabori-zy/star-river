import type { ColumnDef } from "@tanstack/react-table";
import {
	AlertCircle,
	AlertTriangle,
	Bug,
	ChevronDown,
	ChevronRight,
	Info,
	X,
} from "lucide-react";
import { DateTime } from "luxon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogLevel } from "@/types/strategy-event";
import type { StrategyRunningLogEvent } from "@/types/strategy-event/strategy-running-log-event";

// 日志级别图标映射
const getLogLevelIcon = (logLevel: LogLevel) => {
	switch (logLevel) {
		case LogLevel.DEBUG:
			return <Bug className="w-4 h-4 text-gray-500" />;
		case LogLevel.INFO:
			return <Info className="w-4 h-4 text-blue-500" />;
		case LogLevel.WARNING:
			return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
		case LogLevel.ERROR:
			return <X className="w-4 h-4 text-red-500" />;
		case LogLevel.TRACE:
			return <AlertCircle className="w-4 h-4 text-purple-500" />;
		default:
			return <Info className="w-4 h-4 text-gray-500" />;
	}
};

// 日志级别样式映射
const getLogLevelStyle = (logLevel: LogLevel) => {
	switch (logLevel) {
		case LogLevel.DEBUG:
			return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";
		case LogLevel.INFO:
			return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
		case LogLevel.WARNING:
			return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
		case LogLevel.ERROR:
			return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
		case LogLevel.TRACE:
			return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700";
		default:
			return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";
	}
};

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
	return new Date(timestamp).toLocaleString("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};

// Strategy Running Log 表格列定义
export const createStrategyRunningLogColumns = (
	isCompactMode: boolean,
): ColumnDef<StrategyRunningLogEvent>[] => [
	{
		id: "expander",
		header: "",
		size: 50,
		minSize: 50,
		maxSize: 50,
		enableSorting: false,
		enableResizing: false,
		cell: ({ row }) => {
			return row.getCanExpand() ? (
				<Button
					variant="ghost"
					size="sm"
					onClick={row.getToggleExpandedHandler()}
					className="h-6 w-6 p-0 hover:bg-gray-200"
				>
					{row.getIsExpanded() ? (
						<ChevronDown className="w-4 h-4 text-muted-foreground" />
					) : (
						<ChevronRight className="w-4 h-4 text-muted-foreground" />
					)}
				</Button>
			) : null;
		},
	},
	{
		accessorKey: "logLevel",
		header: "级别",
		size: isCompactMode ? 80 : 100,
		minSize: 50,
		maxSize: 80,
		enableResizing: false,
		enableColumnFilter: true,
		filterFn: "equals",
		cell: ({ row }) => {
			const logLevel = row.getValue("logLevel") as LogLevel;

			return isCompactMode ? (
				<div className="flex justify-center">{getLogLevelIcon(logLevel)}</div>
			) : (
				<div className="flex justify-start">
					<Badge className={`${getLogLevelStyle(logLevel)} text-xs px-2 py-1`}>
						{logLevel.toUpperCase()}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "datetime",
		header: "时间",
		size: 180,
		minSize: 180,
		maxSize: 180,
		enableResizing: false,
		cell: ({ row }) => {
			const datetime = row.getValue("datetime") as string;
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
		accessorKey: "source",
		header: "来源",
		size: 160,
		minSize: 160,
		maxSize: 160,
		enableResizing: false,
		enableColumnFilter: true,
		filterFn: "equals",
		cell: ({ row }) => {
			const source = row.getValue("source") as string;
			return (
				<Badge
					variant="outline"
					className="text-xs justify-start font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
					title={source}
				>
					{source}
				</Badge>
			);
		},
	},
	{
		accessorKey: "nodeName",
		header: "节点名称",
		size: 120,
		minSize: 120,
		maxSize: 120,
		enableResizing: false,
		enableColumnFilter: true,
		filterFn: "equals",
		cell: ({ row }) => (
			<div
				className="text-left truncate font-medium text-sm"
				title={row.getValue("nodeName")}
			>
				{row.getValue("nodeName")}
			</div>
		),
	},
	{
		accessorKey: "message",
		header: "消息",
		size: 1000, // 设置较大的初始宽度
		minSize: 200, // 最小宽度确保内容可读
		// 不设置 maxSize，让该列可以占据剩余空间
		enableResizing: false, // 禁用调整大小
		cell: ({ row }) => (
			<div
				className="text-left text-sm leading-relaxed break-all"
				title={row.getValue("message")}
			>
				{row.getValue("message")}
			</div>
		),
	},
];
