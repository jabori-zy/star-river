import { IndicatorValue } from "./indicatorValue";
import { IndicatorType } from "./indicator";

// 指标类型枚举


// 指标参数类型
export type IndicatorParam = {
    paramName: string;      // 参数中文显示名称
    paramValue: number | null;  // 参数值
}


// 实盘交易指标配置
export type IndicatorNodeLiveConfig = {
    period?: number;  // 周期
    stdDev?: number;  // 标准差倍数（布林带）
    priceSource?: string;  // 价格来源
}

// 模拟交易指标配置
export type IndicatorNodeSimulateConfig = {
    period?: number;  // 周期
    stdDev?: number;  // 标准差倍数（布林带）
    priceSource?: string;  // 价格来源
}

// 回测指标配置
export type IndicatorNodeBacktestConfig = {
    period?: number;  // 周期
    stdDev?: number;  // 标准差倍数（布林带）
    priceSource?: string;  // 价格来源
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