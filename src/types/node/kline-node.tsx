import {Node} from '@xyflow/react'
import { SelectedAccount, DataSourceExchange, TimeRange, BacktestDataSource } from '@/types/strategy';


export type SelectedSymbol = {
    symbolId: number; // 交易对id
    handleId: string; // 出口id, 用于连接到其他节点
    symbol: string; // 交易对
    interval: string; // 时间周期
}

// k线节点实盘交易配置
export type KlineNodeLiveConfig = {
    selectedLiveAccount: SelectedAccount | null; //选择的账户
    selectedSymbols: SelectedSymbol[]; // 选择的交易对(可以多选)
}

// k线节点模拟交易配置
export type KlineNodeSimulateConfig = {
    selectedSimulateAccount: SelectedAccount; //选择的账户
    selectedSymbols: SelectedSymbol[]; // 选择的交易对(可以多选)
}

// k线节点回测交易 文件数据源配置
export type KlineNodeBacktestFileConfig = {
    filePath: string; // 文件路径
}

// k线节点回测交易 交易所数据源配置
export type KlineNodeBacktestExchangeConfig = {
    selectedDataSource: DataSourceExchange | null; // 数据来源交易所
    selectedSymbols: SelectedSymbol[]; // 选择的交易对(可以多选)
    timeRange: TimeRange; // 时间范围
}

// k线节点回测交易 配置
export type KlineNodeBacktestConfig = {
    dataSource: BacktestDataSource; // 数据来源
    fileConfig?: KlineNodeBacktestFileConfig; // 文件数据源配置
    exchangeConfig?: KlineNodeBacktestExchangeConfig; // 交易所数据源配置
}



export type KlineData = {
    timestamp: number | null; // 时间戳
    open: number | null; // 开盘价
    high: number | null; // 最高价
    low: number | null; // 最低价
    close: number | null; // 收盘价
    volume: number | null; // 成交量
}

// 实时数据节点数据
export type KlineNodeData = {
    nodeName: string; // 节点名称
    liveConfig?: KlineNodeLiveConfig; // 实盘交易配置。三个配置中，只有一个有效，可以共存
    simulateConfig?: KlineNodeSimulateConfig; // 模拟交易配置
    backtestConfig?: KlineNodeBacktestConfig; // 回测交易配置
    klineData: KlineData; // 蜡烛图数据, 只保存最新的一条

}




export type KlineNode = Node<KlineNodeData,'klineNode'>;