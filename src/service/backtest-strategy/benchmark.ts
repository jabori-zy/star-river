import axios from "axios"
import { API_BASE_URL } from "@/service"
import type { StrategyPerformanceReport } from "@/types/strategy/strategy-benchmark"

const ROUTER = "strategy/backtest"
const API_VERSION = "api/v1"

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`

/**
 * Get strategy performance report
 * @param strategyId Strategy ID
 * @returns Strategy performance report
 */
export async function getStrategyPerformanceReport(
	strategyId: number,
): Promise<StrategyPerformanceReport> {
	try {
		const response = await axios.get(`${API_URL}/${strategyId}/performance-report`)
		if (response.status !== 200) {
			throw new Error(`getStrategyPerformanceReport error: ${response.status}`)
		}
		return response.data.data
	} catch (error) {
		console.error("getStrategyPerformanceReport error:", error)
		throw error
	}
}
