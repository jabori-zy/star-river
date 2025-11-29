import { Position } from "@xyflow/react";
import type React from "react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Badge } from "@/components/ui/badge";
import {
	type FuturesOrderConfig,
	FuturesOrderSide,
	OrderStatus,
	OrderType,
	getFuturesOrderSideLabel,
	getFuturesOrderSideColor,
	getOrderTypeLabel,
	getOrderStatusLabel,
} from "@/types/order";
import {
	getLimitOrderHandleGroup,
	getMarketOrderHandleGroup,
} from "./handle-group";
import { useTranslation } from "react-i18next";

interface OrderHandleItemProps {
	id: string;
	orderConfig: FuturesOrderConfig;
	handleColor: string;
}

const OrderHandleItem: React.FC<OrderHandleItemProps> = ({
	id,
	orderConfig,
	handleColor,
}) => {
	const { t } = useTranslation();
	const isMarketOrder =
		orderConfig.orderType === OrderType.MARKET ||
		orderConfig.orderType === OrderType.STOP_MARKET;

	return (
		<div className="flex flex-col gap-1 relative ">
			{/* 标题 */}
			<div className="flex items-center gap-2 pr-2 relative">
				<Badge
					variant="outline"
					className="h-4 px-1 text-xs rounded-sm"
					style={{
						color: getFuturesOrderSideColor(orderConfig.orderSide),
						borderColor: getFuturesOrderSideColor(orderConfig.orderSide),
					}}
				>
					{getFuturesOrderSideLabel(orderConfig.orderSide, t)}
				</Badge>
				<div className="text-xs font-bold text-muted-foreground">
					{t("futuresOrderNode.order")}-{orderConfig.orderConfigId}
				</div>
				{orderConfig.orderSide === FuturesOrderSide.LONG ? (
					<BaseHandle
						id={`${id}_input_${orderConfig.orderConfigId}`}
						type="target"
						position={Position.Left}
						handleColor={handleColor}
						className="-translate-x-2 -translate-y-3"
					/>
				) : (
					<BaseHandle
						id={`${id}_input_${orderConfig.orderConfigId}`}
						type="target"
						position={Position.Left}
						handleColor={handleColor}
						className="-translate-x-2 -translate-y-3"
					/>
				)}
			</div>

			<div className="flex flex-row flex-1 gap-1 justify-between">
				{/* 订单配置 */}
				<div className="flex flex-1 flex-col gap-2 p-3 text-xs bg-gray-50 rounded min-w-[160px]">
					<div className="flex justify-between gap-4">
						<span className="text-gray-500 whitespace-nowrap">{t("futuresOrderNode.orderConfig.symbol")}</span>
						<span className="font-semibold text-right">{orderConfig.symbol}</span>
					</div>

					<div className="flex justify-between gap-4">
						<span className="text-gray-500 whitespace-nowrap">{t("futuresOrderNode.orderConfig.orderType")}</span>
						<span className="font-medium text-right">
							{getOrderTypeLabel(orderConfig.orderType, t)}
						</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="text-gray-500 whitespace-nowrap">{t("futuresOrderNode.orderConfig.orderSide")}</span>
						<span
							className="font-medium text-right"
							style={{ color: getFuturesOrderSideColor(orderConfig.orderSide) }}
						>
							{getFuturesOrderSideLabel(orderConfig.orderSide, t)}
						</span>
					</div>

					<div className="flex justify-between gap-4">
						<span className="text-gray-500 whitespace-nowrap">{t("futuresOrderNode.orderConfig.quantity")}</span>
						<span className="font-medium text-right">{orderConfig.quantity}</span>
					</div>

					{!isMarketOrder && (
						<div className="flex justify-between gap-4">
							<span className="text-gray-500 whitespace-nowrap">{t("futuresOrderNode.orderConfig.price")}</span>
							<span className="font-medium text-right">{orderConfig.price}</span>
						</div>
					)}

					<div className="flex justify-between gap-4">
						<span className="text-gray-500 whitespace-nowrap">{t("futuresOrderNode.orderConfig.takeProfit")}</span>
						<span className="font-medium text-right">
							{orderConfig.tp != null
								? `${orderConfig.tp}${orderConfig.tpType === "percentage" ? "%" : orderConfig.tpType === "point" ? " Point" : ""}`
								: "-"}
						</span>
					</div>

					<div className="flex justify-between gap-4">
						<span className="text-gray-500 whitespace-nowrap">{t("futuresOrderNode.orderConfig.stopLoss")}</span>
						<span className="font-medium text-right">
							{orderConfig.sl != null
								? `${orderConfig.sl}${orderConfig.slType === "percentage" ? "%" : orderConfig.slType === "point" ? " Point" : ""}`
								: "-"}
						</span>
					</div>
				</div>
				{/* 订单状态 */}
				<div className="flex flex-col gap-2 items-end">
					<div className="text-xs text-muted-foreground">{t("futuresOrderNode.allStatus")}</div>
					<div className="text-xs text-muted-foreground">
						{getOrderStatusLabel(OrderStatus.CREATED, t)}
					</div>
					{!isMarketOrder && (
						<div className="text-xs text-muted-foreground">
							{getOrderStatusLabel(OrderStatus.PLACED, t)}
						</div>
					)}

					<div className="text-xs text-muted-foreground">
						{getOrderStatusLabel(OrderStatus.PARTIAL, t)}
					</div>
					<div className="text-xs text-green-600 font-medium">
						{getOrderStatusLabel(OrderStatus.FILLED, t)}
					</div>
					<div className="text-xs text-muted-foreground">
						{getOrderStatusLabel(OrderStatus.CANCELED, t)}
					</div>
					<div className="text-xs text-muted-foreground">
						{getOrderStatusLabel(OrderStatus.EXPIRED, t)}
					</div>
					<div className="text-xs text-muted-foreground">
						{getOrderStatusLabel(OrderStatus.REJECTED, t)}
					</div>
					<div className="text-xs text-red-500 font-medium">
						{getOrderStatusLabel(OrderStatus.ERROR, t)}
					</div>
				</div>
			</div>
			{/* handle出口 */}
			{isMarketOrder
				? getMarketOrderHandleGroup(id, orderConfig.orderConfigId, handleColor)
				: getLimitOrderHandleGroup(id, orderConfig.orderConfigId, handleColor)}
		</div>
	);
};

export default OrderHandleItem;
