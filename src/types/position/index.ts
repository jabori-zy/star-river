import type { TFunction } from "i18next";

export type { VirtualPosition } from "./virtual-position";

// Position id
export type PositionId = string;

export enum PositionSide {
	Long = "Long", // Long
	Short = "Short", // Short
}

export enum PositionState {
	Open = "Open", // Open position
	Close = "Close", // Close position
	PartiallyClosed = "PartiallyClosed", // Partially closed
	ForceClosed = "ForceClosed", // Force closed
}

// Position side text
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

// Position state text
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
