import axios from "axios";
import { API_BASE_URL } from "@/service";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getStrategyStatus(strategyId: number) {
	try {
		const response = await axios.get(`${API_URL}/${strategyId}/status`);
		if (response.status !== 200) {
			throw new Error(`getStrategyStatus error: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("getStrategyStatus error:", error);
		throw error;
	}
}
