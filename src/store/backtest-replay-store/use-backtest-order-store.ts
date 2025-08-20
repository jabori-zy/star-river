import { create } from "zustand";
import { OrderStatus } from "@/types/order";
import type { VirtualOrder } from "@/types/order/virtual-order";

// 定义组合键类型：exchange+symbol
type OrderKey = string;

// 创建组合键的辅助函数
export const createOrderKey = (exchange: string, symbol: string): OrderKey => {
	return `${exchange}:${symbol}`;
};

// 回测订单数据存储
interface BacktestOrderDataState {
	// 按 exchange+symbol 存储的订单数据列表
	orderData: Record<OrderKey, VirtualOrder[]>;

	// 添加新订单数据到指定的组合键中
	addOrderData: (
		exchange: string,
		symbol: string,
		data: VirtualOrder[],
	) => void;

	// 添加单个订单到指定的组合键中
	addSingleOrder: (
		exchange: string,
		symbol: string,
		order: VirtualOrder,
	) => void;

	// 清空特定组合键的所有订单数据
	clearOrderData: (exchange: string, symbol: string) => void;

	// 清空所有订单数据
	clearAllOrderData: () => void;

	// 获取指定组合键的订单数据
	getOrderData: (exchange: string, symbol: string) => VirtualOrder[];

	// 获取指定订单
	getOrderById: (
		exchange: string,
		symbol: string,
		orderId: string,
	) => VirtualOrder | undefined;

	// 获取最新订单
	getLatestOrder: (
		exchange: string,
		symbol: string,
	) => VirtualOrder | undefined;

	// 获取所有的订单数据
	getAllOrderData: () => Record<OrderKey, VirtualOrder[]>;

	// 获取所有活跃订单（非已完成状态）
	getActiveOrders: (exchange: string, symbol: string) => VirtualOrder[];
}

export const useBacktestOrderDataStore = create<BacktestOrderDataState>(
	(set, get) => ({
		// 初始化订单数据存储
		orderData: {},

		// 添加订单数据到指定组合键中
		addOrderData: (exchange, symbol, data) =>
			set((state) => {
				const orderKey = createOrderKey(exchange, symbol);
				const currentData = state.orderData[orderKey] || [];

				return {
					orderData: {
						...state.orderData,
						[orderKey]: [...currentData, ...data],
					},
				};
			}),

		// 添加单个订单到指定组合键中
		addSingleOrder: (exchange, symbol, order) =>
			set((state) => {
				const orderKey = createOrderKey(exchange, symbol);
				const currentData = state.orderData[orderKey] || [];

				return {
					orderData: {
						...state.orderData,
						[orderKey]: [...currentData, order],
					},
				};
			}),

		// 清空特定组合键的所有订单数据
		clearOrderData: (exchange, symbol) =>
			set((state) => {
				const orderKey = createOrderKey(exchange, symbol);
				return {
					orderData: {
						...state.orderData,
						[orderKey]: [],
					},
				};
			}),

		// 清空所有订单数据
		clearAllOrderData: () =>
			set({
				orderData: {},
			}),

		// 获取指定组合键的订单数据
		getOrderData: (exchange, symbol) => {
			const orderKey = createOrderKey(exchange, symbol);
			return get().orderData[orderKey] || [];
		},

		// 获取指定订单
		getOrderById: (exchange, symbol, orderId) => {
			const orderKey = createOrderKey(exchange, symbol);
			const orders = get().orderData[orderKey] || [];
			return orders.find((order) => order.orderId === orderId);
		},

		// 获取最新订单
		getLatestOrder: (exchange, symbol) => {
			const orderKey = createOrderKey(exchange, symbol);
			const orders = get().orderData[orderKey] || [];
			return orders[orders.length - 1];
		},

		// 获取所有的订单数据
		getAllOrderData: () => {
			return get().orderData;
		},

		// 获取所有活跃订单（非已完成状态）
		getActiveOrders: (exchange, symbol) => {
			const orderKey = createOrderKey(exchange, symbol);
			const orders = get().orderData[orderKey] || [];
			return orders.filter(
				(order) =>
					order.orderStatus !== OrderStatus.FILLED &&
					order.orderStatus !== OrderStatus.CANCELED &&
					order.orderStatus !== OrderStatus.REJECTED,
			);
		},
	}),
);
