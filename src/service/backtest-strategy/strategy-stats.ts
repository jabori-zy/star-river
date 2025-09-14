import axios from "axios";
import { API_BASE_URL } from "@/service";
import type { StrategyStats } from "@/types/statistics";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getStrategyStatsHistory(strategyId: number, playIndex: number): Promise<StrategyStats[]> {
    try {
        const response = await axios.get(`${API_URL}/${strategyId}/stats-history?play_index=${playIndex}`);
        if (response.status !== 200) {
            throw new Error(`获取策略统计历史失败: ${response.status}`);
        }
        
        // 转换datetime字符串为Date对象
        return response.data.data as StrategyStats[]
        
        
    } catch (error) {
        console.error("getStrategyStatsHistory error", error);
        throw error;
    }
}