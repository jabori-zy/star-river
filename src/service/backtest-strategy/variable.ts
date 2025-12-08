import axios from "axios";
import { getApiBaseUrl } from "@/service";
import type { StrategyVariable } from "@/types/variable";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

export async function getStrategyVariables(
	strategyId: number,
): Promise<StrategyVariable[]> {
	try {
		const response = await axios.get(`${getApiUrl()}/${strategyId}/variable`);
		if (response.status !== 200) {
			throw new Error(`getStrategyVariables error: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("getStrategyVariables error:", error);
		throw error;
	}
}
