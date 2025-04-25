import { Node, Edge } from "@xyflow/react";
import { TradeMode } from "@/types/node";


// 策略已选择的账户
export type StrategySelectedAccount = {
  id: number;
  exchange: string;
  accountName: string;
}

// 实盘交易配置
export interface LiveTradeConfig {
  liveAccounts: Array<StrategySelectedAccount>;
  variables?: StrategyVariable[]; // 实盘策略变量
}

// 模拟交易配置
export interface SimulateTradeConfig {
  simulateAccounts: Array<StrategySelectedAccount>;
  variables?: StrategyVariable[]; // 模拟策略变量
}

// 回测交易配置
export interface BacktestTradeConfig {
  backtestStartDate: string;
  backtestEndDate: string;
  variables?: StrategyVariable[]; // 回测策略变量
}


// 策略全局配置
export interface StrategyGlobalConfig {
  liveConfig: LiveTradeConfig; // 实盘交易配置
  simulateConfig: SimulateTradeConfig; // 模拟交易配置
  backtestConfig: BacktestTradeConfig; // 回测交易配置
}

// 策略变量类型
export enum StrategyVariableType {
  NUMBER = "number",
  STRING = "string"
}

// 策略变量定义
export interface StrategyVariable {
  name: string; // 变量名（代码中使用的名称，符合变量命名规则）
  displayName: string; // 显示名称
  type: StrategyVariableType; // 变量类型
  value: string | number; // 变量值
};


export interface Strategy {
  id: number; // 策略ID 
  name: string; // 策略名称
  description: string; // 策略描述
  isDeleted: number; // 是否删除
  status: number; // 状态
  tradeMode: TradeMode; // 交易模式
  globalConfig: StrategyGlobalConfig; // 全局配置
  nodes: Node[]; // 节点列表
  edges: Edge[]; // 边列表
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
}


// 策略列表项组件的属性
export interface StrategyItemProps {
    strategyId: number;
    // 策略名称
    strategyName: string;
    // 策略描述
    strategyDescription: string;
    // 创建时间
    createTime: string;
    // 状态
    strategyStatus: 'running' | 'paused' | 'error';
    onDelete: () => void;
  }


