import { type OpenPositionPriceLine, type OrderMarker, type StopLossPriceLine, type TakeProfitPriceLine } from "@/types/chart";
import type { VirtualOrder } from "@/types/order";
import dayjs from "dayjs";
import type { UTCTimestamp } from "lightweight-charts";
import { LineStyle, LineWidth } from "lightweight-charts";






//一个虚拟订单转换为多个marker，为了换行
export function virtualOrderToMarker(virtualOrder: VirtualOrder): OrderMarker[] {
    const markers: OrderMarker[] = [];
    const timestampInSeconds = dayjs(virtualOrder.createTime).unix() as UTCTimestamp;
    
    // 第一行，用于显示操作+量
    const marker1: OrderMarker = {
        time: timestampInSeconds,
        position: "belowBar",
        shape: "arrowUp",
        color: "#FF0000",
        text:`Buy(${virtualOrder.orderId}) # ${virtualOrder.quantity}`,
    };

    // 第二行，用于显示价格
    const marker2: OrderMarker = {
        time: timestampInSeconds,
        position: "belowBar",
        shape: "circle",
        color: "#FF0000",
        text: `@ ${virtualOrder.openPrice}`,
        size: 0,
    };

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
    markers.push(marker2);
    // markers.push(marker3);
    return markers;
}

// 虚拟订单转换为开仓价格线
export function virtualOrderToOpenPositionPriceLine(virtualOrder: VirtualOrder): OpenPositionPriceLine {
    return {
        id: virtualOrder.orderId.toString(),
        price: virtualOrder.openPrice,
        color: "#F7A200",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "Open Position",
    };
}

export function virtualOrderToTakeProfitPriceLine(virtualOrder: VirtualOrder): TakeProfitPriceLine {
    return {
        id: virtualOrder.orderId.toString(),
        price: virtualOrder.openPrice,
        color: "#0FE8D9",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "Take Profit",
    };
}

export function virtualOrderToStopLossPriceLine(virtualOrder: VirtualOrder): StopLossPriceLine {
    return {
        id: virtualOrder.orderId.toString(),
        price: virtualOrder.openPrice,
        color: "#FF0000",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "Stop Loss",
    };
}

