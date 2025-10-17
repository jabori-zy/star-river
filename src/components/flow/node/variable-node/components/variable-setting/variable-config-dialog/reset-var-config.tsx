import { formatVariableValue } from "@/components/flow/node/start-node/components/utils";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { Label } from "@/components/ui/label";
import type { TimerConfig, TriggerCase } from "@/types/node/variable-node";
import type { CustomVariable } from "@/types/variable";
import { getTriggerCaseLabel } from "../../../variable-node-utils";
import CaseSelector, { type CaseItemInfo } from "./components/case-selector";
import TimerConfigComponent from "./components/timer";
import TriggerTypeConfig from "./components/trigger-type-config";

interface ResetVarConfigProps {
	variable: string;
	triggerType: "condition" | "timer" | "dataflow";
	timerConfig: TimerConfig;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	caseItemList: CaseItemInfo[];
	selectedTriggerCase: TriggerCase | null;
	varInitialValue: string | number | boolean | string[];
	onVariableChange: (value: string) => void;
	onTriggerTypeChange: (value: "condition" | "timer" | "dataflow") => void;
	onTimerConfigChange: (value: TimerConfig) => void;
	onTriggerCaseChange: (value: TriggerCase | null) => void;
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
				{variable &&
					(() => {
						const selectedVar = customVariables.find(
							(v: CustomVariable) => v.varName === variable,
						);
						const formattedValue = selectedVar
							? formatVariableValue(varInitialValue, selectedVar.varValueType)
							: String(varInitialValue);

						// 获取触发信息
						const triggerNodeName = selectedTriggerCase?.fromNodeName;
						const triggerCaseLabel = getTriggerCaseLabel(selectedTriggerCase);

						return (
							<p className="text-xs text-muted-foreground">
								{triggerType === "condition" &&
									triggerNodeName &&
									triggerCaseLabel && (
										<>
											当{" "}
											<span className="text-blue-600 font-medium">
												{triggerNodeName}/{triggerCaseLabel}
											</span>{" "}
											分支满足时，
										</>
									)}
								变量值将被重置为:{" "}
								<span className="font-semibold text-blue-600 px-1.5 py-0.5 rounded bg-blue-50">
									{formattedValue}
								</span>
							</p>
						);
					})()}
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
				</div>
			)}

			{/* 定时配置 */}
			{triggerType === "timer" && (
				<div className="rounded-md border border-gray-200 p-3">
					<TimerConfigComponent
						timerConfig={timerConfig}
						onTimerConfigChange={onTimerConfigChange}
					/>
				</div>
			)}
		</>
	);
};

export default ResetVarConfig;
