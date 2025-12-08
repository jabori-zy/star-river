import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { LogLevel } from "@/types/strategy-event";
import type {
	NodeRunningLogEvent,
	StrategyRunningLogEvent,
} from "@/types/strategy-event/running-log-event";

interface LogTableFiltersProps {
	table: Table<StrategyRunningLogEvent | NodeRunningLogEvent>;
}

export function LogTableFilters({ table }: LogTableFiltersProps) {
	// Get unique node name list
	const uniqueNodeNames = Array.from(
		new Set(
			table
				.getCoreRowModel()
				.rows.map((row) => row.getValue("nodeName") as string)
				.filter(Boolean),
		),
	).sort();

	// Get current filter values
	const logLevelFilter = table
		.getColumn("logLevel")
		?.getFilterValue() as string;
	const typeFilter = table.getColumn("type")?.getFilterValue() as string;
	const nodeNameFilter = table
		.getColumn("nodeName")
		?.getFilterValue() as string;

	// Clear all filters
	const clearAllFilters = () => {
		table.getColumn("logLevel")?.setFilterValue(undefined);
		table.getColumn("type")?.setFilterValue(undefined);
		table.getColumn("nodeName")?.setFilterValue(undefined);
	};

	// Check if any filter is active
	const hasActiveFilters = !!(logLevelFilter || typeFilter || nodeNameFilter);

	return (
		<div className="flex flex-wrap gap-3 items-center p-4 bg-muted/30 border-b">
			{/* Log level filter */}
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-muted-foreground">级别:</span>
				<Select
					value={logLevelFilter || "all"}
					onValueChange={(value) =>
						table
							.getColumn("logLevel")
							?.setFilterValue(value === "all" ? undefined : value)
					}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="所有级别" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">所有级别</SelectItem>
						<SelectItem value={LogLevel.ERROR}>ERROR</SelectItem>
						<SelectItem value={LogLevel.WARN}>WARN</SelectItem>
						<SelectItem value={LogLevel.INFO}>INFO</SelectItem>
						<SelectItem value={LogLevel.DEBUG}>DEBUG</SelectItem>
						<SelectItem value={LogLevel.TRACE}>TRACE</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Source filter */}
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-muted-foreground">来源:</span>
				<Select
					value={typeFilter || "all"}
					onValueChange={(value) =>
						table
							.getColumn("type")
							?.setFilterValue(value === "all" ? undefined : value)
					}
				>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="所有类型" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">所有类型</SelectItem>
						<SelectItem value={"strategy"}>Strategy</SelectItem>
						<SelectItem value={"node"}>Node</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Node name filter */}
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-muted-foreground">节点:</span>
				<Select
					value={nodeNameFilter || "all"}
					onValueChange={(value) =>
						table
							.getColumn("nodeName")
							?.setFilterValue(value === "all" ? undefined : value)
					}
				>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="所有节点" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">所有节点</SelectItem>
						{uniqueNodeNames.map((nodeName) => (
							<SelectItem key={nodeName} value={nodeName}>
								{nodeName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Active filters display and clear button */}
			{hasActiveFilters && (
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">筛选中:</span>
					<div className="flex gap-1">
						{logLevelFilter && (
							<Badge variant="secondary" className="text-xs">
								级别: {logLevelFilter.toUpperCase()}
								<Button
									variant="ghost"
									size="sm"
									className="h-4 w-4 p-0 ml-1 hover:bg-destructive"
									onClick={() =>
										table.getColumn("logLevel")?.setFilterValue(undefined)
									}
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						)}
						{typeFilter && (
							<Badge variant="secondary" className="text-xs">
								类型: {typeFilter}
								<Button
									variant="ghost"
									size="sm"
									className="h-4 w-4 p-0 ml-1 hover:bg-destructive"
									onClick={() =>
										table.getColumn("type")?.setFilterValue(undefined)
									}
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						)}
						{nodeNameFilter && (
							<Badge variant="secondary" className="text-xs">
								节点: {nodeNameFilter}
								<Button
									variant="ghost"
									size="sm"
									className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
									onClick={() =>
										table.getColumn("nodeName")?.setFilterValue(undefined)
									}
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						)}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={clearAllFilters}
						className="h-7 text-xs"
					>
						清空筛选
					</Button>
				</div>
			)}

			{/* Filter result statistics */}
			<div className="ml-auto text-sm text-muted-foreground">
				显示 {table.getFilteredRowModel().rows.length} /{" "}
				{table.getCoreRowModel().rows.length} 条记录
			</div>
		</div>
	);
}
