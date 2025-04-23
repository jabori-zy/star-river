import { TradingMode } from "./node";


// 开始节点数据
export type StartNodeData = {
  strategyTitle: string;
  tradingMode: TradingMode; // 交易模式 根据交易模式，读取配置
  liveTradingConfig?: LiveTradingConfig; // 实盘交易配置。三个配置中，只有一个有效，可以共存
  simulateTradingConfig?: SimulateTradingConfig; // 模拟交易配置
  backtestTradingConfig?: BacktestTradingConfig; // 回测交易配置
  
};


// 实盘交易配置
type LiveTradingConfig = {
  liveAccounts: Array<{
    id: string;
    accountName: string | null;
    availableFunds: string;
  }>;
  maxPositions: number;
  

}

// 模拟交易配置
type SimulateTradingConfig = {
  simulateAccounts: Array<{
    id: string;
    accountName: string | null;
    availableFunds: string;
  }>;
  maxPositions: number;
  feeRate: number;
}

// 回测交易配置
type BacktestTradingConfig = {
  backtestStartDate: string;
  backtestEndDate: string;
  feeRate: number;
}