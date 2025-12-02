import type {
	OrderMarker,
	OrderPriceLine,
	PositionPriceLine,
} from "@/types/chart";
import type { SliceCreator, TradingSlice } from "./types";

export const createTradingSlice: SliceCreator<TradingSlice> = (set, get) => ({
	orderMarkers: [], // 订单标记
	positionPriceLine: [], // 仓位价格线
	orderPriceLine: [], // 限价单价格线

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
