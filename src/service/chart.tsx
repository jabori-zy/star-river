import axios from "axios";
import { API_BASE_URL } from "./index";

const ROUTER = "cache";
const API_VERSION = "api/v1";
const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

// 获取初始化图表数据
export async function getInitialChartData(
	keyStr: string,
	index: number | null,
	limit: number | null,
): Promise<[]> {
	try {
		const params = new URLSearchParams();
		params.append("key", keyStr);
		if (index !== null) {
			params.append("index", index.toString());
		}
		if (limit !== null) {
			params.append("limit", limit.toString());
		}
		console.log("params: ", params.toString());
		const response = await axios.get(`${API_URL}/value?${params.toString()}`);

		if (response.status !== 200) {
			throw new Error(`获取数据失败: ${response.status}`);
		}

		const data = response.data;
		if (data["code"] === 0) {
			return data["data"];
		}
		return [];
	} catch (error) {
		console.error("获取数据错误:", error);
		// 错误回调
		return [];
	}
}
