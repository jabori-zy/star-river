import axios from "axios";
import { getApiBaseUrl } from "@/service";
import type { StrategyStats } from "@/types/statistics";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

export async function getStrategyStatsHistory(
	strategyId: number,
	datetime: string,
): Promise<StrategyStats[]> {
	try {
		console.log("getStrategyStatsHistory params", strategyId, datetime);

		// Use URLSearchParams to correctly encode datetime parameter
		const queryParams = new URLSearchParams();
		queryParams.append("datetime", datetime);

		const response = await axios.get(
			`${getApiUrl()}/${strategyId}/stats-history?${queryParams.toString()}`,
		);
		if (response.status !== 200) {
			throw new Error(`Failed to fetch strategy stats history: ${response.status}`);
		}

		return response.data.data as StrategyStats[];
	} catch (error) {
		console.error("getStrategyStatsHistory error", error);
		throw error;
	}
}
