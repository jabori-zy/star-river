export type { VirtualTransaction } from "./virtual-transaction";

export type TransactionId = number;

// export enum TransactionType {
// 	Open = "OPEN", // 开仓
// 	Close = "CLOSE", // 平仓
// }

// 交易方向
export enum TransactionSide {
	Long = "LONG", // 多头
	Short = "SHORT", // 空头
}
