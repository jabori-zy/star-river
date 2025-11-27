// 主 Hook
export { useBacktestChart } from "./use-backtest-chart";

// Legend Hooks
export { useKlineLegend } from "./use-kline-legend";
export { useIndicatorLegend } from "./use-indicator-legend";

// Core Hooks
export {
	useChartInitialization,
	useChartLifecycle,
	useChartResize,
} from "./core";

// Series Management Hooks
export {
	useKlineSeriesManager,
	useIndicatorSeriesManager,
	useSeriesConfigManager,
} from "./series-management";

// Data Loading Hooks
export {
	useVisibleRangeHandler,
	useKlineDataLoader,
	useIndicatorDataLoader,
} from "./data-loading";

// Types - Core
export type {
	UseChartInitializationProps,
	UseChartInitializationReturn,
	UseChartLifecycleProps,
	UseChartResizeProps,
} from "./core";

// Types - Series Management
export type {
	UseKlineSeriesManagerProps,
	UseKlineSeriesManagerReturn,
	UseIndicatorSeriesManagerProps,
	UseIndicatorSeriesManagerReturn,
	UseSeriesConfigManagerProps,
	UseSeriesConfigManagerReturn,
} from "./series-management";

// Types - Data Loading
export type {
	UseVisibleRangeHandlerProps,
	UseKlineDataLoaderProps,
	UseKlineDataLoaderReturn,
	UseIndicatorDataLoaderProps,
	UseIndicatorDataLoaderReturn,
} from "./data-loading";
