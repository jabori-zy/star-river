import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import {
	getApiBaseUrl,
	ApiError,
	type ApiResponse,
	type MutationMeta,
} from "@/service/index";
import { strategyKeys } from "./query-keys";

const API_VERSION = "api/v1";
const ROUTER = "strategy";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

// ============================================
// 1. 类型定义
// ============================================

/**
 * 删除策略请求参数
 */
export interface DeleteStrategyRequest {
	strategyId: number;
}

/**
 * 删除策略响应
 */
export interface DeleteStrategyResponse {
	success: boolean;
}

// ============================================
// 3. API 调用函数（纯粹的数据交互）
// ============================================

/**
 * 删除策略 API 调用（不包含 UI 逻辑）
 *
 * @param params 删除参数
 * @returns 删除结果
 */
export async function deleteStrategyApi(
	params: DeleteStrategyRequest,
): Promise<DeleteStrategyResponse> {
	// 步骤1：参数校验
	if (!params.strategyId || params.strategyId <= 0) {
		throw new Error("Invalid strategy ID");
	}

	// 步骤2：打印请求日志（开发环境）
	if (import.meta.env.DEV) {
		console.log("[delete strategy] strategyId:", params.strategyId);
	}

	try {
		// 步骤3：发送 DELETE 请求
		const response = await axios.delete<ApiResponse<DeleteStrategyResponse>>(
			`${getApiUrl()}/${params.strategyId}`,
			{
				timeout: 10000, // 10秒超时
			},
		);

		// 步骤4：响应状态检查
		if (response.status !== 200) {
			throw new Error(`HTTP Status: ${response.status}`);
		}

		// 步骤5：业务状态检查
		const apiResponse = response.data;
		if (!apiResponse.success) {
			// 错误响应
			throw new ApiError(
				apiResponse.message,
				apiResponse.errorCode,
				apiResponse.errorCodeChain,
			);
		}

		// 步骤6：打印响应日志（开发环境）
		if (import.meta.env.DEV) {
			console.log("[delete strategy] success");
		}

		return {
			success: true,
		};
	} catch (error) {
		// 统一错误处理
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<ApiResponse<unknown>>;
			const responseData = axiosError.response?.data;

			// 检查是否是后端返回的标准错误响应
			let message = axiosError.message || "network request failed";
			let errorCode: string | undefined;
			let errorCodeChain: string[] | undefined;

			if (responseData && !responseData.success) {
				// 使用后端返回的错误信息
				message = responseData.message;
				errorCode = responseData.errorCode;
				errorCodeChain = responseData.errorCodeChain;
			}

			throw new ApiError(message, errorCode, errorCodeChain);
		}

		// 参数校验错误或其他错误
		throw error;
	}
}

// ============================================
// 4. TanStack Query Hook
// ============================================

/**
 * Mutation 选项（可选配置）
 */
export interface UseDeleteStrategyOptions {
	/**
	 * 元数据配置（用于控制全局 toast 行为）
	 * 使用标准的 MutationMeta 接口
	 */
	meta?: MutationMeta;
	/**
	 * 成功回调
	 */
	onSuccess?: () => void;
	/**
	 * 错误回调
	 */
	onError?: (error: Error) => void;
	/**
	 * 完成回调（无论成功失败）
	 */
	onSettled?: () => void;
}

export function useDeleteStrategy(options?: UseDeleteStrategyOptions) {
	const queryClient = useQueryClient();

	const { meta, onSuccess, onError, onSettled } = options || {};

	return useMutation({
		// Mutation 函数
		mutationFn: (params: DeleteStrategyRequest) => deleteStrategyApi(params),

		// ✅ 通过 meta 传递 toast 配置给全局 MutationCache
		meta: {
			successMessage: meta?.successMessage,
			showSuccessToast: meta?.showSuccessToast,
			errorMessage: meta?.errorMessage,
			showErrorToast: meta?.showErrorToast,
		},

		// 成功回调（只处理数据和缓存，不管 toast）
		onSuccess: () => {
			// 1. 使策略列表缓存失效，触发重新获取
			queryClient.invalidateQueries({
				queryKey: strategyKeys.lists(),
			});

			// 2. 执行用户自定义的成功回调
			onSuccess?.();

			// 3. 开发环境日志
			if (import.meta.env.DEV) {
				console.log("[delete strategy] cache invalidated");
			}
		},

		// 错误回调（只处理业务逻辑，不管 toast）
		onError: (error: Error) => {
			// 执行用户自定义的错误回调
			onError?.(error);

			// 开发环境日志（详细错误已在全局 MutationCache 中打印）
			if (import.meta.env.DEV) {
				console.error("[delete strategy] error:", error);
			}
		},

		// 完成回调（无论成功失败都会执行）
		onSettled: () => {
			onSettled?.();
		},
	});
}
