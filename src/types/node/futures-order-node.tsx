import {Node} from '@xyflow/react'
import { SelectedAccount, BacktestDataSource, DataSourceExchange, TimeRange } from '@/types/strategy';
import { FuturesOrderConfig } from '@/types/order';



export type FuturesOrderNodeLiveConfig = {
    futuresOrderConfigs: FuturesOrderConfig[];
    selectedLiveAccount?: SelectedAccount;
}

export type FuturesOrderNodeSimulateConfig = {
    futuresOrderConfigs: FuturesOrderConfig[];
    selectedSimulateAccount?: SelectedAccount;
}



export type FuturesOrderNodeBacktestExchangeConfig = {
  selectedDataSource: DataSourceExchange; // 数据来源交易所
  symbol: string; // 交易对
  timeRange: TimeRange; // 时间范围
}


export type FuturesOrderNodeBacktestConfig = {
  dataSource: BacktestDataSource;
  exchangeConfig?: FuturesOrderNodeBacktestExchangeConfig;
  futuresOrderConfigs: FuturesOrderConfig[];
}

export type FuturesOrderNodeData = {
  nodeName: string; // 节点名称
  // 针对不同交易模式的条件配置
  liveConfig?: FuturesOrderNodeLiveConfig; 
  simulateConfig?: FuturesOrderNodeSimulateConfig;
  backtestConfig?: FuturesOrderNodeBacktestConfig;
}

export type FuturesOrderNode = Node<FuturesOrderNodeData,'futuresOrderNode'>;