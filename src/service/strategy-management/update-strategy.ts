import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import {
	getApiBaseUrl,
	ApiError,
	type ApiResponse,
	type MutationMeta,
} from "@/service/index";
import type { Strategy } from "@/types/strategy";
import { strategyKeys } from "./query-keys";

const API_VERSION = "api/v1";
const ROUTER = "strategy";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Update strategy request parameters
 */
export interface UpdateStrategyRequest {
	strategyId: number;
	name: string;
	description: string;
	tradeMode: Strategy["tradeMode"];
	nodes: Strategy["nodes"];
	edges: Strategy["edges"];
}

// ============================================
// 2. Data Transform Functions
// ============================================

/**
 * Transform backend raw data to Strategy type
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
 * Transform camelCase to snake_case (to match backend API format)
 */
function transformRequestBody(
	params: Omit<UpdateStrategyRequest, "strategyId">,
): Record<string, unknown> {
	const body: Record<string, unknown> = {};

	if (params.name !== undefined) body.name = params.name.trim();
	if (params.description !== undefined)
		body.description = params.description.trim();
	if (params.tradeMode !== undefined) body.trade_mode = params.tradeMode;
	if (params.nodes !== undefined) body.nodes = params.nodes;
	if (params.edges !== undefined) body.edges = params.edges;

	return body;
}

// ============================================
// 3. API Call Functions (Pure Data Interaction)
// ============================================

/**
 * Update strategy API call (without UI logic)
 *
 * ✅ Uses complete strategy data returned from backend, no secondary request needed
 *
 * @param params Update parameters
 * @returns Updated strategy object
 */
export async function updateStrategyApi(
	params: UpdateStrategyRequest,
): Promise<Strategy> {
	const { strategyId, ...updateData } = params;

	// Step 1: Construct request body (explicit construction for easier debugging)
	const requestBody = transformRequestBody(updateData);

	// Step 2: Log request (development environment)
	if (import.meta.env.DEV) {
		console.log("[update strategy] strategyId:", strategyId);
		console.log("[update strategy] params:", requestBody);
	}

	try {
		// Step 3: Send POST request
		const response = await axios.post<ApiResponse<Record<string, unknown>>>(
			`${getApiUrl()}/${strategyId}`,
			requestBody,
			{
				headers: {
					"Content-Type": "application/json",
				},
				timeout: 10000, // 10s timeout
			},
		);

		// Step 4: Response status check
		if (response.status !== 200) {
			throw new Error(`HTTP Status: ${response.status}`);
		}

		// Step 5: Business status check (using type guard)
		const apiResponse = response.data;
		if (!apiResponse.success) {
			// Error response
			throw new ApiError(
				apiResponse.message,
				apiResponse.errorCode,
				apiResponse.errorCodeChain,
			);
		}

		// Success response - directly use data returned from backend
		const { data } = apiResponse;

		// Step 6: Log response (development environment)
		if (import.meta.env.DEV) {
			console.log("[update strategy] response data:", data);
		}

		// Step 7: Transform backend data to Strategy type
		const strategy = transformToStrategy(data);

		return strategy;
	} catch (error) {
		// Unified error handling
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<ApiResponse<unknown>>;
			const responseData = axiosError.response?.data;

			// Check if it's a standard error response from backend
			let message = axiosError.message || "network request failed";
			let errorCode: string | undefined;
			let errorCodeChain: string[] | undefined;

			if (responseData && !responseData.success) {
				// Use error message from backend
				message = responseData.message;
				errorCode = responseData.errorCode;
				errorCodeChain = responseData.errorCodeChain;
			}

			throw new ApiError(message, errorCode, errorCodeChain);
		}

		// Other errors
		throw error;
	}
}

// ============================================
// 4. TanStack Query Hook
// ============================================

/**
 * Mutation options (optional configuration)
 */
export interface UseUpdateStrategyOptions {
	/**
	 * Metadata configuration (for controlling global toast behavior)
	 * Uses standard MutationMeta interface
	 */
	meta?: MutationMeta;
	/**
	 * Success callback
	 */
	onSuccess?: (strategy: Strategy) => void;
	/**
	 * Error callback
	 */
	onError?: (error: Error) => void;
	/**
	 * Settled callback (executed regardless of success or failure)
	 */
	onSettled?: () => void;
}

/**
 * React Query Hook for updating strategy
 */
export function useUpdateStrategy(options?: UseUpdateStrategyOptions) {
	const queryClient = useQueryClient();

	const { meta, onSuccess, onError, onSettled } = options || {};

	return useMutation({
		// Mutation function
		mutationFn: (params: UpdateStrategyRequest) => updateStrategyApi(params),

		// ✅ Pass toast configuration to global MutationCache via meta
		meta: {
			successMessage: meta?.successMessage,
			showSuccessToast: meta?.showSuccessToast,
			errorMessage: meta?.errorMessage,
			showErrorToast: meta?.showErrorToast,
		},

		// Success callback (only handles data and cache, not toast)
		onSuccess: (strategy) => {
			// 1. Invalidate strategy list cache to trigger refetch
			queryClient.invalidateQueries({
				queryKey: strategyKeys.lists(),
			});

			// 2. Update single strategy detail cache (directly use returned data)
			queryClient.setQueryData(strategyKeys.detail(strategy.id), strategy);

			// 3. Execute user-defined success callback
			onSuccess?.(strategy);

			// 4. Development environment log
			if (import.meta.env.DEV) {
				console.log("[update strategy] success:", strategy);
			}
		},

		// Error callback (only handles business logic, not toast)
		onError: (error: Error) => {
			// Execute user-defined error callback
			onError?.(error);

			// Development environment log (detailed error already logged in global MutationCache)
			if (import.meta.env.DEV) {
				console.error("[update strategy] error:", error);
			}
		},

		// Settled callback (executed regardless of success or failure)
		onSettled: () => {
			onSettled?.();
		},
	});
}
