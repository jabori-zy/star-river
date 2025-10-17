import type {
	TriggerCase,
	UpdateOperationType,
	VariableConfig,
} from "@/types/node/variable-node";
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
	return existingConfigs.some(
		(config, index) =>
			index !== editingIndex &&
			config.varOperation === "get" && // 只检查 get 操作
			(config.symbol || "") === symbol &&
			config.varName === variable &&
			config.varTriggerType === triggerType,
	);
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
	triggerCase: TriggerCase | null,
): string | null => {
	if (!triggerCase) return null;

	if (triggerCase.triggerType === "case") {
		return `Case ${triggerCase.caseId}`;
	} else {
		return "Else";
	}
};

// ==================== 公共辅助组件和函数 ====================

/**
 * 生成触发条件前缀
 */
const generateTriggerPrefix = (
	triggerNodeName?: string,
	triggerCaseLabel?: string,
): React.ReactNode | null => {
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
const generateVariableHighlight = (name?: string): React.ReactNode => {
	if (!name) return null;
	return <span className="text-orange-600 font-medium">{name}</span>;
};

/**
 * 生成值高亮元素
 */
const generateValueHighlight = (value: string): React.ReactNode => {
	return <span className="text-blue-600 font-medium">{value}</span>;
};

/**
 * 提示生成器参数类型
 */
interface HintGeneratorParams {
	variableDisplayName?: string;
	operationType: UpdateOperationType;
	value?: string;
	selectedValues?: string[];
	triggerNodeName?: string;
	triggerCaseLabel?: string;
}

// ==================== 按变量类型拆分的处理器 ====================

/**
 * BOOLEAN 类型提示生成器
 */
const generateBooleanHint = (params: HintGeneratorParams): React.ReactNode => {
	const {
		variableDisplayName,
		operationType,
		value,
		triggerNodeName,
		triggerCaseLabel,
	} = params;
	const triggerPrefix = generateTriggerPrefix(
		triggerNodeName,
		triggerCaseLabel,
	);

	if (operationType === "toggle") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)} 将在 True/False 之间切换
			</>
		);
	}

	if (operationType === "set" && value) {
		const valueLabel = value === "false" ? "False" : "True";
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)} 将被设置为{" "}
				{generateValueHighlight(valueLabel)}
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
		operationType,
		selectedValues,
		triggerNodeName,
		triggerCaseLabel,
	} = params;
	const triggerPrefix = generateTriggerPrefix(
		triggerNodeName,
		triggerCaseLabel,
	);

	const hasValues = selectedValues && selectedValues.length > 0;
	const valueList = hasValues ? selectedValues.join("、") : "";
	const displayValue = hasValues ? `[${valueList}]` : "[]";

	const operationTextMap: Record<string, string> = {
		set: "将被设置为",
		append: "将会添加",
		remove: "将会删除",
	};

	const operationText = operationTextMap[operationType];

	if (operationType === "clear") {
		return (
			<>
				{triggerPrefix}
				{generateVariableHighlight(variableDisplayName)}{" "}
				将被清空，所有元素将被移除
			</>
		);
	}

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
};

/**
 * 数值类型提示生成器（NUMBER, STRING, TIME, PERCENTAGE 共用）
 */
const generateNumericHint = (params: HintGeneratorParams): React.ReactNode => {
	const {
		variableDisplayName,
		operationType,
		value,
		triggerNodeName,
		triggerCaseLabel,
	} = params;

	if (!value) return null;

	const triggerPrefix = generateTriggerPrefix(
		triggerNodeName,
		triggerCaseLabel,
	);

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
	return generateNumericHint(params);
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

// ==================== 主方法（重构后）====================

/**
 * 生成更新变量的提示文本 - 按变量类型拆分的版本
 * @param variableDisplayName 变量显示名称
 * @param operationType 操作类型
 * @param options 配置选项
 *   - varValueType: 变量值类型（可选）
 *   - value: 操作值（字符串，用于 NUMBER, STRING, TIME, PERCENTAGE 类型）
 *   - selectedValues: 选中的值列表（用于 ENUM 类型的 set/append/remove 操作）
 *   - triggerNodeName: 触发节点名称（用于条件触发）
 *   - triggerCaseLabel: 触发分支标签（如 "Case 1" 或 "Else"）
 * @returns React.ReactNode 提示文本的 JSX
 */
export const generateUpdateHint = (
	variableDisplayName: string | undefined,
	operationType: UpdateOperationType,
	options?: {
		varValueType?: VariableValueType;
		value?: string;
		selectedValues?: string[];
		triggerNodeName?: string;
		triggerCaseLabel?: string;
	},
): React.ReactNode => {
	const {
		varValueType,
		value,
		selectedValues,
		triggerNodeName,
		triggerCaseLabel,
	} = options || {};

	// 如果没有指定变量类型，使用通用处理（向后兼容）
	if (!varValueType) {
		return generateNumericHint({
			variableDisplayName,
			operationType,
			value,
			selectedValues,
			triggerNodeName,
			triggerCaseLabel,
		});
	}

	// 根据变量类型选择对应的处理器
	const generator = hintGenerators[varValueType];
	if (!generator) {
		console.warn(`Unknown variable value type: ${varValueType}`);
		return null;
	}

	return generator({
		variableDisplayName,
		operationType,
		value,
		selectedValues,
		triggerNodeName,
		triggerCaseLabel,
	});
};
