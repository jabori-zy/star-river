import axios from "axios";
import { toast } from "sonner";
import { useStrategyStore } from "@/store/useStrategyStore";
import type { BacktestStrategyChartConfig } from "@/types/chart/backtest-chart";
import type { Strategy } from "@/types/strategy";
import { API_BASE_URL } from "./index";

const ROUTER = "strategy";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getStrategyList(
	page: number,
	strategy_per_page: number,
): Promise<Strategy[]> {
	try {
		const response = await axios.get(
			`${API_URL}?page=${page}&strategy_per_page=${strategy_per_page}`,
		);
		return response.data["data"] as Strategy[];
	} catch (error) {
		console.error("获取策略列表错误:", error);
		throw error;
	}
}

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
		console.log(`${API_URL}/${strategyId}`);
		const response = await axios.get(`${API_URL}/${strategyId}`);

		if (response.status !== 200) {
			throw new Error(`获取策略失败: ${response.status}`);
		}

		const data = response.data;
		console.log("接口获取的原始策略数据", data.data);

		if (!data.data) {
			throw new Error("获取策略数据为空");
		}

		const strategy: Strategy = {
			id: data.data["id"],
			name: data.data["name"],
			description: data.data["description"],
			isDeleted: data.data["is_deleted"],
			tradeMode: data.data["trade_mode"],
			config: data.data["config"] || {},
			nodes: data.data["nodes"],
			edges: data.data["edges"],
			status: data.data["status"],
			chartConfig: data.data["chart_config"],
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
		const response = await axios.get(`${API_BASE_URL}/get_strategies`);

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
 * 创建新策略
 */
export async function createStrategy(
	strategyName: string,
	strategyDescription: string,
	options?: UpdateOptions,
): Promise<Strategy> {
	try {
		const response = await axios.post(`${API_URL}`, {
			name: strategyName,
			description: strategyDescription,
			status: 1,
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
 * 更新策略
 */
export async function updateStrategy(
	strategyId: number,
	strategyData: Partial<Strategy>,
	options?: UpdateOptions,
): Promise<Strategy> {
	try {
		const { setStrategy } = useStrategyStore.getState();
		// 将驼峰命名转换为下划线命名以匹配API格式
		const requestBody = {
			name: strategyData.name ?? "",
			description: strategyData.description ?? "",
			is_deleted: strategyData.isDeleted ?? false,
			trade_mode: strategyData.tradeMode ?? "",
			config: strategyData.config ?? {},
			nodes: strategyData.nodes ?? [],
			edges: strategyData.edges ?? [],
			status: strategyData.status ?? 0,
			chart_config: strategyData.chartConfig ?? [],
		};

		// console.log("requestBody", requestBody);

		// 使用POST方法以匹配组件中的用法
		const response = await axios.post(`${API_URL}/${strategyId}`, {
			...requestBody,
		});

		if (response.status !== 200) {
			throw new Error(`更新策略失败: ${response.status}`);
		}

		// 获取更新后的策略数据
		const result = await getStrategyById(strategyId);

		// 更新全局策略状态
		setStrategy(result);

		// 成功回调
		if (options?.showToast) {
			toast.success("保存成功");
		}
		options?.onSuccess?.();

		return result;
	} catch (error) {
		console.error("更新策略错误:", error);

		// 错误回调
		if (options?.showToast) {
			toast.error(
				`保存失败: ${error instanceof Error ? error.message : String(error)}`,
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
 * 删除策略
 */
export async function deleteStrategy(
	strategyId: number,
	options?: UpdateOptions,
): Promise<boolean> {
	try {
		const response = await axios.delete(`${API_URL}/${strategyId}`);

		if (response.status !== 200) {
			throw new Error(`删除策略失败: ${response.status}`);
		}

		const data = response.data;
		const success = data.success === true;

		// 成功回调
		if (success && options?.showToast) {
			toast.success("删除成功");
		}
		if (success) {
			options?.onSuccess?.();
		}

		return success;
	} catch (error) {
		console.error("删除策略错误:", error);

		// 错误回调
		if (options?.showToast) {
			toast.error(
				`删除失败: ${error instanceof Error ? error.message : String(error)}`,
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
		const response = await axios.get(`${API_URL}/${strategyId}/cache-keys`);
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
			`${API_URL}/backtest/${strategyId}/chart_config`,
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
			`${API_URL}/backtest/${strategyId}/chart_config`,
		);
		if (response.status !== 200) {
			throw new Error(`获取策略图表配置失败: ${response.status}`);
		}
		return response.data["data"];
	} catch (error) {
		console.error("获取策略图表配置错误:", error);
		throw error;
	}
}

export async function initStrategy(strategyId: number) {
	try {
		const response = await axios.post(`${API_URL}/${strategyId}/init`);
		if (response.status !== 200) {
			throw new Error(`初始化策略失败: ${response.status}`);
		}
		return response.data["data"];
	} catch (error) {
		console.error("初始化策略错误:", error);
		throw error;
	}
}

export async function stopStrategy(strategyId: number) {
	try {
		const response = await axios.post(`${API_URL}/${strategyId}/stop`);
		if (response.status !== 200) {
			throw new Error(`停止策略失败: ${response.status}`);
		}
		return response.data["data"];
	} catch (error) {
		console.error("停止策略错误:", error);
		throw error;
	}
}
