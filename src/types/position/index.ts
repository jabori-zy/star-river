import type { TFunction } from "i18next";

export type { VirtualPosition } from "./virtual-position";

// 仓位id
export type PositionId = string;

export enum PositionSide {
	Long = "Long", // 多头
	Short = "Short", // 空头
}

export enum PositionState {
	Open = "Open", // 开仓
	Close = "Close", // 平仓
	PartiallyClosed = "PartiallyClosed", // 部分平仓
	ForceClosed = "ForceClosed", // 强制平仓
}

// 仓位方向文本
export const getPositionSideDisplayName = (
	side: PositionSide,
	t: TFunction,
) => {
	switch (side) {
		case PositionSide.Long:
			return t("market.positionSide.long");
		case PositionSide.Short:
			return t("market.positionSide.short");
		default:
			return side;
	}
};

// 仓位状态文本
export const getPositionStateDisplayName = (
	state: PositionState,
	t: TFunction,
) => {
	switch (state) {
		case PositionState.Open:
			return t("market.positionState.open");
		case PositionState.Close:
			return t("market.positionState.close");
		case PositionState.PartiallyClosed:
			return t("market.positionState.partiallyClose");
		case PositionState.ForceClosed:
			return t("market.positionState.forceClose");
		default:
			return state;
	}
};
