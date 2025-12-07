import axios from "axios";
import type { Kline } from "@/types/kline";
import { getApiBaseUrl } from "../index";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

// Get initial chart data
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
		// console.log("Get data params: ", decodeURIComponent(params.toString().replace(/\+/g, ' ')));
		const response = await axios.get(url);

		if (response.status !== 200) {
			throw new Error(`Failed to fetch data: ${response.status}`);
		}

		const data = response.data;
		if (data.success) {
			return data.data;
		}
		return [];
	} catch (error) {
		console.error("Error fetching data:", error);
		// Error callback
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
			throw new Error(`Failed to fetch data: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("Error fetching data:", error);
		return [];
	}
}
