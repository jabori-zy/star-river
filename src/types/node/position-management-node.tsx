import { Node } from '@xyflow/react';
import { SelectedAccount } from '@/types/strategy';

// 仓位操作类型
export enum PositionOperation {
  UPDATE = "update", // 更新仓位
  CLOSEALL = "close_all", // 全部平仓

}

// 仓位操作配置
export type PositionOperationConfig = {
  positionOperationId: number; // 配置ID
  inputHandleId: string; // 输入handleId
  symbol: string | null; // 交易对(可以不配置)
  positionOperation: PositionOperation; // 操作类型
  positionOperationName: string; // 操作名称
}

// 实盘仓位管理配置
export type PositionLiveConfig = {
  selectedAccount: SelectedAccount | null; // 账户选择
  positionOperations: PositionOperationConfig[]; // 操作列表
}

// 模拟仓位管理配置
export type PositionSimulateConfig = {
  selectedAccount: SelectedAccount | null; // 模拟账户选择
  positionOperations: PositionOperationConfig[]; // 操作列表
}

// 回测仓位管理配置
export type PositionBacktestConfig = {
  selectedAccount: SelectedAccount | null; // 回测账户选择
  positionOperations: PositionOperationConfig[]; // 操作列表
}





export type PositionManagementNodeData = {
  strategyId: number;
  nodeName: string | null;
  liveConfig?: PositionLiveConfig;
  simulateConfig?: PositionSimulateConfig;
  backtestConfig?: PositionBacktestConfig;
}

export type PositionManagementNode = Node<PositionManagementNodeData,'positionManagementNode'>;