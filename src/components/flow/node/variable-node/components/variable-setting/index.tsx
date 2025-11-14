import { useReactFlow } from "@xyflow/react";
import React, { useEffect, useMemo, useState } from "react";
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { Label } from "@/components/ui/label";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { getSymbolList } from "@/service/market";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import type { MarketSymbol } from "@/types/market";
import type { VariableConfig, GetCustomVariableConfig, UpdateVariableConfig, ResetVariableConfig } from "@/types/node/variable-node";
import {
	type VariableOperation,
	type UpdateVarValueOperation,
} from "@/types/node/variable-node";
import { getUpdateOperationLabel } from "@/types/node/variable-node/variable-operation-types";
import { TradeMode } from "@/types/strategy";
import VariableConfigItem from "./variable-config-item";
import AddConfigButton from "./components/add-config-button";
import { useTranslation } from "react-i18next";
import useTradingModeStore from "@/store/use-trading-mode-store";
import {
	VariableValueType,
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	type CustomVariable,
} from "@/types/variable";

interface VariableSettingProps {
	id: string;
	tradeMode: TradeMode;
	variableConfigs: VariableConfig[];
	onVariableConfigsChange: (variableConfigs: VariableConfig[]) => void;
}

const VariableSetting: React.FC<VariableSettingProps> = ({
	id,
	tradeMode,
	variableConfigs,
	onVariableConfigsChange,
}) => {
	const { t } = useTranslation();
	const {
		backtestConfig: startNodeBacktestConfig,
		liveConfig: startNodeLiveConfig,
	} = useStartNodeDataStore();
	const { tradingMode } = useTradingModeStore();

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

	// 生成自定义变量选项
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
							{/* <span>{customVar.varDisplayName}</span> */}
							{/* <span className="text-xs text-muted-foreground"> */}
							{customVar.varName}
							{/* </span> */}
						</div>
					),
				};
			}),
		[customVariables],
	);

	// 根据变量类型和触发方式获取可用的更新操作
	const getAvailableOperations = React.useCallback(
		(
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
		},
		[],
	);

	// 本地状态管理
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [pendingDeleteVariable, setPendingDeleteVariable] =
		useState<VariableConfig | null>(null);
	const [pendingVariableData, setPendingVariableData] = useState<{
		targetNodeCount: number;
		targetNodeNames: string[];
	} | null>(null);

	const {
		// getTargetNodeIdsBySourceHandleId,
		getTargetNodeIds,
	} = useStrategyWorkflow();
	const { getNode, getEdges, setEdges } = useReactFlow();

	const selectedAccountId = useMemo(() => {
		if (tradeMode === TradeMode.BACKTEST) {
			return (
				startNodeBacktestConfig?.exchangeModeConfig?.selectedAccounts?.[0]
					?.id ?? undefined
			);
		}

		if (tradeMode === TradeMode.LIVE) {
			return startNodeLiveConfig?.selectedAccounts?.[0]?.id ?? undefined;
		}

		return undefined;
	}, [tradeMode, startNodeBacktestConfig, startNodeLiveConfig]);

	const [symbolList, setSymbolList] = useState<MarketSymbol[]>([]);
	const [isSymbolLoading, setIsSymbolLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;

		if (!selectedAccountId) {
			setSymbolList((prev) => (prev.length === 0 ? prev : []));
			setIsSymbolLoading(false);
			return () => {
				cancelled = true;
			};
		}

		const fetchSymbols = async () => {
			setIsSymbolLoading(true);
			try {
				const data = await getSymbolList(selectedAccountId);
				if (!cancelled) {
					setSymbolList(data);
				}
			} catch (error) {
				console.error("获取交易对列表失败:", error);
				if (!cancelled) {
					setSymbolList([]);
				}
			} finally {
				if (!cancelled) {
					setIsSymbolLoading(false);
				}
			}
		};

		fetchSymbols();

		return () => {
			cancelled = true;
		};
	}, [selectedAccountId]);

	const symbolOptions = useMemo(
		() =>
			symbolList.map((symbol) => ({
				value: symbol.name,
				label: symbol.name,
			})),
		[symbolList],
	);

	const symbolPlaceholder = useMemo(() => {
		if (!selectedAccountId) {
			return "请先选择账户";
		}
		if (isSymbolLoading) {
			return "加载中...";
		}
		return "选择交易对";
	}, [selectedAccountId, isSymbolLoading]);

	const symbolEmptyMessage = useMemo(
		() => (selectedAccountId ? "未找到交易对" : "未选择账户"),
		[selectedAccountId],
	);

	// 创建默认的变量配置
	const createDefaultVariableConfig = (operation: VariableOperation): VariableConfig => {
		const newConfigId = variableConfigs.length + 1;
		const baseConfig = {
			configId: newConfigId,
			inputHandleId: `${id}_input_${newConfigId}`,
			outputHandleId: `${id}_output_${newConfigId}`,
			varType: "custom" as const,
			varName: "",
			varDisplayName: "",
			varValueType: VariableValueType.NUMBER,
			triggerConfig: null,
		};

		switch (operation) {
			case "get":
				return {
					...baseConfig,
					varOperation: "get",
					varValue: null,
				} as GetCustomVariableConfig;

			case "update":
				return {
					...baseConfig,
					varOperation: "update",
					updateVarValueOperation: "set" as UpdateVarValueOperation,
					updateOperationValue: null,
				} as UpdateVariableConfig;

			case "reset":
				return {
					...baseConfig,
					varOperation: "reset",
					varInitialValue: 0,
				} as ResetVariableConfig;

			default:
				return {
					...baseConfig,
					varOperation: "get",
					varValue: null,
				} as GetCustomVariableConfig;
		}
	};

	const handleAddVariable = (operation: VariableOperation) => {
		const newConfig = createDefaultVariableConfig(operation);
		onVariableConfigsChange([...variableConfigs, newConfig]);
	};

	const handleConfigChange = (index: number, updatedConfig: VariableConfig) => {
		const updatedConfigs = [...variableConfigs];
		updatedConfigs[index] = updatedConfig;
		onVariableConfigsChange(updatedConfigs);
	};

	const handleDeleteVariable = (index: number) => {
		const variableToDelete = variableConfigs[index];
		// const targetNodeIds = getTargetNodeIdsBySourceHandleId(
		// 	variableToDelete.outputHandleId,
		// );
		const targetNodeIds = getTargetNodeIds(id);

		const targetNodeNames = [
			...new Set(
				targetNodeIds
					.map((nodeId) => getNode(nodeId)?.data.nodeName as string)
					.filter(Boolean),
			),
		];

		// 如果有连接的目标节点，显示确认对话框
		if (targetNodeIds.length > 0) {
			setPendingDeleteVariable(variableToDelete);
			setPendingVariableData({
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames,
			});
			setIsConfirmDialogOpen(true);
			return;
		}

		// 没有连接节点，直接删除
		performDelete(index);
	};

	// 执行删除
	const performDelete = (index?: number) => {
		const targetIndex =
			index !== undefined
				? index
				: variableConfigs.findIndex(
						(variable) =>
							pendingDeleteVariable &&
							variable.configId === pendingDeleteVariable.configId,
					);

		if (targetIndex === -1) return;

		const variableToDelete = variableConfigs[targetIndex];

		// 删除边
		const sourceHandleId = variableToDelete.outputHandleId;
		const targetHandleId = variableToDelete.inputHandleId;
		const edges = getEdges();
		const remainingEdges = edges.filter(
			(edge) =>
				edge.sourceHandle !== sourceHandleId &&
				edge.targetHandle !== targetHandleId,
		);
		console.log("remainingEdges", remainingEdges);
		setEdges(remainingEdges);

		const updatedVariables = variableConfigs
			.filter((_, i) => i !== targetIndex)
			.map((variable, newIndex) => ({
				...variable,
				configId: newIndex + 1,
				inputHandleId: `${id}_input_${newIndex + 1}`,
				outputHandleId: `${id}_output_${newIndex + 1}`,
			}));
		onVariableConfigsChange(updatedVariables);

		// 清理删除相关状态
		setPendingDeleteVariable(null);
		setIsConfirmDialogOpen(false);
		setPendingVariableData(null);
	};

	const handleConfirmDelete = () => {
		performDelete();
	};

	const handleCancelDelete = () => {
		// 关闭确认对话框并清理状态
		setIsConfirmDialogOpen(false);
		setPendingDeleteVariable(null);
		setPendingVariableData(null);
	};

	return (
		<div className="flex flex-col gap-2">
			<Label className="text-sm font-bold">{t("variableNode.variableConfig")}</Label>

			<div className="space-y-2">
				{variableConfigs.map((config, index) => (
					<VariableConfigItem
						id={id}
						key={config.configId}
						config={config}
						index={index}
						onDelete={handleDeleteVariable}
						onConfigChange={handleConfigChange}
						customVariables={customVariables}
						customVariableOptions={customVariableOptions}
						symbolOptions={symbolOptions}
						symbolPlaceholder={symbolPlaceholder}
						symbolEmptyMessage={symbolEmptyMessage}
						isSymbolSelectorDisabled={!selectedAccountId}
						getAvailableOperations={getAvailableOperations}
						getUpdateOperationLabel={getUpdateOperationLabel}
						allConfigs={variableConfigs}
					/>
				))}
			</div>

			{/* 添加变量按钮 */}
			<AddConfigButton onAddVariable={handleAddVariable} />

			{/* 确认删除对话框 */}
		<NodeOpConfirmDialog
			isOpen={isConfirmDialogOpen}
			onOpenChange={setIsConfirmDialogOpen}
			affectedNodeCount={pendingVariableData?.targetNodeCount || 0}
			affectedNodeNames={pendingVariableData?.targetNodeNames || []}
			onConfirm={handleConfirmDelete}
			onCancel={handleCancelDelete}
			operationType="delete"
		/>
		</div>
	);
};

export default VariableSetting;
