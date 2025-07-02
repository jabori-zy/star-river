import axios from "axios";
import { API_BASE_URL } from "@/service";


const ROUTER = "strategy/backtest"
const API_VERSION = "api/v1"

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`





// /api/v1/strategy/backtest/{strategy_id}/play-one


export async function playOne(strategyId: number) {
    try {
        const response = await axios.post(`${API_URL}/${strategyId}/play-one`);
        if (response.status !== 200) {
            throw new Error(`playOne error: ${response.status}`);
        }
        return response.data["data"];
    } catch (error) {
        console.error('playOne error:', error);
        throw error;
    }
}