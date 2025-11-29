import type { Exchange } from "@/types/market";
import type { NodeId } from "@/types/node";
import type { OrderId } from "@/types/order";
import type { PositionId } from "@/types/position";
import type { TransactionId, TransactionSide } from ".";

export type VirtualTransaction = {
	transactionId: TransactionId; // 交易明细id

	orderId: OrderId; // 订单id

	positionId: PositionId; // 持仓id

	strategyId: string; // 策略id

	nodeId: NodeId; // 节点id

	orderConfigId: number; // 订单配置id

	exchange: string | Exchange; // 交易所

	symbol: string; // 交易品种

	transactionSide: TransactionSide; // 交易方向

	quantity: number; // 交易数量

	price: number; // 交易价格

	profit: number | null; // 收益

	createTime: string; // 创建时间
};
