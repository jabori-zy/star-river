import { type NodeProps, Position } from "@xyflow/react";
import { Play } from "lucide-react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	getNodeDefaultInputHandleId,
	getNodeDefaultOutputHandleId,
	NodeType,
} from "@/types/node/index";
import type { VariableNode as VariableNodeType, VariableNodeData } from "@/types/node/variable-node";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";
import SimulateModeShow from "./components/node-show/simulate-mode-show";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { memo } from "react";

const VariableNode: React.FC<NodeProps<VariableNodeType>> = ({
	id,
	selected,
}) => {
	const { getNodeData } = useStrategyWorkflow();
	const variableNodeData = getNodeData(id) as VariableNodeData;
	const nodeName = variableNodeData.nodeName || "变量节点";

	// 获取当前的交易模式
	const { tradingMode } = useTradingModeStore();

	// 根据交易模式渲染不同的显示组件
	const renderModeShow = () => {
		switch (tradingMode) {
			case TradeMode.LIVE:
				return <LiveModeShow id={id} data={variableNodeData} />;
			case TradeMode.SIMULATE:
				return <SimulateModeShow id={id} data={variableNodeData} />;
			case TradeMode.BACKTEST:
			default:
				return <BacktestModeShow id={id} data={variableNodeData} />;
		}
	};

	const defaultOutputHandle: BaseHandleProps = {
		type: "source",
		position: Position.Right,
		id: getNodeDefaultOutputHandleId(id, NodeType.VariableNode),
		handleColor: "!bg-red-400",
	};

	const defaultInputHandle: BaseHandleProps = {
		type: "target",
		position: Position.Left,
		id: getNodeDefaultInputHandleId(id, NodeType.VariableNode),
		handleColor: "!bg-red-400",
	};

	return (
		<BaseNode
			id={id}
			nodeName={nodeName}
			icon={Play}
			selected={selected}
			isHovered={variableNodeData?.nodeConfig?.isHovered || false}
			defaultInputHandle={defaultInputHandle}
			defaultOutputHandle={defaultOutputHandle}
		>
			{renderModeShow()}
		</BaseNode>
	);
};

export default memo(VariableNode);
