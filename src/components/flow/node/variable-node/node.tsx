import { NodeProps, Position } from "@xyflow/react";
import { type VariableNode as VariableNodeType } from "@/types/node/variable-node";
import BaseNode from "@/components/flow/base/BaseNode";
import { Play } from "lucide-react";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";
import SimulateModeShow from "./components/node-show/simulate-mode-show";
import useTradingModeStore from "@/store/useTradingModeStore";
import { TradeMode } from "@/types/strategy";
import { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import {getNodeDefaultOutputHandleId, NodeType } from "@/types/node/index";


const VariableNode: React.FC<NodeProps<VariableNodeType>> = ({ id, data, selected }) => {
    const nodeName = data.nodeName || "变量节点";

    // 获取当前的交易模式
    const { tradingMode } = useTradingModeStore();

    // 根据交易模式渲染不同的显示组件
    const renderModeShow = () => {
        switch (tradingMode) {
            case TradeMode.LIVE:
                return <LiveModeShow id={id} data={data} />;
            case TradeMode.SIMULATE:
                return <SimulateModeShow id={id} data={data} />;
            case TradeMode.BACKTEST:
            default:
                return <BacktestModeShow id={id} data={data} />;
        }
    };

    const defaultOutputHandle: BaseHandleProps = {
        type: "source",
        position: Position.Right,
        id: getNodeDefaultOutputHandleId(id, NodeType.VariableNode),
        handleColor: '!bg-red-400'
    }

    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            icon={Play}
            selected={selected}
            selectedBorderColor="border-red-400"
            defaultOutputHandle={defaultOutputHandle}
        >
            {renderModeShow()}
        </BaseNode>
    );
};

export default VariableNode;