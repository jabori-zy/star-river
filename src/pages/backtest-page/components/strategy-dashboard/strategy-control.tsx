import { ArrowRightToLine, Pause, Play, Square } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";
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

const StrategyControl: React.FC<StrategyControlProps> = ({ onStop }) => {
	const { t } = useTranslation();
	// Subscribe to states separately to ensure component responds correctly to changes
	const isRunning = useBacktestStrategyControlStore((state) => state.isRunning);
	const isPlayFinished = useBacktestStrategyControlStore(
		(state) => state.isPlayFinished,
	);
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
						<p>{t("desktop.backtestPage.reset")}</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							disabled={isPlayFinished}
							onClick={() => {
								// If running, pause
								if (isRunning) {
									onPause();
								} else {
									// If paused, play
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
						<p>
							{isRunning
								? t("desktop.backtestPage.pause")
								: t("desktop.backtestPage.play")}
						</p>
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
						<p>{t("desktop.backtestPage.next")}</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
};

export default StrategyControl;
