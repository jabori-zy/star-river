import {
	ArrowUpRight,
	Eye,
	MoreVertical,
	Pause,
	Play,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { deleteStrategy } from "@/service/strategy";
import useSidebarToggleStore from "@/store/use-sidebar-toggle-store";
import type { StrategyItemProps } from "@/types/strategy";

export function StrategyItem({
	strategyId,
	strategyName,
	strategyDescription,
	strategyStatus,
	createTime,
	onDelete,
}: StrategyItemProps) {
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const { setIsSidebarOpen } = useSidebarToggleStore();
	const { setOpen } = useSidebar();

	const statusConfig = {
		running: {
			label: "运行中",
			className: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
		},
		paused: {
			label: "暂停中",
			className: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
		},
		error: {
			label: "错误",
			className: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
		},
	};

	const { label, className } = statusConfig[strategyStatus];

	// 格式化时间
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleString("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});
		} catch (error) {
			console.error("日期格式化错误:", error);
			return dateString;
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteStrategy(strategyId);
			toast.success("策略已删除");
			onDelete();
		} catch (error) {
			toast.error("删除失败，请重试" + error);
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	return (
		<Card className="p-6 mb-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-card to-background border border-border/50 relative group">
			<div className="absolute right-4 top-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 hover:bg-accent"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<Play className="h-4 w-4 mr-2" />
							开始运行
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Pause className="h-4 w-4 mr-2" />
							暂停运行
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<AlertDialog
							open={showDeleteDialog}
							onOpenChange={setShowDeleteDialog}
						>
							<AlertDialogTrigger asChild>
								<DropdownMenuItem
									className="text-red-500 focus:text-red-500 focus:bg-red-50"
									onSelect={(e) => {
										e.preventDefault();
										setShowDeleteDialog(true);
									}}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									删除策略
								</DropdownMenuItem>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>确认删除策略？</AlertDialogTitle>
									<AlertDialogDescription>
										你确定要删除策略 "{strategyName}" 吗？此操作无法撤销。
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel disabled={isDeleting}>
										取消
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										disabled={isDeleting}
										className="bg-red-500 hover:bg-red-600 text-white"
									>
										{isDeleting ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
												删除中...
											</>
										) : (
											"确认删除"
										)}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</DropdownMenuContent>
				</DropdownMenu>
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
						</div>
						<p className="text-sm text-muted-foreground flex items-center gap-2">
							<span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40" />
							创建时间：{formatDate(createTime)}
						</p>
					</div>
					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<span className="h-1 w-1 rounded-full bg-green-500" />
							收益率 +12.5%
						</span>
						<span>交易次数 125</span>
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
					<Eye className="h-4 w-4" />
					查看
					<ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
				</Button>
			</div>
		</Card>
	);
}
