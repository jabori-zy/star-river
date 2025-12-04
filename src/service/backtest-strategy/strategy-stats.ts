import axios from "axios";
import { API_BASE_URL } from "@/service";
import type { StrategyStats } from "@/types/statistics";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getStrategyStatsHistory(
	strategyId: number,
	datetime: string,
): Promise<StrategyStats[]> {
	try {
		console.log("getStrategyStatsHistory params", strategyId, datetime);

		// 使用 URLSearchParams 正确编码 datetime 参数
		const queryParams = new URLSearchParams();
		queryParams.append("datetime", datetime);

		const response = await axios.get(
			`${API_URL}/${strategyId}/stats-history?${queryParams.toString()}`,
		);
		if (response.status !== 200) {
			throw new Error(`获取策略统计历史失败: ${response.status}`);
		}

		return response.data.data as StrategyStats[];
	} catch (error) {
		console.error("getStrategyStatsHistory error", error);
		throw error;
	}
}
