import axios from "axios";
import type {
	Account,
	BinanceAccount,
	MT5Account,
	OKXAccount,
} from "../types/account";
import { getApiBaseUrl } from "./index";

const ROUTER = "account";
const API_VERSION = "api/v1";

const getApiUrl = () => `${getApiBaseUrl()}/${API_VERSION}/${ROUTER}`;

// MT5账户数据转换
function transformMT5Account(item: any): MT5Account {
	return {
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
	};
}

// Binance账户数据转换
function transformBinanceAccount(item: any): BinanceAccount {
	return {
		id: item.id,
		accountName: item.account_name,
		exchange: item.exchange,
		apiKey: item.config.apiKey,
		secretKey: item.config.secretKey,
		permissions: item.config.permissions || [],
		balanceUSDT: item.balance_usdt,
		tradingAllowed: item.trading_allowed,
		isAvailable: item.is_available,
		creatTime: item.creat_time,
		updatedTime: item.updat_time,
	};
}

// OKX账户数据转换
// function transformOKXAccount(item: any): OKXAccount {
// 	return {
// 		id: item.id,
// 		accountName: item.account_name,
// 		exchange: item.exchange,
// 		apiKey: item.config.apiKey,
// 		secretKey: item.config.secret_key,
// 		passphrase: item.config.passphrase,
// 		accountId: item.config.account_id,
// 		apiVersion: item.config.api_version,
// 		marginMode: item.margin_mode,
// 		totalAssets: item.total_assets,
// 		availableBalance: item.available_balance,
// 		isAvailable: item.is_available,
// 		createTime: item.creat_time,
// 		updateTime: item.updat_time,
// 	};
// }

// 根据交易所，获取账户配置数据
export async function getAccountConfigs(
	exchange: string | null,
): Promise<MT5Account[] | BinanceAccount[] | OKXAccount[] | Account[]> {
	try {
		// 获取接口数据 - 如果exchange为null，则获取所有配置
		const API_URL = getApiUrl();
		const url = exchange
			? `${API_URL}/config?exchange=${exchange}`
			: `${API_URL}/config`;

		const response = await axios.get(url);
		const accountConfigs = response.data.data || [];

		// 如果没有指定交易所，返回Account类型的所有配置（包含特有字段）
		if (!exchange) {
			const allAccounts: Account[] = accountConfigs.map((item: any) => {
				// 根据exchange字段判断类型并转换
				switch (item.exchange) {
					case "metatrader5":
						return transformMT5Account(item);
					case "binance":
						return transformBinanceAccount(item);
					// case "okx":
					// 	return transformOKXAccount(item);
					default:
						// 未知类型，返回基础账户信息
						return {
							id: item.id,
							accountName: item.account_name,
							exchange: item.exchange,
							isAvailable: item.is_available,
							creatTime: item.creat_time,
							updatedTime: item.updat_time,
						} as Account;
				}
			});
			console.log("获取到的所有账户配置:", allAccounts);
			return allAccounts;
		}

		// 根据不同的交易所类型进行转换
		switch (exchange) {
			case "metatrader5": {
				const mt5Accounts = accountConfigs.map(transformMT5Account);
				console.log("获取到的MT5账户配置:", mt5Accounts);
				return mt5Accounts;
			}

			case "binance": {
				const binanceAccounts = accountConfigs.map(transformBinanceAccount);
				console.log("获取到的Binance账户配置:", binanceAccounts);
				return binanceAccounts;
			}

			// case "okx":
			// 	const okxAccounts = accountConfigs.map(transformOKXAccount);
			// 	console.log("获取到的OKX账户配置:", okxAccounts);
			// 	return okxAccounts;

			default:
				console.warn(`未知的交易所类型: ${exchange}`);
				return [];
		}
	} catch (error) {
		console.error(`获取${exchange || "所有"}账户数据失败:`, error);
		return [];
	}
}

// 启动MT5终端
export async function startMt5Terminal(accountId: number) {
	const requestBody = {
		account_id: accountId,
	};
	try {
		const { data } = await axios.post(
			`${getApiUrl()}/start_mt5_terminal`,
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
	accountConfig: object,
) {
	try {
		const requestBody = {
			account_name: account_name,
			exchange: exchange,
			account_config: accountConfig,
		};
		console.log("添加账户配置请求体:", requestBody);
		const { data } = await axios.post(`${getApiUrl()}/config`, requestBody);
		// console.log("添加账户配置成功:", data)
		return data;
	} catch (error) {
		console.error("添加账户配置失败:", error);
	}
}

// 删除账户配置
export async function deleteAccountConfig(accountId: number) {
	try {
		const { data } = await axios.delete(`${getApiUrl()}/config/${accountId}`);
		return data;
	} catch (error) {
		console.error("删除账户配置失败:", error);
		return {
			success: false,
			message: "删除账户配置失败",
		};
	}
}
