import type { NodeType } from "@/types/node/index";
import { VariableValueType } from "@/types/variable";
import type { VariableValue } from "./variable-config-types";

// ==================== 定时触发相关类型 ====================

export type TimerUnit = "millisecond" | "second" | "minute" | "hour" | "day";

export type RepeatMode = "hourly" | "daily" | "weekly" | "monthly";

export type IntervalTimerConfig = {
	mode: "interval";
	interval: number;
	unit: TimerUnit;
};

export type DayOfMonth = number | "first" | "last";

export type MonthlyFallbackStrategy = "last_day" | "skip";

type BaseScheduledConfig = {
	mode: "scheduled";
	cronExpression: string;
};

export type HourlyScheduledConfig = BaseScheduledConfig & {
	repeatMode: "hourly";
	hourlyInterval: number;
	minuteOfHour: number;
};

export type DailyScheduledConfig = BaseScheduledConfig & {
	repeatMode: "daily";
	time: string;
	daysOfWeek: number[];
};

export type WeeklyScheduledConfig = BaseScheduledConfig & {
	repeatMode: "weekly";
	time: string;
	dayOfWeek: number;
};

export type MonthlyScheduledConfig = BaseScheduledConfig & {
	repeatMode: "monthly";
	time: string;
	dayOfMonth: DayOfMonth;
	monthlyFallback?: MonthlyFallbackStrategy;
};

export type ScheduledTimerConfig =
	| HourlyScheduledConfig
	| DailyScheduledConfig
	| WeeklyScheduledConfig
	| MonthlyScheduledConfig;

export type TimerTrigger = IntervalTimerConfig | ScheduledTimerConfig;

export function isHourlyConfig(
	config: ScheduledTimerConfig,
): config is HourlyScheduledConfig {
	return config.repeatMode === "hourly";
}

export function isDailyConfig(
	config: ScheduledTimerConfig,
): config is DailyScheduledConfig {
	return config.repeatMode === "daily";
}

export function isWeeklyConfig(
	config: ScheduledTimerConfig,
): config is WeeklyScheduledConfig {
	return config.repeatMode === "weekly";
}

export function isMonthlyConfig(
	config: ScheduledTimerConfig,
): config is MonthlyScheduledConfig {
	return config.repeatMode === "monthly";
}

export function createDefaultScheduledConfig(
	repeatMode: RepeatMode,
): ScheduledTimerConfig {
	switch (repeatMode) {
		case "hourly":
			return {
				mode: "scheduled",
				repeatMode: "hourly",
				hourlyInterval: 1,
				minuteOfHour: 0,
				cronExpression: "0 0 * * * *",
			};
		case "daily":
			return {
				mode: "scheduled",
				repeatMode: "daily",
				time: "09:30",
				daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
				cronExpression: "0 30 9 * * 1,2,3,4,5,6,7",
			};
		case "weekly":
			return {
				mode: "scheduled",
				repeatMode: "weekly",
				time: "09:30",
				dayOfWeek: 1,
				cronExpression: "0 30 9 * * 1",
			};
		case "monthly":
			return {
				mode: "scheduled",
				repeatMode: "monthly",
				time: "09:30",
				dayOfMonth: 1,
				cronExpression: "0 30 9 1 * *",
			};
	}
}

// ==================== 条件与数据流触发 ====================

export const VALUE_TYPE_SUPPORT_POLICY: Record<VariableValueType, DataflowErrorType[]> = {
	[VariableValueType.NUMBER]: ["nullValue", "expired", "zeroValue"],
	[VariableValueType.STRING]: ["nullValue", "expired"],
	[VariableValueType.BOOLEAN]: ["nullValue", "expired"],
	[VariableValueType.TIME]: ["nullValue", "expired"],
	[VariableValueType.ENUM]: ["nullValue", "expired"],
	[VariableValueType.PERCENTAGE]: ["nullValue", "expired", "zeroValue"],
}


export type ErrorLog = { notify: false } | { notify: true; level: "warn" | "error" };

export type DataflowErrorType =
    | "nullValue" // 空值错误
    | "expired" // 过期错误
	| "zeroValue" // 零值错误

export type BaseDataflowErrorPolicy = {
	strategy: "skip" | "valueReplace" | "usePreviousValue";
	errorLog: ErrorLog;
}


export type DataflowErrorPolicy = SkipPolicy | ValueReplacePolicy | UsePreviousValuePolicy;

export type SkipPolicy = BaseDataflowErrorPolicy & {
	strategy: "skip";
}
export type ValueReplacePolicy = BaseDataflowErrorPolicy & {
	strategy: "valueReplace";
	replaceValue: VariableValue;
}
export type UsePreviousValuePolicy = BaseDataflowErrorPolicy & {
	strategy: "usePreviousValue";
	maxUseTimes?: number;
}


export type DataFlowTrigger = {
	fromNodeType: NodeType;
	fromNodeId: string;
	fromNodeName: string;
	fromHandleId: string;
	fromVar: string;
	fromVarDisplayName: string;
	fromVarValueType: VariableValueType;
	fromVarConfigId: number;
	expireDuration: {
		unit: TimerUnit;
		duration: number;
	},
	errorPolicy: Partial<Record<DataflowErrorType, DataflowErrorPolicy>>;
};

export type CaseBranchTrigger = {
	triggerType: "case";
	fromNodeType: NodeType;
	fromHandleId: string;
	fromNodeId: string;
	fromNodeName: string;
	caseId: number;
};

export type ElseBranchTrigger = {
	triggerType: "else";
	fromNodeType: NodeType;
	fromHandleId: string;
	fromNodeId: string;
	fromNodeName: string;
};

export type ConditionTrigger = CaseBranchTrigger | ElseBranchTrigger;

export type TriggerType = "condition" | "timer" | "dataflow";

export type TimerTriggerConfig = { type: "timer"; config: TimerTrigger };
export type ConditionTriggerConfig = {
	type: "condition";
	config: ConditionTrigger;
};
export type DataFlowTriggerConfig = {
	type: "dataflow";
	config: DataFlowTrigger;	
};

export type TriggerConfig =
	| TimerTriggerConfig
	| ConditionTriggerConfig
	| DataFlowTriggerConfig
	| null;

export function isTimerTriggerConfig(
	trigger: TriggerConfig,
): trigger is TimerTriggerConfig {
	return trigger?.type === "timer";
}

export function isConditionTriggerConfig(
	trigger: TriggerConfig,
): trigger is ConditionTriggerConfig {
	return trigger?.type === "condition";
}

export function isDataFlowTriggerConfig(
	trigger: TriggerConfig,
): trigger is DataFlowTriggerConfig {
	return trigger?.type === "dataflow";
}

export const getTriggerDetails = (
	triggerConfig?: TriggerConfig,
): {
		triggerType?: TriggerType;
		timerConfig?: TimerTrigger;
		conditionConfig?: ConditionTrigger;
		dataflowConfig?: DataFlowTrigger;
} => {
	if (!triggerConfig) return {};

	if (isTimerTriggerConfig(triggerConfig)) {
		return {
			triggerType: "timer",
			timerConfig: triggerConfig.config,
		};
	}

	if (isConditionTriggerConfig(triggerConfig)) {
		return {
			triggerType: "condition",
			conditionConfig: triggerConfig.config,
		};
	}

	if (isDataFlowTriggerConfig(triggerConfig)) {
		return {
			triggerType: "dataflow",
			dataflowConfig: triggerConfig.config,
		};
	}

	return {};
};
export const getEffectiveTriggerType = (
	config: { triggerConfig?: TriggerConfig },
): TriggerType | null => {
	const trigger = config.triggerConfig;
	return trigger ? trigger.type : null;
};

export const getTimerTriggerConfig = (
	config: { triggerConfig?: TriggerConfig },
): TimerTrigger | undefined => {
	const trigger = config.triggerConfig;
	return trigger?.type === "timer" ? trigger.config : undefined;
};

export const getConditionTriggerConfig = (
	config: { triggerConfig?: TriggerConfig },
): ConditionTrigger | undefined => {
	const trigger = config.triggerConfig;
	return trigger?.type === "condition" ? trigger.config : undefined;
};

export const getDataFlowTriggerConfig = (
	config: { triggerConfig?: TriggerConfig },
): DataFlowTrigger | undefined => {
	const trigger = config.triggerConfig;
	return trigger?.type === "dataflow" ? trigger.config : undefined;
};
