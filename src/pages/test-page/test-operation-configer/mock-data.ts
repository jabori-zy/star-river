import { NodeType } from "@/types/node";
import type { InputArrayType, Operation, InputConfig, OutputConfig, WindowConfig, FillingMethod } from "@/types/operation";

// Series option for Select dropdown
export interface SeriesOption {
	nodeId: string;
	nodeName: string;
	nodeType: NodeType;
	seriesId: number;
	seriesName: string;
	displayName: string;
	handleId: string;
}

// Mock series options (simulating upstream node outputs)
export const mockSeriesOptions: SeriesOption[] = [
	{
		nodeId: "kline-1",
		nodeName: "BTC/USDT KLine",
		nodeType: NodeType.KlineNode,
		seriesId: 1,
		seriesName: "close",
		displayName: "Close Price",
		handleId: "kline-1-output-close",
	},
	{
		nodeId: "kline-1",
		nodeName: "BTC/USDT KLine",
		nodeType: NodeType.KlineNode,
		seriesId: 2,
		seriesName: "open",
		displayName: "Open Price",
		handleId: "kline-1-output-open",
	},
	{
		nodeId: "kline-1",
		nodeName: "BTC/USDT KLine",
		nodeType: NodeType.KlineNode,
		seriesId: 3,
		seriesName: "high",
		displayName: "High Price",
		handleId: "kline-1-output-high",
	},
	{
		nodeId: "kline-1",
		nodeName: "BTC/USDT KLine",
		nodeType: NodeType.KlineNode,
		seriesId: 4,
		seriesName: "low",
		displayName: "Low Price",
		handleId: "kline-1-output-low",
	},
	{
		nodeId: "kline-1",
		nodeName: "BTC/USDT KLine",
		nodeType: NodeType.KlineNode,
		seriesId: 5,
		seriesName: "volume",
		displayName: "Volume",
		handleId: "kline-1-output-volume",
	},
	{
		nodeId: "indicator-1",
		nodeName: "RSI Indicator",
		nodeType: NodeType.IndicatorNode,
		seriesId: 1,
		seriesName: "rsi",
		displayName: "RSI(14)",
		handleId: "indicator-1-output-rsi",
	},
	{
		nodeId: "indicator-2",
		nodeName: "MACD Indicator",
		nodeType: NodeType.IndicatorNode,
		seriesId: 1,
		seriesName: "macd",
		displayName: "MACD Line",
		handleId: "indicator-2-output-macd",
	},
	{
		nodeId: "indicator-2",
		nodeName: "MACD Indicator",
		nodeType: NodeType.IndicatorNode,
		seriesId: 2,
		seriesName: "signal",
		displayName: "Signal Line",
		handleId: "indicator-2-output-signal",
	},
];

// Default operation node configuration
export const mockDefaultConfig = {
	inputArrayType: "Unary" as InputArrayType,
	operation: { type: "Mean" } as Operation,
	inputConfig: null as InputConfig | null,
	outputConfig: null as OutputConfig | null,
	windowConfig: {
		windowType: "rolling",
		windowSize: 20,
	} as WindowConfig,
	fillingMethod: "FFill" as FillingMethod,
};

// Example with filled input config
export const mockFilledConfig = {
	inputArrayType: "Unary" as InputArrayType,
	operation: { type: "EMA", span: 20 } as Operation,
	inputConfig: {
		type: "Series" as const,
		seriesId: 1,
		fromNodeType: NodeType.KlineNode,
		fromNodeId: "kline-1",
		fromNodeName: "BTC/USDT KLine",
		fromHandleId: "kline-1-output-close",
		fromSeriesConfigId: 1,
		fromSeriesName: "close",
		fromSeriesDisplayName: "Close Price",
	},
	outputConfig: {
		type: "Series" as const,
		seriesId: 1,
		outputName: "EMA(20)",
	},
	windowConfig: {
		windowType: "rolling",
		windowSize: 20,
	} as WindowConfig,
	fillingMethod: "FFill" as FillingMethod,
};

// Filling method options with descriptions
export const fillingMethodOptions = [
	{ value: "FFill", label: "Forward Fill", description: "Fill with previous value" },
	{ value: "BFill", label: "Backward Fill", description: "Fill with next value" },
	{ value: "Zero", label: "Zero Fill", description: "Fill with zero" },
	{ value: "Mean", label: "Mean Fill", description: "Fill with mean value" },
	{ value: "Drop", label: "Drop", description: "Remove missing values" },
] as const;

// Window type options
export const windowTypeOptions = [
	{ value: "rolling", label: "Rolling", description: "Fixed window size" },
	{ value: "expanding", label: "Expanding", description: "Growing window from start" },
] as const;

// Input array type options
export const inputArrayTypeOptions = [
	{ value: "Unary", label: "Unary", description: "Single series input" },
	{ value: "Binary", label: "Binary", description: "Two series inputs" },
	{ value: "Nary", label: "N-ary", description: "Multiple series inputs" },
] as const;
