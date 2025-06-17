import BaseNode from "@/components/flow/base/BaseNode";
import { Play } from "lucide-react";
import { NodeProps, Position } from "@xyflow/react";
import { type StartNode } from "@/types/node/start-node";
import { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import { StrategyBacktestConfig, StrategyLiveConfig, TradeMode } from "@/types/strategy";
import LiveNodeShow from "./components/live-mode-show";
import BacktestNodeShow from "./components/backtest-mode-show";
import useTradingModeStore from "@/store/useTradingModeStore";
import { useLiveConfig } from "@/hooks/node/start-node/use-update-live-config";
import { useBacktestConfig } from "@/hooks/node/start-node/use-update-backtest-config";
import { useEffect } from "react";

const StartNode: React.FC<NodeProps<StartNode>> = ({id, data, selected, isConnectable}) => {

    const { tradingMode } = useTradingModeStore();
    const { setDefaultLiveConfig } = useLiveConfig({ id, initialConfig: data?.liveConfig || undefined });
    const { setDefaultBacktestConfig } = useBacktestConfig({ id, initialConfig: data?.backtestConfig || undefined });

    // 节点名称
    const nodeName = data?.nodeName || "策略起点";
    // 实盘配置
    const liveConfig = data?.liveConfig || {} as StrategyLiveConfig;
    // 回测配置
    const backtestConfig = data?.backtestConfig || {} as StrategyBacktestConfig;

    const defaultOutputHandle: BaseHandleProps = {
        id: 'start_node_output',
        type: 'source',
        position: Position.Right,
        isConnectable: isConnectable,
        handleColor: '!bg-red-400',
    }

    // 设置默认实盘和回测配置 - 只在配置为空时初始化
    useEffect(() => {
        // 只有当配置为空或未定义时才设置默认配置
        if (!data?.liveConfig) {
            setDefaultLiveConfig();
        }
        if (!data?.backtestConfig) {
            setDefaultBacktestConfig();
        }
    }, [setDefaultLiveConfig, setDefaultBacktestConfig, data?.liveConfig, data?.backtestConfig]);

    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            icon={Play}
            selected={selected}
            selectedBorderColor="border-red-400"
            defaultOutputHandle={defaultOutputHandle}
        >
            {/* 实盘模式 */}
            { 
                tradingMode === TradeMode.LIVE && (
                    <LiveNodeShow liveConfig={liveConfig} />
                )
            }
            {/* 回测模式 */}
            {
                tradingMode === TradeMode.BACKTEST && (
                    <BacktestNodeShow backtestConfig={backtestConfig} />
                )
            }
        </BaseNode>
    )

}

export default StartNode;