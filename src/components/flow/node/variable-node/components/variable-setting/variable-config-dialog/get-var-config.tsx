import { Settings, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TriggerConfig, TimerTrigger, ConditionTrigger } from "@/types/node/variable-node";
import {
	getEffectiveTriggerType,
	getConditionTriggerConfig,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import {
	type CustomVariable,
	getVariableTypeIcon,
	getVariableTypeIconColor,
	SYSTEM_VARIABLE_METADATA,
	SystemVariable,
} from "@/types/variable";
import { generateGetHint } from "../../../variable-node-utils";
import CaseSelector, { type CaseItemInfo } from "./components/case-selector";
import type { SymbolSelectorOption } from "./components/symbol-selector";
import SymbolSelector from "./components/symbol-selector";
import TimerConfigComponent from "./components/timer";
import TriggerTypeConfig from "./components/trigger-type-config";

interface GetVarConfigProps {
	symbol: string;
	variableName: string;
	variable: string;
	triggerConfig: TriggerConfig;
	symbolOptions: SymbolSelectorOption[];
	symbolPlaceholder: string;
	symbolEmptyMessage: string;
	isSymbolSelectorDisabled: boolean;
	customVariables: CustomVariable[];
	caseItemList: CaseItemInfo[];
	isEditing?: boolean;
	onSymbolChange: (value: string) => void;
	onVariableNameChange: (value: string) => void;
	onVariableChange: (value: string) => void;
	onTriggerConfigChange: (value: TriggerConfig) => void;
	onValidationChange?: (isValid: boolean) => void;
}

const GetVarConfig: React.FC<GetVarConfigProps> = ({
	symbol,
	variableName,
	variable,
	triggerConfig,
	symbolOptions,
	symbolPlaceholder,
	symbolEmptyMessage,
	isSymbolSelectorDisabled,
	customVariables,
	caseItemList,
	isEditing = false,
	onSymbolChange,
	onVariableNameChange,
	onVariableChange,
	onTriggerConfigChange,
	onValidationChange,
}) => {
	// 从 triggerConfig 中提取各种触发配置
	const effectiveTriggerType = getEffectiveTriggerType({ triggerConfig }) ?? "condition";
	const conditionTrigger = getConditionTriggerConfig({ triggerConfig });
	const timerTrigger = getTimerTriggerConfig({ triggerConfig });

	// 使用 ref 缓存 timer 和 condition 配置，防止切换触发类型时丢失
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
	// 生成混合变量选项：自定义变量在前，系统变量在后
	const mixedVariableOptions = [
		// 自定义变量选项
		...customVariables.map((customVar) => {
			const TypeIconComponent = getVariableTypeIcon(customVar.varValueType);
			const typeIconColor = getVariableTypeIconColor(customVar.varValueType);

			return {
				value: customVar.varName,
				label: (
					<div className="flex items-center gap-2">
						<User className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
						<TypeIconComponent
							className={`h-4 w-4 ${typeIconColor} flex-shrink-0`}
						/>
						<span>{customVar.varDisplayName}</span>
						<span className="text-xs text-muted-foreground">
							({customVar.varName})
						</span>
					</div>
				),
				searchText: `${customVar.varDisplayName} ${customVar.varName}`,
			};
		}),
		// 系统变量选项
		...Object.values(SystemVariable).map((sysVar) => {
			const metadata = SYSTEM_VARIABLE_METADATA[sysVar];
			const TypeIconComponent = getVariableTypeIcon(metadata.varValueType);
			const typeIconColor = getVariableTypeIconColor(metadata.varValueType);

			return {
				value: sysVar,
				label: (
					<div className="flex items-center gap-2">
						<Settings className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
						<TypeIconComponent
							className={`h-4 w-4 ${typeIconColor} flex-shrink-0`}
						/>
						<span>{metadata.varDisplayName}</span>
						<span className="text-xs text-muted-foreground">
							({metadata.varName})
						</span>
					</div>
				),
				searchText: `${metadata.varDisplayName} ${metadata.varName}`,
			};
		}),
	];

	const selectedCustomVariable = variable
		? customVariables.find((customVar) => customVar.varName === variable)
		: undefined;

	const selectedSystemMetadata =
		variable && Object.values(SystemVariable).includes(variable as SystemVariable)
			? SYSTEM_VARIABLE_METADATA[variable as SystemVariable]
			: undefined;

	const selectedVariableInfo = selectedCustomVariable
		? {
				displayName: selectedCustomVariable.varDisplayName,
				varValueType: selectedCustomVariable.varValueType,
			}
		: selectedSystemMetadata
			? {
					displayName: selectedSystemMetadata.varDisplayName,
					varValueType: selectedSystemMetadata.varValueType,
				}
			: variable
				? {
						displayName: variable,
						varValueType: undefined,
					}
				: null;

	const variableDisplayName = variableName || selectedVariableInfo?.displayName;
	const variableValueType = selectedVariableInfo?.varValueType;

	// 判断当前选中的变量是否需要选择交易对
	const shouldShowSymbolSelector =
		!!variable && (selectedSystemMetadata?.shouldSelectSymbol ?? false);

	// 当变量改变时，如果切换到自定义变量（不需要 symbol），则清空 symbol 字段
	const handleVariableChange = (value: string) => {
		onVariableChange(value);

		// 检查新选择的变量是否是自定义变量
		const isCustomVariable = customVariables.some(
			(customVar) => customVar.varName === value
		);

		// 如果是自定义变量，清空 symbol
		if (isCustomVariable && symbol) {
			onSymbolChange("");
		}
	};

	// 验证配置是否完整
	useEffect(() => {
		if (!onValidationChange) return;

		let isValid = true;

		// 1. 如果需要选择交易对但未选择，则验证失败
		if (shouldShowSymbolSelector && !symbol) {
			isValid = false;
		}
		// 2. 条件触发模式：必须选择触发条件
		else if (effectiveTriggerType === "condition" && !conditionTrigger) {
			isValid = false;
		}

		onValidationChange(isValid);
	}, [variable, symbol, shouldShowSymbolSelector, effectiveTriggerType, conditionTrigger, onValidationChange]);


	// 判断是否应该显示提示文案
	const shouldShowConditionHint = () => {
		// 必须选择了触发条件
		if (!conditionTrigger) {
			return false;
		}
		// 如果需要交易对，必须选择了交易对
		if (shouldShowSymbolSelector && !symbol) {
			return false;
		}
		return true;
	};

	const shouldShowTimerHint = () => {
		// 如果需要交易对，必须选择了交易对
		if (shouldShowSymbolSelector && !symbol) {
			return false;
		}
		return true;
	};

	const conditionHint =
		effectiveTriggerType === "condition" && variableDisplayName && shouldShowConditionHint()
			? generateGetHint(variableDisplayName, {
					varValueType: variableValueType,
					triggerConfig: {
						triggerType: "condition",
						conditionTrigger: conditionTrigger,
						timerTrigger: undefined,
					},
					symbol: symbol || undefined,
				})
			: null;

	const timerHint =
		effectiveTriggerType === "timer" && variableDisplayName && shouldShowTimerHint()
			? generateGetHint(variableDisplayName, {
					varValueType: variableValueType,
					triggerConfig: {
						triggerType: "timer",
						conditionTrigger: undefined,
						timerTrigger: timerTrigger,
					},
					symbol: symbol || undefined,
				})
			: null;

	return (
		<>
			<div className="flex flex-col gap-2">
				<Label
					htmlFor="variable"
					className="text-sm font-medium pointer-events-none"
				>
					变量
				</Label>
				<SelectWithSearch
					id="variable"
					value={variable}
					onValueChange={handleVariableChange}
					placeholder="选择变量"
					searchPlaceholder="搜索变量..."
					emptyMessage="未找到变量"
					options={mixedVariableOptions}
					disabled={isEditing}
				/>
			</div>

			{shouldShowSymbolSelector && (
				<div className="flex flex-col gap-2">
					<Label
						htmlFor="symbol"
						className="text-sm font-medium pointer-events-none"
					>
						交易对
					</Label>
					<div className="w-full">
						<SymbolSelector
							options={symbolOptions}
							value={symbol}
							onChange={onSymbolChange}
							placeholder={symbolPlaceholder}
							emptyMessage={symbolEmptyMessage}
							disabled={isSymbolSelectorDisabled}
						/>
					</div>
				</div>
			)}

			<div className="flex flex-col gap-2">
				<Label
					htmlFor="variableName"
					className="text-sm font-medium pointer-events-none"
				>
					自定义变量名称
				</Label>
				<Input
					id="variableName"
					type="text"
					value={variableName}
					onChange={(e) => onVariableNameChange(e.target.value)}
					placeholder="输入变量名称"
					className="w-full"
				/>
			</div>

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
				idPrefix="get"
			/>

			{effectiveTriggerType === "condition" && (
				<div className="flex flex-col gap-2">
					<Label className="text-sm font-medium pointer-events-none">
						触发条件
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
					{conditionHint && (
						<p className="text-xs text-muted-foreground">{conditionHint}</p>
					)}
				</div>
			)}

			{effectiveTriggerType === "timer" && (
				<div className="flex flex-col gap-2">
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
					{timerHint && (
						<p className="text-xs text-muted-foreground">{timerHint}</p>
					)}
				</div>
			)}
		</>
	);
};

export default GetVarConfig;
