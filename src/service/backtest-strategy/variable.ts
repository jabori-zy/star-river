import axios from "axios";
import { API_BASE_URL } from "@/service";
import type { StrategyVariable } from "@/types/variable";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getStrategyVariables(strategyId: number): Promise<StrategyVariable[]> {
	try {
		const response = await axios.get(`${API_URL}/${strategyId}/variable`);
		if (response.status !== 200) {
			throw new Error(`getStrategyVariables error: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("getStrategyVariables error:", error);
		throw error;
	}
}
