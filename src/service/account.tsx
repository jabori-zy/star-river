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

// MT5 account data transformation
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

// Binance account data transformation
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

// OKX account data transformation
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

// Get account configuration data based on exchange
export async function getAccountConfigs(
	exchange: string | null,
): Promise<MT5Account[] | BinanceAccount[] | OKXAccount[] | Account[]> {
	try {
		// Get API data - if exchange is null, get all configurations
		const API_URL = getApiUrl();
		const url = exchange
			? `${API_URL}/config?exchange=${exchange}`
			: `${API_URL}/config`;

		const response = await axios.get(url);
		const accountConfigs = response.data.data || [];

		// If no exchange specified, return all configurations as Account type (including specific fields)
		if (!exchange) {
			const allAccounts: Account[] = accountConfigs.map((item: any) => {
				// Determine type and transform based on exchange field
				switch (item.exchange) {
					case "metatrader5":
						return transformMT5Account(item);
					case "binance":
						return transformBinanceAccount(item);
					// case "okx":
					// 	return transformOKXAccount(item);
					default:
						// Unknown type, return basic account info
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
			console.log("Retrieved all account configurations:", allAccounts);
			return allAccounts;
		}

		// Transform based on different exchange types
		switch (exchange) {
			case "metatrader5": {
				const mt5Accounts = accountConfigs.map(transformMT5Account);
				console.log("Retrieved MT5 account configurations:", mt5Accounts);
				return mt5Accounts;
			}

			case "binance": {
				const binanceAccounts = accountConfigs.map(transformBinanceAccount);
				console.log("Retrieved Binance account configurations:", binanceAccounts);
				return binanceAccounts;
			}

			// case "okx":
			// 	const okxAccounts = accountConfigs.map(transformOKXAccount);
			// 	console.log("Retrieved OKX account configurations:", okxAccounts);
			// 	return okxAccounts;

			default:
				console.warn(`Unknown exchange type: ${exchange}`);
				return [];
		}
	} catch (error) {
		console.error(`Failed to fetch ${exchange || "all"} account data:`, error);
		return [];
	}
}

// Start MT5 terminal
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
		console.error("Failed to start MT5 terminal:", error);
		return {
			success: false,
			message: "Failed to start MT5 terminal",
		};
	}
}

// Add account configuration
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
		console.log("Add account configuration request body:", requestBody);
		const { data } = await axios.post(`${getApiUrl()}/config`, requestBody);
		// console.log("Add account configuration success:", data)
		return data;
	} catch (error) {
		console.error("Failed to add account configuration:", error);
	}
}

// Delete account configuration
export async function deleteAccountConfig(accountId: number) {
	try {
		const { data } = await axios.delete(`${getApiUrl()}/config/${accountId}`);
		return data;
	} catch (error) {
		console.error("Failed to delete account configuration:", error);
		return {
			success: false,
			message: "Failed to delete account configuration",
		};
	}
}
