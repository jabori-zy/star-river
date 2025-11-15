import { type NodeProps, Position, useNodeConnections, useNodesData } from "@xyflow/react";
import { Play } from "lucide-react";
import { useEffect } from "react";
import type { BaseHandleProps } from "@/components/flow/base/BaseHandle";
import BaseNode from "@/components/flow/base/BaseNode";
import { useBacktestConfig } from "@/hooks/node-config/if-else-node";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { IfElseNode as IfElseNodeType } from "@/types/node/if-else-node";
import { getNodeDefaultInputHandleId, NodeType } from "@/types/node/index";
import { TradeMode } from "@/types/strategy";
import BacktestModeShow from "./components/node-show/backtest-mode-show";
import LiveModeShow from "./components/node-show/live-mode-show";
import type { StrategyFlowNode } from "@/types/node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { IfElseNodeData } from "@/types/node/if-else-node";

const IfElseNode: React.FC<NodeProps<IfElseNodeType>> = ({
	id,
	selected,
}) => {
	const { tradingMode } = useTradingModeStore();

	const { getSourceNodes, getNodeData } = useStrategyWorkflow();

	const currentNodeData = getNodeData(id) as IfElseNodeData;

	const sourceNodes = getSourceNodes(id);

	// get connections
	const connections = useNodeConnections({id, handleType: 'target'})
	const sourceNodeData = useNodesData<StrategyFlowNode>(connections.map(connection => connection.source));


	const defaultInputHandle: BaseHandleProps = {
		type: "target",
		position: Position.Left,
		id: getNodeDefaultInputHandleId(id, NodeType.IfElseNode),
		handleColor: "!bg-red-400",
	};

	return (
		<BaseNode
			id={id}
			nodeName={currentNodeData?.nodeName || "if else node"}
			icon={Play}
			selected={selected}
			defaultInputHandle={defaultInputHandle}
			className="!max-w-none"
		>
			{tradingMode === TradeMode.BACKTEST && (
				<BacktestModeShow id={id} data={currentNodeData} />
			)}
			{tradingMode === TradeMode.LIVE && <LiveModeShow id={id} data={currentNodeData} />}
		</BaseNode>
	);
};

export default IfElseNode;
