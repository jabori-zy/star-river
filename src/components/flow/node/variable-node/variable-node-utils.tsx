import { Clock, Filter, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
	TimerTrigger,
	TimerUnit,
	ConditionTrigger,
	DataFlowTrigger,
	TriggerType,
	UpdateOperationType,
	VariableConfig,
	VariableOperation,
} from "@/types/node/variable-node";
import { getEffectiveTriggerType } from "@/types/node/variable-node";
import {
	SYSTEM_VARIABLE_METADATA,
	SystemVariable,
	VariableValueType,
} from "@/types/variable";

/**
 * 获取变量类型的中文名称（仅用于系统变量）
 * 对于自定义变量，应该直接返回变量名
 */
export const getVariableLabel = (type: string): string => {
	// 检查是否是系统变量
	if (Object.values(SystemVariable).includes(type as SystemVariable)) {
		const metadata = SYSTEM_VARIABLE_METADATA[type as SystemVariable];
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
	customVariables?: Array<{ varName: string; varDisplayName: string }>,
): string => {
	let typeLabel: string;

	// 检查是否是系统变量
	if (Object.values(SystemVariable).includes(variableType as SystemVariable)) {
		typeLabel = getVariableLabel(variableType);
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
	operationType: UpdateOperationType,
): string => {
	const placeholderMap: Record<UpdateOperationType, string> = {
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
 * @returns 标签文本
 */
export const getTriggerTypeLabel = (triggerType: TriggerType): string => {
	return TRIGGER_TYPE_METADATA[triggerType].label;
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
 * @returns 触发类型信息对象
 */
export const getTriggerTypeInfo = (triggerType: TriggerType): TriggerTypeInfo => {
	return TRIGGER_TYPE_METADATA[triggerType];
};

// ==================== 公共辅助组件和函数 ====================

/**
 * 生成触发条件前缀
 * 支持条件触发和定时触发两种模式（interval 和 scheduled）
 */
const generateTriggerPrefix = ({
	conditionTrigger,
	timerTrigger,
}: {
	conditionTrigger?: ConditionTrigger | null;
	timerTrigger?: TimerTrigger;
}): React.ReactNode | null => {
	// 定时触发模式：优先检查 scheduled 模式
	if (timerTrigger?.mode === "scheduled") {
		const schedulePrefix = generateSchedulePrefix(timerTrigger);
		if (schedulePrefix) {
			return schedulePrefix;
		}
	}

	// 定时触发模式：检查 interval 模式
	const timerPrefix = generateTimerIntervalPrefix(timerTrigger);
	if (timerPrefix) {
		return timerPrefix;
	}

	// 条件触发模式：生成条件分支前缀
	if (!conditionTrigger) return null;

	const triggerNodeName = conditionTrigger.fromNodeName;
	const triggerCaseLabel = getTriggerCaseLabel(conditionTrigger);

	if (!triggerNodeName || !triggerCaseLabel) return null;

	return (
		<>
			当{" "}
			<span className="text-blue-600 font-medium">
				{triggerNodeName}/{triggerCaseLabel}
			</span>{" "}
			分支满足时，
		</>
	);
};

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

const generateGetSymbolHint = (
	triggerPrefix: React.ReactNode,
	symbol: string,
	variableDisplayName?: string,
): React.ReactNode => {
	return (
		<>
			{triggerPrefix}
			将会获取 {generateSymbolHighlight(symbol)} {" "}
			{generateVariableHighlight(variableDisplayName)} 的值
		</>
	);
};

/**
 * 提示生成器参数类型
 */
interface HintGeneratorParams {
	varOperation: VariableOperation;
	variableDisplayName?: string;
	operationType?: UpdateOperationType;
	value?: string;
	selectedValues?: string[];
	conditionTrigger?: ConditionTrigger | null;
	timerTrigger?: TimerTrigger;
	dataflowTrigger?: DataFlowTrigger | null;
	symbol?: string;
}

/**
 * 获取时间单位的中文显示
 */
const getTimerUnitLabel = (unit: TimerUnit): string => {
	const labels: Record<TimerUnit, string> = {
		second: "秒",
		minute: "分钟",
		hour: "小时",
		day: "天",
	};
	return labels[unit];
};

/**
 * 生成定时触发的时间间隔前缀文案
 * @param timerConfig 定时配置
 * @returns 时间间隔文案，如 "每5分钟，" 或 null
 */
export const generateTimerIntervalPrefix = (
	timerConfig?: TimerTrigger,
): string | null => {
	if (!timerConfig || timerConfig.mode !== "interval") {
		return null;
	}

	const { interval, unit } = timerConfig;
	const unitLabel = getTimerUnitLabel(unit);

	return `每${interval}${unitLabel}，`;
};

/**
 * 生成定时执行模式的前缀文案
 * @param timerConfig 定时配置
 * @returns 定时执行文案，如 "每小时的第30分钟，" 或 null
 */
export const generateSchedulePrefix = (
	timerConfig?: TimerTrigger,
): string | null => {
	if (!timerConfig || timerConfig.mode !== "scheduled") {
		return null;
	}

	const { repeatMode } = timerConfig;

	if (repeatMode === "hourly") {
		// 每小时: 每{}小时的第{}分钟，
		const { hourlyInterval, minuteOfHour } = timerConfig;
		if (hourlyInterval === 1) {
			return `每小时的第${minuteOfHour}分钟，`;
		}
		return `每${hourlyInterval}小时的第${minuteOfHour}分钟，`;
	}

	if (repeatMode === "daily") {
		// 每天: 每天 {}:{} (周一，周二...)
		const { time, daysOfWeek } = timerConfig;
		const weekdayMap: Record<number, string> = {
			1: "周一",
			2: "周二",
			3: "周三",
			4: "周四",
			5: "周五",
			6: "周六",
			7: "周日",
		};

		let prefix = `每天 ${time}`;

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
			1: "一",
			2: "二",
			3: "三",
			4: "四",
			5: "五",
			6: "六",
			7: "日",
		};
		const weekdayName = weekdayMap[dayOfWeek] || "";
		return `每周${weekdayName}的 ${time}，`;
	}

	if (repeatMode === "monthly") {
		// 每月: 每月第{}天的{}:{}，每个月的最后一天
		const { time, dayOfMonth } = timerConfig;

		if (typeof dayOfMonth === "number") {
			return `每月第${dayOfMonth}天的 ${time}，`;
		}

		if (dayOfMonth === "first") {
			return `每月第一天的 ${time}，`;
		}

		if (dayOfMonth === "last") {
			return `每月最后一天的 ${time}，`;
		}
	}

	return null;
};

/**
 * 生成数据流触发的提示文本（统一样式）
 * @param variableDisplayName 变量显示名称
 * @param dataflowInfo 数据流信息对象，包含来源节点和变量信息
 * @param operationType 可选的更新操作类型，用于 max/min 的特殊显示
 * @returns React.ReactNode 提示文本的 JSX
 */
export const generateDataflowHint = (
	variableDisplayName: string,
	dataflowInfo: {
		fromNodeName: string;
		fromNodeType: string | null;
		fromVarConfigId: number;
		fromVarDisplayName: string;
	},
	operationType?: UpdateOperationType,
): React.ReactNode => {
	const { fromNodeName, fromNodeType, fromVarConfigId, fromVarDisplayName } =
		dataflowInfo;

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
	const nodeTypeLabel = fromNodeType ? nodeTypeLabels[fromNodeType] || "节点" : "节点";

	// 构建完整路径：节点名称/节点类型配置ID/变量显示名称
	const fullPath = `${fromNodeName}/${nodeTypeLabel}${fromVarConfigId}/${fromVarDisplayName}`;

	// 对于 max/min 操作，显示特殊文案
	if (operationType === "max" || operationType === "min") {
		const operationLabel = operationType === "max" ? "最大值" : "最小值";
		return (
			<>
				取{" "}
				{generateVariableHighlight(variableDisplayName)} 与{" "}
				{generateValueHighlight(fullPath)} 中的{operationLabel}
			</>
		);
	}

	// 对于加减乘除操作，显示运算符格式
	if (operationType === "add") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} +{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	if (operationType === "subtract") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} -{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	if (operationType === "multiply") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} ×{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	if (operationType === "divide") {
		return (
			<>
				{generateVariableHighlight(variableDisplayName)} ÷{" "}
				{generateValueHighlight(fullPath)}
			</>
		);
	}

	// 其他操作（set等），使用默认的"将被设置为"
	return (
		<>
			{generateVariableHighlight(variableDisplayName)} 将被设置为{" "}
			{generateValueHighlight(fullPath)}
		</>
	);
};

// ==================== 按变量类型拆分的处理器 ====================

/**
 * BOOLEAN 类型提示生成器
 */
const generateBooleanHint = (params: HintGeneratorParams): React.ReactNode => {
	const {
		variableDisplayName,
		varOperation,
		operationType,
		value,
		conditionTrigger,
		timerTrigger,
		dataflowTrigger,
		symbol,
	} = params;
	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
	});

	const valueLabel = value === "false" ? "False" : "True";

	if (varOperation === "update") {
		if (operationType === "toggle") {
			return (
				<>
					{triggerPrefix}
					{generateVariableHighlight(variableDisplayName)} 将在 True/False 之间切换
				</>
			);
		}

		if (operationType === "set") {
			// 数据流模式下，显示来源变量
			if (dataflowTrigger && dataflowTrigger.fromVarDisplayName) {
				return (
					<>
						{generateVariableHighlight(variableDisplayName)} 将被设置为{" "}
						{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
					</>
				);
			}

			// 其他模式下，显示具体值
			if (value) {
				return (
					<>
						{triggerPrefix}
						{generateVariableHighlight(variableDisplayName)} 将被设置为{" "}
						{generateValueHighlight(valueLabel)}
					</>
				);
			}
		}

		return null;
	}

	if (varOperation === "reset") {
		if (!value) return null;

		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)} 将被重置为{" "}
				{generateValueHighlight(valueLabel)}
			</>
		);
	}

	if (varOperation === "get") {
		if (symbol) {
			return generateGetSymbolHint(triggerPrefix, symbol, variableDisplayName);
		}
		if (value) {
			return (
				<>
					{triggerPrefix}
					{generateVariableHighlight(variableDisplayName)} 当前值为{" "}
					{generateValueHighlight(valueLabel)}
				</>
			);
		}

		return (
			<>
				{triggerPrefix}
				将会获取 {generateVariableHighlight(variableDisplayName)} 的值
			</>
		);
	}

	return null;
};

/**
 * ENUM 类型提示生成器
 */
const generateEnumHint = (params: HintGeneratorParams): React.ReactNode => {
	const {
		variableDisplayName,
		varOperation,
		operationType,
		selectedValues,
		value,
		conditionTrigger,
		timerTrigger,
		dataflowTrigger,
		symbol,
	} = params;
	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
	});

	const hasValues = selectedValues && selectedValues.length > 0;
	const valueList = hasValues ? selectedValues.join("、") : "";
	const displayValue = hasValues
		? `[${valueList}]`
		: value !== undefined && value !== null && value !== ""
			? value
			: "[]";

	const operationTextMap: Record<string, string> = {
		set: "将被设置为",
		append: "将会添加",
		remove: "将会删除",
	};

	if (varOperation === "update") {
		if (operationType === "clear") {
			return (
				<>
					{triggerPrefix}
					{generateVariableHighlight(variableDisplayName)}{" "}
					将被清空，所有元素将被移除
				</>
			);
		}

		// 数据流模式下的 set 操作，显示来源变量
		if (operationType === "set" && dataflowTrigger && dataflowTrigger.fromVarDisplayName) {
			return (
				<>
					{generateVariableHighlight(variableDisplayName)} 将被设置为{" "}
					{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
				</>
			);
		}

		const operationText = operationTextMap[operationType || ""];
		if (operationText) {
			return (
				<>
					{triggerPrefix}
					{generateVariableHighlight(variableDisplayName)} {operationText}{" "}
					{generateValueHighlight(displayValue)}
				</>
			);
		}

		return null;
	}

	if (varOperation === "reset") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)} 将被重置为{" "}
				{generateValueHighlight(displayValue)}
			</>
		);
	}

	if (varOperation === "get") {
		if (symbol) {
			return generateGetSymbolHint(triggerPrefix, symbol, variableDisplayName);
		}

		if (displayValue !== "[]") {
			return (
				<>
					{triggerPrefix}
					{generateVariableHighlight(variableDisplayName)} 当前值为{" "}
					{generateValueHighlight(displayValue)}
				</>
			);
		}

		return (
			<>
				{triggerPrefix}
				将会获取 {generateVariableHighlight(variableDisplayName)} 的值
			</>
		);
	}

	return null;
};

/**
 * 数值类型提示生成器（NUMBER, STRING, TIME, PERCENTAGE 共用）
 */
const generateNumericHint = (params: HintGeneratorParams): React.ReactNode => {
	const {
		variableDisplayName,
		varOperation,
		operationType,
		value,
		conditionTrigger,
		timerTrigger,
		dataflowTrigger,
		symbol,
	} = params;

	const triggerPrefix = generateTriggerPrefix({
		conditionTrigger,
		timerTrigger,
	});

	if (varOperation === "update") {
		if (!operationType) return null;

		// 数据流模式下的特殊处理
		if (dataflowTrigger && dataflowTrigger.fromVarDisplayName) {
			// max/min 操作
			if (operationType === "max" || operationType === "min") {
				const operationTypeLabel = operationType === "max" ? "最大值" : "最小值";
				return (
					<>
						{generateVariableHighlight(variableDisplayName)} 取{" "}
						{generateVariableHighlight(variableDisplayName)} 与{" "}
						{generateValueHighlight(dataflowTrigger.fromVarDisplayName)} 中的{operationTypeLabel}
					</>
				);
			}

			// 加减乘除操作，显示运算符格式
			if (operationType === "add") {
				return (
					<>
						{generateVariableHighlight(variableDisplayName)} +{" "}
						{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
					</>
				);
			}

			if (operationType === "subtract") {
				return (
					<>
						{generateVariableHighlight(variableDisplayName)} -{" "}
						{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
					</>
				);
			}

			if (operationType === "multiply") {
				return (
					<>
						{generateVariableHighlight(variableDisplayName)} ×{" "}
						{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
					</>
				);
			}

			if (operationType === "divide") {
				return (
					<>
						{generateVariableHighlight(variableDisplayName)} ÷{" "}
						{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
					</>
				);
			}

			// set 操作，显示"将被设置为"
			if (operationType === "set") {
				return (
					<>
						{generateVariableHighlight(variableDisplayName)} 将被设置为{" "}
						{generateValueHighlight(dataflowTrigger.fromVarDisplayName)}
					</>
				);
			}
		}

		// 其他情况需要有值
		if (!value) return null;

		const operationTextMap: Record<UpdateOperationType, string> = {
			set: "将被设置为",
			add: "将增加",
			subtract: "将减少",
			multiply: "将乘以",
			divide: "将除以",
			max: "将取最大值",
			min: "将取最小值",
			toggle: "",
			append: "",
			remove: "",
			clear: "",
		};

		const operationText = operationTextMap[operationType];

		if (!operationText) return null;

		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)} {operationText}{" "}
				{generateValueHighlight(value)}
			</>
		);
	}

	if (varOperation === "reset") {
		if (!value) return null;

		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)} 将被重置为{" "}
				{generateValueHighlight(value)}
			</>
		);
	}

	if (varOperation === "get") {
		if (symbol) {
			return generateGetSymbolHint(triggerPrefix, symbol, variableDisplayName);
		}

		if (value) {
			return (
				<>
					{triggerPrefix}
					{generateVariableHighlight(variableDisplayName)} 当前值为{" "}
					{generateValueHighlight(value)}
				</>
			);
		}

		return (
			<>
				{triggerPrefix}
				将会获取 {generateVariableHighlight(variableDisplayName)} 的值
			</>
		);
	}

	return null;
};

/**
 * STRING 类型提示生成器（复用 generateNumericHint）
 */
const generateStringHint = (params: HintGeneratorParams): React.ReactNode => {
	return generateNumericHint(params);
};

/**
 * TIME 类型提示生成器（复用 generateNumericHint）
 */
const generateTimeHint = (params: HintGeneratorParams): React.ReactNode => {
	return generateNumericHint(params);
};

/**
 * PERCENTAGE 类型提示生成器（复用 generateNumericHint）
 */
const generatePercentageHint = (
	params: HintGeneratorParams,
): React.ReactNode => {
	const trimmedValue = params.value?.trim();
	if (!trimmedValue) {
		return null;
	}

	const formattedValue = trimmedValue.endsWith("%")
		? trimmedValue
		: `${trimmedValue}%`;

	return generateNumericHint({
		...params,
		value: formattedValue,
	});
};

// ==================== 类型处理器映射表 ====================

/**
 * 变量类型到提示生成器的映射
 */
const hintGenerators: Record<
	VariableValueType,
	(params: HintGeneratorParams) => React.ReactNode
> = {
	[VariableValueType.BOOLEAN]: generateBooleanHint,
	[VariableValueType.ENUM]: generateEnumHint,
	[VariableValueType.NUMBER]: generateNumericHint,
	[VariableValueType.STRING]: generateStringHint,
	[VariableValueType.TIME]: generateTimeHint,
	[VariableValueType.PERCENTAGE]: generatePercentageHint,
};

type VariableHintBaseOptions = {
	varValueType?: VariableValueType;
	value?: string;
	selectedValues?: string[];
	triggerConfig?: {
		triggerType: TriggerType;
		conditionTrigger?: ConditionTrigger | null;
		timerTrigger?: TimerTrigger;
		dataflowTrigger?: DataFlowTrigger | null;
	};
	symbol?: string;
};

const generateVariableHintByOperation = (
	variableDisplayName: string | undefined,
	params: {
		varOperation: VariableOperation;
		operationType?: UpdateOperationType;
	} & VariableHintBaseOptions,
): React.ReactNode => {
	const {
		varOperation,
		operationType,
		varValueType,
		value,
		selectedValues,
		triggerConfig,
		symbol,
	} =
		params;

	const generatorParams: HintGeneratorParams = {
		varOperation,
		variableDisplayName,
		operationType,
		value,
		selectedValues,
		conditionTrigger: triggerConfig?.conditionTrigger,
		timerTrigger: triggerConfig?.timerTrigger,
		dataflowTrigger: triggerConfig?.dataflowTrigger,
		symbol,
	};

	if (!varValueType) {
		return generateNumericHint(generatorParams);
	}

	const generator = hintGenerators[varValueType];
	if (!generator) {
		console.warn(`Unknown variable value type: ${varValueType}`);
		return null;
	}

	return generator(generatorParams);
};

// ==================== 主方法（重构后）====================

/**
 * 生成更新变量的提示文本 - 按变量类型拆分的版本
 */
export const generateUpdateHint = (
	variableDisplayName: string | undefined,
	operationType: UpdateOperationType,
	options?: VariableHintBaseOptions,
): React.ReactNode => {
	return generateVariableHintByOperation(variableDisplayName, {
		varOperation: "update",
		operationType,
		...(options || {}),
	});
};

/**
 * 生成重置变量的提示文本
 */
export const generateResetHint = (
	variableDisplayName: string | undefined,
	options?: VariableHintBaseOptions,
): React.ReactNode => {
	return generateVariableHintByOperation(variableDisplayName, {
		varOperation: "reset",
		...(options || {}),
	});
};

/**
 * 生成获取变量的提示文本
 */
export const generateGetHint = (
	variableDisplayName: string | undefined,
	options?: VariableHintBaseOptions,
): React.ReactNode => {
	return generateVariableHintByOperation(variableDisplayName, {
		varOperation: "get",
		...(options || {}),
	});
};

// ==================== 更新操作文本生成器（用于节点显示）====================

/**
 * 获取更新操作类型的显示文本
 * 对于某些操作（如增加、减少等），不需要显示文本，因为会在值中体现
 */
export const getUpdateOperationLabel = (operationType: UpdateOperationType): string => {
	const operationLabels: Record<UpdateOperationType, string> = {
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
	operationType: UpdateOperationType,
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


