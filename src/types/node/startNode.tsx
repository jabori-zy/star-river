import { StrategyLiveConfig, StrategySimulateConfig, StrategyBacktestConfig } from "@/types/strategy";
import { Node } from "@xyflow/react";

// 开始节点数据
export type StartNodeData = {
  strategyId: number;
  strategyName: string;
  nodeName: string;
  liveConfig?: StrategyLiveConfig | null; // 实盘交易配置。三个配置中，只有一个有效，可以共存
  simulateConfig?: StrategySimulateConfig | null; // 模拟交易配置
  backtestConfig?: StrategyBacktestConfig | null; // 回测交易配置
};

export type StartNode = Node<StartNodeData, 'startNode'>;


// export type NodeProps<NodeType extends Node = Node> = NodePropsBase<NodeType>;
// export type 导出 NodeProps类型
// NodeProps - 新定义的类型别名名称，用于表示React Flow中自定义节点组件的props类型
// <NodeType extends Node = Node> - 泛型参数定义
// 1.extends Node - 约束条件，表示NodeType必须是Node类型或其子类型
// 2. = Node - 默认值，表示NodeType如果没有显式指定，则默认为Node类型
// = NodePropsBase<NodeType> - 类型别名的实际定义，表示NodeProps实际上就是NodePropsBase类型，并传入相同的泛型参数