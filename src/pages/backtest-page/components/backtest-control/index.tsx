import { Button } from "@/components/ui/button";
import { Pause, Play, ArrowRightToLine, Square, Save, Loader2 } from "lucide-react";
import React, { useState } from "react";
import AddChartButton from "../add-chart-button";
import LayoutControl from "../layout-control";
import { BacktestStrategyChartConfig, LayoutMode } from "@/types/chart/backtest-chart";
import { playOne } from "@/service/strategy-control/backtest-strategy-control";


interface BacktestControlProps {
    strategyId: number;
    strategyChartConfig: BacktestStrategyChartConfig;
    updateLayout: (layout: LayoutMode) => void;
    onAddChart: (klineCacheKeyStr: string, indicatorCacheKeyStrs: string[], chartName: string) => void;
    onSaveChart: () => void;
    isSaving?: boolean;
}


const BacktestControl: React.FC<BacktestControlProps> = ({ 
    strategyId, 
    strategyChartConfig, 
    updateLayout, 
    onAddChart, 
    onSaveChart, 
    isSaving = false 
}) => {

    const [isRunning, setIsRunning] = useState(false);

    return (
        <div className="flex items-center w-full ">
            {/* 左侧占位空间 */}
            <div className="flex-1"></div>
            
            {/* 播放控制器 - 居中 */}
            <div className="flex items-center gap-2">
                <Button variant="outline">
                    <Square className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => setIsRunning(!isRunning)}>
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" disabled={isRunning} onClick={() => playOne(strategyId)}>
                    <ArrowRightToLine className="w-4 h-4" />
                </Button>
            </div>
            
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
                    strategyId={strategyId}
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