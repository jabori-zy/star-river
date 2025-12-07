import axios from "axios";
import { toast } from "sonner";
// import { useStrategyStore } from "@/store/use-strategy-store";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import type { Strategy } from "@/types/strategy";
import { getApiBaseUrl } from "./index";

const ROUTER = "strategy";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

interface UpdateOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	onFinally?: () => void;
	showToast?: boolean;
}

/**
 * Get strategy details by ID
 */
export async function getStrategyById(strategyId: number): Promise<Strategy> {
	try {
		const response = await axios.get(`${getApiUrl()}/${strategyId}`);

		if (response.status !== 200) {
			throw new Error(`Failed to fetch strategy: ${response.status}`);
		}

		const data = response.data;
		// console.log("Raw strategy data from API", data.data);

		if (!data.data) {
			throw new Error("Strategy data is empty");
		}

		const strategy: Strategy = {
			id: data.data["id"],
			name: data.data["name"],
			description: data.data["description"],
			isDeleted: data.data["is_deleted"],
			tradeMode: data.data["trade_mode"],
			nodes: data.data["nodes"],
			edges: data.data["edges"],
			status: data.data["status"],
			backtestChartConfig: data.data["backtest_chart_config"] || {},
			createTime: data.data["created_time"],
			updateTime: data.data["updated_time"],
		};

		return strategy;
	} catch (error) {
		console.error("Error fetching strategy details:", error);
		throw error;
	}
}

/**
 * Get all strategies list
 */
export async function getAllStrategies(): Promise<Strategy[]> {
	try {
		const response = await axios.get(`${getApiBaseUrl()}/get_strategies`);
		if (response.status !== 200) {
			throw new Error(`Failed to fetch strategies list: ${response.status}`);
		}

		const data = response.data;

		if (!data.data || !Array.isArray(data.data)) {
			return [];
		}

		return data.data.map((item: Record<string, unknown>) => ({
			id: item["id"],
			name: item["name"],
			description: item["description"],
			isDeleted: item["is_deleted"],
			tradeMode: item["trade_mode"],
			config: item["config"],
			nodes: item["nodes"],
			edges: item["edges"],
			status: item["status"],
			createTime: item["created_time"],
			updateTime: item["updated_time"],
		}));
	} catch (error) {
		console.error("Error fetching strategies list:", error);
		throw error;
	}
}

/**
 * create a new strategy
 */
export async function createStrategy(
	strategyName: string,
	strategyDescription: string,
	options?: UpdateOptions,
): Promise<Strategy> {
	try {
		const response = await axios.post(`${getApiUrl()}`, {
			name: strategyName,
			description: strategyDescription,
		});

		console.log("Create strategy response", response);

		if (response.status !== 201) {
			throw new Error(`Failed to create strategy: ${response.status}`);
		}

		const data = response.data;
		const result = await getStrategyById(data.data.id);

		// Success callback
		if (options?.showToast) {
			toast.success("Created successfully");
		}
		options?.onSuccess?.();

		return result;
	} catch (error) {
		console.error("Error creating strategy:", error);

		// Error callback
		if (options?.showToast) {
			toast.error(
				`Failed to create: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
		options?.onError?.(
			error instanceof Error ? error : new Error(String(error)),
		);

		throw error;
	} finally {
		options?.onFinally?.();
	}
}

/**
 * Get strategy subscribed cache keys
 */
export async function getStrategyCacheKeys(
	strategyId: number,
): Promise<string[]> {
	try {
		const response = await axios.get(`${getApiUrl()}/${strategyId}/cache-keys`);
		return response.data.data;
	} catch (error) {
		console.error("Error fetching strategy subscribed cache keys:", error);
		throw error;
	}
}

export async function updateBacktestStrategyChartConfig(
	strategyId: number,
	chartConfig: BacktestStrategyChartConfig,
) {
	try {
		// /api/v1/strategy/backtest/{strategy_id}/chart_config
		const requestBody = {
			backtest_chart_config: chartConfig,
		};
		const response = await axios.post(
			`${getApiUrl()}/backtest/${strategyId}/chart_config`,
			requestBody,
		);
		return response.data;
	} catch (error) {
		console.error("Error updating strategy chart config:", error);
		throw error;
	}
}

export async function getBacktestStrategyChartConfig(
	strategyId: number,
): Promise<BacktestStrategyChartConfig> {
	try {
		// /api/v1/strategy/backtest/{strategy_id}/chart_config
		const response = await axios.get(
			`${getApiUrl()}/backtest/${strategyId}/chart_config`,
		);
		if (response.status !== 200) {
			throw new Error(`Failed to fetch strategy chart config: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("Error fetching strategy chart config:", error);
		throw error;
	}
}
