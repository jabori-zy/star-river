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

export interface MT5AccountInfo {
	account_id: number;
	assets: number;
	balance: number;
	commission_blocked: number;
	company: string;
	credit: number;
	currency: string;
	currency_digits: number;
	dlls_allowed: boolean;
	equity: number;
	fifo_close: boolean;
	leverage: number;
	liabilities: number;
	limit_orders: number;
	login: number;
	margin: number;
	margin_free: number;
	margin_initial: number;
	margin_level: number;
	margin_maintenance: number;
	margin_mode: string;
	margin_so_call: number;
	margin_so_so: number;
	margin_stopout_mode: string;
	name: string;
	profit: number;
	server: string;
	terminal_connected: boolean;
	trade_allowed: boolean;
	trade_expert: boolean;
	trade_mode: string;
}

// 定义SSE事件类型
export interface AccountInfo {
	id: number;
	account_id: number;
	info: MT5AccountInfo;
	create_time: string;
	update_time: string;
}

export interface AccountEvent {
	channel: string;
	event_name: string;
	account_config: AccountConfig;
	account_info: AccountInfo | null;
	exchange_status: string;
}

const useAccountSSE = () => {
	const [accountEventData, setAccountEventData] = useState<AccountEvent | null>(
		null,
	);

	useEffect(() => {
		const sse = new EventSource("http://localhost:3100/api/v1/sse/account");

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
			console.error("SSE错误:", error);
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
};

export default useAccountSSE;
