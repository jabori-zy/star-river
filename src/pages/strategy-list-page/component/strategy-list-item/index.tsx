import { ArrowUpRight, Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import useSidebarToggleStore from "@/store/use-sidebar-toggle-store";
import { TimeDisplay } from "@/components/time-display";
import { StrategyItemDropdownMenu } from "./dropdown-menu";
import { useTranslation } from "react-i18next";



// 策略列表项组件的属性
export interface StrategyItemProps {
	strategyId: number;
	// 策略名称
	strategyName: string;
	// 策略描述
	strategyDescription: string;
	// 创建时间
	createTime: string;
	// 更新时间
	updateTime: string;
	// 状态 (backend returns: "stopped", "running", "paused", etc.)
	strategyStatus: string;
	// 交易模式
	tradeMode: string;
	// 节点数量
	nodeCount: number;
	onDelete: () => void;
}


export function StrategyItem({
	strategyId,
	strategyName,
	strategyDescription,
	strategyStatus,
	createTime,
	updateTime,
	tradeMode,
	nodeCount,
	onDelete,
}: StrategyItemProps) {
	const navigate = useNavigate();
	const { setIsSidebarOpen } = useSidebarToggleStore();
	const { setOpen } = useSidebar();
	const { t } = useTranslation();
	const statusConfig: Record<string, { label: string; className: string }> = {
		running: {
			label: "运行中",
			className: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
		},
		paused: {
			label: "暂停中",
			className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
		},
		stopped: {
			label: "已停止",
			className: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
		},
		error: {
			label: "错误",
			className: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
		},
		completed: {
			label: "已完成",
			className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
		},
	};

	const statusInfo = statusConfig[strategyStatus] || {
		label: strategyStatus,
		className: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
	};

	const { label, className } = statusInfo;

	// Trade mode configuration
	const tradeModeConfig: Record<string, { label: string; className: string }> = {
		backtest: {
			label: "回测",
			className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
		},
		simulate: {
			label: "模拟",
			className: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
		},
		live: {
			label: "实盘",
			className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
		},
	};

	const tradeModeInfo = tradeModeConfig[tradeMode] || {
		label: tradeMode,
		className: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
	};

	return (
		<Card className="p-6 mb-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-card to-background border border-border/50 relative group">
			<div className="absolute right-4 top-4">
				<StrategyItemDropdownMenu
					strategyId={strategyId}
					strategyName={strategyName}
					onDelete={onDelete}
				/>
			</div>

			<div className="flex items-center justify-between">
				<div className="space-y-3">
					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<h3 className="font-semibold text-lg tracking-tight">
								{strategyName}
							</h3>
							<Badge variant="secondary" className={className}>
								{label}
							</Badge>
							<Badge variant="secondary" className={tradeModeInfo.className}>
								{tradeModeInfo.label}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground flex items-center gap-2">
							<span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40" />
							{t("node.node")}: {nodeCount}
						</p>
					</div>
					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<span className="flex items-center gap-2">
							{t("common.lastUpdated")}: <TimeDisplay date={updateTime} />
						</span>
						<span className="flex items-center gap-2">
							{t("common.createTime")}: <TimeDisplay date={createTime} />
						</span>
						
					</div>
				</div>

				<Button
					variant="ghost"
					size="sm"
					className="flex items-center gap-2 hover:bg-primary/10 transition-colors group-hover:translate-x-1 duration-200"
					onClick={() => {
						// 点击查看策略时，关闭侧边栏
						setOpen(false);
						setIsSidebarOpen(false);
						// 跳转到策略节点页面
						navigate("/strategy", {
							state: {
								strategyId,
								strategyName,
								strategyDescription,
							},
						});
					}}
				>
					{/* <Eye className="h-4 w-4" /> */}
					{t("desktop.strategyListPage.view")}
					<ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
				</Button>
			</div>
		</Card>
	);
}
