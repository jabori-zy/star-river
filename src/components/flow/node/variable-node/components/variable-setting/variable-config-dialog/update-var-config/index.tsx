import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { Label } from "@/components/ui/label";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import type { NodeType } from "@/types/node/index";
import type {
	TimerTrigger,
	ConditionTrigger,
	UpdateOperationType,
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
	updateOperationType: UpdateOperationType;
	updateValue: string;
	updateTriggerType: "condition" | "timer" | "dataflow";
	timerConfig: TimerTrigger;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	variableItemList: VariableItem[];
	caseItemList: CaseItemInfo[];
	selectedTriggerCase: ConditionTrigger | null;
	dataflowNodeId: string | null;
	dataflowHandleId: string | null;
	dataflowVariable: string | null;
	dataflowVariableName: string | null;
	onVariableChange: (value: string) => void;
	onUpdateOperationTypeChange: (value: UpdateOperationType) => void;
	onUpdateValueChange: (value: string) => void;
	onUpdateTriggerTypeChange: (
		value: "condition" | "timer" | "dataflow",
	) => void;
	onTimerConfigChange: (value: TimerTrigger) => void;
	onTriggerCaseChange: (value: ConditionTrigger | null) => void;
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
	) => UpdateOperationType[];
	getUpdateOperationLabel: (type: UpdateOperationType) => string;
}

/**
 * 渲染更新操作编辑器
 * 根据变量类型返回对应的编辑器组件
 */
const renderOperationEditor = (
	variable: string,
	updateOperationType: UpdateOperationType,
	updateValue: string,
	updateTriggerType: "condition" | "timer" | "dataflow",
	customVariables: CustomVariable[],
	getAvailableOperations: (
		varValueType: VariableValueType,
		isDataflowMode?: boolean,
	) => UpdateOperationType[],
	getUpdateOperationLabel: (type: UpdateOperationType) => string,
	onUpdateOperationTypeChange: (value: UpdateOperationType) => void,
	onUpdateValueChange: (value: string) => void,
	triggerCase: ConditionTrigger | null,
	timerConfig?: TimerTrigger,
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
		label: getUpdateOperationLabel(op),
	}));
	const isBooleanType = selectedVar?.varValueType === VariableValueType.BOOLEAN;
	const isEnumType = selectedVar?.varValueType === VariableValueType.ENUM;
	const isPercentageType =
		selectedVar?.varValueType === VariableValueType.PERCENTAGE;
	const isTimeType = selectedVar?.varValueType === VariableValueType.TIME;

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
				triggerCase={
					updateTriggerType === "condition" ? (triggerCase ?? null) : null
				}
				timerConfig={
					updateTriggerType === "timer" ? timerConfig : undefined
				}
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
				triggerCase={
					updateTriggerType === "condition" ? (triggerCase ?? null) : null
				}
				timerConfig={
					updateTriggerType === "timer" ? timerConfig : undefined
				}
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
				triggerCase={
					updateTriggerType === "condition" ? (triggerCase ?? null) : null
				}
				timerConfig={
					updateTriggerType === "timer" ? timerConfig : undefined
				}
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
				triggerCase={
					updateTriggerType === "condition" ? (triggerCase ?? null) : null
				}
				timerConfig={
					updateTriggerType === "timer" ? timerConfig : undefined
				}
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
			triggerCase={
				updateTriggerType === "condition" ? (triggerCase ?? null) : null
			}
			timerConfig={
				updateTriggerType === "timer" ? timerConfig : undefined
			}
		/>
	);
};

const UpdateVarConfig: React.FC<UpdateVarConfigProps> = ({
	variable,
	updateOperationType,
	updateValue,
	updateTriggerType,
	timerConfig,
	customVariables,
	customVariableOptions,
	variableItemList,
	caseItemList,
	selectedTriggerCase,
	dataflowNodeId,
	dataflowHandleId,
	dataflowVariable,
	dataflowVariableName,
	onVariableChange,
	onUpdateOperationTypeChange,
	onUpdateValueChange,
	onUpdateTriggerTypeChange,
	onTimerConfigChange,
	onTriggerCaseChange,
	onDataflowNodeChange,
	onDataflowVariableChange,
	getAvailableOperations,
	getUpdateOperationLabel,
}) => {
	return (
		<>
			{/* UPDATE 模式的 UI */}
			<div className="flex flex-col gap-2">
				<Label
					htmlFor="updateVariable"
					className="text-sm font-medium pointer-events-none"
				>
					选择变量
				</Label>
				<SelectInDialog
					id="updateVariable"
					value={variable}
					onValueChange={onVariableChange}
					placeholder={
						customVariables.length === 0 ? "无自定义变量" : "选择要更新的变量"
					}
					options={customVariableOptions}
					disabled={customVariables.length === 0}
					emptyMessage="未配置自定义变量，请在策略起点配置"
				/>
			</div>

			{/* 触发方式 */}
			<TriggerTypeConfig
				triggerType={updateTriggerType}
				onTriggerTypeChange={onUpdateTriggerTypeChange}
				idPrefix="update"
			/>

			{/* 条件触发模式：Case 选择器 */}
			{updateTriggerType === "condition" && (
				<div className="flex flex-col gap-2">
					<Label className="text-sm font-medium pointer-events-none">
						触发条件
					</Label>
					<CaseSelector
						caseList={caseItemList}
						selectedTriggerCase={selectedTriggerCase}
						onTriggerCaseChange={onTriggerCaseChange}
					/>
				</div>
			)}

			{/* 数据流模式：操作符 + 上游节点变量选择器 */}
			{updateTriggerType === "dataflow" && variable && (
				<div className="flex flex-col gap-2">
					<Label
						htmlFor="dataflowOperation"
						className="text-sm font-medium pointer-events-none"
					>
						更新操作
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
			{updateTriggerType === "timer" && (
				<div className="rounded-md border border-gray-200 p-3">
					<TimerConfigComponent
						timerConfig={timerConfig}
						onTimerConfigChange={onTimerConfigChange}
					/>
				</div>
			)}

			{/* 条件触发和定时触发模式：更新操作和值 */}
			{variable &&
				(updateTriggerType === "condition" ||
					updateTriggerType === "timer") && (
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="updateOperation"
							className="text-sm font-medium pointer-events-none"
						>
							更新操作
						</Label>
						{renderOperationEditor(
							variable,
							updateOperationType,
							updateValue,
							updateTriggerType,
							customVariables,
							getAvailableOperations,
							getUpdateOperationLabel,
							onUpdateOperationTypeChange,
							onUpdateValueChange,
							selectedTriggerCase,
							timerConfig,
						)}
					</div>
				)}
		</>
	);
};

export default UpdateVarConfig;
