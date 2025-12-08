import type { UTCTimestamp } from "lightweight-charts";
import { LineStyle } from "lightweight-charts";
import { DateTime } from "luxon";
import type {
	OpenPositionPriceLine,
	OrderMarker,
	OrderPriceLine,
	StopLossPriceLine,
	TakeProfitPriceLine,
} from "@/types/chart";
import type { VirtualOrder } from "@/types/order";
import { FuturesOrderSide, OrderType } from "@/types/order";
import type { VirtualPosition } from "@/types/position";

// Convert a virtual order to multiple markers for line breaks
export function virtualOrderToMarker(
	virtualOrder: VirtualOrder,
): OrderMarker[] {
	const markers: OrderMarker[] = [];
	const timestampInSeconds = getChartAlignedUtcTimestamp(
		virtualOrder.updateTime,
	) as UTCTimestamp;

	const text =
		virtualOrder.orderSide === FuturesOrderSide.LONG
			? `L(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}`
			: `S(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}`;

	const color =
		virtualOrder.orderSide === FuturesOrderSide.LONG ? "#14E031" : "#FF0000";

	const position =
		virtualOrder.orderSide === FuturesOrderSide.LONG ? "belowBar" : "aboveBar";

	const shape =
		virtualOrder.orderSide === FuturesOrderSide.LONG ? "arrowUp" : "arrowDown";

	// First line, used to display operation + quantity
	const marker1: OrderMarker = {
		time: timestampInSeconds,
		position,
		shape,
		color,
		text,
	};

	// Second line, used to display price
	// const marker2: OrderMarker = {
	//     time: timestampInSeconds,
	//     position,
	//     shape,
	//     color,
	//     text: `@ ${virtualOrder.openPrice}`,
	//     size: 0,
	// };

	// Display node ID
	// const marker3: OrderMarker = {
	//     time: timestampInSeconds,
	//     position: "belowBar",
	//     shape: "circle",
	//     color: "#FF0000",
	//     text: `$ ${virtualOrder.nodeId}`,
	//     size: 0,
	// };

	markers.push(marker1);
	// markers.push(marker2);
	// markers.push(marker3);
	return markers;
}

// Convert virtual position to open position price line
export function virtualPositionToOpenPositionPriceLine(
	virtualPosition: VirtualPosition,
): OpenPositionPriceLine {
	return {
		id: `${virtualPosition.positionId.toString()}-open`,
		price: virtualPosition.openPrice,
		color: "#F7A200",
		lineWidth: 1,
		lineStyle: LineStyle.Dashed,
		axisLabelVisible: true,
		title: "Open Position",
	};
}

// export function virtualPositionToTakeProfitPriceLine(
// 	virtualPosition: VirtualPosition,
// ): TakeProfitPriceLine | null {
// 	if (!virtualPosition.tp) {
// 		return null;
// 	}
// 	return {
// 		id: `${virtualPosition.positionId.toString()}-take-profit`,
// 		price: virtualPosition.tp as number,
// 		color: "#00FF00",
// 		lineWidth: 1,
// 		lineStyle: LineStyle.Dashed,
// 		axisLabelVisible: true,
// 		title: "Take Profit",
// 	};
// }

// export function virtualPositionToStopLossPriceLine(
// 	virtualPosition: VirtualPosition,
// ): StopLossPriceLine | null {
// 	if (!virtualPosition.sl) {
// 		return null;
// 	}
// 	return {
// 		id: `${virtualPosition.positionId.toString()}-stop-loss`,
// 		price: virtualPosition.sl as number,
// 		color: "#FF0000",
// 		lineWidth: 1,
// 		lineStyle: LineStyle.Dashed,
// 		axisLabelVisible: true,
// 		title: "Stop Loss",
// 	};
// }

export function TpOrderToTakeProfitPriceLine(
	virtualOrder: VirtualOrder,
): TakeProfitPriceLine {
	return {
		id: `${virtualOrder.orderId.toString()}-take-profit`,
		price: virtualOrder.openPrice,
		color: "#00FF00",
		lineWidth: 1,
		lineStyle: LineStyle.Dashed,
		axisLabelVisible: true,
		title: "Take Profit",
	};
}

export function SlOrderToStopLossPriceLine(
	virtualOrder: VirtualOrder,
): StopLossPriceLine {
	return {
		id: `${virtualOrder.orderId.toString()}-stop-loss`,
		price: virtualOrder.openPrice,
		color: "#FF0000",
		lineWidth: 1,
		lineStyle: LineStyle.Dashed,
		axisLabelVisible: true,
		title: "Stop Loss",
	};
}

export function virtualOrderToLimitOrderPriceLine(
	virtualOrder: VirtualOrder,
): OrderPriceLine | null {
	if (virtualOrder.orderType !== OrderType.LIMIT) {
		return null;
	}
	return {
		id: `${virtualOrder.orderId.toString()}-limit`,
		price: virtualOrder.openPrice,
		color:
			virtualOrder.orderSide === FuturesOrderSide.LONG ? "#00FF00" : "#FF0000",
		lineWidth: 1,
		lineStyle: LineStyle.Dashed,
		axisLabelVisible: true,
		title: `Limit Order ${virtualOrder.orderId}`,
	};
}

/**
 * Align local calendar time to UTC axis: chartMs = getTime() - offsetMs (native Date) or toMillis() + offset*60*1000 (Luxon DateTime).
 * Suitable for scenarios where "the chart only recognizes UTC, but want local 00:00 to display as 00:00 on the UTC axis".
 */
export const getChartAlignedUtcTimestamp = (
	input: DateTime | string,
): number => {
	const datetime = input instanceof DateTime ? input : DateTime.fromISO(input);
	// Luxon DateTime: use addition because toMillis() is already the UTC timestamp corresponding to local time
	const offsetMs = datetime.offset * 60 * 1000;
	return Math.floor(datetime.toMillis() + offsetMs) / 1000;
};

/**
 * Convert chart timestamp (seconds) back to backend format DateTime string (reverse operation).
 * This is the reverse method of getChartAlignedUtcTimestamp.
 *
 * @param chartTimestamp - Timestamp in the chart (seconds)
 * @returns DateTime string in backend format (e.g., "2025-09-30T16:00:00Z")
 *
 * @example
 * const chartTimestamp = 1727712000; // Timestamp obtained from chart
 * const dateTimeString = getDateTimeFromChartTimestamp(chartTimestamp);
 * // Returns: "2025-09-30T16:00:00.000Z"
 */
export const getDateTimeFromChartTimestamp = (
	chartTimestamp: number,
): string | null => {
	// 1. Convert seconds to milliseconds
	const chartMs = chartTimestamp * 1000;

	// 2. Get current local timezone offset (minutes)
	// Note: assumes the timezone used during conversion is consistent with the original conversion
	const localDateTime = DateTime.local();
	const offsetMs = localDateTime.offset * 60 * 1000;

	// 3. Reverse operation: subtract offset to restore original UTC milliseconds timestamp
	const originalMs = chartMs - offsetMs;

	// 4. Create DateTime object from milliseconds and convert to ISO 8601 format (UTC)
	const datetime = DateTime.fromMillis(originalMs, { zone: "utc" });

	// 5. Return ISO format string (consistent with backend format)
	return datetime.toISO();
};
