import { IndicatorConfig, IndicatorValue } from "@/types/indicator";
import {
	BacktestDataSource,
	SelectedAccount,
	TimeRange,
} from "@/types/strategy";
import { Exchange } from "@/types/common";
import { Node } from "@xyflow/react";
import { SelectedSymbol } from "./kline-node";

// 选中的指标, 用于连接到其他节点, 扩展IndicatorConfig
export type SelectedIndicator = {
	indicatorId: number; // 指标id
	outputHandleId: string; // 出口id, 用于连接到其他节点
	indicatorConfig: IndicatorConfig;
	value: IndicatorValue;
};

// 实盘交易指标配置
export type IndicatorNodeLiveConfig = {
	exchange: string | Exchange | null; // 交易所
	symbol: string | null; // 交易对
	interval: string | null; // 时间周期
	selectedIndicators: SelectedIndicator[]; // 选中的指标
};

// 模拟交易指标配置
export type IndicatorNodeSimulateConfig = {
	exchange?: string | Exchange; // 交易所
	symbol?: string; // 交易对
	interval?: string; // 时间周期
	selectedIndicators: SelectedIndicator[]; // 选中的指标
};

export type IndicatorNodeBacktestFileConfig = {
	filePath: string; // 文件路径
};

// 回测交易 交易所配置
export type IndicatorNodeBacktestExchangeModeConfig = {
	selectedAccount: SelectedAccount | null; // 选中的账户
	selectedSymbol: SelectedSymbol | null; // 选中的交易对
	selectedIndicators: SelectedIndicator[]; // 选中的指标
	timeRange: TimeRange; // 时间范围
};

// 指标节点回测模式配置
export type IndicatorNodeBacktestConfig = {
	dataSource: BacktestDataSource; // 数据来源
	fileModeConfig?: IndicatorNodeBacktestFileConfig; // 文件数据源配置
	exchangeModeConfig?: IndicatorNodeBacktestExchangeModeConfig; // 交易所数据源配置
};

// 指标节点数据类型
export type IndicatorNodeData = {
	nodeName: string;
	liveConfig?: IndicatorNodeLiveConfig; // 实盘交易配置
	simulateConfig?: IndicatorNodeSimulateConfig; // 模拟交易配置
	backtestConfig?: IndicatorNodeBacktestConfig; // 回测交易配置
};

export type IndicatorNode = Node<IndicatorNodeData, "indicatorNode">;
