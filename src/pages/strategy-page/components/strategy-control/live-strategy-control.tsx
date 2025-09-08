import { useState } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initStrategy } from "@/service/strategy";
import { TradeMode } from "@/types/strategy";
import { toast } from "sonner";

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
function requestStopStrategy(strategyId: number | undefined) {
	fetch("http://localhost:3100/stop_strategy", {
		headers: {
			"Content-Type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({ strategy_id: strategyId }),
	});
}

interface LiveStrategyControlProps {
	strategyId: number | undefined;
	tradeMode: TradeMode;
}

const LiveStrategyControl: React.FC<LiveStrategyControlProps> = ({
	strategyId,
	tradeMode,
}) => {
	// 策略是否正在运行
	const [isRunning, setIsRunning] = useState(false);

	const handleRun = async () => {
		//如果策略是运行状态
		if (isRunning) {
			// 停止策略
			requestStopStrategy(strategyId);
			// 设置为停止状态
			setIsRunning(false);
		}
		//如果是停止状态
		else {
			if (strategyId) {
				try {
					await initStrategy(strategyId);
					// 运行策略
					requestRunStrategy(strategyId);
					// 设置为运行状态
					setIsRunning(true);
				} catch (error: unknown) {
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
			} else {
				// 没有策略ID，直接运行
				requestRunStrategy(strategyId);
				setIsRunning(true);
			}
		}
	};

	// 获取按钮状态和样式
	const getButtonState = () => {
		if (isRunning) {
			return {
				variant: "destructive" as const,
				text: tradeMode === TradeMode.LIVE ? "停止策略" : "停止",
				icon: <Square className="h-4 w-4" />
			};
		} else {
			return {
				variant: "default" as const,
				text: tradeMode === TradeMode.LIVE ? "开始策略" : "运行",
				icon: <Play className="h-4 w-4" />
			};
		}
	};

	const buttonState = getButtonState();

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

export default LiveStrategyControl;
