import type React from "react";
import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusSection from "./status-section";
import LogSection from "./log-section";
import type { StrategyLoadingDialogProps } from "./types";
import { StrategyState } from "@/types/strategy-event/strategy-log-event";

const StrategyLoadingDialog: React.FC<StrategyLoadingDialogProps> = ({
    open,
    onOpenChange,
    logs,
    currentStage,
    onStrategyStateChange,
}) => {
    // 用于追踪已触发的回调状态，避免重复调用
    const triggeredStatesRef = useRef<Set<string>>(new Set());

    // 监听策略状态变化
    useEffect(() => {
        if (!onStrategyStateChange) return;

        // 过滤策略日志
        const strategyLogs = logs.filter(log => 'strategyState' in log);
        if (strategyLogs.length === 0) return;

        // 获取最新的策略日志
        const latestStrategyLog = strategyLogs.sort((a, b) => b.timestamp - a.timestamp)[0];
        
        if ('strategyState' in latestStrategyLog) {
            const strategyState = latestStrategyLog.strategyState;
            const stateKey = `${strategyState}-${latestStrategyLog.timestamp}`;

            // 检查是否已经触发过这个状态的回调
            if (!triggeredStatesRef.current.has(stateKey)) {
                if (strategyState === StrategyState.Ready) {
                    onStrategyStateChange("ready");
                    triggeredStatesRef.current.add(stateKey);
                } else if (strategyState === StrategyState.Failed) {
                    onStrategyStateChange("failed");
                    triggeredStatesRef.current.add(stateKey);
                }
            }
        }
    }, [logs, onStrategyStateChange]);

    // 为日志区域添加类型标记并排序
    const allLogs = logs
        .map(log => ({
            ...log,
            type: ('strategyState' in log ? 'strategy' : 'node') as 'strategy' | 'node'
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* [&>button:last-child]:hidden */}
            <DialogContent className="max-w-2xl flex flex-col " aria-describedby={undefined}>
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>策略加载</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                    {/* 顶部状态区域 */}
                    <div className="flex-shrink-0">
                        <StatusSection
                            currentStage={currentStage}
                            logs={logs}
                        />
                    </div>

                    {/* 日志区域 - 固定高度 */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <LogSection logs={allLogs} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StrategyLoadingDialog;