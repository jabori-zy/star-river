import type { Node } from "@xyflow/react";
import type {
	StrategyBacktestConfig,
	StrategyLiveConfig,
	StrategySimulateConfig,
} from "@/types/strategy";
import type { NodeDataBase } from ".";

// Start node data
export type StartNodeData = NodeDataBase & {
	liveConfig: StrategyLiveConfig | null; // Live trading config. Only one of the three configs is active, but they can coexist
	backtestConfig: StrategyBacktestConfig | null; // Backtest trading config
	simulateConfig: StrategySimulateConfig | null; // Simulate trading config
};

export type StartNode = Node<StartNodeData, "startNode">;

// export type NodeProps<NodeType extends Node = Node> = NodePropsBase<NodeType>;
// export type exports the NodeProps type
// NodeProps - A newly defined type alias name, used to represent the props type for custom node components in React Flow
// <NodeType extends Node = Node> - Generic parameter definition
// 1.extends Node - Constraint condition, meaning NodeType must be of type Node or its subtype
// 2. = Node - Default value, meaning if NodeType is not explicitly specified, it defaults to Node type
// = NodePropsBase<NodeType> - The actual definition of the type alias, meaning NodeProps is essentially the NodePropsBase type with the same generic parameter passed in
