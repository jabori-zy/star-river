

export enum OrderType {
  LIMIT = 'LIMIT', // 限价单
  MARKET = 'MARKET', // 市价单
  STOP_LIMIT = 'STOP_LIMIT', // 止损限价单
  STOP_MARKET = 'STOP_MARKET', // 止损市价单
  TAKE_PROFIT = 'TAKE_PROFIT', // 止盈单
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT', // 止盈限价单
}

export enum SpotOrderSide {
  BUY = 'BUY', // 买入
  SELL = 'SELL', // 卖出
}

export enum FuturesOrderSide {
  OPEN_LONG = 'OPEN_LONG', // 做多
  OPEN_SHORT = 'OPEN_SHORT', // 做空
  CLOSE_LONG = 'CLOSE_LONG', // 平多
  CLOSE_SHORT = 'CLOSE_SHORT', // 平空
}

export enum OrderStatus {
  CREATED = 'CREATED', // 已创建
  PLACED = 'PLACED', // 已挂单
  PARTIAL = 'PARTIAL', // 部分成交
  FILLED = 'FILLED', // 已执行
  CANCELLED = 'CANCELLED', // 已取消
  EXPIRED = 'EXPIRED', // 已过期
  REJECTED = 'REJECTED', // 已拒绝
  ERROR = 'ERROR', // 错误
}


export type FuturesOrderConfig = {
    orderConfigId: number;
    inputHandleId: string;
    symbol: string;
    orderType: OrderType;
    orderSide: FuturesOrderSide;
    price: number;
    quantity: number;
    tp: number | null;
    sl: number | null;
}