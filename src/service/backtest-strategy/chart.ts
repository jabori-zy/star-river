import axios from "axios";
import type { Kline } from "@/types/kline";
import { getApiBaseUrl } from "../index";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

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
		const url = `${getApiUrl()}/${strategyId}/data?${params.toString()}`;
		// console.log("获取数据参数: ", decodeURIComponent(params.toString().replace(/\+/g, ' ')));
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

export async function getPartialChartData(
	strategyId: number,
	datetimeStr: string,
	limit: number,
	keyStr: string,
): Promise<Kline[]> {
	try {
		const params = new URLSearchParams();
		params.append("datetime", datetimeStr);
		params.append("limit", limit.toString());
		params.append("key", keyStr);
		const url = `${getApiUrl()}/${strategyId}/data-by-datetime?${params.toString()}`;
		const response = await axios.get(url);
		if (response.status !== 200) {
			throw new Error(`获取数据失败: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("获取数据错误:", error);
		return [];
	}
}
