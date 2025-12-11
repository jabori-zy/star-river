import FuturesOrderNode from "@/components/flow/node/futures-order-node/node"; // Futures order node
import IfElseNode from "@/components/flow/node/if-else-node/node";
import IndicatorNode from "@/components/flow/node/indicator-node/node"; // Indicator node
import KlineNode from "@/components/flow/node/kline-node/node"; // Real-time data node
import PositionNode from "@/components/flow/node/position-node/node"; // Position management node
import StartNode from "@/components/flow/node/start-node"; // Start node
import VariableNode from "@/components/flow/node/variable-node/node"; // Variable node
import OperationGroup from "@/components/flow/node/operation-group/node";
import OperationStartNode from "@/components/flow/node/operation-start-node/node";
import OperationNode from "@/components/flow/node/operation-node/node";

export const nodeTypes = {
	startNode: StartNode,
	klineNode: KlineNode,
	indicatorNode: IndicatorNode,
	ifElseNode: IfElseNode,
	futuresOrderNode: FuturesOrderNode,
	positionNode: PositionNode,
	variableNode: VariableNode,
	operationGroup: OperationGroup,
	operationStartNode: OperationStartNode,
	operationNode: OperationNode,
};
