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
	NotRegist = "NotRegistered", // Not registered
	Created = "Created", // Created
	Initializing = "Initializing", // Initializing
	Connected = "Connected", // Connected
	Stopping = "Stopping", // Stopping
	Stopped = "Stopped", // Stopped
	Error = "Error", // Error
}
