import type { Kline } from "@/types/kline";
import type { VirtualOrder } from "@/types/order/virtual-order";
import type { KeyStr } from "@/types/symbol-key";
import type { VirtualPosition } from "../position";
import type { StrategyStats } from "../statistics";
import type { VirtualTransaction } from "../transaction";
import { CustomVariable, SystemVariable } from "../variable";
import { UpdateVarValueOperation, VariableValue } from "../node/variable-node";
import type { BaseEventProps } from "./index";

export type BacktestStrategyEvent =
	| KlineUpdateEvent
	| IndicatorUpdateEvent
	| VirtualOrderEvent
	| VirtualPositionEvent
	| VirtualTransactionEvent
	| BacktestStrategyStatsUpdateEvent
	| PlayFinishedEvent
	| CustomVariableUpdateEvent
	| SystemVariableUpdateEvent;


export type KlineUpdateEvent = BaseEventProps & {
	klineCacheIndex: number;
	klineKey: KeyStr;
	kline: Kline;
};

export type IndicatorUpdateEvent = BaseEventProps & {
	indicatorKey: KeyStr;
	indicatorValue: Record<string, number | string>;
};

export type VirtualOrderEvent = BaseEventProps & {
	futuresOrder: VirtualOrder;
};

export type VirtualPositionEvent = BaseEventProps & {
	virtualPosition: VirtualPosition;
};

export type BacktestStrategyStatsUpdateEvent = Omit<
	BaseEventProps,
	"fromNodeId" | "fromNodeName" | "fromNodeHandleId"
> & {
	statsSnapshot: StrategyStats;
};

export type VirtualTransactionEvent = BaseEventProps & {
	transaction: VirtualTransaction;
};


export type CustomVariableUpdateEvent = BaseEventProps & {
	varOperation: "get" | "update" | "reset";
	updateOperation?: UpdateVarValueOperation,
	updateOperationValue?: VariableValue,
	customVariable: CustomVariable;
};

export type SystemVariableUpdateEvent = BaseEventProps & {
	sysVariable: SystemVariable;
};


export function isCustomVariableUpdateEvent(event: BacktestStrategyEvent): event is CustomVariableUpdateEvent {
	return event.eventType === "custom-variable-update-event" || event.event === "custom-variable-update-event";
}

export function isSystemVariableUpdateEvent(event: BacktestStrategyEvent): event is SystemVariableUpdateEvent {
	return event.eventType === "system-variable-update-event" || event.event === "sys-variable-update-event";
}

export type PlayFinishedEvent = Omit<
	BaseEventProps,
	"fromNodeId" | "fromNodeName" | "fromNodeHandleId"
> & {
	strategyId: number;
	strategyName: string;
	playIndex: number;
};
