import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { Label } from "@/components/ui/label";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import type { NodeType } from "@/types/node/index";
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
import { getUpdateOperationPlaceholder } from "../../../../variable-node-utils";
import CaseSelector, { type CaseItemInfo } from "../components/case-selector";
import DataFlowSelector from "../components/dataflow-selector";
import TimerConfigComponent from "../components/timer";
import TriggerTypeConfig from "../components/trigger-type-config";
import BoolTypeOpEditor from "./bool-type-op-editor";
import EnumTypeOpEditor from "./enum-type-op-editor";
import InputTypeOpEditor from "./input-type-op-editor";
import PercentTypeOpEditor from "./percent-type-op-editor";
import TimeTypeOpEditor from "./time-type-op-editor";

interface UpdateVarConfigProps {
	variable: string;
	updateOperationType: UpdateVarValueOperation;
	updateValue: string;
	triggerConfig: TriggerConfig;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	variableItemList: VariableItem[];
	caseItemList: CaseItemInfo[];
	dataflowNodeId: string | null;
	dataflowHandleId: string | null;
	dataflowVariable: string | null;
	dataflowVariableName: string | null;
	isEditing?: boolean;
	onVariableChange: (value: string) => void;
	onUpdateOperationTypeChange: (value: UpdateVarValueOperation) => void;
	onUpdateValueChange: (value: string) => void;
	onTriggerConfigChange: (value: TriggerConfig) => void;
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
): TriggerConfig => {
	if (updateTriggerType === "condition" && triggerCase) {
		return { type: "condition", config: triggerCase };
	}
	if (updateTriggerType === "timer" && timerConfig) {
		return { type: "timer", config: timerConfig };
	}
	// dataflow 模式暂时返回 null，因为需要从其他地方获取 DataFlowTrigger 数据
	return null;
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
	const isBooleanType = selectedVar?.varValueType === VariableValueType.BOOLEAN;
	const isEnumType = selectedVar?.varValueType === VariableValueType.ENUM;
	const isPercentageType =
		selectedVar?.varValueType === VariableValueType.PERCENTAGE;
	const isTimeType = selectedVar?.varValueType === VariableValueType.TIME;

	// 构建 triggerConfig
	const triggerConfig = buildTriggerConfig(updateTriggerType, triggerCase, timerConfig);

	if (isBooleanType) {
		// BOOLEAN 类型使用 BoolTypeOpEditor (包含 set 和 toggle)
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
}

	if (isEnumType) {
		// ENUM 类型使用 EnumTypeOpEditor
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
	}

	if (isPercentageType) {
		// PERCENTAGE 类型使用 PercentTypeOpEditor
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
	}

	if (isTimeType) {
		// TIME 类型使用 TimeTypeOpEditor
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
	}

	// 其他类型（NUMBER, STRING）使用 InputTypeOpEditor
	return (
		<InputTypeOpEditor
			updateOperationType={updateOperationType}
			updateValue={updateValue}
			availableOperationOptions={availableOperationOptions}
			varValueType={selectedVar?.varValueType || VariableValueType.NUMBER}
			onUpdateOperationTypeChange={onUpdateOperationTypeChange}
			onUpdateValueChange={onUpdateValueChange}
			variableDisplayName={selectedVar?.varDisplayName}
			getPlaceholder={getUpdateOperationPlaceholder}
			triggerType={updateTriggerType}
			triggerConfig={triggerConfig}
		/>
	);
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

		// 1. 必须有自定义变量
		if (customVariables.length === 0) {
			isValid = false;
		}
		// 2. 必须选择变量
		else if (!variable) {
			isValid = false;
		}
		// 3. 条件触发模式：必须选择触发条件
		else if (effectiveTriggerType === "condition") {
			if (!conditionTrigger) {
				isValid = false;
			}
			// 条件触发模式下，如果操作不是 toggle，需要输入更新值
			else if (updateOperationType !== "toggle" && !updateValue.trim()) {
				isValid = false;
			}
		}
		// 4. 数据流模式：必须选择上游节点和变量
		else if (effectiveTriggerType === "dataflow") {
			if (!dataflowNodeId || !dataflowHandleId || !dataflowVariable) {
				isValid = false;
			}
		}
		// 5. 定时触发模式：如果操作不是 toggle，需要输入更新值
		else if (effectiveTriggerType === "timer") {
			if (updateOperationType !== "toggle" && !updateValue.trim()) {
				isValid = false;
			}
		}

		onValidationChange(isValid);
	}, [
		effectiveTriggerType,
		conditionTrigger,
		customVariables.length,
		variable,
		updateOperationType,
		updateValue,
		dataflowNodeId,
		dataflowHandleId,
		dataflowVariable,
		onValidationChange,
	]);

	const createEmptyDataflowTrigger = (): DataFlowTrigger => ({
		fromNodeId: "",
		fromNodeName: "",
		fromHandleId: "",
		fromVar: "",
		fromVarDisplayName: "",
		fromVarConfigId: 0,
		fromNodeType: null,
		fromVarValueType: null,
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
			</div>

			{/* 触发方式 */}
			<TriggerTypeConfig
				triggerType={effectiveTriggerType}
				onTriggerTypeChange={(newType) => {
					// 根据新的触发类型构建 triggerConfig，使用缓存的配置
					if (newType === "condition") {
						// 切换到 condition 时，使用缓存的 conditionTrigger
						onTriggerConfigChange(
							cachedConditionConfig.current
								? { type: "condition", config: cachedConditionConfig.current }
								: null
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
			/>

			{/* 条件触发模式：Case 选择器 */}
			{effectiveTriggerType === "condition" && (
				<div className="flex flex-col gap-2">
					<Label className="text-sm font-medium pointer-events-none">
						{t("variableNode.triggerCase")}
					</Label>
					<CaseSelector
						caseList={caseItemList}
						selectedTriggerCase={conditionTrigger ?? null}
						onTriggerCaseChange={(newCase) => {
							// 更新缓存
							cachedConditionConfig.current = newCase;
							// 通知父组件
							onTriggerConfigChange(newCase ? { type: "condition", config: newCase } : null);
						}}
					/>
				</div>
			)}

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

			{/* 定时触发模式：定时配置 */}
			{effectiveTriggerType === "timer" && (
				<div className="rounded-md border border-gray-200 p-3">
					<TimerConfigComponent
						timerConfig={timerTrigger || { mode: "interval", interval: 1, unit: "hour" }}
						onTimerConfigChange={(newTimer) => {
							// 更新缓存
							cachedTimerConfig.current = newTimer;
							// 通知父组件
							onTriggerConfigChange({ type: "timer", config: newTimer });
						}}
					/>
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
