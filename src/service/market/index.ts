import axios from "axios";
import { API_BASE_URL } from "@/service";
import type { Instrument } from "@/types/market";

const ROUTER = "market";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getSymbolList(
	accountId: number,
): Promise<Instrument[]> {
	try {
		const response = await axios.get(`${API_URL}/symbol_list/${accountId}`);
		return response.data.data as Instrument[];
	} catch (error) {
		console.error("getSymbolList error:", error);
		throw error;
	}
}

export async function getSupportKlineInterval(
	accountId: number,
): Promise<string[]> {
	try {
		const response = await axios.get(
			`${API_URL}/support_kline_intervals/${accountId}`,
		);
		return response.data.data as string[];
	} catch (error) {
		console.error("getSupportKlineInterval error:", error);
		throw error;
	}
}

export async function getSymbolInfo(
	accountId: number,
	symbol: string,
): Promise<Instrument> {
	try {
		const response = await axios.get(
			`${API_URL}/symbol/${accountId}?symbol=${symbol}`,
		);
		return response.data.data as Instrument;
	} catch (error) {
		console.error("getSymbolInfo error:", error);
		throw error;
	}
}
