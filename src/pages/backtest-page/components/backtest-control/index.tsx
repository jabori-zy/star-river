import {
	ArrowRightToLine,
	Loader2,
	Pause,
	Play,
	Save,
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
import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import LayoutControl from "../layout-control";
import AddChartButton from "./add-chart-button";

interface BacktestControlProps {
	strategyId: number;
	isRunning: boolean;
	onPlay: () => void;
	onPlayOne: () => void;
	onPause: () => void;
	onStop: () => void;
}

const BacktestControl: React.FC<BacktestControlProps> = ({
	strategyId,
	isRunning,
	onPlay,
	onPlayOne,
	onPause,
	onStop,
}) => {
	// 使用store中的状态和方法
	const { chartConfig, isSaving, updateLayout, addChart, saveChartConfig } =
		useBacktestChartConfigStore();
	return (
		<div className="flex items-center w-full ">
			{/* 左侧占位空间 */}
			<div className="flex-1"></div>

			{/* 播放控制器 - 居中 */}
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
								disabled={isRunning}
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

			{/* 图表按钮 - 居右 */}
			<div className="flex-1 flex items-center gap-2 justify-end">
				{chartConfig.charts.length > 1 && (
					<LayoutControl
						value={chartConfig.layout || "vertical"}
						onChange={updateLayout}
					/>
				)}
				<AddChartButton
					onAddChart={addChart}
					strategyChartConfig={chartConfig}
					strategyId={strategyId}
				/>
				<Button variant="default" onClick={saveChartConfig} disabled={isSaving}>
					{isSaving ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<Save className="w-4 h-4" />
					)}
					{isSaving ? "保存中..." : "保存图表"}
				</Button>
			</div>
		</div>
	);
};

export default BacktestControl;
