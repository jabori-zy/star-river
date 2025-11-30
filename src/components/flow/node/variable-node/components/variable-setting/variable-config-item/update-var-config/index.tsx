import { TbEdit } from "react-icons/tb";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getTriggerTypeInfo } from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DeleteConfigButton from "../../components/delete-config-button";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import { NodeType } from "@/types/node/index";
import type {
	UpdateVariableConfig,
	TimerTrigger,
	ConditionTrigger,
	TriggerConfig,
	UpdateVarValueOperation,
	DataFlowTrigger,
	DataflowErrorType,
	DataflowErrorPolicy,
	TimerUnit,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getDataFlowTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import {
	type CustomVariable,
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { getUpdateOperationPlaceholder } from "../../../../variable-node-utils";
import type { CaseItemInfo } from "@/components/flow/case-selector";
import DataFlowSelector from "../../components/dataflow-selector";
import TriggerTypeSwitcher from "../../components/trigger-type-switcher";
import BoolTypeOpEditor from "../../components/variable-op-editor/bool-type-op-editor";
import EnumTypeOpEditor from "../../components/variable-op-editor/enum-type-op-editor";
import NumberTypeOpEditor from "../../components/variable-op-editor/number-type-op-editor";
import StringTypeOpEditor from "../../components/variable-op-editor/string-type-op-editor";
import PercentTypeOpEditor from "../../components/variable-op-editor/percent-type-op-editor";
import TimeTypeOpEditor from "../../components/variable-op-editor/time-type-op-editor";
import { useValidateUpdateConfig } from "../validate";
import { useNodeConnections } from "@xyflow/react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { TradeMode } from "@/types/strategy";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	generateNumberHint,
	generateStringHint,
	generateBooleanHint,
	generateEnumHint,
	generateTimeHint,
	generatePercentageHint,
} from "../../../../hint-generators";

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
	getUpdateOperationLabel: (type: UpdateVarValueOperation, t: TFunction) => string;
	duplicateOperation?: string | null;
}

/**
 * 构建 TriggerConfig
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
	// dataflow 模式需要从其他地方获取 DataFlowTrigger 数据
	return undefined;
};

/**
 * 渲染更新操作编辑器
 * 根据变量类型返回对应的编辑器组件
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
	getUpdateOperationLabel: (type: UpdateVarValueOperation, t: TFunction) => string,
	triggerCase: ConditionTrigger | null,
	timerConfig: TimerTrigger | undefined,
	t: TFunction,
	onUpdateOperationTypeChange: (operation: UpdateVarValueOperation) => void,
	onUpdateValueChange: (value: string) => void,
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
		label: getUpdateOperationLabel(op, t),
	}));
	const varValueType = selectedVar?.varValueType || VariableValueType.NUMBER;

	// 构建 triggerConfig
	const triggerConfig = buildTriggerConfig(updateTriggerType, triggerCase, timerConfig);

	// 根据变量类型返回对应的编辑器组件
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
 * 创建空的 DataFlow 触发器配置
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
	const { getIfElseNodeCases, getConnectedNodeVariables } = useStrategyWorkflow();
	const { tradingMode } = useTradingModeStore();

	const effectiveTriggerType = React.useMemo(
		() => getEffectiveTriggerType(config) ?? "condition",
		[config]
	);

	const triggerCase = React.useMemo(
		() => getConditionTriggerConfig(config) ?? null,
		[config]
	);

	const timerConfig = React.useMemo(
		() => getTimerTriggerConfig(config),
		[config]
	);

	const dataflowConfig = React.useMemo(
		() => getDataFlowTriggerConfig(config),
		[config]
	);
	const dataflowValidationRef = React.useRef(true);

	// 使用 ref 缓存 timer、condition 和 dataflow 配置，防止切换触发类型时丢失
	const cachedTimerConfig = useRef<TimerTrigger>(
		timerConfig || { mode: "interval", interval: 1, unit: "hour" }
	);
	const cachedConditionConfig = useRef<ConditionTrigger | null>(triggerCase);
	const cachedDataflowConfig = useRef<DataFlowTrigger>(
		dataflowConfig || createEmptyDataflowTrigger()
	);

	// 获取当前节点的连接信息
	const connections = useNodeConnections({ id, handleType: "target" });

	// 存储上游节点的case列表
	const [caseItemList, setCaseItemList] = useState<CaseItemInfo[]>([]);
	// 存储上游节点的变量列表
	const [variableItemList, setVariableItemList] = useState<VariableItem[]>([]);

	// 获取上游节点的 case 列表和变量列表
	useEffect(() => {
		// filter default input handle connection
		const conn = connections.filter(
			connection => (connection.targetHandle === `${id}_default_input` || connection.targetHandle === config.inputHandleId)
		);
		const cases = getIfElseNodeCases(conn, tradingMode as TradeMode);
		setCaseItemList(cases);

		// 获取连接节点的变量并更新状态
		const variables = getConnectedNodeVariables(connections, tradingMode as TradeMode);
		setVariableItemList(variables);
	}, [connections, getIfElseNodeCases, getConnectedNodeVariables, id, tradingMode, config.inputHandleId]);

	// 当从 props 接收到新的配置时，更新缓存
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

	// 更新 dataflow 配置的辅助函数
	const updateDataflowConfig = (
		updater: (prev: DataFlowTrigger) => DataFlowTrigger,
	) => {
		const prevConfig = getDataFlowTriggerConfig(config) ?? createEmptyDataflowTrigger();
		const newConfig = updater(prevConfig);
		// 更新缓存
		cachedDataflowConfig.current = newConfig;
		// 通知父组件
		onConfigChange({
			...config,
			triggerConfig: {
				type: "dataflow",
				config: newConfig,
			},
		});
	};

	// 使用验证 Hook
	const { variable, triggerCase: triggerCaseError, dataflow, hasError } = useValidateUpdateConfig(config, {
		t,
		duplicateOperation,
		effectiveTriggerType,
	});

	// 组装错误对象供 UI 使用
	const errors = { variable, triggerCase: triggerCaseError, dataflow };

	// 处理变量选择变化
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

	// 处理触发类型变化
	const handleTriggerTypeChange = (triggerType: "condition" | "timer" | "dataflow") => {
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

	// 处理触发条件变化
	const handleTriggerCaseChange = (
		nextTriggerCase: ConditionTrigger | null,
	) => {
		// 更新缓存
		cachedConditionConfig.current = nextTriggerCase;
		// 通知父组件
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

	// 处理定时器配置变化
	const handleTimerConfigChange = (timerConfig: TimerTrigger) => {
		// 更新缓存
		cachedTimerConfig.current = timerConfig;
		// 通知父组件
		onConfigChange({
			...config,
			triggerConfig: {
				type: "timer",
				config: timerConfig,
			},
		});
	};

	// 处理数据流配置校验结果
	const handleDataflowValidationChange = React.useCallback(
		(isValid: boolean) => {
			dataflowValidationRef.current = isValid;
		},
		[],
	);

	// 处理过期时长变化
	const handleExpireDurationChange = (expireDuration: { unit: TimerUnit; duration: number }) => {
		updateDataflowConfig((prev) => ({
			...prev,
			expireDuration,
		}));
	};

	// 处理错误策略变化
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

	// 处理数据流节点变化
	const handleNodeChange = (nodeId: string, nodeType: NodeType | null, nodeName: string) => {
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

	// 处理数据流变量变化
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

	// 处理数据流操作类型变化
	const handleOperationTypeChangeDataflow = (operation: UpdateVarValueOperation) => {
		onConfigChange({
			...config,
			updateVarValueOperation: operation,
		});
	};

	// 处理更新操作类型变化（条件/定时模式）
	const handleUpdateOperationTypeChange = (operation: UpdateVarValueOperation) => {
		onConfigChange({
			...config,
			updateVarValueOperation: operation,
		});
	};

	// 处理更新值变化
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

	// 获取 updateValue 字符串
	const updateValue =
		typeof config.updateOperationValue === "string" ||
		typeof config.updateOperationValue === "number" ||
		typeof config.updateOperationValue === "boolean"
			? String(config.updateOperationValue)
			: Array.isArray(config.updateOperationValue)
				? JSON.stringify(config.updateOperationValue)
				: "";

	// 根据变量类型选择对应的生成器
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

	// 条件触发的提示文案
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

	// 定时触发的提示文案
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

	// 数据流触发的提示文案
	const dataflowHint =
		effectiveTriggerType === "dataflow" && config.varDisplayName && dataflowConfig
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
		<div className={`group flex-1 space-y-2 p-3 rounded-md border bg-background ${hasError ? "border-red-500" : "border-border"}`}>
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
									{/* 第一行：图标 + 操作标题 + 触发方式 + 操作类型 */}
									<div className="flex items-center gap-2">
										<TbEdit className="h-4 w-4 text-green-600 flex-shrink-0" />
										<span className="text-sm font-medium">{t("variableNode.updateVariable")}</span>
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

					{/* 删除按钮 */}
					<DeleteConfigButton onDelete={onDelete} />
				</div>

				{/* Dialog 中的完整配置 UI */}
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
									customVariables.length === 0 ? "无自定义变量" : "选择要更新的变量"
								}
								options={customVariableOptions}
								disabled={customVariables.length === 0}
								emptyMessage="未配置自定义变量，请在策略起点配置"
								className="w-full"
							/>
							{errors.variable && (
								<p className="text-xs text-red-600 mt-1">
									{errors.variable}
								</p>
							)}
						</div>

						{/* 触发方式 */}
						<TriggerTypeSwitcher
							triggerType={effectiveTriggerType}
							onTriggerTypeChange={handleTriggerTypeChange}
							idPrefix="update"
							caseItemList={caseItemList}
							selectedTriggerCase={triggerCase ?? null}
							onTriggerCaseChange={handleTriggerCaseChange}
							timerConfig={timerConfig || { mode: "interval", interval: 1, unit: "hour" }}
							onTimerConfigChange={handleTimerConfigChange}
							expireDuration={
								dataflowConfig?.expireDuration || { unit: "hour" as const, duration: 1 }
							}
							errorPolicy={
								dataflowConfig?.errorPolicy || {
									nullValue: { strategy: "skip" as const, errorLog: { notify: false as const } },
									expired: { strategy: "skip" as const, errorLog: { notify: false as const } },
									zeroValue: { strategy: "skip" as const, errorLog: { notify: false as const } },
								}
							}
							replaceValueType={customVariables.find((v) => v.varName === config.varName)?.varValueType}
							updateOperationType={config.updateVarValueOperation}
							onDataflowValidationChange={handleDataflowValidationChange}
							onExpireDurationChange={handleExpireDurationChange}
							onErrorPolicyChange={handleErrorPolicyChange}
						/>

						{errors.triggerCase && (
							<p className="text-xs text-red-600 mt-1">
								{errors.triggerCase}
							</p>
						)}

						{/* 数据流模式：操作符 + 上游节点变量选择器 */}
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
											selectedNodeId={dataflowConfig?.fromNodeId || null}
											selectedHandleId={dataflowConfig?.fromHandleId || null}
											selectedVariable={dataflowConfig?.fromVar || null}
											selectedVariableName={dataflowConfig?.fromVarDisplayName || null}
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
									<p className="text-xs text-red-600 mt-1">
										{errors.dataflow}
									</p>
								)}
							</div>
						)}

						{/* 条件触发和定时触发模式：更新操作和值 */}
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

			{/* 折叠状态下显示描述文案 */}
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