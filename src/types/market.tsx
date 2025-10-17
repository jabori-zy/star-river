export enum Exchange {
	METATRADER5 = "metatrader5",
	BINANCE = "binance",
	OKX = "okx",
}

export type MarketSymbol = {
	name: string;
	base: string | null;
	quote: string | null;
	exchange: Exchange | string;
	point: number;
};

export enum ExchangeStatus {
	NotRegist = "NotRegist", // 未注册
	Registing = "Registing", // 注册中
	Connected = "Connected", // 已连接
	RegisterFailed = "RegisterFailed", // 注册失败
	Error = "Error", // 错误
}
