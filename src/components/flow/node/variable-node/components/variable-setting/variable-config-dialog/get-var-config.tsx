import { Settings, User } from "lucide-react";
import { useEffect } from "react";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TimerConfig, TriggerCase } from "@/types/node/variable-node";
import {
	type CustomVariable,
	getVariableTypeIcon,
	getVariableTypeIconColor,
	SYSTEM_VARIABLE_METADATA,
	SystemVariable,
} from "@/types/variable";
import CaseSelector, { type CaseItemInfo } from "./components/case-selector";
import type { SymbolSelectorOption } from "./components/symbol-selector";
import SymbolSelector from "./components/symbol-selector";
import TimerConfigComponent from "./components/timer";
import TriggerTypeConfig from "./components/trigger-type-config";

interface GetVarConfigProps {
	symbol: string;
	variableName: string;
	variable: string;
	triggerType: "condition" | "timer" | "dataflow";
	timerConfig: TimerConfig;
	symbolOptions: SymbolSelectorOption[];
	symbolPlaceholder: string;
	symbolEmptyMessage: string;
	isSymbolSelectorDisabled: boolean;
	customVariables: CustomVariable[];
	caseItemList: CaseItemInfo[];
	selectedTriggerCase: TriggerCase | null;
	onSymbolChange: (value: string) => void;
	onVariableNameChange: (value: string) => void;
	onVariableChange: (value: string) => void;
	onTriggerTypeChange: (value: "condition" | "timer" | "dataflow") => void;
	onTimerConfigChange: (value: TimerConfig) => void;
	onTriggerCaseChange: (value: TriggerCase | null) => void;
	onValidationChange?: (isValid: boolean) => void;
}

const GetVarConfig: React.FC<GetVarConfigProps> = ({
	symbol,
	variableName,
	variable,
	triggerType,
	timerConfig,
	symbolOptions,
	symbolPlaceholder,
	symbolEmptyMessage,
	isSymbolSelectorDisabled,
	customVariables,
	caseItemList,
	selectedTriggerCase,
	onSymbolChange,
	onVariableNameChange,
	onVariableChange,
	onTriggerTypeChange,
	onTimerConfigChange,
	onTriggerCaseChange,
	onValidationChange,
}) => {
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

	// 判断当前选中的变量是否需要选择交易对
	const shouldShowSymbolSelector = () => {
		if (!variable) return false;

		// 检查是否是系统变量
		const isSystemVar = Object.values(SystemVariable).includes(
			variable as SystemVariable,
		);
		if (isSystemVar) {
			const metadata = SYSTEM_VARIABLE_METADATA[variable as SystemVariable];
			return metadata.shouldSelectSymbol;
		}

		// 自定义变量不需要选择交易对
		return false;
	};

	// 验证配置是否完整
	useEffect(() => {
		if (!onValidationChange) return;

		// 如果需要选择交易对但未选择，则验证失败
		const needsSymbol = shouldShowSymbolSelector();
		const isValid = !needsSymbol || (needsSymbol && !!symbol);

		onValidationChange(isValid);
	}, [variable, symbol, onValidationChange]);

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
					onValueChange={onVariableChange}
					placeholder="选择变量"
					searchPlaceholder="搜索变量..."
					emptyMessage="未找到变量"
					options={mixedVariableOptions}
				/>
			</div>

			{shouldShowSymbolSelector() && (
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
					变量名称
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
				triggerType={triggerType}
				onTriggerTypeChange={onTriggerTypeChange}
				availableTriggers={["condition", "timer"]}
				idPrefix="get"
			/>

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

export default GetVarConfig;
