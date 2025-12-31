import { useNodeConnections } from "@xyflow/react";
import { ChevronDown, ChevronRight, Settings, User } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TbFileImport } from "react-icons/tb";
import type { CaseItemInfo } from "@/components/flow/case-selector";
import { getTriggerTypeInfo } from "@/components/flow/node/variable-node/variable-node-utils";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useCustomSysVariableName } from "@/store/use-custom-sys-variable-name";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	type ConditionTrigger,
	type GetVariableConfig,
	getConditionTriggerConfig,
	// getDataFlowTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
	type TimerTrigger,
	type TriggerType,
} from "@/types/node/variable-node";
import type { TradeMode } from "@/types/strategy";
import {
	type CustomVariable,
	getSystemVariableMetadata,
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	SystemVariableType,
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
import type { SymbolSelectorOption } from "../../components/symbol-selector";
import SymbolSelector from "../../components/symbol-selector";
import TriggerTypeSwitcher from "../../components/trigger-type-switcher";
import { useValidateGetConfig } from "../validate";

interface GetVarConfigItemProps {
	id: string;
	config: GetVariableConfig;
	onConfigChange: (config: GetVariableConfig) => void;
	onDelete: () => void;
	customVariables: CustomVariable[];
	symbolOptions: SymbolSelectorOption[];
	isSymbolSelectorDisabled: boolean;
	duplicateOperation?: string | null;
}

const GetVarConfigItem: React.FC<GetVarConfigItemProps> = ({
	id,
	config,
	onConfigChange,
	onDelete,
	customVariables,
	symbolOptions,
	isSymbolSelectorDisabled,
	duplicateOperation,
}) => {
	const { t } = useTranslation();
	const { getCustomName, setCustomName } = useCustomSysVariableName();
	const [isOpen, setIsOpen] = useState(false);
	const { getIfElseNodeCases } = useStrategyWorkflow();
	const { tradingMode } = useTradingModeStore();

	// Local state for display name input, avoiding cursor jump issues
	const [localDisplayName, setLocalDisplayName] = useState(
		config.varDisplayName,
	);
	const isLocalEditingRef = useRef(false);

	const effectiveTriggerType = getEffectiveTriggerType(config) ?? "condition";
	const triggerCase = getConditionTriggerConfig(config) ?? null;
	const timerConfig = getTimerTriggerConfig(config);
	// const dataflowConfig = getDataFlowTriggerConfig(config);

	// Use ref to cache timer and condition configs, preventing loss when switching trigger types
	const cachedTimerConfig = useRef<TimerTrigger>(
		timerConfig || { mode: "interval", interval: 1, unit: "hour" },
	);
	const cachedConditionConfig = useRef<ConditionTrigger | null>(triggerCase);

	// Get current node connection info
	// Extract node ID from config.inputHandleId
	// Format: variable_node_1763022786201_1piowqt_input_1
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

	// Check if currently selected variable is a system variable
	const isSystemVariable = config.varName
		? Object.values(SystemVariableType).includes(
				config.varName as SystemVariableType,
			)
		: false;

	// Sync to local state when external config.varDisplayName changes (not triggered by local editing)
	useEffect(() => {
		if (
			!isLocalEditingRef.current &&
			config.varDisplayName !== localDisplayName
		) {
			setLocalDisplayName(config.varDisplayName);
		}
	}, [config.varDisplayName, localDisplayName]);

	// Listen for changes to custom system variable names in store, update varDisplayName in real-time
	useEffect(() => {
		if (isSystemVariable && config.varName && !isLocalEditingRef.current) {
			const customName = getCustomName(config.varName);
			if (customName && customName !== config.varDisplayName) {
				onConfigChange({
					...config,
					varDisplayName: customName,
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [config, getCustomName, onConfigChange, isSystemVariable]);

	// Check if currently selected variable needs symbol selection
	const shouldShowSymbolSelector =
		!!config.varName &&
		isSystemVariable &&
		(Object.values(SystemVariableType).includes(
			config.varName as SystemVariableType,
		)
			? (getSystemVariableMetadata(t)[config.varName as SystemVariableType]
					?.shouldSelectSymbol ?? false)
			: false);

	// Use validation Hook
	const {
		variable,
		symbol,
		triggerCase: triggerCaseError,
		hasError,
	} = useValidateGetConfig(config, {
		t,
		duplicateOperation,
		shouldShowSymbolSelector,
		hasSymbol: "symbol" in config && !!config.symbol,
	});

	// Assemble error object for UI use
	const errors = { variable, symbol, triggerCase: triggerCaseError };

	// Handle variable selection change
	const handleVariableChange = (varName: string) => {
		// Check if it's a custom variable or system variable
		const isCustomVar = customVariables.some((v) => v.varName === varName);
		const isSystemVar = Object.values(SystemVariableType).includes(
			varName as SystemVariableType,
		);

		if (isCustomVar) {
			// Custom variable
			const selectedVar = customVariables.find((v) => v.varName === varName);
			if (selectedVar) {
				// Build new custom variable config with only necessary fields
				const newConfig: GetVariableConfig = {
					configId: config.configId,
					inputHandleId: config.inputHandleId,
					outputHandleId: config.outputHandleId,
					varOperation: "get",
					varType: "custom",
					varName: selectedVar.varName,
					varDisplayName: selectedVar.varDisplayName,
					varValueType: selectedVar.varValueType,
					varValue: config.varValue,
					triggerConfig: config.triggerConfig,
				};
				onConfigChange(newConfig);
			}
		} else if (isSystemVar) {
			// System variable
			const metadata =
				getSystemVariableMetadata(t)[varName as SystemVariableType];
			// Load custom name from store
			const customName = getCustomName(varName);

			// Get current symbol value (if exists)
			const currentSymbol = "symbol" in config ? config.symbol : null;

			const newConfig: GetVariableConfig = {
				configId: config.configId,
				inputHandleId: config.inputHandleId,
				outputHandleId: config.outputHandleId,
				varOperation: "get",
				varType: "system",
				varName: metadata.varName,
				varDisplayName: customName || metadata.varDisplayName,
				varValueType: metadata.varValueType,
				varValue: config.varValue,
				triggerConfig: config.triggerConfig,
				symbol: metadata.shouldSelectSymbol ? currentSymbol || null : undefined,
			};
			onConfigChange(newConfig);
		}
	};

	// Handle symbol selection change
	const handleSymbolChange = (symbol: string) => {
		if ("symbol" in config) {
			onConfigChange({
				...config,
				symbol: symbol || null,
			} as GetVariableConfig);
		}
	};

	// Handle custom variable name change - only update local state
	const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		isLocalEditingRef.current = true;
		setLocalDisplayName(e.target.value);
	};

	// Sync to external state on blur
	const handleDisplayNameBlur = () => {
		isLocalEditingRef.current = false;

		if (localDisplayName !== config.varDisplayName) {
			// If it's a system variable, also update store
			if (isSystemVariable && config.varName) {
				setCustomName(config.varName, localDisplayName);
			}

			onConfigChange({
				...config,
				varDisplayName: localDisplayName,
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
	const handleTimerConfigChange = (nextTimerConfig: TimerTrigger) => {
		// Update cache
		cachedTimerConfig.current = nextTimerConfig;
		// Notify parent component
		onConfigChange({
			...config,
			triggerConfig: {
				type: "timer",
				config: nextTimerConfig,
			},
		});
	};

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
			// get operation currently doesn't support dataflow, fall back to clearing trigger config
			onConfigChange({
				...config,
				triggerConfig: null,
			});
		}
	};
	const typeInfo = getTriggerTypeInfo(effectiveTriggerType, t);
	const TriggerIcon = typeInfo.icon;

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

	// const hint = getHintGenerator(config.varValueType)({
	// 	t,
	// 	varOperation: "get",
	// 	variableDisplayName: config.varDisplayName,
	// 	conditionTrigger: triggerCase,
	// 	timerTrigger: timerConfig,
	// 	dataflowTrigger: dataflowConfig,
	// 	symbol: ("symbol" in config ? config.symbol : null) || undefined,
	// });

	const VarTypeIcon = getVariableValueTypeIcon(config.varValueType);
	const varTypeIconColor = getVariableValueTypeIconColor(config.varValueType);

	// Generate mixed variable options: custom variables first, system variables after
	const mixedVariableOptions = [
		// Custom variable options
		...customVariables.map((customVar) => {
			const TypeIconComponent = getVariableValueTypeIcon(
				customVar.varValueType,
			);
			const typeIconColor = getVariableValueTypeIconColor(
				customVar.varValueType,
			);

			return {
				value: customVar.varName,
				label: (
					<div className="flex items-center gap-2">
						<User className="h-3.5 w-3.5 text-green-600 shrink-0" />
						<TypeIconComponent
							className={`h-4 w-4 ${typeIconColor} shrink-0`}
						/>
						<span>{customVar.varName}</span>
						{/* <span className="text-xs text-muted-foreground">
							({customVar.varName})
						</span> */}
					</div>
				),
				searchText: `${customVar.varDisplayName} ${customVar.varName}`,
			};
		}),
		// System variable options
		...Object.values(SystemVariableType).map((sysVar) => {
			const metadata = getSystemVariableMetadata(t)[sysVar];
			const TypeIconComponent = getVariableValueTypeIcon(metadata.varValueType);
			const typeIconColor = getVariableValueTypeIconColor(
				metadata.varValueType,
			);

			return {
				value: sysVar,
				label: (
					<div className="flex items-center gap-2">
						<Settings className="h-3.5 w-3.5 text-gray-600 shrink-0" />
						<TypeIconComponent
							className={`h-4 w-4 ${typeIconColor} shrink-0`}
						/>
						<span>{metadata.varName}</span>
						{/* <span className="text-xs text-muted-foreground">
							({metadata.varName})
						</span> */}
					</div>
				),
				searchText: `${metadata.varDisplayName} ${metadata.varName}`,
			};
		}),
	];

	// Check if currently selected variable is a custom variable
	const isCustomVariable = config.varName
		? customVariables.some((customVar) => customVar.varName === config.varName)
		: false;

	// Condition trigger hint text
	const shouldShowConditionHint = () => {
		// Must have selected a trigger condition
		if (!triggerCase) {
			return false;
		}
		// If symbol selection is required, must have selected a symbol
		if (
			shouldShowSymbolSelector &&
			!("symbol" in config ? config.symbol : null)
		) {
			return false;
		}
		return true;
	};

	// Timer trigger hint text
	const shouldShowTimerHint = () => {
		// If symbol selection is required, must have selected a symbol
		if (
			shouldShowSymbolSelector &&
			!("symbol" in config ? config.symbol : null)
		) {
			return false;
		}
		return true;
	};

	const conditionHint =
		effectiveTriggerType === "condition" &&
		config.varDisplayName &&
		shouldShowConditionHint()
			? getHintGenerator(config.varValueType)({
					t,
					varOperation: "get",
					variableDisplayName: config.varDisplayName,
					conditionTrigger: triggerCase,
					timerTrigger: undefined,
					dataflowTrigger: undefined,
					symbol: ("symbol" in config ? config.symbol : null) || undefined,
				})
			: null;

	const timerHint =
		effectiveTriggerType === "timer" &&
		config.varDisplayName &&
		shouldShowTimerHint()
			? getHintGenerator(config.varValueType)({
					t,
					varOperation: "get",
					variableDisplayName: config.varDisplayName,
					conditionTrigger: undefined,
					timerTrigger: timerConfig,
					dataflowTrigger: undefined,
					symbol: ("symbol" in config ? config.symbol : null) || undefined,
				})
			: null;

	return (
		<div
			className={`group flex-1 space-y-2 p-3 rounded-md border bg-background ${hasError ? "border-red-500" : "border-border"}`}
		>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-start justify-between gap-2">
					<CollapsibleTrigger asChild>
						<div className="flex items-center gap-2 cursor-pointer">
							{isOpen ? (
								<ChevronDown className="h-4 w-4 shrink-0" />
							) : (
								<ChevronRight className="h-4 w-4 shrink-0" />
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									{/* First row: icon + operation title + trigger method */}
									<div className="flex items-center gap-2">
										<TbFileImport className="h-4 w-4 text-blue-600 shrink-0" />
										<span className="text-sm font-medium">
											{t("variableNode.getVariable")}
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
								htmlFor="variable"
								className="text-sm font-medium pointer-events-none"
							>
								{t("variableNode.var")}
							</Label>
							<SelectWithSearch
								id="variable"
								value={config.varName}
								onValueChange={handleVariableChange}
								placeholder={t("variableNode.selectVariable")}
								searchPlaceholder={t("variableNode.searchVariable")}
								emptyMessage={t("variableNode.emptyMessage")}
								options={mixedVariableOptions}
								className="shadow-none"
							/>
							{errors.variable && (
								<p className="text-xs text-red-600 mt-1">{errors.variable}</p>
							)}
						</div>

						{shouldShowSymbolSelector && (
							<div className="flex flex-col gap-2">
								<Label
									htmlFor="symbol"
									className="text-sm font-medium pointer-events-none"
								>
									{t("variableNode.symbol")}
								</Label>
								<div className="w-full">
									<SymbolSelector
										options={symbolOptions}
										value={("symbol" in config ? config.symbol : null) || ""}
										onChange={handleSymbolChange}
										disabled={isSymbolSelectorDisabled}
									/>
								</div>
								{errors.symbol && (
									<p className="text-xs text-red-600 mt-1">{errors.symbol}</p>
								)}
							</div>
						)}

						{!isCustomVariable && (
							<div className="flex flex-col gap-2">
								<Label
									htmlFor="variableName"
									className="text-sm font-medium pointer-events-none"
								>
									{t("variableNode.customVariableName")}
								</Label>
								<Input
									id="variableName"
									type="text"
									value={localDisplayName}
									onChange={handleDisplayNameChange}
									onBlur={handleDisplayNameBlur}
									placeholder={t("variableNode.inputVariableName")}
									className="w-full"
								/>
							</div>
						)}

						<TriggerTypeSwitcher
							triggerType={effectiveTriggerType}
							onTriggerTypeChange={handleTriggerTypeChange}
							availableTriggers={["condition", "timer"]}
							idPrefix="get"
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

export default GetVarConfigItem;
