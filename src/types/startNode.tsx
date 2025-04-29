import { StrategyLiveConfig, StrategySimulateConfig, StrategyBacktestConfig } from "./strategy";
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

export type StartNode = Node<StartNodeData, 'start'>;