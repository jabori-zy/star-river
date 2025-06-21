import {Node} from '@xyflow/react'
import { SelectedAccount, BacktestDataSource, TimeRange } from '@/types/strategy';
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
  selectedAccount?: SelectedAccount;
  timeRange: TimeRange; // 回测时间范围
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
  backtestConfig?: FuturesOrderNodeBacktestConfig;
  simulateConfig?: FuturesOrderNodeSimulateConfig;
  
}

export type FuturesOrderNode = Node<FuturesOrderNodeData,'futuresOrderNode'>;