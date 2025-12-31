import { ArrowRightToLine, Pause, Play, Square } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBacktestStrategyControlStore } from "@/store/use-backtest-strategy-control-store";
import { BacktestStrategyRunState } from "@/types/strategy/backtest-strategy";

interface StrategyControlProps {
	onStop: () => void;
}

const StrategyControl: React.FC<StrategyControlProps> = ({ onStop }) => {
	const { t } = useTranslation();
	// Subscribe to states separately to ensure component responds correctly to changes
	const strategyRunState = useBacktestStrategyControlStore(
		(state) => state.strategyRunState,
	);
	const onPlay = useBacktestStrategyControlStore((state) => state.onPlay);
	const onPause = useBacktestStrategyControlStore((state) => state.onPause);
	const onPlayOne = useBacktestStrategyControlStore((state) => state.onPlayOne);

	// Calculate button states based on strategyRunState
	const buttonStates = useMemo(() => {
		switch (strategyRunState) {
			case BacktestStrategyRunState.Ready:
				// Ready: stop disabled, play and next enabled
				return {
					stopDisabled: true,
					playDisabled: false,
					nextDisabled: false,
					isPlaying: false,
				};
			case BacktestStrategyRunState.Playing:
				// Playing: play button shows pause icon, stop and next disabled
				return {
					stopDisabled: true,
					playDisabled: false,
					nextDisabled: true,
					isPlaying: true,
				};
			case BacktestStrategyRunState.Pausing:
				// Pausing: all three buttons enabled
				return {
					stopDisabled: false,
					playDisabled: false,
					nextDisabled: false,
					isPlaying: false,
				};
			case BacktestStrategyRunState.PlayComplete:
				// PlayComplete: stop enabled, play and next disabled
				return {
					stopDisabled: false,
					playDisabled: true,
					nextDisabled: true,
					isPlaying: false,
				};
			default:
				// Default: all buttons enabled
				return {
					stopDisabled: false,
					playDisabled: false,
					nextDisabled: false,
					isPlaying: false,
				};
		}
	}, [strategyRunState]);

	return (
		<TooltipProvider>
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							disabled={buttonStates.stopDisabled}
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
							disabled={buttonStates.playDisabled}
							onClick={() => {
								// If playing, pause
								if (buttonStates.isPlaying) {
									onPause();
								} else {
									// If paused, play
									onPlay();
								}
							}}
						>
							{buttonStates.isPlaying ? (
								<Pause className="w-4 h-4" />
							) : (
								<Play className="w-4 h-4" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							{buttonStates.isPlaying
								? t("desktop.backtestPage.pause")
								: t("desktop.backtestPage.play")}
						</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							disabled={buttonStates.nextDisabled}
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
