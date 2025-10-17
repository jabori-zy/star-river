import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { Label } from "@/components/ui/label";
import type { TimerTrigger, ConditionTrigger } from "@/types/node/variable-node";
import type { CustomVariable } from "@/types/variable";
import { formatVariableValue } from "@/components/flow/node/start-node/components/utils";
import { generateResetHint, getTriggerCaseLabel } from "../../../variable-node-utils";
import CaseSelector, { type CaseItemInfo } from "./components/case-selector";
import TimerConfigComponent from "./components/timer";
import TriggerTypeConfig from "./components/trigger-type-config";

interface ResetVarConfigProps {
	variable: string;
	triggerType: "condition" | "timer" | "dataflow";
	timerConfig: TimerTrigger;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	caseItemList: CaseItemInfo[];
	selectedTriggerCase: ConditionTrigger | null;
	varInitialValue: string | number | boolean | string[];
	onVariableChange: (value: string) => void;
	onTriggerTypeChange: (value: "condition" | "timer" | "dataflow") => void;
	onTimerConfigChange: (value: TimerTrigger) => void;
	onTriggerCaseChange: (value: ConditionTrigger | null) => void;
}

const ResetVarConfig: React.FC<ResetVarConfigProps> = ({
	variable,
	triggerType,
	timerConfig,
	customVariables,
	customVariableOptions,
	caseItemList,
	selectedTriggerCase,
	varInitialValue,
	onVariableChange,
	onTriggerTypeChange,
	onTimerConfigChange,
	onTriggerCaseChange,
}) => {
	return (
		<>
			{/* RESET 模式的 UI */}
			<div className="flex flex-col gap-2">
				<Label
					htmlFor="resetVariable"
					className="text-sm font-medium pointer-events-none"
				>
					选择变量
				</Label>
				<SelectInDialog
					id="resetVariable"
					value={variable}
					onValueChange={onVariableChange}
					placeholder={
						customVariables.length === 0 ? "无自定义变量" : "选择要重置的变量"
					}
					options={customVariableOptions}
					disabled={customVariables.length === 0}
					emptyMessage="未配置自定义变量，请在策略起点配置"
				/>
			</div>

			{/* 触发方式 */}
			<TriggerTypeConfig
				triggerType={triggerType}
				onTriggerTypeChange={onTriggerTypeChange}
				availableTriggers={["condition", "timer"]}
				idPrefix="reset"
			/>

			{/* 条件触发模式：Case 选择器 */}
			{triggerType === "condition" && (
				<div className="flex flex-col gap-2">
					<Label className="text-sm font-medium pointer-events-none">
						触发条件
					</Label>
					<CaseSelector
						caseList={caseItemList}
						selectedTriggerCase={selectedTriggerCase}
						onTriggerCaseChange={onTriggerCaseChange}
					/>
					{variable &&
						(() => {
							const selectedVar = customVariables.find(
								(v: CustomVariable) => v.varName === variable,
							);
							const variableDisplayName =
								selectedVar?.varDisplayName || variable;
							const formattedValue = selectedVar
								? formatVariableValue(varInitialValue, selectedVar.varValueType)
								: String(varInitialValue);

							// 获取触发信息
							const triggerNodeName = selectedTriggerCase?.fromNodeName;
							const triggerCaseLabel =
								getTriggerCaseLabel(selectedTriggerCase);

						const hint = generateResetHint(variableDisplayName, {
							varValueType: selectedVar?.varValueType,
							value: formattedValue,
							selectedValues: Array.isArray(varInitialValue)
								? varInitialValue
								: undefined,
							triggerNodeName,
							triggerCaseLabel: triggerCaseLabel || undefined,
							timerConfig: undefined, // 条件触发模式下不需要 timerConfig
						});

							return hint ? (
								<p className="text-xs text-muted-foreground">{hint}</p>
							) : null;
						})()}
				</div>
			)}

			{/* 定时配置 */}
			{triggerType === "timer" && (
				<>
					<div className="rounded-md border border-gray-200 p-3">
						<TimerConfigComponent
							timerConfig={timerConfig}
							onTimerConfigChange={onTimerConfigChange}
						/>
					</div>
					{variable &&
						(() => {
							const selectedVar = customVariables.find(
								(v: CustomVariable) => v.varName === variable,
							);
							const variableDisplayName =
								selectedVar?.varDisplayName || variable;
							const formattedValue = selectedVar
								? formatVariableValue(varInitialValue, selectedVar.varValueType)
								: String(varInitialValue);

							const hint = generateResetHint(variableDisplayName, {
								varValueType: selectedVar?.varValueType,
								value: formattedValue,
								selectedValues: Array.isArray(varInitialValue)
									? varInitialValue
									: undefined,
								timerConfig: timerConfig,
							});

							return hint ? (
								<p className="text-xs text-muted-foreground mt-1">{hint}</p>
							) : null;
						})()}
				</>
			)}
		</>
	);
};

export default ResetVarConfig;
