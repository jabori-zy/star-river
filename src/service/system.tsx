import axios from "axios";
import type { SystemConfig } from "@/types/system";
import { getApiBaseUrl } from ".";

const ROUTER = "system";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

export async function getSystemConfig(): Promise<SystemConfig> {
	try {
		const response = await axios.get(`${getApiUrl()}/config`);
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
		const response = await axios.put(`${getApiUrl()}/config`, systemConfig);
		return response.data.data as SystemConfig;
	} catch (error) {
		console.error("更新系统配置错误:", error);
		throw error;
	}
}

export async function getTimezones(): Promise<string[]> {
	try {
		const response = await axios.get(`${getApiUrl()}/timezones`);
		return response.data.data as string[];
	} catch (error) {
		console.error("获取时区错误:", error);
		throw error;
	}
}
