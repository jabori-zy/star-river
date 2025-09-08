import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initStrategy } from "@/service/strategy";
import { toast } from "sonner";
import useStrategyLoadingStore from "@/store/useStrategyLoadingStore";

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

interface RetryButtonProps {
	strategyId: number | undefined;
}

const RetryButton: React.FC<RetryButtonProps> = ({ strategyId }) => {
	const { startLoading, setInitializing, setFailed } = useStrategyLoadingStore();

	const handleRetry = async () => {
		if (!strategyId) return;

		// 失败状态下重新启动，先清除失败状态
		setFailed(false);

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
		}
	};

	return (
		<Button
			variant="destructive"
			size="sm"
			className="flex items-center gap-2 min-w-[90px]"
			onClick={handleRetry}
		>
			<RefreshCw className="h-4 w-4" />
			重新启动
		</Button>
	);
};

export default RetryButton;
