import { useNodeConnections } from "@xyflow/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TbRefresh } from "react-icons/tb";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import type { CaseItemInfo } from "@/components/flow/case-selector";
import { formatVariableValue } from "@/components/flow/node/start-node/components/utils";
import { getTriggerTypeInfo } from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type {
	ConditionTrigger,
	ResetVariableConfig,
	TimerTrigger,
	TriggerType,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import type { TradeMode } from "@/types/strategy";
import {
	type CustomVariable,
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";
import {
	generateBooleanHint,
	generateEnumHint,
	generateNumberHint,
	generatePercentageHint,
	generateStringHint,
	generateTimeHint,
} from "../../../../hint-generators";
import DeleteConfigButton from "../../components/delete-config-button";
import TriggerTypeSwitcher from "../../components/trigger-type-switcher";
import { useValidateResetConfig } from "../validate";

interface ResetVarConfigItemProps {
	id: string;
	config: ResetVariableConfig;
	onConfigChange: (config: ResetVariableConfig) => void;
	onDelete: () => void;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	duplicateOperation?: string | null;
}

const ResetVarConfigItem: React.FC<ResetVarConfigItemProps> = ({
	id,
	config,
	onConfigChange,
	onDelete,
	customVariables,
	customVariableOptions,
	duplicateOperation,
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const { getIfElseNodeCases } = useStrategyWorkflow();
	const { tradingMode } = useTradingModeStore();

	const effectiveTriggerType = getEffectiveTriggerType(config) ?? "condition";

	const triggerCase = getConditionTriggerConfig(config) ?? null;
	const timerConfig = getTimerTriggerConfig(config);

	// Use ref to cache timer and condition configs, preventing loss when switching trigger types
	const cachedTimerConfig = useRef<TimerTrigger>(
		timerConfig || { mode: "interval", interval: 1, unit: "hour" },
	);
	const cachedConditionConfig = useRef<ConditionTrigger | null>(triggerCase);

	// Get current node connection info
	// Extract node ID from config.inputHandleId
	const connections = useNodeConnections({ id, handleType: "target" });

	// Store case list from upstream nodes
	const [caseItemList, setCaseItemList] = useState<CaseItemInfo[]>([]);

	// Get case list from upstream nodes
	useEffect(() => {
		// filter default input handle connection
		const conn = connections.filter(
			(connection) =>
				connection.targetHandle === `${id}_default_input` ||
				connection.targetHandle === config.inputHandleId,
		);
		const cases = getIfElseNodeCases(conn, tradingMode as TradeMode);
		setCaseItemList(cases);
	}, [connections, getIfElseNodeCases, id, tradingMode, config.inputHandleId]);

	// Update cache when receiving new config from props
	useEffect(() => {
		if (timerConfig) {
			cachedTimerConfig.current = timerConfig;
		}
	}, [timerConfig]);

	useEffect(() => {
		if (triggerCase) {
			cachedConditionConfig.current = triggerCase;
		}
	}, [triggerCase]);

	// Handle variable selection change
	const handleVariableChange = (varName: string) => {
		const selectedVar = customVariables.find((v) => v.varName === varName);
		if (selectedVar) {
			onConfigChange({
				...config,
				varName: selectedVar.varName,
				varDisplayName: selectedVar.varDisplayName,
				varValueType: selectedVar.varValueType,
				// Set default initial value based on variable type
				varInitialValue: selectedVar.initialValue,
			});
		}
	};

	// Use validation Hook
	const {
		variable,
		triggerCase: triggerCaseError,
		hasError,
	} = useValidateResetConfig(config, {
		t,
		duplicateOperation,
	});

	// Assemble error object for UI use
	const errors = { variable, triggerCase: triggerCaseError };

	// Handle trigger type change
	const handleTriggerTypeChange = (triggerType: TriggerType) => {
		if (triggerType === "condition") {
			onConfigChange({
				...config,
				triggerConfig: cachedConditionConfig.current
					? {
							type: "condition",
							config: cachedConditionConfig.current,
						}
					: null,
			});
		} else if (triggerType === "timer") {
			onConfigChange({
				...config,
				triggerConfig: {
					type: "timer",
					config: cachedTimerConfig.current,
				},
			});
		} else {
			onConfigChange({
				...config,
				triggerConfig: null,
			});
		}
	};

	// Handle trigger case change
	const handleTriggerCaseChange = (
		nextTriggerCase: ConditionTrigger | null,
	) => {
		// Update cache
		cachedConditionConfig.current = nextTriggerCase;
		// Notify parent component
		onConfigChange({
			...config,
			triggerConfig: nextTriggerCase
				? {
						type: "condition",
						config: nextTriggerCase,
					}
				: null,
		});
	};

	// Handle timer config change
	const handleTimerConfigChange = (timerConfig: TimerTrigger) => {
		// Update cache
		cachedTimerConfig.current = timerConfig;
		// Notify parent component
		onConfigChange({
			...config,
			triggerConfig: {
				type: "timer",
				config: timerConfig,
			},
		});
	};

	const typeInfo = getTriggerTypeInfo(effectiveTriggerType, t);
	const TriggerIcon = typeInfo.icon;

	const VarTypeIcon = getVariableValueTypeIcon(config.varValueType);
	const varTypeIconColor = getVariableValueTypeIconColor(config.varValueType);

	const formattedValue = formatVariableValue(
		config.varInitialValue,
		config.varValueType,
	);

	// Select the corresponding generator based on variable type
	const getHintGenerator = (varValueType?: VariableValueType) => {
		if (!varValueType) return generateNumberHint;

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

	// Determine whether to show hint text
	const shouldShowHint = () => {
		// Must have selected a variable
		if (!config.varName) {
			return false;
		}
		// Condition trigger mode: must have selected a trigger condition
		if (effectiveTriggerType === "condition" && !triggerCase) {
			return false;
		}
		return true;
	};

	// Generate condition trigger hint
	const conditionHint = (() => {
		if (effectiveTriggerType !== "condition" || !shouldShowHint()) {
			return null;
		}

		const selectedVar = customVariables.find(
			(v: CustomVariable) => v.varName === config.varName,
		);
		const variableDisplayName = selectedVar?.varDisplayName || config.varName;

		const hint = getHintGenerator(selectedVar?.varValueType)({
			t,
			varOperation: "reset",
			variableDisplayName,
			value: formattedValue,
			selectedValues: Array.isArray(config.varInitialValue)
				? config.varInitialValue
				: undefined,
			conditionTrigger: triggerCase,
			timerTrigger: undefined,
		});

		return hint;
	})();

	// Generate timer trigger hint
	const timerHint = (() => {
		if (effectiveTriggerType !== "timer" || !shouldShowHint()) {
			return null;
		}

		const selectedVar = customVariables.find(
			(v: CustomVariable) => v.varName === config.varName,
		);
		const variableDisplayName = selectedVar?.varDisplayName || config.varName;

		const hint = getHintGenerator(selectedVar?.varValueType)({
			t,
			varOperation: "reset",
			variableDisplayName,
			value: formattedValue,
			selectedValues: Array.isArray(config.varInitialValue)
				? config.varInitialValue
				: undefined,
			conditionTrigger: undefined,
			timerTrigger: timerConfig,
		});

		return hint;
	})();

	return (
		<div
			className={`group flex-1 space-y-2 p-3 rounded-md border bg-background ${hasError ? "border-red-500" : "border-border"}`}
		>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-start justify-between gap-2">
					<CollapsibleTrigger asChild>
						<div className="flex items-center gap-2 cursor-pointer">
							{isOpen ? (
								<ChevronDown className="h-4 w-4 flex-shrink-0" />
							) : (
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									{/* First row: icon + operation title + trigger method */}
									<div className="flex items-center gap-2">
										<TbRefresh className="h-4 w-4 text-orange-600 flex-shrink-0" />
										<span className="text-sm font-medium">
											{t("variableNode.resetVariable")}
										</span>
										<Badge className={`h-5 text-[10px] ${typeInfo.badgeColor}`}>
											<TriggerIcon className="h-3 w-3" />
											{typeInfo.label}
										</Badge>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top">
									<div className="flex items-center gap-1">
										<VarTypeIcon className={`text-sm ${varTypeIconColor}`} />
										<p>{config.varName}</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</div>
					</CollapsibleTrigger>

					{/* Delete button */}
					<DeleteConfigButton onDelete={onDelete} />
				</div>

				{/* Full config UI in dialog */}
				<CollapsibleContent>
					<div className="flex flex-col gap-2 mt-2">
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="resetVariable"
								className="text-sm font-medium pointer-events-none"
							>
								{t("variableNode.var")}
							</Label>
							<SelectInDialog
								id="resetVariable"
								value={config.varName}
								onValueChange={handleVariableChange}
								placeholder={
									customVariables.length === 0
										? t("variableNode.noCustomVariable")
										: t("variableNode.selectVariableToReset")
								}
								options={customVariableOptions}
								disabled={customVariables.length === 0}
								emptyMessage={t("variableNode.noCustomVariableHint")}
							/>
							{errors.variable && (
								<p className="text-xs text-red-600 mt-1">{errors.variable}</p>
							)}
						</div>

						{/* Trigger method */}
						<TriggerTypeSwitcher
							triggerType={effectiveTriggerType}
							onTriggerTypeChange={handleTriggerTypeChange}
							availableTriggers={["condition", "timer"]}
							idPrefix="reset"
							caseItemList={caseItemList}
							selectedTriggerCase={triggerCase ?? null}
							onTriggerCaseChange={handleTriggerCaseChange}
							timerConfig={
								timerConfig || { mode: "interval", interval: 1, unit: "hour" }
							}
							onTimerConfigChange={handleTimerConfigChange}
						/>

						{errors.triggerCase && (
							<p className="text-xs text-red-600 mt-1">{errors.triggerCase}</p>
						)}

						{/* Show description text when expanded */}
						{effectiveTriggerType === "condition" && conditionHint && (
							<p className="text-xs text-muted-foreground mt-2">
								{conditionHint}
							</p>
						)}

						{effectiveTriggerType === "timer" && timerHint && (
							<p className="text-xs text-muted-foreground mt-2">{timerHint}</p>
						)}
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* Show description text when collapsed */}
			{!isOpen && (
				<>
					{effectiveTriggerType === "condition" && conditionHint && (
						<p className="text-xs text-muted-foreground">{conditionHint}</p>
					)}

					{effectiveTriggerType === "timer" && timerHint && (
						<p className="text-xs text-muted-foreground">{timerHint}</p>
					)}
				</>
			)}
		</div>
	);
};

export default ResetVarConfigItem;
