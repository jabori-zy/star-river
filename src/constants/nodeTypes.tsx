import FuturesOrderNode from "@/components/flow/node/futures-order-node/node"; // 期货订单节点
import IfElseNode from "@/components/flow/node/if-else-node/node";
import IndicatorNode from "@/components/flow/node/indicator-node/node"; // 指标节点
import KlineNode from "@/components/flow/node/kline-node/node"; // 实时数据节点
import PositionNode from "@/components/flow/node/position-management-node/node"; // 持仓管理节点
import StartNode from "@/components/flow/node/start-node"; // 开始节点
import VariableNode from "@/components/flow/node/variable-node/node"; // 变量节点

export const nodeTypes = {
	startNode: StartNode,
	klineNode: KlineNode,
	indicatorNode: IndicatorNode,
	ifElseNode: IfElseNode,
	futuresOrderNode: FuturesOrderNode,
	positionNode: PositionNode,
	variableNode: VariableNode,
};
