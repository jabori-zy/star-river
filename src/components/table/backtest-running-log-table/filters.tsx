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
import { StrategyRunningLogSource } from "@/types/strategy-event/strategy-running-log-event";
import type { Table } from "@tanstack/react-table";
import type { StrategyRunningLogEvent } from "@/types/strategy-event/strategy-running-log-event";

interface LogTableFiltersProps {
	table: Table<StrategyRunningLogEvent>;
}

export function LogTableFilters({ table }: LogTableFiltersProps) {
	// 获取唯一的节点名称列表
	const uniqueNodeNames = Array.from(
		new Set(
			table
				.getCoreRowModel()
				.rows.map((row) => row.getValue("nodeName") as string)
				.filter(Boolean)
		)
	).sort();

	// 获取当前的筛选值
	const logLevelFilter = table.getColumn("logLevel")?.getFilterValue() as string;
	const sourceFilter = table.getColumn("source")?.getFilterValue() as string;
	const nodeNameFilter = table.getColumn("nodeName")?.getFilterValue() as string;

	// 清空所有筛选
	const clearAllFilters = () => {
		table.getColumn("logLevel")?.setFilterValue(undefined);
		table.getColumn("source")?.setFilterValue(undefined);
		table.getColumn("nodeName")?.setFilterValue(undefined);
	};

	// 检查是否有任何筛选器处于激活状态
	const hasActiveFilters = !!(logLevelFilter || sourceFilter || nodeNameFilter);

	return (
		<div className="flex flex-wrap gap-3 items-center p-4 bg-muted/30 border-b">
			{/* 日志级别筛选 */}
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
						<SelectItem value={LogLevel.WARNING}>WARNING</SelectItem>
						<SelectItem value={LogLevel.INFO}>INFO</SelectItem>
						<SelectItem value={LogLevel.DEBUG}>DEBUG</SelectItem>
						<SelectItem value={LogLevel.TRACE}>TRACE</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* 来源筛选 */}
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-muted-foreground">来源:</span>
				<Select
					value={sourceFilter || "all"}
					onValueChange={(value) =>
						table
							.getColumn("source")
							?.setFilterValue(value === "all" ? undefined : value)
					}
				>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="所有来源" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">所有来源</SelectItem>
						<SelectItem value={StrategyRunningLogSource.Node}>Node</SelectItem>
						<SelectItem value={StrategyRunningLogSource.VirtualTradingSystem}>
							VirtualTradingSystem
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* 节点名称筛选 */}
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

			{/* 活动筛选器显示和清空按钮 */}
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
						{sourceFilter && (
							<Badge variant="secondary" className="text-xs">
								来源: {sourceFilter}
								<Button
									variant="ghost"
									size="sm"
									className="h-4 w-4 p-0 ml-1 hover:bg-destructive"
									onClick={() =>
										table.getColumn("source")?.setFilterValue(undefined)
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

			{/* 筛选结果统计 */}
			<div className="ml-auto text-sm text-muted-foreground">
				显示 {table.getFilteredRowModel().rows.length} / {table.getCoreRowModel().rows.length} 条记录
			</div>
		</div>
	);
}