import type { Node } from "@xyflow/react";
import type { IndicatorType } from "@/types/indicator";
import type { Exchange } from "@/types/market";
import type {
	BacktestDataSource,
	SelectedAccount,
	TimeRange,
} from "@/types/strategy";
import type { NodeDataBase } from ".";
import type { SelectedSymbol } from "./kline-node";

// 选中的指标, 用于连接到其他节点, 使用新的指标配置结构
export type SelectedIndicator = {
	configId: number; // 指标id
	outputHandleId: string; // 出口id, 用于连接到其他节点
	indicatorType: IndicatorType; // 指标类型
	indicatorConfig: Record<string, unknown>; // 使用新结构的 getConfig() 返回值
	value: Record<string, number>;
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
	fileModeConfig: IndicatorNodeBacktestFileConfig | null; // 文件数据源配置
	exchangeModeConfig: IndicatorNodeBacktestExchangeModeConfig | null; // 交易所数据源配置
};

// 指标节点数据类型
export type IndicatorNodeData = NodeDataBase & {
	liveConfig?: IndicatorNodeLiveConfig; // 实盘交易配置
	simulateConfig?: IndicatorNodeSimulateConfig; // 模拟交易配置
	backtestConfig?: IndicatorNodeBacktestConfig; // 回测交易配置
};

export type IndicatorNode = Node<IndicatorNodeData, "indicatorNode">;
