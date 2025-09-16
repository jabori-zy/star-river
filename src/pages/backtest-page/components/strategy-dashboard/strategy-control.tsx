import {
	ArrowRightToLine,
	Pause,
	Play,
	Square,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBacktestStrategyControlStore } from "@/store/use-backtest-strategy-control-store";



interface StrategyControlProps {
	onStop: () => void;
}




const StrategyControl: React.FC<StrategyControlProps> = ({
	onStop,
}) => {
	// 分别订阅状态，确保组件正确响应变化
	const isRunning = useBacktestStrategyControlStore((state) => state.isRunning);
	const isPlayFinished = useBacktestStrategyControlStore((state) => state.isPlayFinished);
	const onPlay = useBacktestStrategyControlStore((state) => state.onPlay);
	const onPause = useBacktestStrategyControlStore((state) => state.onPause);
	const onPlayOne = useBacktestStrategyControlStore((state) => state.onPlayOne);

	return (
		<TooltipProvider>
			<div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={isRunning}
                        onClick={() => {
                            onStop();
                        }}
                    >
                        <Square className="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>重置回测</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={isPlayFinished}
                        onClick={() => {
                            // 如果正在运行，则暂停
                            if (isRunning) {
                                onPause();
                            } else {
                                // 如果正在暂停，则播放
                                onPlay();
                            }
                        }}
                    >
                        {isRunning ? (
                            <Pause className="w-4 h-4" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isRunning ? "暂停" : "播放"}</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={isRunning || isPlayFinished}
                        onClick={() => onPlayOne()}
                    >
                        <ArrowRightToLine className="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>下一根K线</p>
                </TooltipContent>
            </Tooltip>
        </div>
        </TooltipProvider>
    );
};

export default StrategyControl;