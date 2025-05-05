import { Node } from '@xyflow/react';
import { SelectedAccount } from './strategy';

export enum PositionOperationType {
  UPDATE = "update", // 更新仓位
  CLOSEALL = "close_all", // 全部平仓
}


export type PositionOperationConfig = {
  configId: number; // 配置ID
  operationType: PositionOperationType; // 操作类型
  operationName: string; // 操作名称
}

export type PositionLiveConfig = {
  selectedLiveAccount: SelectedAccount | null; // 账户选择
  symbol: string | null; // 交易对
  operations: PositionOperationConfig[]; // 操作列表
}

export type PositionSimulateConfig = {
  selectedSimulateAccount: SelectedAccount | null; // 账户选择
  symbol: string | null; // 交易对
  operations: PositionOperationConfig[]; // 操作列表
}

export type PositionBacktestConfig = {
  symbol: string | null; // 交易对
  operations: PositionOperationConfig[]; // 操作列表
}





export type PositionNodeData = {
  strategyId: number;
  nodeName: string | null;
  liveConfig?: PositionLiveConfig;
  simulateConfig?: PositionSimulateConfig;
  backtestConfig?: PositionBacktestConfig;
}

export type PositionNode = Node<
  PositionNodeData,
  'position'
>;