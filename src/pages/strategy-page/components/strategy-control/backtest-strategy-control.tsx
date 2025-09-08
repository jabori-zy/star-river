import { useEffect } from "react";
import { Play, Square, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initStrategy, stopStrategy } from "@/service/strategy";
import type { TradeMode } from "@/types/strategy";
import { toast } from "sonner";
import useStrategyLoadingStore from "@/store/useStrategyLoadingStore";
import { getStrategyStatus } from "@/service/backtest-strategy/strategy-status";

// 运行策略
function requestRunStrategy(strategyId: number | undefined) {
	fetch("http://localhost:3100/run_strategy", {
		headers: {
			"Content-Type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({ strategy_id: strategyId }),
	});
}

// 停止策略
async function requestStopStrategy(strategyId: number | undefined) {
	if (!strategyId) return;
	
	try {
		await stopStrategy(strategyId);
		console.log("策略停止成功");
	} catch (error) {
		console.error("停止策略失败:", error);
		toast.error("停止策略失败");
	}
}

interface BacktestStrategyControlProps {
	strategyId: number | undefined;
	tradeMode: TradeMode;
}

const BacktestStrategyControl: React.FC<BacktestStrategyControlProps> = ({
	strategyId,
}) => {
	// 使用全局策略加载状态
	const { 
		startLoading, 
		reset, 
		setInitializing, 
		setShowDialog,
		setFailed,
		setRunning,
		setBacktesting,
		isInitializing, 
		showDialog,
		isRunning,     // 从全局状态获取运行状态
		isBacktesting, // 从全局状态获取回测状态
		isFailed       // 从全局状态获取失败状态
	} = useStrategyLoadingStore();

	// 组件首次加载时检查策略状态
	useEffect(() => {
		if (!strategyId) return;

		const checkStrategyStatus = async () => {
			try {
				const status = await getStrategyStatus(strategyId);
				console.log('初始化策略状态:', status);
				
				// 根据接口返回的状态设置按钮状态
				switch (status) {
					case 'stopped':
						// 策略已停止，重置所有状态
						reset();
						break;
					case 'initializing':
						// 策略正在初始化，设置相应状态
						setInitializing(true);
						break;
					case 'running':
						// 策略正在运行，设置运行状态
						setRunning(true);
						break;
					case 'playing':
					case 'pausing':
					case 'ready':
						// 策略处于回测中状态
						setBacktesting(true);
						break;
					case 'failed':
						// 策略启动失败，设置失败状态
						setFailed(true);
						break;
					default:
						console.warn('未知的策略状态:', status);
						break;
				}
			} catch (error) {
				console.error('获取策略状态失败:', error);
				// 获取状态失败时，保持默认状态（假设策略已停止）
			}
		};

		checkStrategyStatus();
	}, [strategyId, reset, setInitializing, setRunning, setBacktesting, setFailed]);

	const handleRun = async () => {
		//如果策略是运行状态或回测中状态
		if (isRunning || isBacktesting) {
			// 停止策略
			await requestStopStrategy(strategyId);
			// 重置全局加载状态
			reset();
		}
		//如果是失败状态或初始化状态且对话框已关闭，重新启动或打开对话框
		else if (isFailed) {
			// 失败状态下重新启动，先清除失败状态
			setFailed(false);
			// 然后按照正常启动流程处理
			if (strategyId) {
				try {
					// 设置初始化状态
					setInitializing(true);
					
					// 先初始化策略
					await initStrategy(strategyId);
					
					// 策略初始化成功，启动全局加载状态
					startLoading(strategyId);
					
					// 运行策略
					requestRunStrategy(strategyId);
				} catch (error: unknown) {
					// 初始化失败，重置状态
					setInitializing(false);
					
					// 处理409错误（策略正在运行）
					const axiosError = error as { response?: { status?: number } };
					if (axiosError?.response?.status === 409) {
						toast.error("策略正在运行中，无法再次启动");
					} else {
						toast.error("策略初始化失败");
						console.error("策略初始化错误:", error);
					}
					return;
				}
			}
		}
		//如果是初始化状态且对话框已关闭，重新打开对话框
		else if (isInitializing && !showDialog) {
			setShowDialog(true);
		}
		//如果是停止状态
		else {
			if (strategyId) {
				try {
					// 设置初始化状态
					setInitializing(true);
					
					// 先初始化策略
					await initStrategy(strategyId);
					
					// 策略初始化成功，启动全局加载状态
					startLoading(strategyId);
					
					// 运行策略
					requestRunStrategy(strategyId);
					
					// 注意：此时不立即设置为运行状态，等策略真正启动后再设置
					// setIsRunning(true) 应该在策略状态回调中设置
				} catch (error: unknown) {
					// 初始化失败，重置状态
					setInitializing(false);
					
					// 处理409错误（策略正在运行）
					const axiosError = error as { response?: { status?: number } };
					if (axiosError?.response?.status === 409) {
						toast.error("策略正在运行中，无法再次启动");
					} else {
						toast.error("策略初始化失败");
						console.error("策略初始化错误:", error);
					}
					return;
				}
			}
		}
	};

	// 获取按钮状态和样式
	const getButtonState = () => {
		if (isRunning) {
			return {
				variant: "destructive" as const,
				text: "停止回测",
				icon: <Square className="h-4 w-4" />
			};
		} else if (isBacktesting) {
			// 回测中状态：灰色按钮，回测中文案
			return {
				variant: "secondary" as const,
				text: "回测中...",
				icon: <Loader2 className="h-4 w-4 animate-spin" />
			};
		} else if (isFailed) {
			// 失败状态：红色按钮，重新启动文案
			return {
				variant: "destructive" as const,
				text: "重新启动",
				icon: <RefreshCw className="h-4 w-4" />
			};
		} else if (isInitializing) {
			// 在初始化阶段，根据对话框状态显示不同文字
			return {
				variant: "secondary" as const,
				text: showDialog ? "加载中..." : "查看加载状态",
				icon: <Loader2 className="h-4 w-4 animate-spin" />
			};
		} else {
			return {
				variant: "default" as const,
				text: "开始回测",
				icon: <Play className="h-4 w-4" />
			};
		}
	};

	const buttonState = getButtonState();

	// 回测中状态使用分割按钮
	if (isBacktesting) {
		return (
			<div className="flex">
				<Button
					variant={buttonState.variant}
					size="sm"
					className="flex items-center gap-2 min-w-[90px] rounded-r-none border-r-0"
					disabled
				>
					{buttonState.icon}
					{buttonState.text}
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button 
							variant={buttonState.variant}
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
							onClick={async () => {
								// 停止策略的逻辑
								await requestStopStrategy(strategyId);
								reset();
							}}
							className="text-red-600 focus:text-red-600"
						>
							<Square className="h-4 w-4 mr-2" />
							结束策略
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem 
							onClick={() => {
								// 重新加载功能留空
								console.log("重新加载功能待实现");
							}}
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							重新加载
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		);
	}

	// 其他状态使用普通按钮
	return (
		<Button
			variant={buttonState.variant}
			size="sm"
			className="flex items-center gap-2 min-w-[90px]"
			onClick={handleRun}
		>
			{buttonState.icon}
			{buttonState.text}
		</Button>
	);
};

export default BacktestStrategyControl;
