import axios from "axios";
import { getApiBaseUrl } from "@/service";
import type { StrategyPerformanceReport } from "@/types/strategy/strategy-benchmark";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

/**
 * Get strategy performance report
 * @param strategyId Strategy ID
 * @returns Strategy performance report
 */
export async function getStrategyPerformanceReport(
	strategyId: number,
): Promise<StrategyPerformanceReport> {
	try {
		const response = await axios.get(
			`${getApiUrl()}/${strategyId}/performance-report`,
		);
		if (response.status !== 200) {
			throw new Error(`getStrategyPerformanceReport error: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("getStrategyPerformanceReport error:", error);
		throw error;
	}
}
