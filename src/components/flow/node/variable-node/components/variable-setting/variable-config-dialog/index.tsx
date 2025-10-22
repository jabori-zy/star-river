import { useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import useTradingModeStore from "@/store/use-trading-mode-store";
import { useCustomSysVariableName } from "@/store/use-custom-sys-variable-name";
import { NodeType } from "@/types/node/index";
import type {
	ConditionTrigger,
	DataFlowTrigger,
	DataflowErrorPolicy,
	DataflowErrorType,
	GetVariableConfig,
	ResetVariableConfig,
	TimerTrigger,
	TimerUnit,
	TriggerConfig,
	UpdateVariableConfig,
	UpdateVarValueOperation,
	VariableConfig,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getDataFlowTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import { TradeMode } from "@/types/strategy";
import {
	type CustomVariable,
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	getSystemVariableMetadata,
	SystemVariable,
	VariableValueType,
} from "@/types/variable";
import {
	generateVariableName,
	isDuplicateConfig,
} from "../../../variable-node-utils";
import type { SymbolSelectorOption } from "./components/symbol-selector";
import type { CaseItemInfo } from "./components/trigger-type-switcher/case-selector";
import GetVarConfig from "./get-var-config";
import ResetVarConfig from "./reset-var-config";
import UpdateVarConfig from "./update-var-config";
import VarOperateGuide from "./var-operate-guide";
import { getUpdateOperationLabel } from "./variable-setting-dialog-utils";

const buildTriggerConfigFromState = (
	triggerType: "condition" | "timer" | "dataflow",
	options: {
		timerConfig?: TimerTrigger;
		conditionConfig?: ConditionTrigger;
		dataflowConfig?: DataFlowTrigger;
	},
): TriggerConfig | undefined => {
	if (triggerType === "timer") {
		return options.timerConfig
			? { type: "timer", config: options.timerConfig }
			: undefined;
	}

	if (triggerType === "condition") {
		return options.conditionConfig
			? { type: "condition", config: options.conditionConfig }
			: undefined;
	}

	if (triggerType === "dataflow") {
		return options.dataflowConfig
			? { type: "dataflow", config: options.dataflowConfig }
			: undefined;
	}

	return undefined;
};

const DEFAULT_DATAFLOW_EXPIRE_DURATION: { unit: TimerUnit; duration: number } =
	{
		unit: "hour",
		duration: 1,
	};

const createDefaultDataflowErrorPolicy = (): Partial<
	Record<DataflowErrorType, DataflowErrorPolicy>
> => ({
	nullValue: { strategy: "skip", errorLog: { notify: false } },
	expired: { strategy: "skip", errorLog: { notify: false } },
	zeroValue: { strategy: "skip", errorLog: { notify: false } },
});

interface VariableConfigDialogProps {
	id: string; // 节点id
	isOpen: boolean;
	isEditing: boolean;
	editingConfig?: VariableConfig;
	onOpenChange: (open: boolean) => void;
	onSave: (id: string, config: VariableConfig) => void;
	existingConfigs: VariableConfig[];
	editingIndex: number | null;
	variableItemList: VariableItem[];
	caseItemList: CaseItemInfo[];
	symbolOptions: SymbolSelectorOption[];
	symbolPlaceholder: string;
	symbolEmptyMessage: string;
	isSymbolSelectorDisabled: boolean;
}

const VariableConfigDialog: React.FC<VariableConfigDialogProps> = ({
	id,
	isOpen,
	isEditing,
	editingConfig,
	onOpenChange,
	onSave,
	existingConfigs,
	editingIndex,
	variableItemList,
	caseItemList,
	symbolOptions,
	symbolPlaceholder,
	symbolEmptyMessage,
	isSymbolSelectorDisabled,
}) => {
	const { t } = useTranslation();
	const { setCustomName, getCustomName } = useCustomSysVariableName();
	
	// 获取开始节点的配置
	const {
		backtestConfig: startNodeBacktestConfig,
		liveConfig: startNodeLiveConfig,
		// simulateConfig: startNodeSimulateConfig,
	} = useStartNodeDataStore();
	const { tradingMode } = useTradingModeStore();

	// 获取工作流工具函数
	const { getTargetNodeIds } = useStrategyWorkflow();
	const { getNode } = useReactFlow();

	// 二次确认对话框状态
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
	const [pendingVariableConfig, setPendingVariableConfig] = React.useState<{
		varOperation: "get" | "update" | "reset";
		targetNodeCount: number;
		targetNodeNames: string[];
	} | null>(null);

	// 获取自定义变量列表
	const customVariables = React.useMemo(() => {
		if (tradingMode === TradeMode.BACKTEST) {
			return startNodeBacktestConfig?.customVariables || [];
		} else if (tradingMode === TradeMode.LIVE) {
			return startNodeLiveConfig?.customVariables || [];
		} else {
			return [];
		}
	}, [tradingMode, startNodeBacktestConfig, startNodeLiveConfig]);

	const customVariableOptions = React.useMemo(
		() =>
			customVariables.map((customVar: CustomVariable) => {
				const IconComponent = getVariableValueTypeIcon(customVar.varValueType);
				const iconColor = getVariableValueTypeIconColor(customVar.varValueType);

				return {
					value: customVar.varName,
					label: (
						<div className="flex items-center gap-2">
							<IconComponent className={`h-4 w-4 ${iconColor}`} />
							<span>{customVar.varDisplayName}</span>
							<span className="text-xs text-muted-foreground">
								({customVar.varName})
							</span>
						</div>
					),
				};
			}),
		[customVariables],
	);

	// 步骤状态: 1=选择操作类型, 2=配置参数
	const [currentStep, setCurrentStep] = React.useState<1 | 2>(1);

	// 表单状态
	const [varOperation, setVarOperation] = React.useState<
		"get" | "update" | "reset"
	>("get");
	const [symbol, setSymbol] = React.useState<string>("");
	const [variableName, setVariableName] = React.useState<string>("");
	const [variable, setVariable] = React.useState<string>(
		SystemVariable.TOTAL_POSITION_NUMBER,
	);
	const [triggerType, setTriggerType] = React.useState<
		"condition" | "timer" | "dataflow"
	>("condition");
	const [timerConfig, setTimerConfig] = React.useState<TimerTrigger>({
		mode: "interval",
		interval: 1,
		unit: "minute",
	});
	const [isNameAutoGenerated, setIsNameAutoGenerated] =
		React.useState<boolean>(true);
	// update模式的状态
	const [updateOperationType, setUpdateOperationType] =
		React.useState<UpdateVarValueOperation>("set");
	const [updateValue, setUpdateValue] = React.useState<string>("");
	const [updateTriggerType, setUpdateTriggerType] = React.useState<
		"condition" | "timer" | "dataflow"
	>("condition");

	// dataflow模式的状态 - 用于从上游节点选择变量
	const [dataflowNodeId, setDataflowNodeId] = React.useState<string | null>(
		null,
	);
	const [dataflowNodeType, setDataflowNodeType] =
		React.useState<NodeType | null>(null);
	const [dataflowNodeName, setDataflowNodeName] = React.useState<string | null>(
		null,
	);
	const [dataflowHandleId, setDataflowHandleId] = React.useState<string | null>(
		null,
	);
	const [dataflowVariable, setDataflowVariable] = React.useState<string | null>(
		null,
	);
	const [dataflowVariableName, setDataflowVariableName] = React.useState<
		string | null
	>(null);
	const [dataflowVariableId, setDataflowVariableId] = React.useState<
		number | null
	>(null);
	const [dataflowVariableValueType, setDataflowVariableValueType] =
		React.useState<VariableValueType | null>(null);
	const [dataflowExpireDuration, setDataflowExpireDuration] = React.useState<{
		unit: TimerUnit;
		duration: number;
	}>(() => ({ ...DEFAULT_DATAFLOW_EXPIRE_DURATION }));
	const [dataflowErrorPolicy, setDataflowErrorPolicy] = React.useState<
		Partial<Record<DataflowErrorType, DataflowErrorPolicy>>
	>(() => createDefaultDataflowErrorPolicy());

	// reset模式的状态 - 变量初始值
	const [varInitialValue, setVarInitialValue] = React.useState<
		string | number | boolean | string[]
	>("");

	// get模式的验证状态
	const [isGetConfigValid, setIsGetConfigValid] = React.useState<boolean>(true);

	// update模式的验证状态
	const [isUpdateConfigValid, setIsUpdateConfigValid] =
		React.useState<boolean>(true);

	// reset模式的验证状态
	const [isResetConfigValid, setIsResetConfigValid] =
		React.useState<boolean>(true);

	// get模式的条件触发配置 - 用于选择触发的 case
	const [triggerCase, setTriggerCase] = React.useState<ConditionTrigger | null>(
		null,
	);

	// 重复变量操作检测状态 - 存储重复的操作类型
	const [duplicateOperation, setDuplicateOperation] = React.useState<
		string | null
	>(null);

	// 用于追踪上一个变量的类型，以便在变量类型改变时清空更新值
	const prevVarValueTypeRef = React.useRef<VariableValueType | null>(null);

	// 检测是否有重复的变量操作配置（仅针对自定义变量）
	const checkDuplicateVariableOperation = React.useCallback(
		(varName: string): string | null => {
			// 检查是否是自定义变量
			const isCustomVariable = customVariables.some(
				(customVar: CustomVariable) => customVar.varName === varName,
			);

			// 只对自定义变量进行检测
			if (!isCustomVariable) {
				return null;
			}

			// 查找是否有相同变量的配置
			for (let i = 0; i < existingConfigs.length; i++) {
				// 如果是编辑模式,跳过当前正在编辑的配置
				if (isEditing && i === editingIndex) {
					continue;
				}

				const config = existingConfigs[i];
				if (config.varName === varName) {
					// 找到重复的配置,返回操作类型
					return config.varOperation;
				}
			}

			return null;
		},
		[customVariables, existingConfigs, isEditing, editingIndex],
	);

	// 根据变量类型和触发方式获取可用的更新操作
	const getAvailableOperations = (
		varValueType: VariableValueType,
		isDataflowMode?: boolean,
	): UpdateVarValueOperation[] => {
		if (
			varValueType === VariableValueType.NUMBER ||
			varValueType === VariableValueType.PERCENTAGE
		) {
			// 数据流模式支持 max 和 min，条件/定时触发模式不支持
			if (isDataflowMode) {
				return ["set", "add", "subtract", "multiply", "divide", "max", "min"];
			}
			return ["set", "add", "subtract", "multiply", "divide"];
		} else if (varValueType === VariableValueType.BOOLEAN) {
			return ["set", "toggle"];
		} else if (varValueType === VariableValueType.ENUM) {
			return ["set", "append", "remove", "clear"];
		} else {
			// STRING, TIME 类型只支持直接赋值
			return ["set"];
		}
	};

	// 生成 Dialog 标题
	const getDialogTitle = (): React.ReactNode => {
		const prefix = isEditing ? t("variableNode.edit") : t("variableNode.add");

		// Step 1: 返回基础标题
		if (currentStep === 1) {
			return `${prefix} ${t("variableNode.variableConfig")}`;
		}

		// Step 2: 根据操作类型返回带高亮的标题
		const operationLabels = {
			get: t("variableNode.get").toUpperCase(),
			update: t("variableNode.update").toUpperCase(),
			reset: t("variableNode.reset").toUpperCase(),
		};

		const operationLabel = operationLabels[varOperation];

		return (
			<>
				{prefix}{" "}
				<span className="font-semibold text-blue-600 px-1 py-0.5 rounded bg-blue-50">
					{operationLabel}
				</span>{" "}
				{t("variableNode.variableConfig")}
			</>
		);
	};

	// 生成 Dialog 描述
	const getDialogDescription = (): string => {
		// Step 1: 返回基础描述
		if (currentStep === 1) {
			return t("variableNode.addVariableDescription");
		}

		// Step 2: 根据操作类型返回对应描述
		const descriptionMap = {
			get: t("variableNode.getVarConfigDescription"),
			update: t("variableNode.updateVarConfigDescription"),
			reset: t("variableNode.resetVarConfigDescription"),
		};

		return descriptionMap[varOperation] || "";
	};

	const resetForm = useCallback(() => {
		setCurrentStep(1);
		setVarOperation("get");
		setSymbol("");
		setVariableName("");
		setVariable(SystemVariable.TOTAL_POSITION_NUMBER);
		setTriggerType("condition");
		setTimerConfig({
			mode: "interval",
			interval: 1,
			unit: "minute",
		});
		setIsNameAutoGenerated(true);
		setUpdateOperationType("set");
		setUpdateValue("");
		setUpdateTriggerType("condition");
		// 重置dataflow相关状态
		setDataflowNodeId(null);
		setDataflowNodeType(null);
		setDataflowNodeName(null);
		setDataflowHandleId(null);
		setDataflowVariable(null);
		setDataflowVariableName(null);
		setDataflowVariableId(null);
		setDataflowExpireDuration({ ...DEFAULT_DATAFLOW_EXPIRE_DURATION });
		setDataflowErrorPolicy(createDefaultDataflowErrorPolicy());
		// 重置reset模式状态
		setVarInitialValue("");
		// 重置验证状态
		setIsGetConfigValid(true);
		setIsUpdateConfigValid(true);
		setIsResetConfigValid(true);
		// 重置条件触发配置
		setTriggerCase(null);
		// 重置变量类型追踪
		prevVarValueTypeRef.current = null;
		// 重置二次确认状态
		setIsConfirmDialogOpen(false);
		setPendingVariableConfig(null);
		// 重置重复检测状态
		setDuplicateOperation(null);
	}, []);

	// 当切换操作类型时，自动选择合适的默认变量
	React.useEffect(() => {
		if (varOperation === "update" || varOperation === "reset") {
			if (customVariables.length > 0) {
				// 有自定义变量，自动选中第一个
				setVariable(customVariables[0].varName);
			} else {
				// 没有自定义变量，清空变量选择
				setVariable("");
			}
		} else if (varOperation === "get") {
			// 切换到 get 模式时，恢复为默认的系统变量
			setVariable(SystemVariable.TOTAL_POSITION_NUMBER);
			// 重置变量类型追踪
			prevVarValueTypeRef.current = null;
		}
	}, [varOperation, customVariables]);

	// 当变量改变时，检查当前的操作类型是否适用于新变量类型，如果不适用则自动切换
	React.useEffect(() => {
		if (varOperation === "update" && variable) {
			const selectedVar = customVariables.find(
				(v: CustomVariable) => v.varName === variable,
			);
			if (selectedVar) {
				// 检查变量类型是否改变
				const currentVarValueType = selectedVar.varValueType;
				const hasTypeChanged =
					prevVarValueTypeRef.current !== null &&
					prevVarValueTypeRef.current !== currentVarValueType;

				// 如果变量类型改变，清空更新值
				if (hasTypeChanged) {
					setUpdateValue("");
				}

				// 更新ref为当前类型
				prevVarValueTypeRef.current = currentVarValueType;

				const isDataflowMode = updateTriggerType === "dataflow";
				const availableOps = getAvailableOperations(
					selectedVar.varValueType,
					isDataflowMode,
				);
				// 如果当前操作类型不在可用操作列表中，则切换到第一个可用操作
				if (!availableOps.includes(updateOperationType)) {
					setUpdateOperationType(availableOps[0]);
					// 如果切换到 toggle，清空输入值
					if (availableOps[0] === "toggle") {
						setUpdateValue("");
					}
					// 如果切换到 set 且是 BOOLEAN 类型，设置默认值为 "true"
					else if (
						availableOps[0] === "set" &&
						selectedVar.varValueType === VariableValueType.BOOLEAN
					) {
						setUpdateValue("true");
					}
				}
				// 如果操作类型是 set 且变量是 BOOLEAN 类型，且当前值为空，设置默认值
				else if (
					updateOperationType === "set" &&
					selectedVar.varValueType === VariableValueType.BOOLEAN &&
					!updateValue
				) {
					setUpdateValue("true");
				}
			}
		}
	}, [
		variable,
		varOperation,
		customVariables,
		updateOperationType,
		updateValue,
		updateTriggerType,
	]);

	// 当reset模式下变量改变时，更新初始值
	React.useEffect(() => {
		if (varOperation === "reset" && variable) {
			const selectedVar = customVariables.find(
				(v: CustomVariable) => v.varName === variable,
			);
			if (selectedVar) {
				setVarInitialValue(selectedVar.initialValue);
			}
		}
	}, [variable, varOperation, customVariables]);

	// 当变量改变时，检测是否有重复的操作配置
	React.useEffect(() => {
		if (variable) {
			const duplicate = checkDuplicateVariableOperation(variable);
			setDuplicateOperation(duplicate);
		} else {
			setDuplicateOperation(null);
		}
	}, [variable, checkDuplicateVariableOperation]);

	// 当对话框打开时重置或恢复状态
	useEffect(() => {
		if (isOpen) {
			if (isEditing && editingConfig) {
				setCurrentStep(2); // 编辑时直接进入配置步骤
				setVarOperation(editingConfig.varOperation);
				setVariable(editingConfig.varName);

				if (editingConfig.varOperation === "get") {
					setSymbol(
						("symbol" in editingConfig ? editingConfig.symbol : null) || "",
					);
					
					// 如果是系统变量，优先从 store 加载自定义名称
					if (editingConfig.varType === "system") {
						const customName = getCustomName(editingConfig.varName);
						setVariableName(customName || editingConfig.varDisplayName);
					} else {
						setVariableName(editingConfig.varDisplayName);
					}

					const effectiveTriggerType =
						getEffectiveTriggerType(editingConfig) ?? "condition";
					const existingTimer = getTimerTriggerConfig(editingConfig);
					const existingCondition = getConditionTriggerConfig(editingConfig);

					setTriggerType(effectiveTriggerType);

					if (effectiveTriggerType === "timer") {
						if (existingTimer) {
							setTimerConfig(existingTimer);
						}
						setTriggerCase(null);
					} else if (effectiveTriggerType === "condition") {
						setTriggerCase(existingCondition ?? null);
					}

					setIsNameAutoGenerated(false); // 编辑时不是自动生成的
				} else if (editingConfig.varOperation === "update") {
					setUpdateOperationType(editingConfig.updateVarValueOperation);

					const effectiveUpdateTriggerType =
						getEffectiveTriggerType(editingConfig) ?? "condition";
					const existingTimer = getTimerTriggerConfig(editingConfig);
					const existingCondition = getConditionTriggerConfig(editingConfig);
					const existingDataflow = getDataFlowTriggerConfig(editingConfig);

					setUpdateTriggerType(effectiveUpdateTriggerType);

					if (effectiveUpdateTriggerType === "timer") {
						if (existingTimer) {
							setTimerConfig(existingTimer);
						}
						setTriggerCase(null);
						setUpdateValue(String(editingConfig.updateOperationValue || ""));
					} else if (effectiveUpdateTriggerType === "condition") {
						setTriggerCase(existingCondition ?? null);
						setUpdateValue(String(editingConfig.updateOperationValue || ""));
					} else if (effectiveUpdateTriggerType === "dataflow") {
						if (existingDataflow) {
							setDataflowExpireDuration(
								existingDataflow.expireDuration
									? { ...existingDataflow.expireDuration }
									: { ...DEFAULT_DATAFLOW_EXPIRE_DURATION },
							);
							setDataflowErrorPolicy(() => {
								const defaults = createDefaultDataflowErrorPolicy();
								return existingDataflow.errorPolicy
									? { ...defaults, ...existingDataflow.errorPolicy }
									: defaults;
							});
							setDataflowNodeId(existingDataflow.fromNodeId);
							setDataflowHandleId(existingDataflow.fromHandleId);
							setDataflowVariable(existingDataflow.fromVar);
							setDataflowVariableName(existingDataflow.fromVarDisplayName);
							setDataflowVariableId(existingDataflow.fromVarConfigId);
							setDataflowVariableValueType(existingDataflow.fromVarValueType);

							const selectedNode = variableItemList.find(
								(item) => item.nodeId === existingDataflow.fromNodeId,
							);
							if (selectedNode) {
								setDataflowNodeType(selectedNode.nodeType);
								setDataflowNodeName(selectedNode.nodeName);
							}
						} else {
							setDataflowExpireDuration({
								...DEFAULT_DATAFLOW_EXPIRE_DURATION,
							});
							setDataflowErrorPolicy(createDefaultDataflowErrorPolicy());
							setDataflowNodeId(null);
							setDataflowHandleId(null);
							setDataflowVariable(null);
							setDataflowVariableName(null);
							setDataflowVariableId(null);
							setDataflowVariableValueType(null);
							setDataflowNodeType(null);
							setDataflowNodeName(null);
						}
						setTriggerCase(null);
						setUpdateValue("");
					}
				} else {
					const effectiveTriggerType =
						getEffectiveTriggerType(editingConfig) ?? "condition";
					const existingTimer = getTimerTriggerConfig(editingConfig);
					const existingCondition = getConditionTriggerConfig(editingConfig);

					setTriggerType(effectiveTriggerType);

					if (effectiveTriggerType === "timer") {
						if (existingTimer) {
							setTimerConfig(existingTimer);
						}
						setTriggerCase(null);
					} else if (effectiveTriggerType === "condition") {
						setTriggerCase(existingCondition ?? null);
					}

					setVarInitialValue(editingConfig.varInitialValue);
				}
			} else {
				resetForm();
				// 新建时生成默认名称
				const defaultName = generateVariableName(
					SystemVariable.TOTAL_POSITION_NUMBER,
					existingConfigs.length,
					t,
					customVariables,
				);
				setVariableName(defaultName);
				setIsNameAutoGenerated(true);
			}
		}
	}, [
		isOpen,
		isEditing,
		editingConfig,
		existingConfigs.length,
		resetForm,
		variableItemList,
		customVariables,
	]);

	// 检查是否存在重复配置
	const isDuplicate = () => {
		return isDuplicateConfig(
			existingConfigs,
			editingIndex,
			symbol,
			variable,
			triggerType,
		);
	};

	// 当变量类型改变时，自动填充变量名称
	const handleVariableTypeChange = (newType: string) => {
		setVariable(newType);

		// 所有模式都使用 generateVariableName 生成带序号的名称
		if (isNameAutoGenerated || !variableName.trim()) {
			const newName = generateVariableName(
				newType,
				existingConfigs.length,
				t,
				customVariables,
			);
			setVariableName(newName);
			setIsNameAutoGenerated(true);
		}
	};

	// 当用户手动修改变量名称时，标记为非自动生成
	const handleVariableNameChange = (value: string) => {
		setVariableName(value);
		setIsNameAutoGenerated(false);
	};

	// 处理dataflow节点选择
	const handleDataflowNodeChange = (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => {
		setDataflowNodeId(nodeId);
		setDataflowNodeType(nodeType);
		setDataflowNodeName(nodeName);
		// 清空变量选择
		setDataflowHandleId(null);
		setDataflowVariable(null);
		setDataflowVariableName(null);
		setDataflowVariableId(null);
		setDataflowVariableValueType(null);
	};

	// 处理dataflow变量选择
	const handleDataflowVariableChange = (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		variableValueType: VariableValueType,
	) => {
		setDataflowVariableId(variableId);
		setDataflowHandleId(handleId);
		setDataflowVariable(variable);
		setDataflowVariableName(variableName);
		setDataflowVariableValueType(variableValueType);
	};

	const handleSave = () => {
		// 根据操作类型验证不同的必填字段
		if (varOperation === "get") {
			// get模式：变量名必填
			if (!variableName.trim()) {
				return;
			}
			if (isDuplicate()) {
				return;
			}
		} else if (varOperation === "update") {
			// update模式：数据流触发无需输入值；其它触发方式中 toggle 不需要更新值，其余操作需要
			if (
				updateTriggerType !== "dataflow" &&
				updateOperationType !== "toggle" &&
				!updateValue.trim()
			) {
				return;
			}
		} else {
			// reset模式：变量必填
			if (!variable) {
				return;
			}
		}

		// 如果是编辑操作，检查是否有连接的目标节点
		if (isEditing && editingConfig) {
			const targetNodeIds = getTargetNodeIds(id);
			console.log("targetNodeIds", targetNodeIds);
			const targetNodeNames = [
				...new Set(
					targetNodeIds
						.map((nodeId) => getNode(nodeId)?.data.nodeName as string)
						.filter(Boolean),
				),
			];

			// 如果有连接的目标节点，显示确认对话框
			if (targetNodeIds.length > 0) {
				// 先关闭配置对话框
				onOpenChange(false);

				// 保存待处理的配置数据
				setPendingVariableConfig({
					varOperation,
					targetNodeCount: targetNodeIds.length,
					targetNodeNames: targetNodeNames,
				});

				// 短暂延迟后显示确认对话框，确保配置对话框完全关闭
				setTimeout(() => {
					setIsConfirmDialogOpen(true);
				}, 50);
				return;
			}
		}

		// 没有连接节点或是新增操作，直接保存
		performSave();
	};

	// 执行保存
	const performSave = () => {
		const timerConfigData: TimerTrigger | undefined =
			triggerType === "timer" ? timerConfig : undefined;

		console.log("editingConfig", editingConfig);

		// 根据 varOperation 创建对应的配置类型
		let variableConfig: VariableConfig;

		if (varOperation === "get") {
			// 判断是系统变量还是自定义变量
			const isSystemVariable = Object.values(SystemVariable).includes(
				variable as SystemVariable,
			);
			const selectedCustomVar = customVariables.find(
				(v: CustomVariable) => v.varName === variable,
			);

			// 根据变量类型获取相应的元数据
			let varValueType: VariableValueType;
			let varDisplayName: string;

			if (isSystemVariable) {
				// 系统变量
				const metadata = getSystemVariableMetadata(t)[variable as SystemVariable];
				varValueType = metadata.varValueType;
				varDisplayName = variableName.trim() || metadata.varDisplayName;
			} else if (selectedCustomVar) {
				// 自定义变量
				varValueType = selectedCustomVar.varValueType;
				varDisplayName =
					variableName.trim() || selectedCustomVar.varDisplayName;
			} else {
				// 默认值
				varValueType = VariableValueType.NUMBER;
				varDisplayName = variableName.trim();
			}

			const triggerConfig = buildTriggerConfigFromState(triggerType, {
				timerConfig: timerConfigData,
				conditionConfig:
					triggerType === "condition" && triggerCase ? triggerCase : undefined,
			});
			if (!triggerConfig) {
				return;
			}

			const getConfig: GetVariableConfig = {
				configId: editingConfig?.configId || 0,
				inputHandleId: editingConfig?.inputHandleId || "",
				outputHandleId: editingConfig?.outputHandleId || "",
				varOperation: "get",
				varType: isSystemVariable ? "system" : "custom",
				symbol: symbol || null,
				triggerConfig,
				varDisplayName: varDisplayName,
				varName: variable,
				varValueType: varValueType,
				varValue: 0,
			};
			variableConfig = getConfig;
		} else if (varOperation === "update") {
			// update 模式 - 查找选中的自定义变量信息
			const selectedCustomVar = customVariables.find(
				(v: CustomVariable) => v.varName === variable,
			);

			// 根据触发方式确定 updateOperationValue
			let updateOperationValue: string | number | boolean | string[] | null;
			let updateDataflowTrigger: DataFlowTrigger | null = null;
			if (updateTriggerType === "dataflow") {
				// 数据流模式：保存 DataFlow 对象
				const resolvedNodeType =
					dataflowNodeType ?? NodeType.VariableNode;
				const resolvedVarValueType =
					dataflowVariableValueType ?? VariableValueType.NUMBER;
				updateDataflowTrigger = {
					fromNodeId: dataflowNodeId || "",
					fromNodeName: dataflowNodeName || "",
					fromHandleId: dataflowHandleId || "",
					fromVar: dataflowVariable || "",
					fromVarDisplayName: dataflowVariableName || "",
					fromVarConfigId: dataflowVariableId || 0,
					fromNodeType: resolvedNodeType,
					fromVarValueType: resolvedVarValueType,
					expireDuration: { ...dataflowExpireDuration },
					errorPolicy: { ...dataflowErrorPolicy },
				};
				updateOperationValue = null;
			} else {
				// 条件触发/定时触发模式：根据变量类型转换值
				if (updateOperationType === "toggle") {
					updateOperationValue = true;
				} else {
					// 根据变量类型转换 updateValue
					const varType =
						selectedCustomVar?.varValueType || VariableValueType.NUMBER;
					switch (varType) {
						case VariableValueType.NUMBER:
						case VariableValueType.PERCENTAGE:
							// 数字类型：转换为 number
							updateOperationValue = updateValue ? Number(updateValue) : 0;
							break;
						case VariableValueType.BOOLEAN:
							// 布尔类型：转换为 boolean
							updateOperationValue = updateValue === "true";
							break;
						case VariableValueType.ENUM:
							// 枚举类型：解析 JSON 数组
							try {
								updateOperationValue = JSON.parse(updateValue);
							} catch {
								updateOperationValue = [];
							}
							break;
						case VariableValueType.STRING:
						case VariableValueType.TIME:
						default:
							// 字符串/时间类型：保持字符串
							updateOperationValue = updateValue;
							break;
					}
				}
			}

		const triggerConfig = buildTriggerConfigFromState(updateTriggerType, {
			timerConfig: updateTriggerType === "timer" ? timerConfig : undefined,
			conditionConfig:
				updateTriggerType === "condition" && triggerCase ? triggerCase : undefined,
			dataflowConfig:
				updateTriggerType === "dataflow" && updateDataflowTrigger
					? updateDataflowTrigger
					: undefined,
		});
		if (!triggerConfig) {
			return;
		}

		const updateConfig: UpdateVariableConfig = {
			configId: editingConfig?.configId || 0,
			inputHandleId: editingConfig?.inputHandleId || "",
			outputHandleId: editingConfig?.outputHandleId || "",
			varOperation: "update",
			updateVarValueOperation: updateOperationType,
			triggerConfig,
			varType: "custom", // update 模式下只能是自定义变量
			varName: variable,
			varDisplayName: selectedCustomVar?.varDisplayName || variable,
			varValueType:
				selectedCustomVar?.varValueType || VariableValueType.NUMBER,
			updateOperationValue: updateOperationValue,
		};
		variableConfig = updateConfig;
		} else {
			// reset 模式 - 查找选中的自定义变量信息
			const selectedCustomVar = customVariables.find(
				(v: CustomVariable) => v.varName === variable,
			);

		const triggerConfig = buildTriggerConfigFromState(triggerType, {
			timerConfig: timerConfigData,
			conditionConfig:
				triggerType === "condition" && triggerCase ? triggerCase : undefined,
		});
		if (!triggerConfig) {
			return;
		}

		const resetConfig: ResetVariableConfig = {
			configId: editingConfig?.configId || 0,
			inputHandleId: editingConfig?.inputHandleId || "",
			outputHandleId: editingConfig?.outputHandleId || "",
			varOperation: "reset",
			triggerConfig,
			varType: "custom", // reset 模式下只能是自定义变量
			varName: variable,
			varDisplayName: selectedCustomVar?.varDisplayName || variable,
			varValueType:
				selectedCustomVar?.varValueType || VariableValueType.NUMBER,
			varInitialValue: varInitialValue, // 保存初始值
		};
		variableConfig = resetConfig;
		}

		console.log("variableConfig", variableConfig);

		// 如果是 GET 操作的系统变量，保存自定义名称到 store
		if (
			variableConfig.varOperation === "get" &&
			variableConfig.varType === "system"
		) {
			setCustomName(variableConfig.varName, variableConfig.varDisplayName);
		}

		onSave(id, variableConfig);
		onOpenChange(false);

		// 清理确认对话框状态
		setIsConfirmDialogOpen(false);
		setPendingVariableConfig(null);
	};

	// 确认保存（从确认对话框）
	const handleConfirmSave = () => {
		performSave();
	};

	// 取消保存（从确认对话框）
	const handleCancelSave = () => {
		// 关闭确认对话框
		setIsConfirmDialogOpen(false);
		setPendingVariableConfig(null);

		// 短暂延迟后重新打开配置对话框
		setTimeout(() => {
			onOpenChange(true);
		}, 100);
	};

	const handleNextStep = () => {
		setCurrentStep(2);
	};

	const handleBackStep = () => {
		setCurrentStep(1);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>{getDialogTitle()}</DialogTitle>
					<DialogDescription>{getDialogDescription()}</DialogDescription>
				</DialogHeader>
				<ScrollArea className="flex-1 overflow-auto">
					<div className="flex flex-col gap-4 py-2 pr-0">
						{currentStep === 1 ? (
							<VarOperateGuide
								value={varOperation}
								onValueChange={(value) =>
									setVarOperation(value as "get" | "update" | "reset")
								}
								onConfirm={handleNextStep}
							/>
						) : (
							<>
								{varOperation === "get" ? (
									<GetVarConfig
										symbol={symbol}
										variableName={variableName}
										variable={variable}
				triggerConfig={buildTriggerConfigFromState(triggerType, {
					timerConfig:
						triggerType === "timer" ? timerConfig : undefined,
					conditionConfig:
						triggerType === "condition" && triggerCase ? triggerCase : undefined,
				})}
										symbolOptions={symbolOptions}
										symbolPlaceholder={symbolPlaceholder}
										symbolEmptyMessage={symbolEmptyMessage}
										isSymbolSelectorDisabled={isSymbolSelectorDisabled}
										customVariables={customVariables}
										caseItemList={caseItemList}
										isEditing={isEditing}
										duplicateOperation={duplicateOperation}
										onSymbolChange={setSymbol}
										onVariableNameChange={handleVariableNameChange}
										onVariableChange={handleVariableTypeChange}
										onTriggerConfigChange={(newConfig) => {
											const newTriggerType =
												getEffectiveTriggerType({ triggerConfig: newConfig }) ??
												"condition";
											const newTimerConfig = getTimerTriggerConfig({
												triggerConfig: newConfig,
											});
											const newConditionConfig = getConditionTriggerConfig({
												triggerConfig: newConfig,
											});

											setTriggerType(newTriggerType);
											if (newTimerConfig) setTimerConfig(newTimerConfig);
											setTriggerCase(newConditionConfig ?? null);
										}}
										onValidationChange={setIsGetConfigValid}
									/>
								) : varOperation === "update" ? (
									<UpdateVarConfig
										variable={variable}
										updateOperationType={updateOperationType}
										updateValue={updateValue}
				triggerConfig={buildTriggerConfigFromState(
					updateTriggerType,
					{
						timerConfig:
							updateTriggerType === "timer"
								? timerConfig
								: undefined,
						conditionConfig:
							updateTriggerType === "condition" && triggerCase
								? triggerCase
								: undefined,
						dataflowConfig:
							updateTriggerType === "dataflow"
								? {
									fromNodeId: dataflowNodeId || "",
									fromNodeName: dataflowNodeName || "",
									fromHandleId: dataflowHandleId || "",
									fromVar: dataflowVariable || "",
									fromVarDisplayName: dataflowVariableName || "",
																fromVarConfigId: dataflowVariableId || 0,
																fromNodeType:
																	dataflowNodeType ?? NodeType.VariableNode,
																fromVarValueType:
																	dataflowVariableValueType ??
																	VariableValueType.NUMBER,
																expireDuration: { ...dataflowExpireDuration },
																errorPolicy: { ...dataflowErrorPolicy },
								}
								: undefined,
					},
				)}
										customVariables={customVariables}
										customVariableOptions={customVariableOptions}
										variableItemList={variableItemList}
										caseItemList={caseItemList}
										dataflowNodeId={dataflowNodeId}
										dataflowHandleId={dataflowHandleId}
										dataflowVariable={dataflowVariable}
										dataflowVariableName={dataflowVariableName}
										isEditing={isEditing}
										duplicateOperation={duplicateOperation}
										onVariableChange={setVariable}
										onUpdateOperationTypeChange={setUpdateOperationType}
										onUpdateValueChange={setUpdateValue}
										onTriggerConfigChange={(newConfig) => {
											const newTriggerType =
												getEffectiveTriggerType({ triggerConfig: newConfig }) ??
												"condition";
											const newTimerConfig = getTimerTriggerConfig({
												triggerConfig: newConfig,
											});
											const newConditionConfig = getConditionTriggerConfig({
												triggerConfig: newConfig,
											});
											const newDataflowConfig = getDataFlowTriggerConfig({
												triggerConfig: newConfig,
											});

											setUpdateTriggerType(newTriggerType);
											if (newTimerConfig) setTimerConfig(newTimerConfig);
											setTriggerCase(newConditionConfig ?? null);

											// 更新 dataflow 相关状态
											if (newDataflowConfig) {
												setDataflowExpireDuration(
													newDataflowConfig.expireDuration
														? { ...newDataflowConfig.expireDuration }
														: { ...DEFAULT_DATAFLOW_EXPIRE_DURATION },
												);
												setDataflowErrorPolicy(() => {
													const defaults = createDefaultDataflowErrorPolicy();
													return newDataflowConfig.errorPolicy
														? { ...defaults, ...newDataflowConfig.errorPolicy }
														: defaults;
												});
												setDataflowNodeId(newDataflowConfig.fromNodeId);
												setDataflowNodeName(newDataflowConfig.fromNodeName);
												setDataflowHandleId(newDataflowConfig.fromHandleId);
												setDataflowVariable(newDataflowConfig.fromVar);
												setDataflowVariableName(
													newDataflowConfig.fromVarDisplayName,
												);
												setDataflowVariableId(
													newDataflowConfig.fromVarConfigId,
												);
												setDataflowNodeType(newDataflowConfig.fromNodeType);
												setDataflowVariableValueType(
													newDataflowConfig.fromVarValueType,
												);
											}
										}}
										onDataflowNodeChange={handleDataflowNodeChange}
										onDataflowVariableChange={handleDataflowVariableChange}
										getAvailableOperations={getAvailableOperations}
										getUpdateOperationLabel={getUpdateOperationLabel}
										onValidationChange={setIsUpdateConfigValid}
									/>
								) : (
									<ResetVarConfig
										variable={variable}
			triggerConfig={buildTriggerConfigFromState(triggerType, {
				timerConfig:
					triggerType === "timer" ? timerConfig : undefined,
				conditionConfig:
					triggerType === "condition" && triggerCase ? triggerCase : undefined,
			})}
										customVariables={customVariables}
										customVariableOptions={customVariableOptions}
										caseItemList={caseItemList}
										varInitialValue={varInitialValue}
										isEditing={isEditing}
										duplicateOperation={duplicateOperation}
										onVariableChange={setVariable}
										onTriggerConfigChange={(newConfig) => {
											const newTriggerType =
												getEffectiveTriggerType({ triggerConfig: newConfig }) ??
												"condition";
											const newTimerConfig = getTimerTriggerConfig({
												triggerConfig: newConfig,
											});
											const newConditionConfig = getConditionTriggerConfig({
												triggerConfig: newConfig,
											});

											setTriggerType(newTriggerType);
											if (newTimerConfig) setTimerConfig(newTimerConfig);
											setTriggerCase(newConditionConfig ?? null);
										}}
										onValidationChange={setIsResetConfigValid}
									/>
								)}
							</>
						)}
					</div>
					<ScrollBar orientation="vertical" />
				</ScrollArea>
				<DialogFooter>
					{currentStep === 1 ? (
						<>
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								{t("cancel")}
							</Button>
							<Button onClick={handleNextStep}>{t("next")}</Button>
						</>
					) : (
						<>
							{!isEditing && (
								<Button variant="outline" onClick={handleBackStep}>
									{t("previous")}
								</Button>
							)}
							<Button
								onClick={handleSave}
								disabled={
									varOperation === "get"
										? !variableName.trim() || isDuplicate() || !isGetConfigValid
										: varOperation === "update"
											? !isUpdateConfigValid
											: !isResetConfigValid // reset 模式
								}
							>
								{t("save")}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>

			{/* 确认修改对话框 */}
			<NodeOpConfirmDialog
				isOpen={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}
				affectedNodeCount={pendingVariableConfig?.targetNodeCount || 0}
				affectedNodeNames={pendingVariableConfig?.targetNodeNames || []}
				onConfirm={handleConfirmSave}
				onCancel={handleCancelSave}
				operationType="edit"
			/>
		</Dialog>
	);
};

export default VariableConfigDialog;
