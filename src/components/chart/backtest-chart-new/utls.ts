import type { OrderMarker } from "@/types/chart";
import type { VirtualOrder } from "@/types/order";
import dayjs from "dayjs";
import type { UTCTimestamp } from "lightweight-charts";






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
        text:`Buy # ${virtualOrder.quantity}`,
    };

    // 第二行，用于显示价格
    const marker2: OrderMarker = {
        time: timestampInSeconds,
        position: "belowBar",
        shape: "circle",
        color: "#FF0000",
        text: `@ $${virtualOrder.openPrice}`,
        size: 0,
    };

    // 显示节点id
    const marker3: OrderMarker = {
        time: timestampInSeconds,
        position: "belowBar",
        shape: "circle",
        color: "#FF0000",
        text: `$ ${virtualOrder.nodeId}`,
        size: 0,
    };

    markers.push(marker1);
    markers.push(marker2);
    markers.push(marker3);
    return markers;
}