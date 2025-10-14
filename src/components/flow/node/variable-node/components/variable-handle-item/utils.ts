import {
	type TimerConfig,
	type VariableConfig,
	type UpdateOperationType,
} from "@/types/node/variable-node";
import { SystemVariable} from "@/types/variable";

// 获取变量类型的中文标签
export const getVariableLabel = (variable: string): string => {
	const variableMap: Record<string, string> = {
		[SystemVariable.POSITION_NUMBER]: "持仓数量",
		[SystemVariable.Filled_ORDER_NUMBER]: "已成交订单数量",
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
export const getTimerConfigDisplay = (timerConfig: TimerConfig): string => {
	const unitMap = {
		second: "秒",
		minute: "分钟",
		hour: "小时",
		day: "天",
	};

	return `${timerConfig.interval}${unitMap[timerConfig.unit]}`;
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
	};
	return labels[type];
};

// 获取变量配置的简要描述
export const getVariableConfigDescription = (
	config: VariableConfig,
): string => {
	const variableText = getVariableLabel(config.varName);

	if (config.varOperation === "get") {
		const symbolText = formatSymbolDisplay(config.symbol || null);
		const typeText = getVariableTypeLabel(config.varTriggerType);

		let description = `${symbolText} - ${variableText} (${typeText})`;

		if (config.varTriggerType === "timer" && config.timerConfig) {
			description += ` - ${getTimerConfigDisplay(config.timerConfig)}`;
		}

		return description;
	} else {
		// update 模式
		const opLabel = getUpdateOperationLabel(config.updateOperationType);
		if (config.updateOperationType === "toggle") {
			return `更新变量 - ${variableText} (${opLabel})`;
		}
		return `更新变量 - ${variableText} ${opLabel} ${String(config.varValue)}`;
	}
};

// 获取变量配置的状态标签
export const getVariableConfigStatusLabel = (
	config: VariableConfig,
): string => {
	if (!config.varName) {
		return "未选择变量类型";
	}

	if (config.varOperation === "get") {
		if (!config.varDisplayName?.trim()) {
			return "未设置名称";
		}
		if (config.varTriggerType === "timer" && !config.timerConfig) {
			return "未配置定时器";
		}
	} else {
		// update 模式
		// toggle 不需要更新值，其他操作需要
		if (config.updateOperationType !== "toggle" && !config.varValue) {
			return "未设置更新值";
		}
	}

	return "配置完成";
};

// 检查变量配置是否完整
export const isVariableConfigComplete = (config: VariableConfig): boolean => {
	if (!config.varName) {
		return false;
	}

	if (config.varOperation === "get") {
		if (!config.varDisplayName?.trim()) {
			return false;
		}
		if (config.varTriggerType === "timer" && !config.timerConfig) {
			return false;
		}
	} else {
		// update 模式
		// toggle 不需要更新值，其他操作需要
		if (config.updateOperationType !== "toggle" && !config.varValue) {
			return false;
		}
	}

	return true;
};
