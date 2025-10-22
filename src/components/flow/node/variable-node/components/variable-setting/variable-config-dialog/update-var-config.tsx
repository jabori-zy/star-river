import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { Label } from "@/components/ui/label";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import { NodeType } from "@/types/node/index";
import type {
	TimerTrigger,
	ConditionTrigger,
	TriggerConfig,
	UpdateVarValueOperation,
	DataFlowTrigger,
} from "@/types/node/variable-node";
import {
	getEffectiveTriggerType,
	getConditionTriggerConfig,
	getTimerTriggerConfig,
	getDataFlowTriggerConfig,
} from "@/types/node/variable-node";
import { type CustomVariable, VariableValueType } from "@/types/variable";
import { getUpdateOperationPlaceholder } from "../../../variable-node-utils";
import { type CaseItemInfo } from "./components/trigger-type-switcher/case-selector";
import DataFlowSelector from "./components/dataflow-selector";
import TriggerTypeSwitcher from "./components/trigger-type-switcher";
import BoolTypeOpEditor from "./components/variable-op-editor/bool-type-op-editor";
import EnumTypeOpEditor from "./components/variable-op-editor/enum-type-op-editor";
import NumberTypeOpEditor from "./components/variable-op-editor/number-type-op-editor";
import StringTypeOpEditor from "./components/variable-op-editor/string-type-op-editor";
import PercentTypeOpEditor from "./components/variable-op-editor/percent-type-op-editor";
import TimeTypeOpEditor from "./components/variable-op-editor/time-type-op-editor";

interface UpdateVarConfigProps {
	variable: string;
	updateOperationType: UpdateVarValueOperation;
	updateValue: string;
	triggerConfig?: TriggerConfig;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	variableItemList: VariableItem[];
	caseItemList: CaseItemInfo[];
	dataflowNodeId: string | null;
	dataflowHandleId: string | null;
	dataflowVariable: string | null;
	dataflowVariableName: string | null;
	isEditing?: boolean;
	duplicateOperation?: string | null;
	onVariableChange: (value: string) => void;
	onUpdateOperationTypeChange: (value: UpdateVarValueOperation) => void;
	onUpdateValueChange: (value: string) => void;
	onTriggerConfigChange: (value: TriggerConfig | undefined) => void;
	onDataflowNodeChange: (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => void;
	onDataflowVariableChange: (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		variableValueType: VariableValueType,
	) => void;
	getAvailableOperations: (
		varValueType: VariableValueType,
		isDataflowMode?: boolean,
	) => UpdateVarValueOperation[];
	getUpdateOperationLabel: (type: UpdateVarValueOperation, t:(key: string) => string) => string;
	onValidationChange?: (isValid: boolean) => void;
}

/**
 * 构建 TriggerConfig
 */
const buildTriggerConfig = (
	updateTriggerType: "condition" | "timer" | "dataflow",
	triggerCase: ConditionTrigger | null,
	timerConfig?: TimerTrigger,
): TriggerConfig | undefined => {
	if (updateTriggerType === "condition" && triggerCase) {
		return { type: "condition", config: triggerCase };
	}
	if (updateTriggerType === "timer" && timerConfig) {
		return { type: "timer", config: timerConfig };
	}
	// dataflow 模式需要从其他地方获取 DataFlowTrigger 数据
	return undefined;
};

/**
 * 渲染更新操作编辑器
 * 根据变量类型返回对应的编辑器组件
 */
const renderOperationEditor = (
	variable: string,
	updateOperationType: UpdateVarValueOperation,
	updateValue: string,
	updateTriggerType: "condition" | "timer" | "dataflow",
	customVariables: CustomVariable[],
	getAvailableOperations: (
		varValueType: VariableValueType,
		isDataflowMode?: boolean,
	) => UpdateVarValueOperation[],
	getUpdateOperationLabel: (type: UpdateVarValueOperation, t: (key: string) => string) => string,
	onUpdateOperationTypeChange: (value: UpdateVarValueOperation) => void,
	onUpdateValueChange: (value: string) => void,
	triggerCase: ConditionTrigger | null,
	timerConfig: TimerTrigger | undefined,
	t: (key: string) => string,
): React.ReactNode => {
	const selectedVar = customVariables.find(
		(v: CustomVariable) => v.varName === variable,
	);
	// 条件/定时触发模式不支持 max/min，数据流模式支持
	const isDataflowMode = updateTriggerType === "dataflow";
	const availableOps = getAvailableOperations(
		selectedVar?.varValueType || VariableValueType.NUMBER,
		isDataflowMode,
	);
	const availableOperationOptions = availableOps.map((op) => ({
		value: op,
		label: getUpdateOperationLabel(op, t),
	}));
	const varValueType = selectedVar?.varValueType || VariableValueType.NUMBER;

	// 构建 triggerConfig
	const triggerConfig = buildTriggerConfig(updateTriggerType, triggerCase, timerConfig);

	// 根据变量类型返回对应的编辑器组件
	switch (varValueType) {
		case VariableValueType.BOOLEAN:
			return (
				<BoolTypeOpEditor
					updateOperationType={updateOperationType}
					updateValue={updateValue}
					availableOperationOptions={availableOperationOptions}
					onUpdateOperationTypeChange={onUpdateOperationTypeChange}
					onUpdateValueChange={onUpdateValueChange}
					variableDisplayName={selectedVar?.varDisplayName}
					idPrefix="update-bool"
					triggerType={updateTriggerType}
					triggerConfig={triggerConfig}
				/>
			);

		case VariableValueType.ENUM:
			return (
				<EnumTypeOpEditor
					updateOperationType={updateOperationType}
					updateValue={updateValue}
					availableOperationOptions={availableOperationOptions}
					onUpdateOperationTypeChange={onUpdateOperationTypeChange}
					onUpdateValueChange={onUpdateValueChange}
					variableDisplayName={selectedVar?.varDisplayName}
					idPrefix="update-enum"
					triggerType={updateTriggerType}
					triggerConfig={triggerConfig}
				/>
			);

		case VariableValueType.PERCENTAGE:
			return (
				<PercentTypeOpEditor
					updateOperationType={updateOperationType}
					updateValue={updateValue}
					availableOperationOptions={availableOperationOptions}
					onUpdateOperationTypeChange={onUpdateOperationTypeChange}
					onUpdateValueChange={onUpdateValueChange}
					variableDisplayName={selectedVar?.varDisplayName}
					getPlaceholder={getUpdateOperationPlaceholder}
					triggerType={updateTriggerType}
					triggerConfig={triggerConfig}
				/>
			);

		case VariableValueType.TIME:
			return (
				<TimeTypeOpEditor
					updateOperationType={updateOperationType}
					updateValue={updateValue}
					availableOperationOptions={availableOperationOptions}
					onUpdateOperationTypeChange={onUpdateOperationTypeChange}
					onUpdateValueChange={onUpdateValueChange}
					variableDisplayName={selectedVar?.varDisplayName}
					triggerType={updateTriggerType}
					triggerConfig={triggerConfig}
				/>
			);

		case VariableValueType.STRING:
			return (
				<StringTypeOpEditor
					updateOperationType={updateOperationType}
					updateValue={updateValue}
					availableOperationOptions={availableOperationOptions}
					onUpdateOperationTypeChange={onUpdateOperationTypeChange}
					onUpdateValueChange={onUpdateValueChange}
					variableDisplayName={selectedVar?.varDisplayName}
					getPlaceholder={getUpdateOperationPlaceholder}
					triggerType={updateTriggerType}
					triggerConfig={triggerConfig}
				/>
			);

		case VariableValueType.NUMBER:
		default:
			return (
				<NumberTypeOpEditor
					updateOperationType={updateOperationType}
					updateValue={updateValue}
					availableOperationOptions={availableOperationOptions}
					onUpdateOperationTypeChange={onUpdateOperationTypeChange}
					onUpdateValueChange={onUpdateValueChange}
					variableDisplayName={selectedVar?.varDisplayName}
					getPlaceholder={getUpdateOperationPlaceholder}
					triggerType={updateTriggerType}
					triggerConfig={triggerConfig}
				/>
			);
	}
};

const UpdateVarConfig: React.FC<UpdateVarConfigProps> = ({
	variable,
	updateOperationType,
	updateValue,
	triggerConfig,
	customVariables,
	customVariableOptions,
	variableItemList,
	caseItemList,
	dataflowNodeId,
	dataflowHandleId,
	dataflowVariable,
	dataflowVariableName,
	isEditing = false,
	duplicateOperation,
	onVariableChange,
	onUpdateOperationTypeChange,
	onUpdateValueChange,
	onTriggerConfigChange,
	onDataflowNodeChange,
	onDataflowVariableChange,
	getAvailableOperations,
	getUpdateOperationLabel,
	onValidationChange,
}) => {
	const { t } = useTranslation();

	// 从 triggerConfig 中提取各种触发配置
	const effectiveTriggerType = getEffectiveTriggerType({ triggerConfig }) ?? "condition";
	const conditionTrigger = getConditionTriggerConfig({ triggerConfig });
	const timerTrigger = getTimerTriggerConfig({ triggerConfig });
	const dataflowTrigger = getDataFlowTriggerConfig({ triggerConfig });

	// 使用 ref 缓存配置，防止切换触发类型时丢失
	const cachedTimerConfig = useRef<TimerTrigger>({ mode: "interval", interval: 1, unit: "hour" });
	const cachedConditionConfig = useRef<ConditionTrigger | null>(null);

	// Dataflow 配置验证状态
	const [isDataflowConfigValid, setIsDataflowConfigValid] = useState(true);

	// 当从 props 接收到新的配置时，更新缓存
	useEffect(() => {
		if (timerTrigger) {
			cachedTimerConfig.current = timerTrigger;
		}
	}, [timerTrigger]);

	useEffect(() => {
		if (conditionTrigger) {
			cachedConditionConfig.current = conditionTrigger;
		}
	}, [conditionTrigger]);

	// 验证表单有效性并通知父组件
	useEffect(() => {
		if (!onValidationChange) return;

		let isValid = true;

		// 1. 如果存在重复的变量操作配置，则验证失败
		if (duplicateOperation) {
			isValid = false;
		}
		// 2. 必须有自定义变量
		else if (customVariables.length === 0) {
			isValid = false;
		}
		// 3. 必须选择变量
		else if (!variable) {
			isValid = false;
		}
		// 4. 条件触发模式：必须选择触发条件
		else if (effectiveTriggerType === "condition") {
			if (!conditionTrigger) {
				isValid = false;
			}
			// 条件触发模式下，如果操作不是 toggle，需要输入更新值
			else if (updateOperationType !== "toggle" && !updateValue.trim()) {
				isValid = false;
			}
		}
		// 5. 数据流模式：必须选择上游节点和变量，且 dataflow 配置必须有效
		else if (effectiveTriggerType === "dataflow") {
			if (!dataflowNodeId || !dataflowHandleId || !dataflowVariable) {
				isValid = false;
			}
			// 检查 dataflow 配置是否有效（例如除法分母不能为0）
			else if (!isDataflowConfigValid) {
				isValid = false;
			}
		}
		// 6. 定时触发模式：如果操作不是 toggle，需要输入更新值
		else if (effectiveTriggerType === "timer") {
			if (updateOperationType !== "toggle" && !updateValue.trim()) {
				isValid = false;
			}
		}

		onValidationChange(isValid);
	}, [
		duplicateOperation,
		effectiveTriggerType,
		conditionTrigger,
		customVariables.length,
		variable,
		updateOperationType,
		updateValue,
		dataflowNodeId,
		dataflowHandleId,
		dataflowVariable,
		isDataflowConfigValid,
		onValidationChange,
	]);

	const createEmptyDataflowTrigger = (): DataFlowTrigger => ({
		fromNodeId: "",
		fromNodeName: "",
		fromHandleId: "",
		fromVar: "",
		fromVarDisplayName: "",
		fromVarConfigId: 0,
		fromNodeType: NodeType.VariableNode,
		fromVarValueType: VariableValueType.NUMBER,
		expireDuration: {
			unit: "hour",
			duration: 1,
		},
		errorPolicy: {
			nullValue: { strategy: "skip", errorLog: { notify: false } },
			expired: { strategy: "skip", errorLog: { notify: false } },
			zeroValue: { strategy: "skip", errorLog: { notify: false } },
		},
	});
	return (
		<>
			{/* UPDATE 模式的 UI */}
			<div className="flex flex-col gap-2">
				<Label
					htmlFor="updateVariable"
					className="text-sm font-medium pointer-events-none"
				>
					{t("variableNode.var")}
				</Label>
				<SelectInDialog
					id="updateVariable"
					value={variable}
					onValueChange={onVariableChange}
					placeholder={
						customVariables.length === 0 ? "无自定义变量" : "选择要更新的变量"
					}
					options={customVariableOptions}
					disabled={isEditing}
					emptyMessage="未配置自定义变量，请在策略起点配置"
					className="w-full"
				/>
				{duplicateOperation && (
					<p className="text-xs text-red-600 mt-1">
						{t("variableNode.duplicateOperationError", { operation: t(`variableNode.${duplicateOperation}`) })}
					</p>
				)}
			</div>

		{/* 触发方式 */}
		<TriggerTypeSwitcher
			triggerType={effectiveTriggerType}
			onTriggerTypeChange={(newType) => {
				// 根据新的触发类型构建 triggerConfig，使用缓存的配置
				if (newType === "condition") {
					// 切换到 condition 时，使用缓存的 conditionTrigger
					onTriggerConfigChange(
				cachedConditionConfig.current
					? { type: "condition", config: cachedConditionConfig.current }
					: undefined
					);
				} else if (newType === "timer") {
					// 切换到 timer 时，使用缓存的 timerTrigger（保留用户之前的配置）
					onTriggerConfigChange({
						type: "timer",
						config: cachedTimerConfig.current
					});
				} else if (newType === "dataflow") {
					// 切换到 dataflow 时，保持已有的 dataflowTrigger，如果没有则创建空模板
					onTriggerConfigChange({
						type: "dataflow",
						config: dataflowTrigger || createEmptyDataflowTrigger(),
					});
				}
			}}
			idPrefix="update"
			caseItemList={caseItemList}
			selectedTriggerCase={conditionTrigger ?? null}
			onTriggerCaseChange={(newCase) => {
				// 更新缓存
			cachedConditionConfig.current = newCase;
			// 通知父组件
			onTriggerConfigChange(newCase ? { type: "condition", config: newCase } : undefined);
			}}
			timerConfig={timerTrigger || cachedTimerConfig.current}
			onTimerConfigChange={(newTimer) => {
				// 更新缓存
				cachedTimerConfig.current = newTimer;
				// 通知父组件
				onTriggerConfigChange({ type: "timer", config: newTimer });
			}}
			expireDuration={(() => {
				const result = dataflowTrigger?.expireDuration || { unit: "hour" as const, duration: 1 };
				// console.log("[UpdateVarConfig] expireDuration prop", { dataflowTrigger, result });
				return result;
			})()}
			errorPolicy={(() => {
				const result = dataflowTrigger?.errorPolicy || {
					nullValue: { strategy: "skip" as const, errorLog: { notify: false as const } },
					expired: { strategy: "skip" as const, errorLog: { notify: false as const } },
					zeroValue: { strategy: "skip" as const, errorLog: { notify: false as const } },
				};
				// console.log("[UpdateVarConfig] errorPolicy prop", { dataflowTrigger, result });
				return result;
			})()}
			replaceValueType={customVariables.find((v) => v.varName === variable)?.varValueType}
			updateOperationType={updateOperationType}
			onDataflowValidationChange={setIsDataflowConfigValid}
			onExpireDurationChange={(config) => {
				const currentTrigger = dataflowTrigger || createEmptyDataflowTrigger();
				onTriggerConfigChange({
					type: "dataflow",
					config: {
						...currentTrigger,
						expireDuration: config,
					},
				});
			}}
			onErrorPolicyChange={(errorType, policy) => {
				const currentTrigger = dataflowTrigger || createEmptyDataflowTrigger();
				// console.log("[UpdateVarConfig] onErrorPolicyChange", {
				// 	errorType,
				// 	policy,
				// 	dataflowTrigger,
				// 	currentTrigger,
				// });
				const newConfig = {
					type: "dataflow" as const,
					config: {
						...currentTrigger,
						errorPolicy: {
							...currentTrigger.errorPolicy,
							[errorType]: policy,
						},
					},
				};
				// console.log("[UpdateVarConfig] calling onTriggerConfigChange with", newConfig);
				onTriggerConfigChange(newConfig);
			}}
		/>

			{/* 数据流模式：操作符 + 上游节点变量选择器 */}
			{effectiveTriggerType === "dataflow" && variable && (
				<div className="flex flex-col gap-2">
					<Label
						htmlFor="dataflowOperation"
						className="text-sm font-medium pointer-events-none"
					>
						{t("variableNode.updateOp")}
					</Label>
					{(() => {
						const selectedVar = customVariables.find(
							(v: CustomVariable) => v.varName === variable,
						);
						// 数据流模式传入 true，支持 max/min 操作
						let availableOps = getAvailableOperations(
							selectedVar?.varValueType || VariableValueType.NUMBER,
							true,
						);

						// 数据流模式下，BOOLEAN类型去除toggle操作
						if (selectedVar?.varValueType === VariableValueType.BOOLEAN) {
							availableOps = availableOps.filter((op) => op !== "toggle");
						}

						// 数据流模式统一使用 DataFlowSelector
						return (
							<DataFlowSelector
								variableItemList={variableItemList}
								selectedNodeId={dataflowNodeId}
								selectedHandleId={dataflowHandleId}
								selectedVariable={dataflowVariable}
								selectedVariableName={dataflowVariableName}
								updateOperationType={updateOperationType}
								availableOperations={availableOps}
								targetVariableType={selectedVar?.varValueType}
								targetVariableDisplayName={selectedVar?.varDisplayName}
								onNodeChange={onDataflowNodeChange}
								onVariableChange={onDataflowVariableChange}
								onOperationTypeChange={onUpdateOperationTypeChange}
							/>
						);
					})()}
				</div>
			)}

			{/* 条件触发和定时触发模式：更新操作和值 */}
			{variable &&
				(effectiveTriggerType === "condition" ||
					effectiveTriggerType === "timer") && (
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="updateOperation"
							className="text-sm font-medium pointer-events-none"
						>
							{t("variableNode.updateOp")}
						</Label>
						{renderOperationEditor(
							variable,
							updateOperationType,
							updateValue,
							effectiveTriggerType,
							customVariables,
							getAvailableOperations,
							getUpdateOperationLabel,
							onUpdateOperationTypeChange,
							onUpdateValueChange,
							conditionTrigger ?? null,
							timerTrigger,
							t,
						)}
					</div>
				)}
		</>
	);
};

export default UpdateVarConfig;
