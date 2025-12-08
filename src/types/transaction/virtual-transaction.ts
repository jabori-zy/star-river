import type { Exchange } from "@/types/market";
import type { NodeId } from "@/types/node";
import type { OrderId } from "@/types/order";
import type { PositionId } from "@/types/position";
import type { TransactionId, TransactionSide } from ".";

export type VirtualTransaction = {
	transactionId: TransactionId; // Transaction detail id

	orderId: OrderId; // Order id

	positionId: PositionId; // Position id

	strategyId: string; // Strategy id

	nodeId: NodeId; // Node id

	orderConfigId: number; // Order config id

	exchange: string | Exchange; // Exchange

	symbol: string; // Trading symbol

	transactionSide: TransactionSide; // Transaction direction

	quantity: number; // Transaction quantity

	price: number; // Transaction price

	profit: number | null; // Profit

	createTime: string; // Create time
};
