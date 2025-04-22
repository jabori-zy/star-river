import { useEffect, useState } from "react";

export interface AccountConfig {
    id: number;
    account_name: string;
    exchange: string;
    is_available: boolean;
    login: number;
    password: string;
    server: string;
    terminal_path: string;
    sort_index: number;
    created_time: string;
    updated_time: string;
}

// 定义SSE事件类型
export interface MT5AccountInfo {
    channel: string;
    event_name: string;
    account_id: number;
    login: number;
    trade_mode: string;
    leverage: number;
    limit_orders: number;
    margin_stopout_mode: string;
    trade_allowed: boolean;
    dlls_allowed: boolean;
    terminal_connected: boolean;
    trade_expert: boolean;
    margin_mode: string;
    currency_digits: number;
    fifo_close: boolean;
    balance: number;
    credit: number;
    profit: number;
    equity: number;
    margin: number;
    margin_free: number;
    margin_level: number;
    margin_so_call: number;
    margin_so_so: number;
    margin_initial: number;
    margin_maintenance: number;
    assets: number;
    liabilities: number;
    commission_blocked: number;
    name: string;
    server: string;
    currency: string;
    company: string;
}

export interface AccountEvent {
    channel: string;
    event_name: string;
    account_config: AccountConfig;
    account_info: MT5AccountInfo | null;
    exchange_status: string;
}

const useAccountSSE = () => {
    const [accountEventData, setAccountEventData] = useState<AccountEvent | null>(null);

    useEffect(() => {
        const sse = new EventSource("http://localhost:3100/account_sse");
        
        sse.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setAccountEventData(data);
                // console.log("SSE接收到数据:", data);
            } catch (error) {
                console.error("SSE数据解析错误:", error);
            }
        };
        
        sse.onerror = (error) => {
            console.error('SSE错误:', error);
            sse.close();
            // 可以添加重连逻辑
            setTimeout(() => {
                console.log("尝试重新连接SSE...");
                // 此处可以重新创建EventSource实例
            }, 5000);
        };

        return () => {
            sse.close();
        };
    }, []);

    return accountEventData;
}

export default useAccountSSE;
