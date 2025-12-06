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
 * 根据ID获取策略详情
 */
export async function getStrategyById(strategyId: number): Promise<Strategy> {
	try {
		const response = await axios.get(`${getApiUrl()}/${strategyId}`);

		if (response.status !== 200) {
			throw new Error(`获取策略失败: ${response.status}`);
		}

		const data = response.data;
		// console.log("接口获取的原始策略数据", data.data);

		if (!data.data) {
			throw new Error("获取策略数据为空");
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
		console.error("获取策略详情错误:", error);
		throw error;
	}
}

/**
 * 获取所有策略列表
 */
export async function getAllStrategies(): Promise<Strategy[]> {
	try {
		const response = await axios.get(`${getApiBaseUrl()}/get_strategies`);
		if (response.status !== 200) {
			throw new Error(`获取策略列表失败: ${response.status}`);
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
		console.error("获取策略列表错误:", error);
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

		console.log("创建策略响应", response);

		if (response.status !== 201) {
			throw new Error(`创建策略失败: ${response.status}`);
		}

		const data = response.data;
		const result = await getStrategyById(data.data.id);

		// 成功回调
		if (options?.showToast) {
			toast.success("创建成功");
		}
		options?.onSuccess?.();

		return result;
	} catch (error) {
		console.error("创建策略错误:", error);

		// 错误回调
		if (options?.showToast) {
			toast.error(
				`创建失败: ${error instanceof Error ? error.message : String(error)}`,
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
 * 获取策略订阅的缓存键
 */
export async function getStrategyCacheKeys(
	strategyId: number,
): Promise<string[]> {
	try {
		const response = await axios.get(`${getApiUrl()}/${strategyId}/cache-keys`);
		return response.data.data;
	} catch (error) {
		console.error("获取策略订阅的缓存键错误:", error);
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
		console.error("更新策略图表配置错误:", error);
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
			throw new Error(`获取策略图表配置失败: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("获取策略图表配置错误:", error);
		throw error;
	}
}
