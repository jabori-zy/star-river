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
}