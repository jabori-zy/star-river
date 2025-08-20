import type { VirtualOrder } from "@/types/order/virtual-order";
import { FuturesOrderSide, OrderStatus, OrderType } from "@/types/order";

// 模拟数据生成函数
export function generateMockVirtualOrders(count: number = 50): VirtualOrder[] {
	const symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "DOGEUSDT", "SOLUSDT", "BNBUSDT"];
	const exchanges = ["BINANCE", "OKX", "HUOBI", "BYBIT"];
	const orderSides: FuturesOrderSide[] = [FuturesOrderSide.OPEN_LONG, FuturesOrderSide.OPEN_SHORT, FuturesOrderSide.CLOSE_LONG, FuturesOrderSide.CLOSE_SHORT];
	const orderTypes: OrderType[] = [OrderType.LIMIT, OrderType.MARKET, OrderType.STOP_LIMIT, OrderType.STOP_MARKET, OrderType.TAKE_PROFIT_MARKET, OrderType.TAKE_PROFIT_LIMIT];
	const orderStatuses: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.PLACED, OrderStatus.PARTIAL, OrderStatus.FILLED, OrderStatus.CANCELED, OrderStatus.REJECTED];

	const mockData: VirtualOrder[] = [];

	for (let i = 0; i < count; i++) {
		const symbol = symbols[Math.floor(Math.random() * symbols.length)];
		const orderSide = orderSides[Math.floor(Math.random() * orderSides.length)];
		const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
		const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
		const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
		
		// 生成价格相关数据
		const basePrice = Math.random() * 50000 + 1000; // 1000-51000范围的基础价格
		const openPrice = Math.round(basePrice * 100) / 100;
		const quantity = Math.round((Math.random() * 10 + 0.1) * 1000) / 1000;
		
		// 生成止盈止损价格（有50%概率为null）
		const tp = Math.random() > 0.5 ? Math.round(openPrice * (1 + Math.random() * 0.1) * 100) / 100 : null;
		const sl = Math.random() > 0.5 ? Math.round(openPrice * (1 - Math.random() * 0.05) * 100) / 100 : null;
		
		// 生成时间戳
		const createTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
		const updateTime = new Date(new Date(createTime).getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString();

		const order: VirtualOrder = {
			orderId: `VO${Date.now()}_${i.toString().padStart(3, '0')}`,
			strategyId: `STR_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
			nodeId: `NODE_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
			orderConfigId: Math.floor(Math.random() * 1000) + 1,
			exchange,
			symbol,
			orderSide,
			orderType,
			orderStatus,
			quantity,
			openPrice,
			tp,
			sl,
			createTime,
			updateTime,
		};

		mockData.push(order);
	}

	// 按创建时间倒序排序
	return mockData.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
}

// 导出默认的模拟数据
export const mockVirtualOrders = generateMockVirtualOrders(30);