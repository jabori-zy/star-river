import axios from "axios";
import { getApiBaseUrl } from "@/service";
import type { ExchangeStatus } from "@/types/market";

const ROUTER = "exchange";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

export async function getExchangeStatus(
	accountId: number,
): Promise<ExchangeStatus> {
	try {
		const response = await axios.get(`${getApiUrl()}/status/${accountId}`);
		return response.data.data as ExchangeStatus;
	} catch (error) {
		console.error("getExchangeStatus error:", error);
		throw error;
	}
}

export async function connectExchange(accountId: number): Promise<void> {
	try {
		const response = await axios.post(`${getApiUrl()}/connect/${accountId}`);
		console.log("connectExchange response:", response.data.data);
		return response.data.data as void;
	} catch (error) {
		console.error("connectExchange error:", error);
		throw error;
	}
}
