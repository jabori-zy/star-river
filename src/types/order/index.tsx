


export enum OrderType {
  LIMIT = 'LIMIT', // 限价单
  MARKET = 'MARKET', // 市价单
  STOP_LIMIT = 'STOP_LIMIT', // 止损限价单
  STOP_MARKET = 'STOP_MARKET', // 止损市价单
  TAKE_PROFIT = 'TAKE_PROFIT', // 止盈单
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT', // 止盈限价单
}

export enum OrderSide {
  BUY = 'BUY', // 买入
  SELL = 'SELL', // 卖出
}

export enum OrderStatus {
  PENDING = 'PENDING', // 待执行
  EXECUTED = 'EXECUTED', // 已执行
}


export type FuturesOrderConfig = {
    symbol: string;
    orderType: OrderType;
    orderSide: OrderSide;
    price: number;
    quantity: number;
    tp: number | null;
    sl: number | null;
  }