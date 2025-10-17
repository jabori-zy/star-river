import type {
	TimerTrigger,
	UpdateOperationType,
	VariableConfig,
} from "@/types/node/variable-node";
import {
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import { SystemVariable } from "@/types/variable";

// 获取变量类型的中文标签
export const getVariableLabel = (variable: string): string => {
	const variableMap: Record<string, string> = {
		[SystemVariable.POSITION_NUMBER]: "持仓数量",
		[SystemVariable.FILLED_ORDER_NUMBER]: "已成交订单数量",
	};
	return variableMap[variable] || variable;
};

// 获取变量触发类型的中文标签
export const getVariableTypeLabel = (type: "condition" | "timer"): string => {
	if (type === "condition") {
		return "条件触发";
	} else if (type === "timer") {
		return "定时触发";
	}
	return type;
};

// 格式化交易对显示
export const formatSymbolDisplay = (symbol: string | null): string => {
	return symbol || "全部交易对";
};

// 格式化定时配置显示
export const getTimerConfigDisplay = (timerConfig: TimerTrigger): string => {
	if (timerConfig.mode === "interval") {
		const unitMap = {
			second: "秒",
			minute: "分钟",
			hour: "小时",
			day: "天",
		};
		return `${timerConfig.interval}${unitMap[timerConfig.unit]}`;
	} else {
		// scheduled 模式
		const { repeatMode } = timerConfig;
		let description = "";

		// 每小时模式：显示间隔
		if (repeatMode === "hourly") {
			const { hourlyInterval, minuteOfHour } = timerConfig;
			description =
				hourlyInterval === 1
					? `每小时 第${minuteOfHour}分钟`
					: `每${hourlyInterval}小时 第${minuteOfHour}分钟`;
			return description;
		}

		// 其他模式
		const repeatMap = {
			daily: "每天",
			weekly: "每周",
			monthly: "每月",
		};
		description = repeatMap[repeatMode as "daily" | "weekly" | "monthly"];

		// 每周模式：添加星期信息
		if (repeatMode === "weekly") {
			const { dayOfWeek } = timerConfig;
			const weekdayMap: Record<number, string> = {
				1: "周一",
				2: "周二",
				3: "周三",
				4: "周四",
				5: "周五",
				6: "周六",
				7: "周日",
			};
			description += ` ${weekdayMap[dayOfWeek] || ""}`;
		}

		// 每天模式：添加星期信息（如果有选择）
		if (repeatMode === "daily") {
			const { daysOfWeek } = timerConfig;
			if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
				const weekdayMap: Record<number, string> = {
					1: "一",
					2: "二",
					3: "三",
					4: "四",
					5: "五",
					6: "六",
					7: "日",
				};
				const weekdayNames = daysOfWeek.map((d) => weekdayMap[d]).join(",");
				description += ` (周${weekdayNames})`;
			}
		}

		// 每月模式：添加日期信息
		if (repeatMode === "monthly") {
			const { dayOfMonth } = timerConfig;
			if (typeof dayOfMonth === "number") {
				description += ` 第${dayOfMonth}天`;
			} else {
				const dayMap: Record<string, string> = {
					first: "第一天",
					last: "最后一天",
				};
				description += ` ${dayMap[dayOfMonth]}`;
			}
		}

		description += ` ${timerConfig.time}`;
		return description;
	}
};

// 获取更新操作类型的显示文本
export const getUpdateOperationLabel = (type: UpdateOperationType): string => {
	const labels: Record<UpdateOperationType, string> = {
		set: "=",
		add: "+=",
		subtract: "-=",
		multiply: "*=",
		divide: "/=",
		max: "max",
		min: "min",
		toggle: "toggle",
		append: "追加",
		remove: "移除",
		clear: "清空",
	};
	return labels[type];
};

// 获取变量配置的简要描述
export const getVariableConfigDescription = (
	config: VariableConfig,
): string => {
	const variableText = getVariableLabel(config.varName);
	const effectiveTriggerType = getEffectiveTriggerType(config);
	const timerConfig = getTimerTriggerConfig(config);

	if (config.varOperation === "get") {
		const symbolText = formatSymbolDisplay(("symbol" in config ? config.symbol : null) || null);
		const typeText = getVariableTypeLabel(
			effectiveTriggerType === "timer" || effectiveTriggerType === "condition"
				? effectiveTriggerType
				: "condition",
		);

		let description = `${symbolText} - ${variableText} (${typeText})`;
		if (effectiveTriggerType === "timer" && timerConfig) {
			description += ` - ${getTimerConfigDisplay(timerConfig)}`;
		}

		return description;
	} else if (config.varOperation === "update") {
		// update 模式
		const opLabel = getUpdateOperationLabel(config.updateOperationType);
		if (config.updateOperationType === "toggle") {
			return `更新变量 - ${variableText} (${opLabel})`;
		}
		return `更新变量 - ${variableText} ${opLabel}`;
	} else {
		// reset 模式
		const typeText = getVariableTypeLabel(
			effectiveTriggerType === "timer" || effectiveTriggerType === "condition"
				? effectiveTriggerType
				: "condition",
		);
		let description = `重置变量 - ${variableText} (${typeText})`;

		if (effectiveTriggerType === "timer" && timerConfig) {
			description += ` - ${getTimerConfigDisplay(timerConfig)}`;
		}

		return description;
	}
};

// 获取变量配置的状态标签
export const getVariableConfigStatusLabel = (
	config: VariableConfig,
): string => {
	if (!config.varName) {
		return "未选择变量类型";
	}

	const effectiveTriggerType = getEffectiveTriggerType(config);
	const timerConfig = getTimerTriggerConfig(config);

	if (config.varOperation === "get") {
		if (!config.varDisplayName?.trim()) {
			return "未设置名称";
		}
		if (
			effectiveTriggerType === "timer" &&
			!timerConfig
		) {
			return "未配置定时器";
		}
	} else if (config.varOperation === "update") {
		// update 模式
		// toggle 和 clear 不需要更新值，其他操作需要
		if (
			config.updateOperationType !== "toggle" &&
			config.updateOperationType !== "clear"
		) {
			// 这里不检查 varValue，因为 update 模式没有 varValue 字段
		}
	} else {
		// reset 模式
		if (
			effectiveTriggerType === "timer" &&
			!timerConfig
		) {
			return "未配置定时器";
		}
	}

	return "配置完成";
};

// 检查变量配置是否完整
export const isVariableConfigComplete = (config: VariableConfig): boolean => {
	if (!config.varName) {
		return false;
	}

	const effectiveTriggerType = getEffectiveTriggerType(config);
	const hasTimerConfig = !!getTimerTriggerConfig(config);

	if (config.varOperation === "get") {
		if (!config.varDisplayName?.trim()) {
			return false;
		}
		if (effectiveTriggerType === "timer" && !hasTimerConfig) {
			return false;
		}
	} else if (config.varOperation === "update") {
		// update 模式
		// toggle 和 clear 不需要更新值，其他操作需要
		// 这里不检查具体的值，因为 update 模式的值验证由组件内部处理
	} else {
		// reset 模式
		if (effectiveTriggerType === "timer" && !hasTimerConfig) {
			return false;
		}
	}

	return true;
};
