import axios from "axios";
import { API_BASE_URL } from "@/service";
import type { ExchangeStatus } from "@/types/market";

const ROUTER = "exchange";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getExchangeStatus(
	accountId: number,
): Promise<ExchangeStatus> {
	try {
		const response = await axios.get(`${API_URL}/status/${accountId}`);
		return response.data.data as ExchangeStatus;
	} catch (error) {
		console.error("getExchangeStatus error:", error);
		throw error;
	}
}

export async function connectExchange(accountId: number): Promise<void> {
	try {
		const response = await axios.post(`${API_URL}/connect/${accountId}`);
		console.log("connectExchange response:", response.data.data);
		return response.data.data as void;
	} catch (error) {
		console.error("connectExchange error:", error);
		throw error;
	}
}
