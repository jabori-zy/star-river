import type { UTCTimestamp } from "lightweight-charts";
import { LineStyle } from "lightweight-charts";
import { DateTime } from "luxon";
import type {
	LimitOrderPriceLine,
	OpenPositionPriceLine,
	OrderMarker,
	StopLossPriceLine,
	TakeProfitPriceLine,
} from "@/types/chart";
import type { VirtualOrder } from "@/types/order";
import { FuturesOrderSide, OrderType } from "@/types/order";
import type { VirtualPosition } from "@/types/position";

//一个虚拟订单转换为多个marker，为了换行
export function virtualOrderToMarker(
	virtualOrder: VirtualOrder,
): OrderMarker[] {
	const markers: OrderMarker[] = [];
	const timestampInSeconds = getChartAlignedUtcTimestamp(
		virtualOrder.updateTime,
	) as UTCTimestamp;

	const text =
		virtualOrder.orderSide === FuturesOrderSide.OPEN_LONG
			? `Open Long(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}`
			: virtualOrder.orderSide === FuturesOrderSide.OPEN_SHORT
				? `Open Short(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}`
				: virtualOrder.orderSide === FuturesOrderSide.CLOSE_LONG
					? `Close Long(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}`
					: `Close Short(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}`;

	const color =
		virtualOrder.orderSide === FuturesOrderSide.OPEN_LONG
			? "#14E031"
			: virtualOrder.orderSide === FuturesOrderSide.OPEN_SHORT
				? "#FF0000"
				: virtualOrder.orderSide === FuturesOrderSide.CLOSE_LONG
					? "#FF0000"
					: "#14E031";

	const position =
		virtualOrder.orderSide === FuturesOrderSide.OPEN_LONG
			? "belowBar"
			: virtualOrder.orderSide === FuturesOrderSide.OPEN_SHORT
				? "aboveBar"
				: virtualOrder.orderSide === FuturesOrderSide.CLOSE_LONG
					? "aboveBar"
					: "belowBar";

	const shape =
		virtualOrder.orderSide === FuturesOrderSide.OPEN_LONG
			? "arrowUp"
			: virtualOrder.orderSide === FuturesOrderSide.OPEN_SHORT
				? "arrowDown"
				: virtualOrder.orderSide === FuturesOrderSide.CLOSE_LONG
					? "arrowDown"
					: "arrowUp";

	// 第一行，用于显示操作+量
	const marker1: OrderMarker = {
		time: timestampInSeconds,
		position,
		shape,
		color,
		text,
	};

	// 第二行，用于显示价格
	// const marker2: OrderMarker = {
	//     time: timestampInSeconds,
	//     position,
	//     shape,
	//     color,
	//     text: `@ ${virtualOrder.openPrice}`,
	//     size: 0,
	// };

	// 显示节点id
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

// 虚拟订单转换为开仓价格线
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

export function virtualPositionToTakeProfitPriceLine(
	virtualPosition: VirtualPosition,
): TakeProfitPriceLine | null {
	if (!virtualPosition.tp) {
		return null;
	}
	return {
		id: `${virtualPosition.positionId.toString()}-take-profit`,
		price: virtualPosition.tp as number,
		color: "#00FF00",
		lineWidth: 1,
		lineStyle: LineStyle.Dashed,
		axisLabelVisible: true,
		title: "Take Profit",
	};
}

export function virtualPositionToStopLossPriceLine(
	virtualPosition: VirtualPosition,
): StopLossPriceLine | null {
	if (!virtualPosition.sl) {
		return null;
	}
	return {
		id: `${virtualPosition.positionId.toString()}-stop-loss`,
		price: virtualPosition.sl as number,
		color: "#FF0000",
		lineWidth: 1,
		lineStyle: LineStyle.Dashed,
		axisLabelVisible: true,
		title: "Stop Loss",
	};
}

export function virtualOrderToLimitOrderPriceLine(
	virtualOrder: VirtualOrder,
): LimitOrderPriceLine | null {
	if (virtualOrder.orderType !== OrderType.LIMIT) {
		return null;
	}
	return {
		id: `${virtualOrder.orderId.toString()}-limit`,
		price: virtualOrder.openPrice,
		color:
			virtualOrder.orderSide === FuturesOrderSide.OPEN_LONG
				? "#00FF00"
				: "#FF0000",
		lineWidth: 1,
		lineStyle: LineStyle.Dashed,
		axisLabelVisible: true,
		title: `Limit Order ${virtualOrder.orderId}`,
	};
}

/**
 * 将本地日历时间对齐到 UTC 轴：chartMs = getTime() - offsetMs（原生Date）或 toMillis() + offset*60*1000（Luxon DateTime）。
 * 适用于"图表只认 UTC，但希望本地 00:00 在 UTC 轴显示为 00:00"的场景。
 */
export const getChartAlignedUtcTimestamp = (
	input: DateTime | string,
): number => {
	const datetime = input instanceof DateTime ? input : DateTime.fromISO(input);
	// Luxon DateTime：使用加法，因为 toMillis() 已经是本地时间对应的UTC时间戳
	const offsetMs = datetime.offset * 60 * 1000;
	return Math.floor(datetime.toMillis() + offsetMs) / 1000;
};

/**
 * 将图表时间戳（秒）转换回后端格式的 DateTime 字符串（逆操作）。
 * 这是 getChartAlignedUtcTimestamp 的逆方法。
 *
 * @param chartTimestamp - 图表中的时间戳（秒）
 * @returns 后端格式的 DateTime 字符串（如 "2025-09-30T16:00:00Z"）
 *
 * @example
 * const chartTimestamp = 1727712000; // 从图表获取的时间戳
 * const dateTimeString = getDateTimeFromChartTimestamp(chartTimestamp);
 * // 返回: "2025-09-30T16:00:00.000Z"
 */
export const getDateTimeFromChartTimestamp = (
	chartTimestamp: number,
): string | null => {
	// 1. 将秒转换为毫秒
	const chartMs = chartTimestamp * 1000;

	// 2. 获取当前本地时区的偏移量（分钟）
	// 注意：这里假设转换时使用的时区与原始转换时一致
	const localDateTime = DateTime.local();
	const offsetMs = localDateTime.offset * 60 * 1000;

	// 3. 逆操作：减去偏移量，还原原始的 UTC 毫秒时间戳
	const originalMs = chartMs - offsetMs;

	// 4. 从毫秒创建 DateTime 对象，并转换为 ISO 8601 格式（UTC）
	const datetime = DateTime.fromMillis(originalMs, { zone: "utc" });

	// 5. 返回 ISO 格式字符串（与后端格式一致）
	return datetime.toISO();
};
