import { useEffect, useRef } from "react";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { Label } from "@/components/ui/label";
import type { TriggerConfig, TimerTrigger, ConditionTrigger } from "@/types/node/variable-node";
import {
	getEffectiveTriggerType,
	getConditionTriggerConfig,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import type { CustomVariable } from "@/types/variable";
import { VariableValueType } from "@/types/variable";
import { formatVariableValue } from "@/components/flow/node/start-node/components/utils";
import {
	generateBooleanHint,
	generateEnumHint,
	generateNumberHint,
	generateStringHint,
	generateTimeHint,
	generatePercentageHint,
} from "../../../hint-generators";
import CaseSelector, { type CaseItemInfo } from "./components/case-selector";
import TimerConfigComponent from "./components/timer";
import TriggerTypeConfig from "./components/trigger-type-config";
import { useTranslation } from "react-i18next";

interface ResetVarConfigProps {
	variable: string;
	triggerConfig: TriggerConfig;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	caseItemList: CaseItemInfo[];
	varInitialValue: string | number | boolean | string[];
	isEditing?: boolean;
	duplicateOperation?: string | null;
	onVariableChange: (value: string) => void;
	onTriggerConfigChange: (value: TriggerConfig) => void;
	onValidationChange?: (isValid: boolean) => void;
}

const ResetVarConfig: React.FC<ResetVarConfigProps> = ({
	variable,
	triggerConfig,
	customVariables,
	customVariableOptions,
	caseItemList,
	varInitialValue,
	isEditing = false,
	duplicateOperation,
	onVariableChange,
	onTriggerConfigChange,
	onValidationChange,
}) => {
	const { t } = useTranslation();
	// 从 triggerConfig 中提取各种触发配置
	const effectiveTriggerType = getEffectiveTriggerType({ triggerConfig }) ?? "condition";
	const conditionTrigger = getConditionTriggerConfig({ triggerConfig });
	const timerTrigger = getTimerTriggerConfig({ triggerConfig });

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
		else if (effectiveTriggerType === "condition" && !conditionTrigger) {
			isValid = false;
		}

		onValidationChange(isValid);
	}, [
		duplicateOperation,
		effectiveTriggerType,
		conditionTrigger,
		customVariables.length,
		variable,
		onValidationChange,
	]);

	// 根据变量类型选择对应的生成器
	const getHintGenerator = (varValueType?: VariableValueType) => {
		if (!varValueType) return generateNumberHint; // 默认使用 NUMBER 生成器

		const generatorMap = {
			[VariableValueType.BOOLEAN]: generateBooleanHint,
			[VariableValueType.ENUM]: generateEnumHint,
			[VariableValueType.NUMBER]: generateNumberHint,
			[VariableValueType.STRING]: generateStringHint,
			[VariableValueType.TIME]: generateTimeHint,
			[VariableValueType.PERCENTAGE]: generatePercentageHint,
		};

		return generatorMap[varValueType] || generateNumberHint;
	};

	// 判断是否应该显示提示文案
	const shouldShowHint = () => {
		// 必须选择了变量
		if (!variable) {
			return false;
		}
		// 条件触发模式：必须选择了触发条件
		if (effectiveTriggerType === "condition" && !conditionTrigger) {
			return false;
		}
		return true;
	};

	return (
		<>
			{/* RESET 模式的 UI */}
			<div className="flex flex-col gap-2">
				<Label
					htmlFor="resetVariable"
					className="text-sm font-medium pointer-events-none"
				>
					{t("variableNode.var")}
				</Label>
				<SelectInDialog
					id="resetVariable"
					value={variable}
					onValueChange={onVariableChange}
					placeholder={
						customVariables.length === 0 ? "无自定义变量" : "选择要重置的变量"
					}
					options={customVariableOptions}
					disabled={isEditing}
					emptyMessage="未配置自定义变量，请在策略起点配置"
				/>
				{duplicateOperation && (
					<p className="text-xs text-red-600 mt-1">
						{t("variableNode.duplicateOperationError", { operation: t(`variableNode.${duplicateOperation}`) })}
					</p>
				)}
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
					}
				}}
				availableTriggers={["condition", "timer"]}
				idPrefix="reset"
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
				{shouldShowHint() &&
					(() => {
						const selectedVar = customVariables.find(
							(v: CustomVariable) => v.varName === variable,
						);
						const variableDisplayName =
							selectedVar?.varDisplayName || variable;
						const formattedValue = selectedVar
							? formatVariableValue(varInitialValue, selectedVar.varValueType)
							: String(varInitialValue);

						const hint = getHintGenerator(selectedVar?.varValueType)({
							t,
							varOperation: "reset",
							variableDisplayName,
							value: formattedValue,
							selectedValues: Array.isArray(varInitialValue)
								? varInitialValue
								: undefined,
							conditionTrigger: conditionTrigger,
							timerTrigger: undefined,
						});

						return hint ? (
							<p className="text-xs text-muted-foreground">{hint}</p>
						) : null;
					})()}
			</div>
			)}

			{/* 定时配置 */}
			{effectiveTriggerType === "timer" && (
				<>
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
				{shouldShowHint() &&
					(() => {
						const selectedVar = customVariables.find(
							(v: CustomVariable) => v.varName === variable,
						);
						const variableDisplayName =
							selectedVar?.varDisplayName || variable;
						const formattedValue = selectedVar
							? formatVariableValue(varInitialValue, selectedVar.varValueType)
							: String(varInitialValue);

						const hint = getHintGenerator(selectedVar?.varValueType)({
							t,
							varOperation: "reset",
							variableDisplayName,
							value: formattedValue,
							selectedValues: Array.isArray(varInitialValue)
								? varInitialValue
								: undefined,
							conditionTrigger: undefined,
							timerTrigger: timerTrigger,
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
