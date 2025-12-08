import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { Subscription } from "rxjs";
import { OrderTable } from "@/components/new-table/backtest/order-table";
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

		// Expose method for clearing orders
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
			// Sort in reverse order
			setOrderData(virtualOrderData.reverse());
		}, [strategyId]);

		// Initialize order data
		useEffect(() => {
			getVirtualOrderData();
		}, [getVirtualOrderData]);

		useEffect(() => {
			if (!orderStreamSubscription.current) {
				const orderStream = createOrderStream();
				const subscription = orderStream.subscribe((orderEvent) => {
					const order = orderEvent.futuresOrder;

					// Use functional update to avoid closure issues
					setOrderData((prev) => {
						const existingOrder = prev.find((o) => o.orderId === order.orderId);
						if (existingOrder) {
							// If order already exists, replace it entirely
							return prev.map((o) => (o.orderId === order.orderId ? order : o));
						} else {
							// Insert in reverse order, later times come first
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
				<OrderTable data={orderData} />
			</div>
		);
	},
);

OrderRecord.displayName = "OrderRecord";

export default OrderRecord;
