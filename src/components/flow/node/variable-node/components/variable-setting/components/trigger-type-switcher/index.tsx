import { useTranslation } from "react-i18next";
import CaseSelector, {
	type CaseItemInfo,
} from "@/components/flow/case-selector";
import { getTriggerTypeInfo } from "@/components/flow/node/variable-node/variable-node-utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type {
	ConditionTrigger,
	DataflowErrorPolicy,
	DataflowErrorType,
	TimerTrigger,
	TimerUnit,
	TriggerType,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import { TradeMode } from "@/types/strategy";
import type { VariableValueType } from "@/types/variable";
import DataflowConfig from "./dataflow-config";
import TimerConfigComponent from "./timer-config";

interface TriggerTypeSwitcherProps {
	triggerType: TriggerType;
	onTriggerTypeChange: (value: TriggerType) => void;
	availableTriggers?: TriggerType[]; // 可选：指定可用的触发类型，不指定则显示全部
	idPrefix?: string;
	// Condition 触发相关
	caseItemList?: CaseItemInfo[];
	selectedTriggerCase?: ConditionTrigger | null;
	onTriggerCaseChange?: (triggerCase: ConditionTrigger | null) => void;
	// Timer 触发相关
	timerConfig?: TimerTrigger;
	onTimerConfigChange?: (config: TimerTrigger) => void;
	// Dataflow 触发相关
	expireDuration?: { unit: TimerUnit; duration: number };
	errorPolicy?: Partial<Record<DataflowErrorType, DataflowErrorPolicy>>;
	replaceValueType?: VariableValueType;
	updateOperationType?: UpdateVarValueOperation;
	onExpireDurationChange?: (config: {
		unit: TimerUnit;
		duration: number;
	}) => void;
	onErrorPolicyChange?: (
		errorType: DataflowErrorType,
		policy: DataflowErrorPolicy,
	) => void;
	onDataflowValidationChange?: (isValid: boolean) => void;
}

const TRIGGER_TYPES: TriggerType[] = ["condition", "timer", "dataflow"];

const TriggerTypeSwitcher: React.FC<TriggerTypeSwitcherProps> = ({
	triggerType,
	onTriggerTypeChange,
	availableTriggers,
	idPrefix = "trigger",
	caseItemList = [],
	selectedTriggerCase = null,
	onTriggerCaseChange,
	timerConfig,
	onTimerConfigChange,
	expireDuration,
	errorPolicy,
	replaceValueType,
	updateOperationType,
	onExpireDurationChange,
	onErrorPolicyChange,
	onDataflowValidationChange,
}) => {
	// 如果指定了 availableTriggers，则只显示指定的触发类型；否则显示全部
	const displayTypes = availableTriggers || TRIGGER_TYPES;
	const { t } = useTranslation();
	const { tradingMode } = useTradingModeStore();

	// 判断是否在 backtest 模式下
	const isBacktestMode = tradingMode === TradeMode.BACKTEST;

	return (
		<div className="space-y-3">
			{/* 触发类型选择器 */}
			<div className="space-y-1">
				<Label className="text-sm font-medium">
					{t("variableNode.triggerType")}
				</Label>
				<div className="flex flex-row items-center justify-between pt-1 px-2">
					<TooltipProvider>
						{displayTypes.map((type) => {
							const typeInfo = getTriggerTypeInfo(type, t);
							const IconComponent = typeInfo.icon;
							const triggerId = `${idPrefix}-${type}-trigger`;

							// 判断 Timer 触发器是否应该被禁用
							const isTimerDisabled = type === "timer" && isBacktestMode;

							const checkboxContent = (
								<div className="flex items-center space-x-1">
									<Checkbox
										id={triggerId}
										checked={triggerType === type}
										disabled={isTimerDisabled}
										onCheckedChange={(checked) => {
											if (checked && !isTimerDisabled) {
												onTriggerTypeChange(type);
											}
										}}
									/>
									<Label
										htmlFor={triggerId}
										className={`text-sm flex items-center gap-1 ${
											isTimerDisabled
												? "cursor-not-allowed opacity-50"
												: "cursor-pointer"
										}`}
									>
										<IconComponent
											className={`h-3.5 w-3.5 ${typeInfo.color}`}
										/>
										{typeInfo.label}
									</Label>
								</div>
							);

							// 如果是禁用的 Timer，添加 Tooltip
							if (isTimerDisabled) {
								return (
									<Tooltip key={type}>
										<TooltipTrigger asChild>{checkboxContent}</TooltipTrigger>
										<TooltipContent>
											<p>
												{t(
													"variableNode.timerConfig.unavailableInBacktestMode",
												)}
											</p>
										</TooltipContent>
									</Tooltip>
								);
							}

							return <div key={type}>{checkboxContent}</div>;
						})}
					</TooltipProvider>
				</div>
			</div>

			{/* Condition 触发配置 */}
			{triggerType === "condition" && onTriggerCaseChange && (
				<div className="space-y-2">
					<Label className="text-sm font-medium pointer-events-none">
						{t("variableNode.triggerCase")}
					</Label>
					<CaseSelector
						caseList={caseItemList}
						selectedTriggerCase={selectedTriggerCase}
						onTriggerCaseChange={onTriggerCaseChange}
					/>
				</div>
			)}

			{/* Timer 触发配置 */}
			{triggerType === "timer" && timerConfig && onTimerConfigChange && (
				<div className="rounded-md border border-gray-200 p-3">
					<TimerConfigComponent
						timerConfig={timerConfig}
						onTimerConfigChange={onTimerConfigChange}
					/>
				</div>
			)}

			{/* Dataflow 触发配置 */}
			{triggerType === "dataflow" &&
				expireDuration &&
				errorPolicy &&
				onExpireDurationChange &&
				onErrorPolicyChange && (
					<div className="">
						<DataflowConfig
							expireDuration={expireDuration}
							errorPolicy={errorPolicy}
							replaceValueType={replaceValueType}
							updateOperationType={updateOperationType}
							onExpireDurationChange={onExpireDurationChange}
							onErrorPolicyChange={onErrorPolicyChange}
							onValidationChange={onDataflowValidationChange}
						/>
					</div>
				)}
		</div>
	);
};

export default TriggerTypeSwitcher;
