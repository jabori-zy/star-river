import axios from "axios";
import { API_BASE_URL } from "@/service";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getVirtualOrder(strateygId: number) {
    try {
        const response = await axios.get(`${API_URL}/${strateygId}/virtual-orders`);
        if (response.status !== 200) {
            throw new Error(`获取虚拟订单失败: ${response.status}`);
        }
        return response.data.data;
    } catch (error) {
        console.error("getVirtualOrder error", error);
        throw error;
    }

}

export async function getVirtualPosition(strateygId: number) {
    try {
        const response = await axios.get(`${API_URL}/${strateygId}/current-positions`);
        if (response.status !== 200) {
            throw new Error(`获取虚拟持仓失败: ${response.status}`);
        }
        return response.data.data;
    } catch (error) {
        console.error("getVirtualPosition error", error);
        throw error;
    }

}

export async function getVirtualTransaction(strateygId: number) {
    try {
        const response = await axios.get(`${API_URL}/${strateygId}/virtual-transactions`);
        if (response.status !== 200) {
            throw new Error(`获取虚拟交易明细失败: ${response.status}`);
        }
        return response.data.data;
    } catch (error) {
        console.error("getVirtualTransaction error", error);
        throw error;
    }
}