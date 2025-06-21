import React from "react";
import { type FuturesOrderConfig, OrderType, FuturesOrderSide } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Position } from "@xyflow/react";

interface OrderHandleItemProps {
    orderConfig: FuturesOrderConfig
}

const getOrderTypeLabel = (type: OrderType) => {
    const labels = {
        [OrderType.LIMIT]: '限价',
        [OrderType.MARKET]: '市价',
        [OrderType.STOP_LIMIT]: '止损限价',
        [OrderType.STOP_MARKET]: '止损市价',
        [OrderType.TAKE_PROFIT]: '止盈',
        [OrderType.TAKE_PROFIT_LIMIT]: '止盈限价',
    };
    return labels[type] || type;
};

const getOrderSideLabel = (side: FuturesOrderSide) => {
    const labels = {
        [FuturesOrderSide.LONG]: '做多',
        [FuturesOrderSide.SHORT]: '做空',
    };
    return labels[side] || side;
};

const OrderHandleItem: React.FC<OrderHandleItemProps> = ({orderConfig}) => {

    const isMarketOrder = orderConfig.orderType === OrderType.MARKET || orderConfig.orderType === OrderType.STOP_MARKET;

    return (
        <div className="flex flex-col gap-1 relative">
            {/* 标题 */}
            <div className="flex items-center gap-2 pr-2 relative">
                <Badge 
                    variant={orderConfig.orderSide === FuturesOrderSide.LONG ? "default" : "destructive"} 
                    className="h-4 px-1 text-xs rounded-sm"
                >
                    {getOrderSideLabel(orderConfig.orderSide)}
                </Badge>
                <div className="text-xs font-bold text-muted-foreground"> 
                    Order{orderConfig.id}
                </div>
                {
                    orderConfig.orderSide === FuturesOrderSide.LONG ? (
                        <BaseHandle
                            id={`order-${orderConfig.id}`}
                            type="target"
                            position={Position.Left}
                            handleColor="!bg-black-400"
                            className="-translate-x-2 -translate-y-3"
                        />

                    ) : (
                        <BaseHandle
                            id={`order-${orderConfig.id}`}
                            type="target"
                            position={Position.Left}
                            handleColor="!bg-red-500"
                            className="-translate-x-2 -translate-y-3"
                        />                       
                    )
                }
                
            </div>
            

            {/* 订单配置 */}
            <div className="flex items-center gap-1 p-2 text-xs bg-gray-100 rounded">
                <Badge variant="outline" className="h-4 px-1 text-xs">
                    {orderConfig.symbol}
                </Badge>
                
                <span className="text-xs text-muted-foreground">
                    {getOrderTypeLabel(orderConfig.orderType)}
                </span>
                <span className="text-xs text-muted-foreground">
                    {orderConfig.quantity}
                </span>
                {!isMarketOrder && (
                    <span className="text-xs text-muted-foreground">
                        @{orderConfig.price}
                    </span>
                )}
                {orderConfig.tp && (
                    <span className="text-xs text-green-600">
                        TP:{orderConfig.tp}
                    </span>
                )}
                {orderConfig.sl && (
                    <span className="text-xs text-red-600">
                        SL:{orderConfig.sl}
                    </span>
                )}
            </div>
        </div>
    );
};

export default OrderHandleItem; 