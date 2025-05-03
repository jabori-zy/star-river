import { Node } from '@xyflow/react';
import { SelectedAccount } from './strategy';

export enum PositionOperationType {
  UPDATE = "update", // 更新仓位
  CLOSEALL = "close_all", // 全部平仓
}

export type OperationConfig = {
  selectedAccount?: SelectedAccount;
  symbol: string;
}

export type PositionOperationConfig = {
  configId: number; // 配置ID
  operationType: PositionOperationType; // 操作类型
  operationName: string; // 操作名称
  operationConfig: OperationConfig; // 操作配置
}

export type PositionNodeData = {
  strategyId: number;
  nodeName: string | null;
  liveConfig?: {
    operations: PositionOperationConfig[];
  };
  simulateConfig?: {
    operations: PositionOperationConfig[];
  };
  backtestConfig?: {
    operations: PositionOperationConfig[];
  };
}

export type PositionNode = Node<
  PositionNodeData,
  'position'
>;