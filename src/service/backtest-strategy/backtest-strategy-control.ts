import axios from "axios";
import { API_BASE_URL } from "@/service";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

// /api/v1/strategy/backtest/{strategy_id}/play-one

export async function playOne(strategyId: number) {
	try {
		const response = await axios.post(`${API_URL}/${strategyId}/play-one`);
		if (response.status !== 200) {
			throw new Error(`playOne error: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("playOne error:", error);
		throw error;
	}
}

export async function play(strategyId: number) {
	try {
		console.log("play", strategyId);
		const response = await axios.post(`${API_URL}/${strategyId}/play`);
		if (response.status !== 200) {
			throw new Error(`play error: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("play error:", error);
		throw error;
	}
}

export async function pause(strategyId: number) {
	try {
		const response = await axios.post(`${API_URL}/${strategyId}/pause`);
		if (response.status !== 200) {
			throw new Error(`pause error: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("pause error:", error);
		throw error;
	}
}

export async function stop(strategyId: number) {
	try {
		const response = await axios.post(`${API_URL}/${strategyId}/reset`);
		if (response.status !== 200) {
			throw new Error(`reset error: ${response.status}`);
		}
		return response.data.data;
	} catch (error) {
		console.error("reset error:", error);
		throw error;
	}
}

export async function get_play_index(strategyId: number) {
	try {
		const response = await axios.get(`${API_URL}/${strategyId}/play-index`);
		if (response.status !== 200) {
			throw new Error(`get_play_index error: ${response.status}`);
		}
		return response.data.data.play_index;
	} catch (error) {
		console.error("get_play_index error:", error);
		throw error;
	}
}


