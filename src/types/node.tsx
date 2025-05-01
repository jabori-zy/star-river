import {Node} from '@xyflow/react'
import { StartNodeData } from './startNode';
import { StrategyLiveConfig, StrategySimulateConfig, StrategyBacktestConfig } from './strategy';

// 交易模式枚举
export enum TradeMode {
  LIVE = "live",
  SIMULATE = "simulate",
  BACKTEST = "backtest"
}

// 所有可能的节点数据类型
export type NodeItemProps = {
    nodeId: string;
    nodeType: string;
    nodeName: string;
    nodeDescription: string;
    nodeColor: string;
};

type outputValue = {
  value: number | null;
  timestamp: number | null;
}


// type LiveDataNodeData = {
//   strategyId: number | null;
//   exchange: string | null;
//   symbol: string | null;
//   interval: string | null;
//   tradingMode?: TradeMode; // 交易模式
//   liveTradingConfig?: StrategyLiveConfig; // 实盘交易配置。三个配置中，只有一个有效，可以共存
//   simulateTradingConfig?: StrategySimulateConfig; // 模拟交易配置
//   backtestTradingConfig?: StrategyBacktestConfig; // 回测交易配置
// };


type IndicatorParam = {
  paramName: string;      // 参数中文显示名称
  paramValue: number | null;  // 参数值
}

type SMAIndicatorNodeData = {
  strategyId: number | null;
  nodeName: string | null;
  indicatorName: string | null;
  indicatorConfig: Record<string, IndicatorParam>; 
  indicatorValue: Record<string, outputValue> | null;

};



type OrderNodeData = {
  strategyId: number | null;
  nodeName: string | null;
  exchange: string | null;
  symbol: string | null;
  orderRequest: OrderRequest | null;
};

type GetPositionNumberNodeData = {
  strategyId: number | null;
  nodeName: string | null;
  exchange: string | null;
  symbol: string | null;
  positionNumber: number
  getPositionNumberRequest: GetPositionNumberRequest | null;
  
};



type OrderRequest = {
  strategyId: number;
  nodeId: string;
  exchange: string;
  symbol: string;
  orderType: string;
  orderSide: string;
  price: number;
  quantity: number;
  tp: number | null;
  sl: number | null;
}

type GetPositionNumberRequest = {
  strategyId: number;
  nodeId: string;
  exchange: string;
  symbol: string;
  positionSide: string | null;
  position_number: number;

}







// // node定义
// export type LiveDataNode = Node<
//   {
//     exchange: string;
//     symbol: string;
//     interval: string;
//     tradingMode?: TradeMode; // 交易模式
//     liveTradingConfig?: StrategyLiveConfig; // 实盘交易配置。三个配置中，只有一个有效，可以共存
//     simulateTradingConfig?: StrategySimulateConfig; // 模拟交易配置
//     backtestTradingConfig?: StrategyBacktestConfig; // 回测交易配置
//   },
//   'liveData'
// >;

export type IndicatorNode = Node<
  {
    exchange: string | null;
    symbol: string | null;
    interval: string | null;
    indicatorName: string;
    indicatorConfig: {
      period: number; 
    };
    indicatorValue: Record<string, outputValue> | null;
  },
  'indicator'
>;

export type OrderNode = Node<
  {
    nodeName: string | null;
    exchange: string | null;
    symbol: string | null;
    orderRequest: OrderRequest | null;
  },
  'order'
>;

export type GetPositionNumberNode = Node<
  {
    nodeName: string;
    exchange: string;
    symbol: string;
    positionNumber: number,
    getPositionNumberRequest: GetPositionNumberRequest;
  }
>;
