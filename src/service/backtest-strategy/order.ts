import axios from "axios";
import { getApiBaseUrl } from "@/service";
import type { VirtualOrder } from "@/types/order/virtual-order";
import type { VirtualPosition } from "@/types/position/virtual-position";
import type { VirtualTransaction } from "@/types/transaction/virtual-transaction";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

export async function getVirtualOrder(
	strateygId: number,
): Promise<VirtualOrder[]> {
	try {
		const response = await axios.get(`${getApiUrl()}/${strateygId}/virtual-orders`);
		if (response.status !== 200) {
			throw new Error(`Failed to fetch virtual orders: ${response.status}`);
		}

		return response.data.data as VirtualOrder[];
	} catch (error) {
		console.error("getVirtualOrder error", error);
		throw error;
	}
}

export async function getVirtualPosition(
	strateygId: number,
): Promise<VirtualPosition[]> {
	try {
		const response = await axios.get(
			`${getApiUrl()}/${strateygId}/current-positions`,
		);
		if (response.status !== 200) {
			throw new Error(`Failed to fetch virtual positions: ${response.status}`);
		}
		return response.data.data as VirtualPosition[];
	} catch (error) {
		console.error("getVirtualPosition error", error);
		throw error;
	}
}

export async function getHisotryVirtualPosition(
	strateygId: number,
): Promise<VirtualPosition[]> {
	try {
		const response = await axios.get(
			`${getApiUrl()}/${strateygId}/history-positions`,
		);
		if (response.status !== 200) {
			throw new Error(`Failed to fetch virtual position history: ${response.status}`);
		}
		return response.data.data as VirtualPosition[];
	} catch (error) {
		console.error("getHisotryVirtualPosition error", error);
		throw error;
	}
}

export async function getVirtualTransaction(
	strateygId: number,
): Promise<VirtualTransaction[]> {
	try {
		const response = await axios.get(
			`${getApiUrl()}/${strateygId}/virtual-transactions`,
		);
		if (response.status !== 200) {
			throw new Error(`Failed to fetch virtual transaction details: ${response.status}`);
		}
		return response.data.data as VirtualTransaction[];
	} catch (error) {
		console.error("getVirtualTransaction error", error);
		throw error;
	}
}
