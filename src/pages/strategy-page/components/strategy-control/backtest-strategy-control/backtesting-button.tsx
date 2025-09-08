import { Loader2, Square, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { stopStrategy } from "@/service/strategy";
import { toast } from "sonner";
import useStrategyLoadingStore from "@/store/useStrategyLoadingStore";

// 检测当前运行环境
function isElectronEnvironment() {
	return !!(window.require?.("electron"));
}

// 关闭指定策略的回测窗口
async function closeBacktestWindow(strategyId: number) {
	try {
		if (isElectronEnvironment()) {
			// Electron环境：通过IPC关闭窗口
			const electronModule = window.require("electron");
			if (electronModule?.ipcRenderer) {
				const closed = await electronModule.ipcRenderer.invoke(
					"close-backtest-window", 
					strategyId
				);
				if (closed) {
					console.log(`回测窗口已关闭: ${strategyId}`);
				} else {
					console.log(`回测窗口未找到或已关闭: ${strategyId}`);
				}
				return closed;
			}
		} else {
			return true; // 返回true表示"处理完成"
		}
		return false;
	} catch (error) {
		console.error("关闭回测窗口失败:", error);
		return false;
	}
}

// 停止策略
async function requestStopStrategy(strategyId: number | undefined) {
	if (!strategyId) return;
	
	// 停止后端策略
	await stopStrategy(strategyId);
	
	// 关闭对应的回测窗口
	await closeBacktestWindow(strategyId);
}

interface BacktestingButtonProps {
	strategyId: number | undefined;
}

const BacktestingButton: React.FC<BacktestingButtonProps> = ({ strategyId }) => {
	const { reset, setShowDialog, setStopping, clearLogs, setDialogTitle } = useStrategyLoadingStore();

	const handleStop = async () => {
		// 先清空旧日志，设置停止标题，然后显示dialog并设置停止中状态
		clearLogs();
		setDialogTitle("策略停止中");
		setShowDialog(true);
		setStopping(true);
		
		try {
			await requestStopStrategy(strategyId);
			console.log("策略停止请求已发送，等待SSE确认...");
			
			// 不再自动关闭dialog，等待SSE事件通知策略已停止
		} catch (error) {
			console.error("停止策略失败:", error);
			toast.error("停止策略失败");
			// 如果停止请求失败，重置状态
			setTimeout(() => {
				reset();
			}, 1000);
		}
	};

	const handleReload = () => {
		// 重新加载功能留空
		console.log("重新加载功能待实现");
	};

	return (
		<div className="flex">
			<Button
				variant="secondary"
				size="sm"
				className="flex items-center gap-2 min-w-[90px] rounded-r-none border-r-0"
				disabled
			>
				<Loader2 className="h-4 w-4 animate-spin" />
				回测中...
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button 
						variant="secondary"
						size="sm"
						className="px-2 rounded-l-none"
					>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent 
					className="min-w-32" 
					align="end"
					sideOffset={4}
				>
					<DropdownMenuItem 
						onClick={handleStop}
						className="text-red-600 focus:text-red-600"
					>
						<Square className="h-4 w-4 mr-2" />
						结束策略
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleReload}>
						<RefreshCw className="h-4 w-4 mr-2" />
						重新加载
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default BacktestingButton;
