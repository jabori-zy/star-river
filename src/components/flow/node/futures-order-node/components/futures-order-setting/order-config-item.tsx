import React from "react";
import { type FuturesOrderConfig, OrderType, FuturesOrderSide } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, X } from "lucide-react";

interface OrderConfigItemProps {
    config: FuturesOrderConfig;
    index: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}

const OrderConfigItem: React.FC<OrderConfigItemProps> = ({
    config,
    index,
    onEdit,
    onDelete
}) => {
    const getOrderTypeLabel = (type: OrderType) => {
        const labels = {
            [OrderType.LIMIT]: '限价单',
            [OrderType.MARKET]: '市价单',
            [OrderType.STOP_LIMIT]: '止损限价单',
            [OrderType.STOP_MARKET]: '止损市价单',
            [OrderType.TAKE_PROFIT]: '止盈单',
            [OrderType.TAKE_PROFIT_LIMIT]: '止盈限价单',
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

    const isMarketOrder = config.orderType === OrderType.MARKET || config.orderType === OrderType.STOP_MARKET;

    return (
        <div className="flex items-center justify-between p-2 border rounded-md bg-background group">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-5 px-1">
                    {config.symbol}
                </Badge>
                <Badge 
                    variant={config.orderSide === FuturesOrderSide.LONG ? "default" : "destructive"} 
                    className="h-5 px-1 text-xs"
                >
                    {getOrderSideLabel(config.orderSide)}
                </Badge>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                        {getOrderTypeLabel(config.orderType)}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground">
                    数量: {config.quantity}
                    {!isMarketOrder && ` | 价格: ${config.price}`}
                    {config.tp && ` | 止盈: ${config.tp}`}
                    {config.sl && ` | 止损: ${config.sl}`}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => onEdit(index)}
                    >
                        <Settings className="h-3 w-3" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive"
                        onClick={() => onDelete(index)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfigItem; 