import axios from "axios";
import type { SystemConfig } from "@/types/system";
import { API_BASE_URL } from ".";

const ROUTER = "system";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getSystemConfig(): Promise<SystemConfig> {
	try {
		const response = await axios.get(`${API_URL}/config`);
		return response.data.data as SystemConfig;
	} catch (error) {
		console.error("获取系统配置错误:", error);
		throw error;
	}
}

export async function updateSystemConfig(
	systemConfig: SystemConfig,
): Promise<SystemConfig> {
	try {
		const response = await axios.put(`${API_URL}/config`, systemConfig);
		return response.data.data as SystemConfig;
	} catch (error) {
		console.error("更新系统配置错误:", error);
		throw error;
	}
}


export async function getTimezones(): Promise<string[]> {
	try {
		const response = await axios.get(`${API_URL}/timezones`);
		return response.data.data as string[];
	} catch (error) {
		console.error("获取时区错误:", error);
		throw error;
	}
}
