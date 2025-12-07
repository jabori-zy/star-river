import type { TFunction } from "i18next";
import type { LucideIcon } from "lucide-react";
import { Clock, Filter, Workflow } from "lucide-react";
import type {
	ConditionTrigger,
	TimerTrigger,
	TriggerType,
	UpdateVarValueOperation,
	VariableConfig,
} from "@/types/node/variable-node";
import { getEffectiveTriggerType } from "@/types/node/variable-node";
import {
	getSystemVariableMetadata,
	SystemVariableType,
} from "@/types/variable";
/**
 * Get the display name of variable type (only for system variables)
 * For custom variables, should directly return the variable name
 */
export const getVariableLabel = (type: string, t: TFunction): string => {
	// Check if it's a system variable
	if (Object.values(SystemVariableType).includes(type as SystemVariableType)) {
		const metadata = getSystemVariableMetadata(t)[type as SystemVariableType];
		return metadata.varDisplayName;
	}
	// For custom variables, directly return the variable name
	return type;
};

/**
 * Generate default variable name
 */
export const generateVariableName = (
	variableType: string,
	existingConfigsLength: number,
	t: TFunction,
	customVariables?: Array<{ varName: string; varDisplayName: string }>,
): string => {
	let typeLabel: string;

	// Check if it's a system variable
	if (
		Object.values(SystemVariableType).includes(
			variableType as SystemVariableType,
		)
	) {
		typeLabel = getVariableLabel(variableType, t);
	} else if (customVariables) {
		// Custom variable: find varDisplayName from the list
		const customVar = customVariables.find((v) => v.varName === variableType);
		typeLabel = customVar?.varDisplayName || variableType;
	} else {
		// If custom variable list is not provided, use the variable name itself
		typeLabel = variableType;
	}

	const nextIndex = existingConfigsLength + 1;
	return `${typeLabel}${nextIndex}`;
};

/**
 * Check if there is a duplicate configuration (same symbol + variable type + trigger method)
 * Only check duplicates for get operations
 */
export const isDuplicateConfig = (
	existingConfigs: VariableConfig[],
	editingIndex: number | null,
	symbol: string,
	variable: string,
	triggerType: "condition" | "timer" | "dataflow",
): boolean => {
	return existingConfigs.some((config, index) => {
		if (index === editingIndex) return false;
		if (config.varOperation !== "get") return false;

		const configSymbol = ("symbol" in config ? config.symbol : null) || "";
		if (configSymbol !== symbol) return false;
		if (config.varName !== variable) return false;

		const effectiveTriggerType = getEffectiveTriggerType(config);

		return effectiveTriggerType === triggerType;
	});
};

/**
 * Get placeholder text for update operation input field
 */
export const getUpdateOperationPlaceholder = (
	operationType: UpdateVarValueOperation,
): string => {
	const placeholderMap: Record<UpdateVarValueOperation, string> = {
		set: "Enter new value",
		add: "Enter increment value",
		subtract: "Enter decrement value",
		multiply: "Enter multiplier",
		divide: "Enter divisor",
		max: "Enter comparison value",
		min: "Enter comparison value",
		toggle: "Enter value",
		append: "Enter value to add",
		remove: "Enter value to remove",
		clear: "Enter value",
	};
	return placeholderMap[operationType] || "Enter value";
};

/**
 * Get trigger label from TriggerCase
 * @param triggerCase Trigger configuration
 * @returns Trigger label (e.g. "Case 1" or "Else")
 */
export const getTriggerCaseLabel = (
	triggerCase: ConditionTrigger | null,
): string | null => {
	if (!triggerCase) return null;

	if (triggerCase.triggerType === "case") {
		return `Case ${triggerCase.caseId}`;
	} else {
		return "Else";
	}
};

/**
 * Trigger type configuration
 */
export interface TriggerTypeInfo {
	icon: LucideIcon;
	label: string;
	color: string;
	badgeColor: string;
}

/**
 * Trigger type metadata mapping table
 */
const TRIGGER_TYPE_METADATA: Record<TriggerType, TriggerTypeInfo> = {
	condition: {
		icon: Filter,
		label: "Condition Trigger",
		color: "text-orange-500",
		badgeColor: "bg-orange-100 text-orange-800",
	},
	timer: {
		icon: Clock,
		label: "Timer Trigger",
		color: "text-blue-500",
		badgeColor: "bg-blue-100 text-blue-800",
	},
	dataflow: {
		icon: Workflow,
		label: "Dataflow Trigger",
		color: "text-blue-500",
		badgeColor: "bg-emerald-100 text-emerald-800",
	},
};

/**
 * Get trigger type icon
 * @param triggerType Trigger type
 * @returns Icon component
 */
export const getTriggerTypeIcon = (triggerType: TriggerType): LucideIcon => {
	return TRIGGER_TYPE_METADATA[triggerType].icon;
};

/**
 * Get trigger type label text
 * @param triggerType Trigger type
 * @param t i18n translation function
 * @returns Label text
 */
export const getTriggerTypeLabel = (
	triggerType: TriggerType,
	t: TFunction,
): string => {
	const labelKeyMap: Record<TriggerType, string> = {
		condition: "variableNode.condition",
		timer: "variableNode.timer",
		dataflow: "variableNode.dataflow",
	};
	return t(labelKeyMap[triggerType]);
};

/**
 * Get trigger type color style class name
 * @param triggerType Trigger type
 * @returns Tailwind color class name
 */
export const getTriggerTypeColor = (triggerType: TriggerType): string => {
	return TRIGGER_TYPE_METADATA[triggerType].color;
};

/**
 * Get trigger type Badge color style class name
 * @param triggerType Trigger type
 * @returns Tailwind Badge color class name
 */
export const getTriggerTypeBadgeColor = (triggerType: TriggerType): string => {
	return TRIGGER_TYPE_METADATA[triggerType].badgeColor;
};

/**
 * Get complete information of trigger type
 * @param triggerType Trigger type
 * @param t i18n translation function
 * @returns Trigger type information object
 */
export const getTriggerTypeInfo = (
	triggerType: TriggerType,
	t: TFunction,
): TriggerTypeInfo => {
	const baseInfo = TRIGGER_TYPE_METADATA[triggerType];
	return {
		...baseInfo,
		label: getTriggerTypeLabel(triggerType, t),
	};
};

// ==================== Public helper components and functions ====================

/**
 * Generate variable name highlight element
 */
export const generateVariableHighlight = (name?: string): React.ReactNode => {
	if (!name) return null;
	return <span className="text-orange-600 font-medium">{name}</span>;
};

/**
 * Generate value highlight element
 */
export const generateValueHighlight = (value: string): React.ReactNode => {
	return <span className="text-blue-600 font-medium">{value}</span>;
};

export const generateSymbolHighlight = (symbol?: string): React.ReactNode => {
	if (!symbol) return null;
	return <span className="text-indigo-600 font-medium">{symbol}</span>;
};

/**
 * Generate timer trigger interval prefix text
 * @param timerConfig Timer configuration
 * @returns Interval text, e.g. "Every 5 minutes," or null
 */
export const generateTimerIntervalPrefix = (
	t: (key: string, options?: { [key: string]: string }) => string,
	timerConfig?: TimerTrigger,
): string | null => {
	if (!timerConfig || timerConfig?.mode !== "interval") {
		return null;
	}

	const { interval, unit } = timerConfig;
	switch (unit) {
		case "second":
			return t("variableNode.hint.intervalSecond", {
				interval: interval.toString(),
			});
		case "minute":
			return t("variableNode.hint.intervalMinute", {
				interval: interval.toString(),
			});
		case "hour":
			return t("variableNode.hint.intervalHour", {
				interval: interval.toString(),
			});
		case "day":
			return t("variableNode.hint.intervalDay", {
				interval: interval.toString(),
			});
	}
	return null;
};

/**
 * Generate scheduled execution mode prefix text
 * @param timerConfig Timer configuration
 * @returns Scheduled execution text, e.g. "At minute 30 of every hour," or null
 */
export const generateSchedulePrefix = (
	timerConfig: TimerTrigger,
	t: (key: string, options?: { [key: string]: string }) => string,
): string | null => {
	if (!timerConfig || timerConfig.mode !== "scheduled") {
		return null;
	}

	const { repeatMode } = timerConfig;

	if (repeatMode === "hourly") {
		// Hourly: At minute {} of every {} hour(s),
		const { hourlyInterval, minuteOfHour } = timerConfig;
		if (hourlyInterval === 1) {
			return t("variableNode.hint.scheduleHourlyOne", {
				minute: minuteOfHour.toString(),
			});
		}
		return t("variableNode.hint.scheduleHourly", {
			hourlyInterval: hourlyInterval.toString(),
			minute: minuteOfHour.toString(),
		});
	}

	if (repeatMode === "daily") {
		// Daily: Every day {}:{} (Mon, Tue...)
		const { time, daysOfWeek } = timerConfig;
		const weekdayMap: Record<number, string> = {
			1: t("common.weekdayAbbr.monday"),
			2: t("common.weekdayAbbr.tuesday"),
			3: t("common.weekdayAbbr.wednesday"),
			4: t("common.weekdayAbbr.thursday"),
			5: t("common.weekdayAbbr.friday"),
			6: t("common.weekdayAbbr.saturday"),
			7: t("common.weekdayAbbr.sunday"),
		};

		let prefix = t("variableNode.hint.scheduleDaily", { time: time });

		// If specific weekdays are selected, add weekday information
		if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
			const weekdayNames = daysOfWeek.map((d) => weekdayMap[d]).join("、");
			prefix += ` (${weekdayNames})`;
		}

		return `${prefix}，`;
	}

	if (repeatMode === "weekly") {
		// Weekly: Every {Wednesday} {}:{}
		const { time, dayOfWeek } = timerConfig;
		const weekdayMap: Record<number, string> = {
			1: t("common.weekday.monday"),
			2: t("common.weekday.tuesday"),
			3: t("common.weekday.wednesday"),
			4: t("common.weekday.thursday"),
			5: t("common.weekday.friday"),
			6: t("common.weekday.saturday"),
			7: t("common.weekday.sunday"),
		};
		const weekdayName = weekdayMap[dayOfWeek] || "";
		return t("variableNode.hint.scheduleWeekly", {
			weekday: weekdayName,
			time: time,
		});
	}

	if (repeatMode === "monthly") {
		// Monthly: Day {} of every month at {}:{}, last day of every month
		const { time, dayOfMonth } = timerConfig;

		if (typeof dayOfMonth === "number") {
			return t("variableNode.hint.scheduleMonthly", {
				dayOfMonth: dayOfMonth.toString(),
				time: time,
			});
		}

		if (dayOfMonth === "first") {
			return t("variableNode.hint.scheduleMonthlyFirst", { time: time });
		}

		if (dayOfMonth === "last") {
			return t("variableNode.hint.scheduleMonthlyLast", { time: time });
		}
	}

	return null;
};

// ==================== Update operation text generator (for node display) ====================

// /**
//  * Get display text for update operation type
//  * For some operations (such as add, subtract, etc.), no text is needed as it's reflected in the value
//  */
// export const getUpdateOperationLabel = (
// 	operationType: UpdateVarValueOperation,
// ): string => {
// 	const operationLabels: Record<UpdateVarValueOperation, string> = {
// 		set: "Set to",
// 		add: "", // Shown as +5 format
// 		subtract: "", // Shown as -5 format
// 		multiply: "", // Shown as ×5 format
// 		divide: "", // Shown as ÷5 format
// 		max: "Take max value",
// 		min: "Take min value",
// 		toggle: "Toggle",
// 		append: "Append",
// 		remove: "Remove",
// 		clear: "Clear",
// 	};
// 	return operationLabels[operationType] || operationType;
// };

/**
 * Format update operation value display
 */
export const formatUpdateOperationValue = (
	value: string | number | boolean | string[] | null,
	operationType: UpdateVarValueOperation,
): string => {
	if (value === null || value === undefined) {
		return "";
	}

	// If it's clear or toggle operation, no need to display value
	if (operationType === "clear" || operationType === "toggle") {
		return "";
	}

	// If it's an array (enum type)
	if (Array.isArray(value)) {
		return value.length > 0 ? `[${value.join(", ")}]` : "[]";
	}

	// If it's a boolean value
	if (typeof value === "boolean") {
		return value ? "True" : "False";
	}

	const stringValue = String(value);

	// For add operation, add + prefix
	if (operationType === "add") {
		return `+${stringValue}`;
	}

	// For subtract operation, add - prefix
	if (operationType === "subtract") {
		return `-${stringValue}`;
	}

	// For multiply operation, add × symbol
	if (operationType === "multiply") {
		return `×${stringValue}`;
	}

	// For divide operation, add ÷ symbol
	if (operationType === "divide") {
		return `÷${stringValue}`;
	}

	return stringValue;
};
