import {Node} from '@xyflow/react'
import { SelectedAccount } from './strategy';

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

export type OrderNodeBacktestConfig = {
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