import {Node} from '@xyflow/react'
import { SelectedAccount } from './strategy';



// 实时数据节点实盘交易配置
export type LiveDataNodeLiveConfig = {
    selectedLiveAccount: SelectedAccount; //选择的账户
    symbol: string; // 交易对
    interval: string; // 时间周期
}

// 实时数据节点模拟交易配置
export type LiveDataNodeSimulateConfig = {
    selectedSimulateAccount: SelectedAccount; //选择的账户
    symbol: string; // 交易对
    interval: string; // 时间周期
}

// 实时数据节点回测交易配置
export type LiveDataNodeBacktestConfig = {
    backtestStartDate: string; // 回测开始日期
    backtestEndDate: string; // 回测结束日期
}

// 实时数据节点数据
export type LiveDataNodeData = {
    nodeName: string; // 节点名称
    liveConfig?: LiveDataNodeLiveConfig; // 实盘交易配置。三个配置中，只有一个有效，可以共存
    simulateConfig?: LiveDataNodeSimulateConfig; // 模拟交易配置
    backtestConfig?: LiveDataNodeBacktestConfig; // 回测交易配置
}




export type LiveDataNode = Node<
  LiveDataNodeData,
  'liveData'
>;