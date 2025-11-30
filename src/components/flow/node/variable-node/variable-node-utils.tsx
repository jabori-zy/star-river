import { Clock, Filter, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
	TimerTrigger,
	ConditionTrigger,
	TriggerType,
	UpdateVarValueOperation,
	VariableConfig,
} from "@/types/node/variable-node";
import { getEffectiveTriggerType } from "@/types/node/variable-node";
import {
	getSystemVariableMetadata,
	SystemVariableType,
} from "@/types/variable";
import type { TFunction } from "i18next";
/**
 * 获取变量类型的中文名称（仅用于系统变量）
 * 对于自定义变量，应该直接返回变量名
 */
export const getVariableLabel = (type: string, t: TFunction): string => {
	// 检查是否是系统变量
	if (Object.values(SystemVariableType).includes(type as SystemVariableType)) {
		const metadata = getSystemVariableMetadata(t)[type as SystemVariableType];
		return metadata.varDisplayName;
	}
	// 自定义变量直接返回变量名（变量名通常就是 varName）
	return type;
};

/**
 * 生成默认变量名称
 */
export const generateVariableName = (
	variableType: string,
	existingConfigsLength: number,
	t: TFunction,
	customVariables?: Array<{ varName: string; varDisplayName: string }>,
): string => {
	let typeLabel: string;

	// 检查是否是系统变量
	if (Object.values(SystemVariableType).includes(variableType as SystemVariableType)) {
		typeLabel = getVariableLabel(variableType, t);
	} else if (customVariables) {
		// 自定义变量：从列表中查找 varDisplayName
		const customVar = customVariables.find((v) => v.varName === variableType);
		typeLabel = customVar?.varDisplayName || variableType;
	} else {
		// 如果没有提供自定义变量列表，使用变量名本身
		typeLabel = variableType;
	}

	const nextIndex = existingConfigsLength + 1;
	return `${typeLabel}${nextIndex}`;
};

/**
 * 检查是否存在重复配置（相同交易对+变量类型+触发方式）
 * 只对 get 操作进行重复检查
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
 * 获取更新操作的输入框占位符文本
 */
export const getUpdateOperationPlaceholder = (
	operationType: UpdateVarValueOperation,
): string => {
	const placeholderMap: Record<UpdateVarValueOperation, string> = {
		set: "输入新值",
		add: "输入增加值",
		subtract: "输入减少值",
		multiply: "输入乘数",
		divide: "输入除数",
		max: "输入比较值",
		min: "输入比较值",
		toggle: "输入值",
		append: "输入要添加的值",
		remove: "输入要删除的值",
		clear: "输入值",
	};
	return placeholderMap[operationType] || "输入值";
};

/**
 * 从 TriggerCase 获取触发标签
 * @param triggerCase 触发配置
 * @returns 触发标签（如 "Case 1" 或 "Else"）
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
 * 触发类型配置
 */
export interface TriggerTypeInfo {
	icon: LucideIcon;
	label: string;
	color: string;
	badgeColor: string;
}

/**
 * 触发类型元数据映射表
 */
const TRIGGER_TYPE_METADATA: Record<TriggerType, TriggerTypeInfo> = {
	condition: {
		icon: Filter,
		label: "条件触发",
		color: "text-orange-500",
		badgeColor: "bg-orange-100 text-orange-800",
	},
	timer: {
		icon: Clock,
		label: "定时触发",
		color: "text-blue-500",
		badgeColor: "bg-blue-100 text-blue-800",
	},
	dataflow: {
		icon: Workflow,
		label: "数据流触发",
		color: "text-blue-500",
		badgeColor: "bg-emerald-100 text-emerald-800",
	},
};

/**
 * 获取触发类型的图标
 * @param triggerType 触发类型
 * @returns 图标组件
 */
export const getTriggerTypeIcon = (triggerType: TriggerType): LucideIcon => {
	return TRIGGER_TYPE_METADATA[triggerType].icon;
};

/**
 * 获取触发类型的标签文本
 * @param triggerType 触发类型
 * @param t i18n 翻译函数
 * @returns 标签文本
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
 * 获取触发类型的颜色样式类名
 * @param triggerType 触发类型
 * @returns Tailwind 颜色类名
 */
export const getTriggerTypeColor = (triggerType: TriggerType): string => {
	return TRIGGER_TYPE_METADATA[triggerType].color;
};

/**
 * 获取触发类型的 Badge 颜色样式类名
 * @param triggerType 触发类型
 * @returns Tailwind Badge 颜色类名
 */
export const getTriggerTypeBadgeColor = (triggerType: TriggerType): string => {
	return TRIGGER_TYPE_METADATA[triggerType].badgeColor;
};

/**
 * 获取触发类型的完整信息
 * @param triggerType 触发类型
 * @param t i18n 翻译函数
 * @returns 触发类型信息对象
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

// ==================== 公共辅助组件和函数 ====================

/**
 * 生成变量名高亮元素
 */
export const generateVariableHighlight = (name?: string): React.ReactNode => {
	if (!name) return null;
	return <span className="text-orange-600 font-medium">{name}</span>;
};

/**
 * 生成值高亮元素
 */
export const generateValueHighlight = (value: string): React.ReactNode => {
	return <span className="text-blue-600 font-medium">{value}</span>;
};

export const generateSymbolHighlight = (symbol?: string): React.ReactNode => {
	if (!symbol) return null;
	return (
		<span className="text-indigo-600 font-medium">
			{symbol}
		</span>
	);
};

/**
 * 生成定时触发的时间间隔前缀文案
 * @param timerConfig 定时配置
 * @returns 时间间隔文案，如 "每5分钟，" 或 null
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
			return t("variableNode.hint.intervalSecond", { interval: interval.toString() });
		case "minute":
			return t("variableNode.hint.intervalMinute", { interval: interval.toString() });
		case "hour":
			return t("variableNode.hint.intervalHour", { interval: interval.toString() });
		case "day":
			return t("variableNode.hint.intervalDay", { interval: interval.toString() });
	}
	return null;
};

/**
 * 生成定时执行模式的前缀文案
 * @param timerConfig 定时配置
 * @returns 定时执行文案，如 "每小时的第30分钟，" 或 null
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
		// 每小时: 每{}小时的第{}分钟，
		const { hourlyInterval, minuteOfHour } = timerConfig;
		if (hourlyInterval === 1) {
			return t("variableNode.hint.scheduleHourlyOne", { minute: minuteOfHour.toString() });
		}
		return t("variableNode.hint.scheduleHourly", { hourlyInterval: hourlyInterval.toString(), minute: minuteOfHour.toString() });
	}

	if (repeatMode === "daily") {
		// 每天: 每天 {}:{} (周一，周二...)
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

		// 如果选择了特定的星期，添加星期信息
		if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
			const weekdayNames = daysOfWeek.map((d) => weekdayMap[d]).join("、");
			prefix += ` (${weekdayNames})`;
		}

		return `${prefix}，`;
	}

	if (repeatMode === "weekly") {
		// 每周: 每周{三} {}:{}
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
		return t("variableNode.hint.scheduleWeekly", { weekday: weekdayName, time: time });
	}

	if (repeatMode === "monthly") {
		// 每月: 每月第{}天的{}:{}，每个月的最后一天
		const { time, dayOfMonth } = timerConfig;

		if (typeof dayOfMonth === "number") {
			return t("variableNode.hint.scheduleMonthly", { dayOfMonth: dayOfMonth.toString(), time: time });
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

// ==================== 更新操作文本生成器（用于节点显示）====================

/**
 * 获取更新操作类型的显示文本
 * 对于某些操作（如增加、减少等），不需要显示文本，因为会在值中体现
 */
export const getUpdateOperationLabel = (operationType: UpdateVarValueOperation): string => {
	const operationLabels: Record<UpdateVarValueOperation, string> = {
		set: "设置为",
		add: "",  // 通过 +5 的格式体现
		subtract: "",  // 通过 -5 的格式体现
		multiply: "",  // 通过 ×5 的格式体现
		divide: "",  // 通过 ÷5 的格式体现
		max: "取最大值",
		min: "取最小值",
		toggle: "切换",
		append: "添加",
		remove: "删除",
		clear: "清空",
	};
	return operationLabels[operationType] || operationType;
};

/**
 * 格式化更新操作的值显示
 */
export const formatUpdateOperationValue = (
	value: string | number | boolean | string[] | null,
	operationType: UpdateVarValueOperation,
): string => {
	if (value === null || value === undefined) {
		return "";
	}

	// 如果是清空或切换操作，不需要显示值
	if (operationType === "clear" || operationType === "toggle") {
		return "";
	}

	// 如果是数组（枚举类型）
	if (Array.isArray(value)) {
		return value.length > 0 ? `[${value.join("、")}]` : "[]";
	}

	// 如果是布尔值
	if (typeof value === "boolean") {
		return value ? "True" : "False";
	}

	const stringValue = String(value);

	// 对于增加操作，添加 + 前缀
	if (operationType === "add") {
		return `+${stringValue}`;
	}

	// 对于减少操作，添加 - 前缀
	if (operationType === "subtract") {
		return `-${stringValue}`;
	}

	// 对于乘法操作，添加 × 符号
	if (operationType === "multiply") {
		return `×${stringValue}`;
	}

	// 对于除法操作，添加 ÷ 符号
	if (operationType === "divide") {
		return `÷${stringValue}`;
	}

	return stringValue;
};


