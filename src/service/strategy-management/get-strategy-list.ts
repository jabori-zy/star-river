import axios, { type AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import type { StrategyInfo } from "@/types/strategy/strategy-list";
import { API_BASE_URL, type ApiResponse, ApiError } from "@/service/index";
import { strategyKeys } from "./query-keys";
const API_VERSION = "api/v1";
const ROUTER = "strategy";
const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

// ============================================
// 1. Type Definitions
// ============================================

/**
 * Request parameters for getting strategy list
 */
export interface GetStrategyListRequest {
	page?: number;
	items_per_page?: number;
}

/**
 * Backend paginated response structure
 */
interface PaginatedResponse {
	data: Record<string, unknown>[];
	total_items: number;
	items_per_page: number;
	current_page: number;
	total_pages: number;
}

/**
 * Strategy list response data
 */
export interface StrategyListResponse {
	data: StrategyInfo[];
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
	totalPages: number;
}

// ============================================
// 2. Data Transform Functions
// ============================================

/**
 * Transform backend raw data to StrategyInfo type
 */
function transformToStrategyInfo(data: Record<string, unknown>): StrategyInfo {
	return {
		id: data.id as number,
		name: data.name as string,
		description: data.description as string,
		status: data.status as StrategyInfo["status"],
		tradeMode: data.tradeMode as string,
		nodeCount: data.nodeCount as number,
		createTime: data.createTime as string,
		updateTime: data.updateTime as string,
	};
}

/**
 * Transform paginated response data
 */
function transformPaginatedResponse(
	data: PaginatedResponse,
): StrategyListResponse {
	return {
		data: data.data.map(transformToStrategyInfo),
		totalItems: data.total_items,
		itemsPerPage: data.items_per_page,
		currentPage: data.current_page,
		totalPages: data.total_pages,
	};
}

// ============================================
// 3. API Call Function (Pure Data Interaction)
// ============================================

/**
 * Get strategy list API call
 *
 * @param params Query parameters
 * @returns Strategy list and pagination info
 */
export async function getStrategyListApi(
	params?: GetStrategyListRequest,
): Promise<StrategyListResponse> {
	// Step 1: Build query parameters
	const queryParams = new URLSearchParams();
	if (params?.page !== undefined) {
		queryParams.append("page", params.page.toString());
	}
	if (params?.items_per_page !== undefined) {
		queryParams.append("items_per_page", params.items_per_page.toString());
	}

	const url = queryParams.toString()
		? `${API_URL}?${queryParams.toString()}`
		: API_URL;

	// Step 2: Log request in dev environment
	if (import.meta.env.DEV) {
		console.log("[get strategy list] params:", params);
	}

	try {
		// Step 3: Send GET request
		const response = await axios.get<ApiResponse<PaginatedResponse>>(url, {
			headers: {
				"Content-Type": "application/json",
			},
			timeout: 10000, // 10s timeout
		});

		// Step 4: Check response status
		if (response.status !== 200) {
			throw new Error(`HTTP Status: ${response.status}`);
		}

		// Step 5: Check business status
		const apiResponse = response.data;
		if (!apiResponse.success) {
			// Error response
			throw new ApiError(
				apiResponse.message,
				apiResponse.errorCode,
				apiResponse.errorCodeChain,
			);
		}

		// Success response
		const { data } = apiResponse;

		// Step 6: Log response in dev environment
		if (import.meta.env.DEV) {
			console.log("[get strategy list] response data:", data);
		}

		// Step 7: Transform data format
		const result = transformPaginatedResponse(data);

		return result;
	} catch (error) {
		// Unified error handling
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<ApiResponse<unknown>>;
			const responseData = axiosError.response?.data;

			// Check if it's a standard error response from backend
			let message = axiosError.message || "network request failed";
			let errorCode: string | undefined = undefined;
			let errorCodeChain: string[] | undefined = undefined;

			if (responseData && !responseData.success) {
				// Use error info from backend
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
 * Query options (optional config)
 */
export interface UseStrategyListOptions {
	/**
	 * Query parameters
	 */
	params?: GetStrategyListRequest;
	/**
	 * Enable query (default: true)
	 */
	enabled?: boolean;
	/**
	 * Time to keep data fresh (milliseconds)
	 */
	staleTime?: number;
	/**
	 * Cache time (milliseconds)
	 */
	gcTime?: number;
}

/**
 * React Query Hook for getting strategy list
 */
export function useStrategyList(options?: UseStrategyListOptions) {
	const { params, enabled = true, staleTime, gcTime } = options || {};

	return useQuery({
		// Query Key
		queryKey: strategyKeys.list({
			page: params?.page,
			perPage: params?.items_per_page,
		}),

		// Query Function
		queryFn: () => getStrategyListApi(params),

		// Config options
		enabled,
		staleTime: staleTime ?? 60 * 1000, // Default 1 minute
		gcTime: gcTime ?? 5 * 60 * 1000, // Default 5 minutes

		// Selector (optional, for data transformation)
		select: (data) => data,
	});
}
