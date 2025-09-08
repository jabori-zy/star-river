import { Play } from "lucide-react";
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

interface StartButtonProps {
	strategyId: number | undefined;
}

const StartButton: React.FC<StartButtonProps> = ({ strategyId }) => {
	const { startLoading, setInitializing } = useStrategyLoadingStore();

	const handleStart = async () => {
		if (!strategyId) return;

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
			variant="default"
			size="sm"
			className="flex items-center gap-2 min-w-[90px]"
			onClick={handleStart}
		>
			<Play className="h-4 w-4" />
			开始回测
		</Button>
	);
};

export default StartButton;
