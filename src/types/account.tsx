// Define common account properties
export interface BaseAccount {
	id: number;
	accountName: string;
	exchange: string;
	isAvailable: boolean;
	creatTime: string;
	updatedTime: string;
}

// MetaTrader5 specific properties
export interface MT5Account extends BaseAccount {
	login: number;
	server: string;
	terminalPath: string;
	leverage: number | null;
	balance: number | null;
	equity: number | null;
	margin: number | null;
	terminalStatus: string;
	eaStatus: string;
}

// Binance specific properties
export interface BinanceAccount extends BaseAccount {
	apiKey: string;
	secretKey: string;
	permissions: string[];
	balanceUSDT: number;
	tradingAllowed: boolean;
}

// OKX specific properties
export interface OKXAccount extends BaseAccount {
	apiVersion: string;
	marginMode: "cross" | "isolated";
	totalAssets: number;
	availableBalance: number;
}

// Define account union type
export type Account = MT5Account | BinanceAccount | OKXAccount;
