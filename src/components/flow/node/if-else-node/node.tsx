import { NodeProps } from "@xyflow/react";
import { type IfElseNode as IfElseNodeType } from "@/types/node/if-else-node"; 
import BaseNode from "@/components/flow/base/BaseNode";
import useTradingModeStore from "@/store/useTradingModeStore";
import { useReactFlow, Position } from "@xyflow/react";
import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { TradeMode } from "@/types/strategy";
import { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import { NodeDefaultInputHandleId } from "@/types/node/index";
import { useUpdateBacktestConfig } from "@/hooks/node/if-else-node/use-update-backtest-config";
import BacktestModeShow from "./components/backtest-mode-show";
import LiveModeShow from "./components/live-mode-show";


const IfElseNode: React.FC<NodeProps<IfElseNodeType>> = ({id, data, selected}) => {
    const nodeName = data?.nodeName || "条件节点";
    const { tradingMode } = useTradingModeStore();
    const { getNode } = useReactFlow();
    const lastConnectionRef = useRef<string | null>(null);

    const { setDefaultBacktestConfig } = useUpdateBacktestConfig({ id, initialConfig: data?.backtestConfig });


    // 初始化时设置默认配置
    useEffect(() => {
        if (!data?.backtestConfig) {
            setDefaultBacktestConfig();
        }
    }, [setDefaultBacktestConfig, data?.backtestConfig]);



    const defaultInputHandle: BaseHandleProps = {
        type: "target",
        position: Position.Left,
        id: NodeDefaultInputHandleId.IfElseNodeInput,
    }

    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            icon={Play}
            selected={selected}
            defaultInputHandle={defaultInputHandle}
        >
            {tradingMode === TradeMode.BACKTEST && <BacktestModeShow id={id} data={data} />}
            {tradingMode === TradeMode.LIVE && <LiveModeShow id={id} data={data} />}
        </BaseNode>
    )

}


export default IfElseNode;