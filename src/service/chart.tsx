import axios from "axios";
import { API_BASE_URL } from "./index";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";
const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

// 获取初始化图表数据
export async function getInitialChartData(
	strategyId: number,
	keyStr: string,
	index: number | null,
	limit: number | null,
): Promise<[]> {
	try {
		const params = new URLSearchParams();
		params.append("key", keyStr);
		if (index !== null) {
			params.append("play_index", index.toString());
		}
		if (limit !== null) {
			params.append("limit", limit.toString());
		}
		const url = `${API_URL}/${strategyId}/data?${params.toString()}`;
		const response = await axios.get(url);

		if (response.status !== 200) {
			throw new Error(`获取数据失败: ${response.status}`);
		}

		const data = response.data;
		if (data.success) {
			return data.data;
		}
		return [];
	} catch (error) {
		console.error("获取数据错误:", error);
		// 错误回调
		return [];
	}
}
