import { getApiBaseUrl } from "@/service";

export const getBacktestStrategyEventSseUrl = () =>
	`${getApiBaseUrl()}/api/v1/sse/strategy/backtest/event`;
export const getBacktestStrategyStateLogUrl = () =>
	`${getApiBaseUrl()}/api/v1/sse/strategy/backtest/state-log`;
export const getBacktestStrategyRunningLogUrl = () =>
	`${getApiBaseUrl()}/api/v1/sse/strategy/backtest/running-log`;
export const getBacktestStrategyPerformanceUrl = () =>
	`${getApiBaseUrl()}/api/v1/sse/strategy/backtest/performance`;

export const getBacktestEventTestUrl = () =>
	`${getApiBaseUrl()}/api/v1/sse/strategy/backtest/event-test`;
