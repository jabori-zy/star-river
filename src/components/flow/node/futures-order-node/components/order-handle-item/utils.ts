import { type FuturesOrderConfig, OrderType, FuturesOrderSide } from "@/types/order";

export const formatOrderConfig = (config: FuturesOrderConfig): string => {
    const side = config.orderSide === FuturesOrderSide.LONG ? '多' : '空';
    const type = getOrderTypeLabel(config.orderType);
    const isMarketOrder = config.orderType === OrderType.MARKET || config.orderType === OrderType.STOP_MARKET;
    
    let result = `${config.symbol} ${side} ${type} ${config.quantity}`;
    
    if (!isMarketOrder) {
        result += ` @${config.price}`;
    }
    
    if (config.tp) {
        result += ` TP:${config.tp}`;
    }
    
    if (config.sl) {
        result += ` SL:${config.sl}`;
    }
    
    return result;
};

export const getOrderTypeLabel = (type: OrderType): string => {
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

export const getOrderSideLabel = (side: FuturesOrderSide): string => {
    const labels = {
        [FuturesOrderSide.LONG]: '多',
        [FuturesOrderSide.SHORT]: '空',
    };
    return labels[side] || side;
};

export const getOrderConfigSummary = (configs: FuturesOrderConfig[]): string => {
    if (configs.length === 0) return '无订单配置';
    if (configs.length === 1) return formatOrderConfig(configs[0]);
    return `${configs.length}个订单配置`;
}; 