import {Node} from '@xyflow/react'
import { SelectedAccount, BacktestDataSource, DataSourceExchange, TimeRange } from '@/types/strategy';

export type OrderConfig = {
    symbol: string;
    orderType: string;
    orderSide: string;
    price: number;
    quantity: number;
    tp: number | null;
    sl: number | null;
  }

export type OrderNodeLiveConfig = {
    orderConfig: OrderConfig;
    selectedLiveAccount?: SelectedAccount;
}

export type OrderNodeSimulateConfig = {
    orderConfig: OrderConfig;
    selectedSimulateAccount?: SelectedAccount;
}



export type OrderNodeBacktestExchangeConfig = {
  selectedDataSource: DataSourceExchange; // 数据来源交易所
  symbol: string; // 交易对
  timeRange: TimeRange; // 时间范围
}


export type OrderNodeBacktestConfig = {
  dataSource: BacktestDataSource;
  exchangeConfig?: OrderNodeBacktestExchangeConfig;
  orderConfig: OrderConfig;
}


export type OrderNodeData = Node<
  {
    strategyId: number;
    nodeName: string | null;
    liveConfig?: OrderNodeLiveConfig;
    simulateConfig?: OrderNodeSimulateConfig;
    backtestConfig?: OrderNodeBacktestConfig;
  },
  'order'
>;