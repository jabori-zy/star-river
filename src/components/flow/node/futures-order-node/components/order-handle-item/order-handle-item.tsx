import React from "react";
import { type FuturesOrderConfig, OrderType, FuturesOrderSide, OrderStatus } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";
import { getOrderStatusLabel, getOrderSideLabel, getOrderTypeLabel } from "./utils";
import { getLimitOrderHandleGroup, getMarketOrderHandleGroup } from "./handle-group";

interface OrderHandleItemProps {
    id: string;
    orderConfig: FuturesOrderConfig
}


const OrderHandleItem: React.FC<OrderHandleItemProps> = ({id, orderConfig}) => {

    const isMarketOrder = orderConfig.orderType === OrderType.MARKET || orderConfig.orderType === OrderType.STOP_MARKET;

    return (
        <div className="flex flex-col gap-1 relative ">
            {/* 标题 */}
            <div className="flex items-center gap-2 pr-2 relative">
                <Badge 
                    variant={orderConfig.orderSide === FuturesOrderSide.OPEN_LONG ? "default" : "destructive"} 
                    className="h-4 px-1 text-xs rounded-sm"
                >
                    {getOrderSideLabel(orderConfig.orderSide)}
                </Badge>
                <div className="text-xs font-bold text-muted-foreground"> 
                    Order{orderConfig.orderConfigId}
                </div>
                {
                    orderConfig.orderSide === FuturesOrderSide.OPEN_LONG ? (
                        <BaseHandle
                            id={`${id}_input${orderConfig.orderConfigId}`}
                            type="target"
                            position={Position.Left}
                            handleColor="!bg-black-400"
                            className="-translate-x-2 -translate-y-3"
                        />

                    ) : (
                        <BaseHandle
                            id={`${id}_input${orderConfig.orderConfigId}`}
                            type="target"
                            position={Position.Left}
                            handleColor="!bg-red-500"
                            className="-translate-x-2 -translate-y-3"
                        />                       
                    )
                }
                
            </div>
            

            <div className="flex flex-row flex-1 gap-1 justify-between">
                {/* 订单配置 */}
                <div className="flex flex-1 flex-col gap-2 p-4 text-xs bg-gray-50 rounded">
                    <div className="flex justify-between">
                        <span className="text-gray-600">交易对：</span>
                        <span className="font-medium">{orderConfig.symbol}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-gray-600">订单类型：</span>
                        <span className="font-medium">{getOrderTypeLabel(orderConfig.orderType)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">订单方向：</span>
                        <span className="font-medium">{getOrderSideLabel(orderConfig.orderSide)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-gray-600">数量：</span>
                        <span className="font-medium">{orderConfig.quantity}</span>
                    </div>
                    
                    {!isMarketOrder && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">成交价格：</span>
                            <span className="font-medium">{orderConfig.price}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between">
                        <span className="text-gray-600">止盈：</span>
                        <span className="font-medium">{orderConfig.tp || '-'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-gray-600">止损：</span>
                        <span className="font-medium">{orderConfig.sl || '-'}</span>
                    </div>
                </div>
                {/* 订单状态 */}
                <div className="flex flex-col gap-2 items-end">
                    <div className="text-xs text-muted-foreground">
                        {getOrderStatusLabel(OrderStatus.CREATED)}
                    </div>
                    {!isMarketOrder && (
                        <div className="text-xs text-muted-foreground">
                            {getOrderStatusLabel(OrderStatus.PLACED)}
                        </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                        {getOrderStatusLabel(OrderStatus.PARTIAL)}
                    </div>
                    <div className="text-xs text-green-400">
                        {getOrderStatusLabel(OrderStatus.FILLED)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {getOrderStatusLabel(OrderStatus.CANCELLED)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {getOrderStatusLabel(OrderStatus.EXPIRED)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {getOrderStatusLabel(OrderStatus.REJECTED)}
                    </div>
                    <div className="text-xs text-red-400">
                        {getOrderStatusLabel(OrderStatus.ERROR)}
                    </div>
                </div>
            </div>
            {/* handle出口 */}
            {isMarketOrder ? getMarketOrderHandleGroup(id, orderConfig.orderConfigId) : getLimitOrderHandleGroup(id, orderConfig.orderConfigId)}
                
        </div>
    );
};

export default OrderHandleItem; 