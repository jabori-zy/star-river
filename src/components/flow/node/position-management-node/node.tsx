import { NodeProps } from "@xyflow/react";
import { type PositionManagementNode as PositionManagementNodeType } from "@/types/node/position-management-node";
import BaseNode from "@/components/flow/base/BaseNode";
import { Play } from "lucide-react";
import BacktestModeShow from "./components/show/backtest-mode-show";
import LiveModeShow from "./components/show/live-mode-show";
import SimulateModeShow from "./components/show/simulate-mode-show";
import useTradingModeStore from "@/store/useTradingModeStore";
import { TradeMode } from "@/types/strategy";

const PositionManagementNode: React.FC<NodeProps<PositionManagementNodeType>> = ({ id, data, selected }) => {
    const nodeName = data.nodeName || "仓位管理节点";
    const { tradingMode } = useTradingModeStore();

    // 根据交易模式渲染不同的内容
    const renderModeContent = () => {
        switch (tradingMode) {
            case TradeMode.LIVE:
                return <LiveModeShow id={id} data={data} />;
            case TradeMode.SIMULATE:
                return <SimulateModeShow id={id} data={data} />;
            case TradeMode.BACKTEST:
                return <BacktestModeShow id={id} data={data} />;
            default:
                return <BacktestModeShow id={id} data={data} />;
        }
    };

    return (
        <BaseNode
            id={id}
            nodeName={nodeName}
            icon={Play}
            selected={selected}
            selectedBorderColor="border-red-400"
        >
            {renderModeContent()}
        </BaseNode>
    );
};

export default PositionManagementNode;