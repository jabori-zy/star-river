import axios from "axios";
import { MT5Account, Account } from "../types/account";

const API_BASE_URL = "http://localhost:3100";
const ROUTER = "account";
const API_VERSION = "api/v1";

const API_URL = `${API_BASE_URL}/${API_VERSION}/${ROUTER}`;

// 根据交易所，获取账户配置数据
export async function getAccountConfigs(
	exchange: string | null,
): Promise<MT5Account[]> {
	// 根据交易所，映射账户配置数据
	if (exchange === "metatrader5") {
		try {
			const response = await axios.get(
				`${API_URL}/config?exchange=${exchange}`,
			);
			const accountConfigs = response.data.data || [];
			const mt5Accounts: MT5Account[] = [];
			accountConfigs.forEach(
				(item: {
					id: number;
					account_name: string;
					exchange: string;
					config: {
						login: number;
						server: string;
						terminal_path: string;
					};
					leverage: number;
					balance: number;
					equity: number;
					margin: number;
					terminal_status: string;
					ea_status: string;
					is_available: boolean;
					creat_time: string;
					updat_time: string;
				}) => {
					console.log("获取到的MT5账户配置:", item);
					mt5Accounts.push({
						id: item.id,
						accountName: item.account_name,
						exchange: item.exchange,
						login: item.config.login,
						server: item.config.server,
						terminalPath: item.config.terminal_path,
						leverage: item.leverage,
						balance: item.balance,
						equity: item.equity,
						margin: item.margin,
						terminalStatus: item.terminal_status,
						eaStatus: item.ea_status,
						isAvailable: item.is_available,
						creatTime: item.creat_time,
						updatedTime: item.updat_time,
					});
				},
			);

			console.log("获取到的MT5账户配置:", mt5Accounts);
			return mt5Accounts;
		} catch (error) {
			console.error("获取MT5账户数据失败:", error);
			return [];
		}
	}

	// 默认返回空数组
	return [];
}

// 启动MT5终端
export async function startMt5Terminal(accountId: number) {
	const requestBody = {
		account_id: accountId,
	};
	try {
		const { data } = await axios.post(
			`${API_URL}/start_mt5_terminal`,
			requestBody,
		);
		return data;
	} catch (error) {
		console.error("启动MT5终端失败:", error);
		return {
			success: false,
			message: "启动MT5终端失败",
		};
	}
}

// 添加账户配置
export async function addAccountConfig(
	account_name: string,
	exchange: string,
	accountConfig: any,
) {
	try {
		const requestBody = {
			account_name: account_name,
			exchange: exchange,
			account_config: accountConfig,
		};
		const { data } = await axios.post(`${API_URL}/config`, requestBody);
		// console.log("添加账户配置成功:", data)
		return data;
	} catch (error) {
		console.error("添加账户配置失败:", error);
	}
}

// 删除账户配置
export async function deleteAccountConfig(accountId: number) {
	try {
		const { data } = await axios.delete(`${API_URL}/config/${accountId}`);
		return data;
	} catch (error) {
		console.error("删除账户配置失败:", error);
		return {
			success: false,
			message: "删除账户配置失败",
		};
	}
}
