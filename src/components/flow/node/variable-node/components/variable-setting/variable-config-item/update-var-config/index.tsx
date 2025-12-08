import { useNodeConnections } from "@xyflow/react";
import type { TFunction } from "i18next";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TbEdit } from "react-icons/tb";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import type { CaseItemInfo } from "@/components/flow/case-selector";
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
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useTradingModeStore from "@/store/use-trading-mode-store";
import { NodeType } from "@/types/node/index";
import type {
	ConditionTrigger,
	DataFlowTrigger,
	DataflowErrorPolicy,
	DataflowErrorType,
	TimerTrigger,
	TimerUnit,
	TriggerConfig,
	UpdateVariableConfig,
	UpdateVarValueOperation,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getDataFlowTriggerConfig,
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
import { getUpdateOperationPlaceholder } from "../../../../variable-node-utils";
import DataFlowSelector from "../../components/dataflow-selector";
import DeleteConfigButton from "../../components/delete-config-button";
import TriggerTypeSwitcher from "../../components/trigger-type-switcher";
import BoolTypeOpEditor from "../../components/variable-op-editor/bool-type-op-editor";
import EnumTypeOpEditor from "../../components/variable-op-editor/enum-type-op-editor";
import NumberTypeOpEditor from "../../components/variable-op-editor/number-type-op-editor";
import PercentTypeOpEditor from "../../components/variable-op-editor/percent-type-op-editor";
import StringTypeOpEditor from "../../components/variable-op-editor/string-type-op-editor";
import TimeTypeOpEditor from "../../components/variable-op-editor/time-type-op-editor";
import { useValidateUpdateConfig } from "../validate";


interface UpdateVarConfigItemProps {
	id: string;
	config: UpdateVariableConfig;
	onConfigChange: (config: UpdateVariableConfig) => void;
	onDelete: () => void;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	getAvailableOperations: (
		varValueType: VariableValueType,
		isDataflowMode?: boolean,
	) => UpdateVarValueOperation[];
	getUpdateOperationLabel: (
		type: UpdateVarValueOperation,
		t: TFunction,
	) => string;
	duplicateOperation?: string | null;
}

/**
 * Build TriggerConfig
 */
const buildTriggerConfig = (
	updateTriggerType: "condition" | "timer" | "dataflow",
	triggerCase: ConditionTrigger | null,
	timerConfig?: TimerTrigger,
): TriggerConfig | undefined => {
	if (updateTriggerType === "condition" && triggerCase) {
		return { type: "condition", config: triggerCase };
	}
	if (updateTriggerType === "timer" && timerConfig) {
		return { type: "timer", config: timerConfig };
	}
	// Dataflow mode needs to get DataFlowTrigger data from elsewhere
	return undefined;
};

/**
 * Render update operation editor
 * Returns the corresponding editor component based on variable type
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
	getUpdateOperationLabel: (
		type: UpdateVarValueOperation,
		t: TFunction,
	) => string,
	triggerCase: ConditionTrigger | null,
	timerConfig: TimerTrigger | undefined,
	t: TFunction,
	onUpdateOperationTypeChange: (operation: UpdateVarValueOperation) => void,
	onUpdateValueChange: (value: string) => void,
): React.ReactNode => {
	const selectedVar = customVariables.find(
		(v: CustomVariable) => v.varName === variable,
	);
	// Condition/timer trigger modes don't support max/min, dataflow mode does
	const isDataflowMode = updateTriggerType === "dataflow";
	const availableOps = getAvailableOperations(
		selectedVar?.varValueType || VariableValueType.NUMBER,
		isDataflowMode,
	);
	const availableOperationOptions = availableOps.map((op) => ({
		value: op,
		label: getUpdateOperationLabel(op, t),
	}));
	const varValueType = selectedVar?.varValueType || VariableValueType.NUMBER;

	// Build triggerConfig
	const triggerConfig = buildTriggerConfig(
		updateTriggerType,
		triggerCase,
		timerConfig,
	);

	// Return the corresponding editor component based on variable type
	switch (varValueType) {
		case VariableValueType.BOOLEAN:
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

		case VariableValueType.ENUM:
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

		case VariableValueType.PERCENTAGE:
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

		case VariableValueType.TIME:
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

		case VariableValueType.STRING:
			return (
				<StringTypeOpEditor
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

		case VariableValueType.NUMBER:
		default:
			return (
				<NumberTypeOpEditor
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
};

/**
 * Create empty DataFlow trigger configuration
 */
const createEmptyDataflowTrigger = (): DataFlowTrigger => ({
	fromNodeId: "",
	fromNodeName: "",
	fromHandleId: "",
	fromVar: "",
	fromVarDisplayName: "",
	fromVarConfigId: 0,
	fromNodeType: NodeType.VariableNode,
	fromVarValueType: VariableValueType.NUMBER,
	expireDuration: {
		unit: "hour",
		duration: 1,
	},
	errorPolicy: {
		nullValue: { strategy: "skip", errorLog: { notify: false } },
		expired: { strategy: "skip", errorLog: { notify: false } },
		zeroValue: { strategy: "skip", errorLog: { notify: false } },
	},
});

const UpdateVarConfigItem: React.FC<UpdateVarConfigItemProps> = ({
	id,
	config,
	onConfigChange,
	onDelete,
	customVariables,
	customVariableOptions,
	getAvailableOperations,
	getUpdateOperationLabel,
	duplicateOperation,
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const { getIfElseNodeCases, getConnectedNodeVariables } =
		useStrategyWorkflow();
	const { tradingMode } = useTradingModeStore();

	const effectiveTriggerType = React.useMemo(
		() => getEffectiveTriggerType(config) ?? "condition",
		[config],
	);

	const triggerCase = React.useMemo(
		() => getConditionTriggerConfig(config) ?? null,
		[config],
	);

	const timerConfig = React.useMemo(
		() => getTimerTriggerConfig(config),
		[config],
	);

	const dataflowConfig = React.useMemo(
		() => getDataFlowTriggerConfig(config),
		[config],
	);
	const dataflowValidationRef = React.useRef(true);

	// Use ref to cache timer, condition and dataflow configurations to prevent loss when switching trigger types
	const cachedTimerConfig = useRef<TimerTrigger>(
		timerConfig || { mode: "interval", interval: 1, unit: "hour" },
	);
	const cachedConditionConfig = useRef<ConditionTrigger | null>(triggerCase);
	const cachedDataflowConfig = useRef<DataFlowTrigger>(
		dataflowConfig || createEmptyDataflowTrigger(),
	);

	// Get connection information of current node
	const connections = useNodeConnections({ id, handleType: "target" });

	// Store case list of upstream nodes
	const [caseItemList, setCaseItemList] = useState<CaseItemInfo[]>([]);
	// Store variable list of upstream nodes
	const [variableItemList, setVariableItemList] = useState<VariableItem[]>([]);

	// Get case list and variable list of upstream nodes
	useEffect(() => {
		// Filter default input handle connection
		const conn = connections.filter(
			(connection) =>
				connection.targetHandle === `${id}_default_input` ||
				connection.targetHandle === config.inputHandleId,
		);
		const cases = getIfElseNodeCases(conn, tradingMode as TradeMode);
		setCaseItemList(cases);

		// Get variables from connected nodes and update state
		const variables = getConnectedNodeVariables(
			connections,
			tradingMode as TradeMode,
		);
		setVariableItemList(variables);
	}, [
		connections,
		getIfElseNodeCases,
		getConnectedNodeVariables,
		id,
		tradingMode,
		config.inputHandleId,
	]);

	// Update cache when receiving new configuration from props
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

	useEffect(() => {
		if (dataflowConfig) {
			cachedDataflowConfig.current = dataflowConfig;
		}
	}, [dataflowConfig]);

	// Helper function to update dataflow configuration
	const updateDataflowConfig = (
		updater: (prev: DataFlowTrigger) => DataFlowTrigger,
	) => {
		const prevConfig =
			getDataFlowTriggerConfig(config) ?? createEmptyDataflowTrigger();
		const newConfig = updater(prevConfig);
		// Update cache
		cachedDataflowConfig.current = newConfig;
		// Notify parent component
		onConfigChange({
			...config,
			triggerConfig: {
				type: "dataflow",
				config: newConfig,
			},
		});
	};

	// Use validation Hook
	const {
		variable,
		triggerCase: triggerCaseError,
		dataflow,
		hasError,
	} = useValidateUpdateConfig(config, {
		t,
		duplicateOperation,
		effectiveTriggerType,
	});

	// Assemble error object for UI use
	const errors = { variable, triggerCase: triggerCaseError, dataflow };

	// Handle variable selection change
	const handleVariableChange = (varName: string) => {
		const selectedVar = customVariables.find((v) => v.varName === varName);
		if (selectedVar) {
			onConfigChange({
				...config,
				varName: selectedVar.varName,
				varDisplayName: selectedVar.varDisplayName,
				varValueType: selectedVar.varValueType,
			});
		}
	};

	// Handle trigger type change
	const handleTriggerTypeChange = (
		triggerType: "condition" | "timer" | "dataflow",
	) => {
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
		} else if (triggerType === "dataflow") {
			onConfigChange({
				...config,
				triggerConfig: {
					type: "dataflow",
					config: cachedDataflowConfig.current,
				},
			});
		}
	};

	// Handle trigger condition change
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

	// Handle timer configuration change
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

	// Handle dataflow configuration validation result
	const handleDataflowValidationChange = React.useCallback(
		(isValid: boolean) => {
			dataflowValidationRef.current = isValid;
		},
		[],
	);

	// Handle expiration duration change
	const handleExpireDurationChange = (expireDuration: {
		unit: TimerUnit;
		duration: number;
	}) => {
		updateDataflowConfig((prev) => ({
			...prev,
			expireDuration,
		}));
	};

	// Handle error policy change
	const handleErrorPolicyChange = (
		errorType: DataflowErrorType,
		policy: DataflowErrorPolicy,
	) => {
		updateDataflowConfig((prev) => ({
			...prev,
			errorPolicy: {
				...prev.errorPolicy,
				[errorType]: policy,
			},
		}));
	};

	// Handle dataflow node change
	const handleNodeChange = (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => {
		updateDataflowConfig((prev) => {
			const isSameNode = prev.fromNodeId === nodeId;
			return {
				...prev,
				fromNodeId: nodeId,
				fromNodeName: nodeName,
				fromNodeType: nodeType ?? prev.fromNodeType ?? NodeType.VariableNode,
				...(isSameNode
					? {}
					: {
							fromHandleId: "",
							fromVar: "",
							fromVarDisplayName: "",
							fromVarConfigId: 0,
							fromVarValueType: VariableValueType.NUMBER,
						}),
			};
		});
	};

	// Handle dataflow variable change
	const handleVariableChangeDataflow = (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		variableValueType: VariableValueType,
	) => {
		updateDataflowConfig((prev) => ({
			...prev,
			fromHandleId: handleId,
			fromVar: variable,
			fromVarDisplayName: variableName,
			fromVarValueType: variableValueType,
			fromVarConfigId: variableId,
		}));
	};

	// Handle dataflow operation type change
	const handleOperationTypeChangeDataflow = (
		operation: UpdateVarValueOperation,
	) => {
		onConfigChange({
			...config,
			updateVarValueOperation: operation,
		});
	};

	// Handle update operation type change (condition/timer mode)
	const handleUpdateOperationTypeChange = (
		operation: UpdateVarValueOperation,
	) => {
		onConfigChange({
			...config,
			updateVarValueOperation: operation,
		});
	};

	// Handle update value change
	const handleUpdateValueChange = (value: string) => {
		onConfigChange({
			...config,
			updateOperationValue: value,
		});
	};

	const typeInfo = getTriggerTypeInfo(effectiveTriggerType, t);
	const TriggerIcon = typeInfo.icon;

	const VarTypeIcon = getVariableValueTypeIcon(config.varValueType);
	const varTypeIconColor = getVariableValueTypeIconColor(config.varValueType);

	// Get updateValue string
	const updateValue =
		typeof config.updateOperationValue === "string" ||
		typeof config.updateOperationValue === "number" ||
		typeof config.updateOperationValue === "boolean"
			? String(config.updateOperationValue)
			: Array.isArray(config.updateOperationValue)
				? JSON.stringify(config.updateOperationValue)
				: "";

	// Select the corresponding generator based on variable type
	const getHintGenerator = (varValueType?: VariableValueType) => {
		if (!varValueType) return generateNumberHint;

		switch (varValueType) {
			case VariableValueType.STRING:
				return generateStringHint;
			case VariableValueType.BOOLEAN:
				return generateBooleanHint;
			case VariableValueType.ENUM:
				return generateEnumHint;
			case VariableValueType.TIME:
				return generateTimeHint;
			case VariableValueType.PERCENTAGE:
				return generatePercentageHint;
			default:
				return generateNumberHint;
		}
	};

	// Hint text for condition trigger
	const conditionHint =
		effectiveTriggerType === "condition" && config.varDisplayName && triggerCase
			? getHintGenerator(config.varValueType)({
					t,
					varOperation: "update",
					variableDisplayName: config.varDisplayName,
					conditionTrigger: triggerCase,
					timerTrigger: undefined,
					dataflowTrigger: undefined,
					operationType: config.updateVarValueOperation,
					value: updateValue,
				})
			: null;

	// Hint text for timer trigger
	const timerHint =
		effectiveTriggerType === "timer" && config.varDisplayName && timerConfig
			? getHintGenerator(config.varValueType)({
					t,
					varOperation: "update",
					variableDisplayName: config.varDisplayName,
					conditionTrigger: undefined,
					timerTrigger: timerConfig,
					dataflowTrigger: undefined,
					operationType: config.updateVarValueOperation,
					value: updateValue,
				})
			: null;

	// Hint text for dataflow trigger
	const dataflowHint =
		effectiveTriggerType === "dataflow" &&
		config.varDisplayName &&
		dataflowConfig
			? getHintGenerator(config.varValueType)({
					t,
					varOperation: "update",
					variableDisplayName: config.varDisplayName,
					conditionTrigger: undefined,
					timerTrigger: undefined,
					dataflowTrigger: dataflowConfig,
					operationType: config.updateVarValueOperation,
					value: updateValue,
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
								<ChevronDown className="h-4 w-4 flex-shrink-0" />
							) : (
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									{/* First line: icon + operation title + trigger method + operation type */}
									<div className="flex items-center gap-2">
										<TbEdit className="h-4 w-4 text-green-600 flex-shrink-0" />
										<span className="text-sm font-medium">
											{t("variableNode.updateVariable")}
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

				{/* Complete configuration UI in Dialog */}
				<CollapsibleContent>
					<div className="flex flex-col gap-2 mt-2">
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="updateVariable"
								className="text-sm font-medium pointer-events-none"
							>
								{t("variableNode.var")}
							</Label>
							<SelectInDialog
								id="updateVariable"
								value={config.varName}
								onValueChange={handleVariableChange}
								placeholder={
									customVariables.length === 0
										? t("variableNode.noCustomVariable")
										: t("variableNode.selectVariableToUpdate")
								}
								options={customVariableOptions}
								disabled={customVariables.length === 0}
								emptyMessage={t("variableNode.noCustomVariableHint")}
								className="w-full"
							/>
							{errors.variable && (
								<p className="text-xs text-red-600 mt-1">{errors.variable}</p>
							)}
						</div>

						{/* Trigger method */}
						<TriggerTypeSwitcher
							triggerType={effectiveTriggerType}
							onTriggerTypeChange={handleTriggerTypeChange}
							idPrefix="update"
							caseItemList={caseItemList}
							selectedTriggerCase={triggerCase ?? null}
							onTriggerCaseChange={handleTriggerCaseChange}
							timerConfig={
								timerConfig || { mode: "interval", interval: 1, unit: "hour" }
							}
							onTimerConfigChange={handleTimerConfigChange}
							expireDuration={
								dataflowConfig?.expireDuration || {
									unit: "hour" as const,
									duration: 1,
								}
							}
							errorPolicy={
								dataflowConfig?.errorPolicy || {
									nullValue: {
										strategy: "skip" as const,
										errorLog: { notify: false as const },
									},
									expired: {
										strategy: "skip" as const,
										errorLog: { notify: false as const },
									},
									zeroValue: {
										strategy: "skip" as const,
										errorLog: { notify: false as const },
									},
								}
							}
							replaceValueType={
								customVariables.find((v) => v.varName === config.varName)
									?.varValueType
							}
							updateOperationType={config.updateVarValueOperation}
							onDataflowValidationChange={handleDataflowValidationChange}
							onExpireDurationChange={handleExpireDurationChange}
							onErrorPolicyChange={handleErrorPolicyChange}
						/>

						{errors.triggerCase && (
							<p className="text-xs text-red-600 mt-1">{errors.triggerCase}</p>
						)}

						{/* Dataflow mode: operator + upstream node variable selector */}
						{effectiveTriggerType === "dataflow" && config.varName && (
							<div className="flex flex-col gap-2">
								<Label
									htmlFor="dataflowOperation"
									className="text-sm font-medium pointer-events-none"
								>
									{t("variableNode.updateOp")}
								</Label>
								{(() => {
									const selectedVar = customVariables.find(
										(v: CustomVariable) => v.varName === config.varName,
									);
									// Dataflow mode passes true, supporting max/min operations
									let availableOps = getAvailableOperations(
										selectedVar?.varValueType || VariableValueType.NUMBER,
										true,
									);

									// In dataflow mode, remove toggle operation for BOOLEAN type
									if (selectedVar?.varValueType === VariableValueType.BOOLEAN) {
										availableOps = availableOps.filter((op) => op !== "toggle");
									}

									// Dataflow mode uniformly uses DataFlowSelector
									return (
										<DataFlowSelector
											variableItemList={variableItemList}
											selectedNodeId={dataflowConfig?.fromNodeId || null}
											selectedHandleId={dataflowConfig?.fromHandleId || null}
											selectedVariable={dataflowConfig?.fromVar || null}
											selectedVariableName={
												dataflowConfig?.fromVarDisplayName || null
											}
											updateOperationType={config.updateVarValueOperation}
											availableOperations={availableOps}
											targetVariableType={selectedVar?.varValueType}
											targetVariableDisplayName={selectedVar?.varDisplayName}
											onNodeChange={handleNodeChange}
											onVariableChange={handleVariableChangeDataflow}
											onOperationTypeChange={handleOperationTypeChangeDataflow}
										/>
									);
								})()}
								{errors.dataflow && (
									<p className="text-xs text-red-600 mt-1">{errors.dataflow}</p>
								)}
							</div>
						)}

						{/* Condition trigger and timer trigger mode: update operation and value */}
						{config.varName &&
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
										config.varName,
										config.updateVarValueOperation,
										updateValue,
										effectiveTriggerType,
										customVariables,
										getAvailableOperations,
										getUpdateOperationLabel,
										triggerCase ?? null,
										timerConfig,
										t,
										handleUpdateOperationTypeChange,
										handleUpdateValueChange,
									)}
								</div>
							)}
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* Display description text when collapsed */}
			{!isOpen && (
				<>
					{effectiveTriggerType === "condition" && conditionHint && (
						<p className="text-xs text-muted-foreground">{conditionHint}</p>
					)}

					{effectiveTriggerType === "timer" && timerHint && (
						<p className="text-xs text-muted-foreground">{timerHint}</p>
					)}

					{effectiveTriggerType === "dataflow" && dataflowHint && (
						<p className="text-xs text-muted-foreground">{dataflowHint}</p>
					)}
				</>
			)}
		</div>
	);
};

export default UpdateVarConfigItem;
