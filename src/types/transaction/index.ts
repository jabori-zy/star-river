export type { VirtualTransaction } from "./virtual-transaction";

export type TransactionId = number;


export enum TransactionType {
    Open = "OPEN", // 开仓
    Close = "CLOSE", // 平仓
}


// 交易方向
export enum TransactionSide {
    OpenLong = "OPEN_LONG", // 多头
    OpenShort = "OPEN_SHORT", // 空头
    CloseLong = "CLOSE_LONG", // 多头平仓
    CloseShort = "CLOSE_SHORT", // 空头平仓
}