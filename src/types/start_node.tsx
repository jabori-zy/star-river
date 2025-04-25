import { TradeMode } from "./node";

// 策略变量类型
export enum StrategyVariableType {
  NUMBER = "number",
  STRING = "string"
}

// 策略变量定义
export type StrategyVariable = {
  name: string; // 变量名（代码中使用的名称，符合变量命名规则）
  displayName: string; // 显示名称
  type: StrategyVariableType; // 变量类型
  value: string | number; // 变量值
};

// 开始节点数据
export type StartNodeData = {
  strategyTitle: string;
  liveTradingConfig?: LiveTradeConfig; // 实盘交易配置。三个配置中，只有一个有效，可以共存
  simulateTradingConfig?: SimulateTradeConfig; // 模拟交易配置
  backtestTradingConfig?: BacktestTradeConfig; // 回测交易配置
};

export type AccountItem = {
  id: number;
  accountName: string;
  exchange: string;
  availableBalance: number;
}

// 实盘交易配置
export interface LiveTradeConfig {
  liveAccounts: Array<AccountItem>;
  variables?: StrategyVariable[]; // 实盘策略变量
}

// 模拟交易配置
export interface SimulateTradeConfig {
  simulateAccounts: Array<AccountItem>;
  variables?: StrategyVariable[]; // 模拟策略变量
}

// 回测交易配置
export interface BacktestTradeConfig {
  backtestStartDate: string;
  backtestEndDate: string;
  variables?: StrategyVariable[]; // 回测策略变量
}