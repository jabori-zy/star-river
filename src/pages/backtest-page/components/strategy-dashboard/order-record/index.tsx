import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { Subscription } from "rxjs";
import BacktestOrderRecordTable from "@/components/table/backtest-order-record-table";
import { createOrderStream } from "@/hooks/obs/backtest-strategy-event-obs";
import { getVirtualOrder } from "@/service/backtest-strategy";
import type { VirtualOrder } from "@/types/order/virtual-order";

interface OrderRecordProps {
	strategyId: number;
}

export interface OrderRecordRef {
	clearOrders: () => void;
}

const OrderRecord = forwardRef<OrderRecordRef, OrderRecordProps>(
	({ strategyId }, ref) => {
		const [orderData, setOrderData] = useState<VirtualOrder[]>([]);
		const orderStreamSubscription = useRef<Subscription | null>(null);

		// 暴露清空订单的方法
		useImperativeHandle(
			ref,
			() => ({
				clearOrders: () => {
					setOrderData([]);
				},
			}),
			[],
		);

		const getVirtualOrderData = useCallback(async () => {
			const virtualOrderData = (await getVirtualOrder(
				strategyId,
			)) as VirtualOrder[];
			// 倒序排列
			setOrderData(virtualOrderData.reverse());
		}, [strategyId]);

		// 初始化订单数据
		useEffect(() => {
			getVirtualOrderData();
		}, [getVirtualOrderData]);

		useEffect(() => {
			if (!orderStreamSubscription.current) {
				const orderStream = createOrderStream();
				const subscription = orderStream.subscribe((orderEvent) => {
					const order = orderEvent.futuresOrder;

					// 使用函数式更新来避免闭包问题
					setOrderData((prev) => {
						const existingOrder = prev.find(
							(o) => o.orderId === order.orderId,
						);
						if (existingOrder) {
							// 如果订单已经存在，则整个替换
							return prev.map((o) =>
								o.orderId === order.orderId ? order : o,
							);
						} else {
							// 倒序插入，时间越晚的越靠前
							return [order, ...prev];
						}
					});
					
				});
				orderStreamSubscription.current = subscription;
			}

			return () => {
				orderStreamSubscription.current?.unsubscribe();
			};
		}, []);

		return (
			<div>
				<BacktestOrderRecordTable
					title="订单记录"
					showTitle={false}
					data={orderData}
				/>
			</div>
		);
	},
);

OrderRecord.displayName = "OrderRecord";

export default OrderRecord;
