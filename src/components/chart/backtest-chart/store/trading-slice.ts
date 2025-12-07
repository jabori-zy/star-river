import type {
	OrderMarker,
	OrderPriceLine,
	PositionPriceLine,
} from "@/types/chart";
import type { SliceCreator, TradingSlice } from "./types";

export const createTradingSlice: SliceCreator<TradingSlice> = (set, get) => ({
	orderMarkers: [], // Order markers
	positionPriceLine: [], // Position price lines
	orderPriceLine: [], // Limit order price lines

	setOrderMarkers: (markers: OrderMarker[]) => set({ orderMarkers: markers }),

	getOrderMarkers: () => get().orderMarkers,

	setPositionPriceLine: (priceLine: PositionPriceLine[]) =>
		set({ positionPriceLine: priceLine }),

	getPositionPriceLine: () => get().positionPriceLine,

	deletePositionPriceLine: (priceLineId: string) =>
		set({
			positionPriceLine: get().positionPriceLine.filter(
				(priceLine) => priceLine.id !== priceLineId,
			),
		}),

	setOrderPriceLine: (priceLine: OrderPriceLine[]) =>
		set({ orderPriceLine: priceLine }),

	getOrderPriceLine: () => get().orderPriceLine,

	deleteOrderPriceLine: (priceLineId: string) =>
		set({
			orderPriceLine: get().orderPriceLine.filter(
				(priceLine) => priceLine.id !== priceLineId,
			),
		}),
});
