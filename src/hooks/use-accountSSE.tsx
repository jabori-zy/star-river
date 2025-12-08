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

// Define SSE event type
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
				// console.log("SSE received data:", data);
			} catch (error) {
				console.error("SSE data parsing error:", error);
			}
		};

		sse.onerror = (error) => {
			console.error("SSE error:", error);
			sse.close();
			// Reconnection logic can be added
			setTimeout(() => {
				console.log("Attempting to reconnect to SSE...");
				// EventSource instance can be recreated here
			}, 5000);
		};

		return () => {
			sse.close();
		};
	}, []);

	return accountEventData;
};

export default useAccountSSE;
