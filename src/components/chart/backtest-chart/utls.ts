import { type OpenPositionPriceLine, type OrderMarker, type StopLossPriceLine, type TakeProfitPriceLine } from "@/types/chart";
import type { VirtualOrder } from "@/types/order";
import dayjs from "dayjs";
import type { UTCTimestamp } from "lightweight-charts";
import { LineStyle } from "lightweight-charts";
import type { VirtualPosition } from "@/types/position";
import { FuturesOrderSide } from "@/types/order";
import { getChartAlignedUtcSeconds } from "@/utils/datetime-offset";






//一个虚拟订单转换为多个marker，为了换行
export function virtualOrderToMarker(virtualOrder: VirtualOrder): OrderMarker[] {
    const markers: OrderMarker[] = [];
    const timestampInSeconds = getChartAlignedUtcSeconds(virtualOrder.updateTime) as UTCTimestamp;

    const text = virtualOrder.orderSide === FuturesOrderSide.OPEN_LONG ? 
        `Open Long(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}` : 
        virtualOrder.orderSide === FuturesOrderSide.OPEN_SHORT ? 
        `Open Short(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}` : 
        virtualOrder.orderSide === FuturesOrderSide.CLOSE_LONG ? 
        `Close Long(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}` : 
        `Close Short(${virtualOrder.orderId}) # ${virtualOrder.quantity} @ ${virtualOrder.openPrice}`;
    
    const color = virtualOrder.orderSide === FuturesOrderSide.OPEN_LONG ? "#14E031" :
    virtualOrder.orderSide === FuturesOrderSide.OPEN_SHORT ? "#FF0000" : 
    virtualOrder.orderSide === FuturesOrderSide.CLOSE_LONG ? "#FF0000" : "#14E031";

    const position = virtualOrder.orderSide === FuturesOrderSide.OPEN_LONG ? "belowBar" : 
    virtualOrder.orderSide === FuturesOrderSide.OPEN_SHORT ? "aboveBar" : 
    virtualOrder.orderSide === FuturesOrderSide.CLOSE_LONG ? "aboveBar" : "belowBar";

    const shape = virtualOrder.orderSide === FuturesOrderSide.OPEN_LONG ? "arrowUp" : 
    virtualOrder.orderSide === FuturesOrderSide.OPEN_SHORT ? "arrowDown" : 
    virtualOrder.orderSide === FuturesOrderSide.CLOSE_LONG ? "arrowDown" : "arrowUp";

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
export function virtualPositionToOpenPositionPriceLine(virtualPosition: VirtualPosition): OpenPositionPriceLine {
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


export function virtualPositionToTakeProfitPriceLine(virtualPosition: VirtualPosition): TakeProfitPriceLine | null {
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

export function virtualPositionToStopLossPriceLine(virtualPosition: VirtualPosition): StopLossPriceLine | null {
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

