import axios, { type AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Strategy } from "@/types/strategy";
import { API_BASE_URL, type ApiResponse, ApiError, type MutationMeta } from "@/service/index";
import { strategyKeys } from "./query-keys";
const API_VERSION = "api/v1";
const ROUTER = "strategy";
const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

// ============================================
// 1. 类型定义
// ============================================

/**
 * 创建策略请求参数
 */
export interface CreateStrategyRequest {
	name: string;
	description: string;
}

// ============================================
// 3. API 调用函数（纯粹的数据交互）
// ============================================

/**
 * 将后端返回的原始数据转换为 Strategy 类型
 */
function transformToStrategy(data: Record<string, unknown>): Strategy {
	return {
		id: data.id as number,
		name: data.name as string,
		description: data.description as string,
		isDeleted: data.isDeleted as boolean,
		tradeMode: data.tradeMode as Strategy["tradeMode"],
		nodes: (data.nodes as Strategy["nodes"]) || [],
		edges: (data.edges as Strategy["edges"]) || [],
		status: data.status as Strategy["status"],
		backtestChartConfig:
			(data.backtestChartConfig as Strategy["backtestChartConfig"]) || null,
		createTime: data.createTime as string,
		updateTime: data.updateTime as string,
	};
}

/**
 * 创建策略 API 调用（不包含 UI 逻辑）
 *
 * ✅ 直接使用后端返回的完整策略数据，无需二次请求
 *
 * @param params 创建参数
 * @returns 创建的策略对象
 */
export async function createStrategyApi(
	params: CreateStrategyRequest,
): Promise<Strategy> {
	// 步骤1：参数校验
	// validateCreateStrategyParams(params);

	// 步骤2：构造请求体（显式构造，方便调试）
	const requestBody: CreateStrategyRequest = {
		name: params.name.trim(),
		description: params.description.trim(),
	};

	// 步骤3：打印请求日志（开发环境）
	if (import.meta.env.DEV) {
		console.log("[create strategy] params:", requestBody);
	}

	try {
		// 步骤4：发送 POST 请求
		const response = await axios.post<ApiResponse<Record<string, unknown>>>(
			API_URL,
			requestBody,
			{
				headers: {
					"Content-Type": "application/json",
				},
				timeout: 10000, // 10秒超时
			},
		);

		// 步骤5：响应状态检查
		if (response.status !== 201) {
			throw new Error(`HTTP Status: ${response.status}`);
		}

		// 步骤6：业务状态检查（使用类型守卫）
		const apiResponse = response.data;
		if (!apiResponse.success) {
			// 错误响应
			throw new ApiError(
				apiResponse.message,
				apiResponse.errorCode,
				apiResponse.errorCodeChain,
			);
		}

		// 成功响应 - 直接使用后端返回的数据
		const { data } = apiResponse;

		// 步骤7：打印响应日志（开发环境）
		if (import.meta.env.DEV) {
			console.log("[create strategy] response data:", data);
		}

		// 步骤8：将后端返回的数据转换为 Strategy 类型
		const strategy = transformToStrategy(data);

		return strategy;
	} catch (error) {
		// 统一错误处理
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<ApiResponse<unknown>>;
			const responseData = axiosError.response?.data;
            

			// 检查是否是后端返回的标准错误响应
			let message = axiosError.message || "network request failed";
			let errorCode: string | undefined = undefined;
            let errorCodeChain: string[] | undefined = undefined;

			if (responseData && !responseData.success) {
				// 使用后端返回的错误信息
				message = responseData.message;
				errorCode = responseData.errorCode;
                errorCodeChain = responseData.errorCodeChain;
			}

			throw new ApiError(message, errorCode, errorCodeChain);
		}

		// 参数校验错误或其他错误
		// console.error("[create strategy] error:", error);
		throw error;
	}
}

// ============================================
// 4. TanStack Query Hook
// ============================================

/**
 * Mutation 选项（可选配置）
 */
export interface UseCreateStrategyOptions {
	/**
	 * 元数据配置（用于控制全局 toast 行为）
	 * 使用标准的 MutationMeta 接口
	 */
	meta?: MutationMeta;
	/**
	 * 成功回调
	 */
	onSuccess?: (strategy: Strategy) => void;
	/**
	 * 错误回调
	 */
	onError?: (error: Error) => void;
	/**
	 * 完成回调（无论成功失败）
	 */
	onSettled?: () => void;
}


export function useCreateStrategy(options?: UseCreateStrategyOptions) {
	const queryClient = useQueryClient();

	const { meta, onSuccess, onError, onSettled } = options || {};

	return useMutation({
		// Mutation 函数
		mutationFn: (params: CreateStrategyRequest) => createStrategyApi(params),

		// ✅ 通过 meta 传递 toast 配置给全局 MutationCache
		meta: {
			successMessage: meta?.successMessage,
			showSuccessToast: meta?.showSuccessToast,
			errorMessage: meta?.errorMessage,
			showErrorToast: meta?.showErrorToast,
		},

		// 成功回调（只处理数据和缓存，不管 toast）
		onSuccess: (strategy) => {
			// 1. 使策略列表缓存失效，触发重新获取
			queryClient.invalidateQueries({
				queryKey: strategyKeys.lists(),
			});

			// 2. 预填充单个策略详情的缓存（优化性能）
			queryClient.setQueryData(strategyKeys.detail(strategy.id), strategy);

			// 3. 执行用户自定义的成功回调
			onSuccess?.(strategy);

			// 4. 开发环境日志
			if (import.meta.env.DEV) {
				console.log("[create strategy] success:", strategy);
			}
		},

		// 错误回调（只处理业务逻辑，不管 toast）
		onError: (error: Error) => {
			// 执行用户自定义的错误回调
			onError?.(error);

			// 开发环境日志（详细错误已在全局 MutationCache 中打印）
			if (import.meta.env.DEV) {
				console.error("[create strategy] error:", error);
			}
		},

		// 完成回调（无论成功失败都会执行）
		onSettled: () => {
			onSettled?.();
		},
	});
}

