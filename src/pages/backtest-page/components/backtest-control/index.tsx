import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pause, Play, ArrowRightToLine, Square, Save, Loader2 } from "lucide-react";
import React from "react";
import AddChartButton from "./add-chart-button";
import LayoutControl from "../layout-control";
import { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import { LayoutMode } from "@/types/chart";


interface BacktestControlProps {
    strategyId: number;
    strategyChartConfig: BacktestStrategyChartConfig;
    updateLayout: (layout: LayoutMode) => void;
    onAddChart: (klineCacheKeyStr: string, chartName: string) => void;
    onSaveChart: () => void;
    isRunning: boolean;
    onPlay: () => void;
    onPlayOne: () => void;
    onPause: () => void;
    onStop: () => void;
    isSaving?: boolean;
}


const BacktestControl: React.FC<BacktestControlProps> = ({ 
    strategyChartConfig, 
    updateLayout, 
    onAddChart, 
    onSaveChart, 
    isSaving = false,
    isRunning,
    onPlay,
    onPlayOne,
    onPause,
    onStop
}) => {

    return (
        <div className="flex items-center w-full ">
            {/* 左侧占位空间 */}
            <div className="flex-1"></div>
            
            {/* 播放控制器 - 居中 */}
            <TooltipProvider>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" disabled={isRunning} onClick={() => {
                                onStop();
                            }}>
                                <Square className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>重置回测</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" onClick={() => {
                                // 如果正在运行，则暂停
                                if (isRunning) {
                                    onPause();
                                } else {
                                    // 如果正在暂停，则播放
                                    onPlay();
                                }
                            }}>
                                {isRunning ? 
                                <Pause className="w-4 h-4" /> : 
                                <Play className="w-4 h-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isRunning ? '暂停' : '播放'}</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" disabled={isRunning} onClick={() => onPlayOne()}>
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
                {strategyChartConfig.charts.length > 1 && (
                    <LayoutControl 
                        value={strategyChartConfig.layout || "vertical"}
                        onChange={updateLayout}
                    />
                )}
                <AddChartButton 
                    onAddChart={onAddChart} 
                    strategyChartConfig={strategyChartConfig}
                />
                <Button variant="default" onClick={onSaveChart} disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isSaving ? '保存中...' : '保存图表'}
                </Button>
            </div>
        </div>
    )
}

export default BacktestControl;