import { IndicatorValue } from "@/types/indicator/indicatorValue";
import { IndicatorType, IndicatorConfig } from "@/types/indicator";
import { TimeRange, BacktestDataSource } from "@/types/strategy";
import { Exchange } from "@/types/common";
// 指标类型枚举


// 指标参数类型
export type IndicatorParam = {
    paramName: string;      // 参数中文显示名称
    paramValue: number | null;  // 参数值
}


// 实盘交易指标配置
export type IndicatorNodeLiveConfig = {
    exchange?: string;  // 交易所
    symbol?: string;  // 交易对
    interval?: string;  // 时间周期
    indicatorConfig: IndicatorConfig; // 指标配置
}

// 模拟交易指标配置
export type IndicatorNodeSimulateConfig = {
    indicatorConfig: IndicatorConfig; // 指标配置
}


export type IndicatorNodeBacktestFileConfig = {
    filePath: string; // 文件路径
}


// 回测交易 交易所配置
export type IndicatorNodeBacktestExchangeConfig = {
    exchange: Exchange; // 交易所
    symbol: string; // 交易对
    interval: string; // 时间周期
    timeRange: TimeRange; // 时间范围
}

// 指标节点回测模式配置
export type IndicatorNodeBacktestConfig = {
    dataSource: BacktestDataSource; // 数据来源
    fileConfig?: IndicatorNodeBacktestFileConfig; // 文件数据源配置
    exchangeConfig?: IndicatorNodeBacktestExchangeConfig; // 交易所数据源配置
    indicatorConfig: IndicatorConfig; // 指标配置
}

// 指标节点数据类型
export type IndicatorNodeData = {
    nodeName: string;
    indicatorType: IndicatorType;
    indicatorValue?: IndicatorValue;
    liveConfig?: IndicatorNodeLiveConfig;    // 实盘交易配置
    simulateConfig?: IndicatorNodeSimulateConfig;  // 模拟交易配置
    backtestConfig?: IndicatorNodeBacktestConfig;  // 回测交易配置
}