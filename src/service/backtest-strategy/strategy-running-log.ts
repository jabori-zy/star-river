import axios from "axios";
import { API_BASE_URL } from "@/service";
import type { StrategyRunningLogEvent } from "@/types/strategy-event/strategy-running-log-event";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getStrategyRunningLog(
	strategyId: number,
): Promise<StrategyRunningLogEvent[]> {
	try {
		const response = await axios.get(`${API_URL}/${strategyId}/running-log`);
		if (response.status !== 200) {
			throw new Error(`获取策略运行日志失败: ${response.status}`);
		}

		return response.data.data as StrategyRunningLogEvent[];
	} catch (error) {
		console.error("getStrategyRunningLog error", error);
		throw error;
	}
}
