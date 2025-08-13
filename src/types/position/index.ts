export type { VirtualPosition } from "./virtual-position";


// 仓位id
export type PositionId = string;

export enum PositionSide {
    LONG = "LONG", // 多头
    SHORT = "SHORT", // 空头
}

export enum PositionState {
    OPEN = "OPEN", // 开仓
    CLOSE = "CLOSE", // 平仓
    PARTIALLY_CLOSED = "PARTIALLY_CLOSED", // 部分平仓
    FORCED_CLOSED = "FORCED_CLOSED", // 强制平仓
}

