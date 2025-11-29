export enum Exchange {
	METATRADER5 = "metatrader5",
	BINANCE = "binance",
	OKX = "okx",
}

export type Instrument = {
	name: string;
	base: string | null;
	quote: string | null;
	exchange: Exchange | string;
	point: number;
};

export enum ExchangeStatus {
	NotRegist = "NotRegistered", // 未注册
	Created = "Created", // 已创建
	Initializing = "Initializing", // 初始化中
	Connected = "Connected", // 已连接
	Stopping = "Stopping", // 停止中
	Stopped = "Stopped", // 已停止
	Error = "Error", // 错误
}
