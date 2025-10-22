import type {
	TimerTrigger,
	UpdateVarValueOperation,
	VariableConfig,
} from "@/types/node/variable-node";
import {
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import { SystemVariable } from "@/types/variable";
import { generateVariableHighlight, generateValueHighlight, formatUpdateOperationValue } from "../../variable-node-utils";
import type { TriggerType, DataFlowTrigger } from "@/types/node/variable-node";


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
export const getUpdateOperationLabel = (type: UpdateVarValueOperation, t: (key: string) => string): string => {
	const labels: Record<UpdateVarValueOperation, string> = {
		set: "=",
		add: "+=",
		subtract: "-=",
		multiply: "*=",
		divide: "/=",
		max: "max",
		min: "min",
		toggle: "Toggle",
		append: "追加",
		remove: "移除",
		clear: "清空",
	};
	return labels[type];
};

// 获取变量配置的简要描述
export const getVariableConfigDescription = (
	config: VariableConfig,
	t: (key: string) => string,
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
		const opLabel = getUpdateOperationLabel(config.updateVarValueOperation, t);
		if (config.updateVarValueOperation === "toggle") {
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

// 生成触发条件文本（用于节点面板显示）
export const generateTriggerConditionText = (
	config: VariableConfig,
	t: (key: string) => string,
): string | null => {
	const effectiveTriggerType = getEffectiveTriggerType(config);

	if (effectiveTriggerType === "condition") {
		// 条件触发模式
		const conditionTrigger = config.triggerConfig?.type === "condition"
			? config.triggerConfig.config
			: null;

		if (!conditionTrigger) return null;

		const nodeName = conditionTrigger.fromNodeName;
		const caseLabel = conditionTrigger.triggerType === "case"
			? `Case ${conditionTrigger.caseId}`
			: "Else";

		if (!nodeName) return null;

		return `${t("variableNode.triggerCase")}: ${nodeName}/${caseLabel}`;
	}

	if (effectiveTriggerType === "timer") {
		// 定时触发模式
		const timerConfig = getTimerTriggerConfig(config);
		if (!timerConfig) return null;

		if (timerConfig.mode === "interval") {
			// 固定间隔模式
			const unitMap = {
				second: "秒",
				minute: "分钟",
				hour: "小时",
				day: "天",
			};
			return `固定间隔: 每${timerConfig.interval}${unitMap[timerConfig.unit]}`;
		}

		if (timerConfig.mode === "scheduled") {
			// 定时执行模式
			const { repeatMode } = timerConfig;

			if (repeatMode === "hourly") {
				const { hourlyInterval, minuteOfHour } = timerConfig;
				if (hourlyInterval === 1) {
					return `定时执行: 每小时第${minuteOfHour}分钟`;
				}
				return `定时执行: 每${hourlyInterval}小时第${minuteOfHour}分钟`;
			}

			if (repeatMode === "daily") {
				const { time, daysOfWeek } = timerConfig;
				let text = `定时执行: 每天 ${time}`;

				if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
					const weekdayMap: Record<number, string> = {
						1: "周一", 2: "周二", 3: "周三", 4: "周四",
						5: "周五", 6: "周六", 7: "周日",
					};
					const weekdayNames = daysOfWeek.map((d) => weekdayMap[d]).join("、");
					text += ` (${weekdayNames})`;
				}

				return text;
			}

			if (repeatMode === "weekly") {
				const { time, dayOfWeek } = timerConfig;
				const weekdayMap: Record<number, string> = {
					1: "周一", 2: "周二", 3: "周三", 4: "周四",
					5: "周五", 6: "周六", 7: "周日",
				};
				return `定时执行: 每周${weekdayMap[dayOfWeek]} ${time}`;
			}

			if (repeatMode === "monthly") {
				const { time, dayOfMonth } = timerConfig;

				if (typeof dayOfMonth === "number") {
					return `定时执行: 每月第${dayOfMonth}天 ${time}`;
				}

				if (dayOfMonth === "first") {
					return `定时执行: 每月第一天 ${time}`;
				}

				if (dayOfMonth === "last") {
					return `定时执行: 每月最后一天 ${time}`;
				}
			}
		}
	}

	if (effectiveTriggerType === "dataflow") {
		// 数据流触发模式
		const dataflowConfig = config.triggerConfig?.type === "dataflow"
			? config.triggerConfig.config
			: null;

		if (!dataflowConfig) return null;

		const fromNodeName = dataflowConfig.fromNodeName;
		const fromNodeType = dataflowConfig.fromNodeType;
		const fromVarConfigId = dataflowConfig.fromVarConfigId;
		const fromVarDisplayName = dataflowConfig.fromVarDisplayName || dataflowConfig.fromVar;

		if (!fromNodeName || !fromVarDisplayName) return null;

		// 获取节点类型标签
		const nodeTypeLabels: Record<string, string> = {
			indicatorNode: "指标",
			klineNode: "K线",
			variableNode: "变量",
			ifElseNode: "条件",
			startNode: "起点",
			futuresOrderNode: "合约订单",
			positionManagementNode: "持仓管理",
		};
		const nodeTypeLabel = nodeTypeLabels[fromNodeType] || "节点";

		// 构建完整路径：节点名称/节点类型配置ID/变量显示名称
		return `数据流: ${fromNodeName}/${nodeTypeLabel}${fromVarConfigId}/${fromVarDisplayName}`;
	}

	return null;
};



/**
 * 生成更新操作的文本（用于节点卡片显示）
 * 支持数据流模式下的特殊显示
 * 返回 React.ReactNode 以支持样式化的变量名
 */
export const generateUpdateOperationNodeText = (
	varDisplayName: string,
	operationType: UpdateVarValueOperation,
	operationValue: string | number | boolean | string[] | null,
	triggerType: TriggerType,
	t: (key: string) => string,
	dataflowTrigger?: DataFlowTrigger | null,
): React.ReactNode => {
	// 数据流模式下的特殊处理
	if (triggerType === "dataflow" && dataflowTrigger) {
		// max/min 操作
		if (operationType === "max" || operationType === "min") {
			const operationTypeLabel = operationType === "max" ? "最大值" : "最小值";
			return (
				<>
					取 {generateVariableHighlight(varDisplayName)} 与{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)} 中的{operationTypeLabel}
				</>
			);
		}

		// 加减乘除操作，显示运算符格式
		if (operationType === "add") {
			return (
				<>
					{generateVariableHighlight(varDisplayName)} +{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		if (operationType === "subtract") {
			return (
				<>
					{generateVariableHighlight(varDisplayName)} -{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		if (operationType === "multiply") {
			return (
				<>
					{generateVariableHighlight(varDisplayName)} ×{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		if (operationType === "divide") {
			return (
				<>
					{generateVariableHighlight(varDisplayName)} ÷{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		// set 操作
		if (operationType === "set") {
			return (
				<>
					设置为 {generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}
	}

	// 其他情况，使用标准格式
	const operationLabel = getUpdateOperationLabel(operationType, t);
	const formattedValue = formatUpdateOperationValue(operationValue, operationType);

	// 组合操作标签和值，对值添加样式
	if (operationLabel && formattedValue) {
		return (
			<>
				{operationLabel} {generateValueHighlight(formattedValue)}
			</>
		);
	}

	if (operationLabel) {
		return operationLabel;
	}

	if (formattedValue) {
		return generateValueHighlight(formattedValue);
	}

	return null;
};
