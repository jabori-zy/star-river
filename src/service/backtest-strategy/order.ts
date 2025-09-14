import axios from "axios";
import { API_BASE_URL } from "@/service";
import type { VirtualPosition } from "@/types/position/virtual-position";
import type { VirtualOrder } from "@/types/order/virtual-order";
import type { VirtualTransaction } from "@/types/transaction/virtual-transaction";

const ROUTER = "strategy/backtest";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

export async function getVirtualOrder(strateygId: number) : Promise<VirtualOrder[]> {
    try {
        const response = await axios.get(`${API_URL}/${strateygId}/virtual-orders`);
        if (response.status !== 200) {
            throw new Error(`获取虚拟订单失败: ${response.status}`);
        }
        
        
        return response.data.data as VirtualOrder[]
        
    } catch (error) {
        console.error("getVirtualOrder error", error);
        throw error;
    }

}

export async function getVirtualPosition(strateygId: number) : Promise<VirtualPosition[]> {
    try {
        const response = await axios.get(`${API_URL}/${strateygId}/current-positions`);
        if (response.status !== 200) {
            throw new Error(`获取虚拟持仓失败: ${response.status}`);
        }
        return response.data.data as VirtualPosition[]
    } catch (error) {
        console.error("getVirtualPosition error", error);
        throw error;
    }

}


export async function getHisotryVirtualPosition(strateygId: number) : Promise<VirtualPosition[]> {
    try {
        const response = await axios.get(`${API_URL}/${strateygId}/history-positions`);
        if (response.status !== 200) {
            throw new Error(`获取虚拟持仓历史失败: ${response.status}`);
        }
        return response.data.data as VirtualPosition[]
        
    }
    catch (error) {
        console.error("getHisotryVirtualPosition error", error);
        throw error;
    }
}

export async function getVirtualTransaction(strateygId: number) : Promise<VirtualTransaction[]> {
    try {
        const response = await axios.get(`${API_URL}/${strateygId}/virtual-transactions`);
        if (response.status !== 200) {
            throw new Error(`获取虚拟交易明细失败: ${response.status}`);
        }
        return response.data.data as VirtualTransaction[]
    } catch (error) {
        console.error("getVirtualTransaction error", error);
        throw error;
    }
}

