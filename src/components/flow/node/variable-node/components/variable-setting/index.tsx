import { useReactFlow } from "@xyflow/react";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { Label } from "@/components/ui/label";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useSymbolList } from "@/service/market/symbol-list";
import type {
	GetCustomVariableConfig,
	ResetVariableConfig,
	UpdateVariableConfig,
	UpdateVarValueOperation,
	VariableConfig,
	VariableOperation,
} from "@/types/node/variable-node";
import { getUpdateOperationLabel } from "@/types/node/variable-node/variable-operation-types";
import { TradeMode } from "@/types/strategy";
import {
	type CustomVariable,
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";
import AddConfigButton from "./components/add-config-button";
import VariableConfigItem from "./variable-config-item";

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

	const { getStartNodeData } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const customVariables = startNodeData?.backtestConfig?.customVariables || [];

	// Generate custom variable options
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

	// Get available update operations based on variable type and trigger mode
	const getAvailableOperations = React.useCallback(
		(
			varValueType: VariableValueType,
			isDataflowMode?: boolean,
		): UpdateVarValueOperation[] => {
			if (
				varValueType === VariableValueType.NUMBER ||
				varValueType === VariableValueType.PERCENTAGE
			) {
				// Dataflow mode supports max and min, condition/timer trigger modes do not
				if (isDataflowMode) {
					return ["set", "add", "subtract", "multiply", "divide", "max", "min"];
				}
				return ["set", "add", "subtract", "multiply", "divide"];
			} else if (varValueType === VariableValueType.BOOLEAN) {
				return ["set", "toggle"];
			} else if (varValueType === VariableValueType.ENUM) {
				return ["set", "append", "remove", "clear"];
			} else {
				// STRING, TIME types only support direct assignment
				return ["set"];
			}
		},
		[],
	);

	// Local state management
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
				startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts?.[0]
					?.id ?? undefined
			);
		}

		if (tradeMode === TradeMode.LIVE) {
			return startNodeData?.liveConfig?.selectedAccounts?.[0]?.id ?? undefined;
		}

		return undefined;
	}, [tradeMode, startNodeData]);

	// Use React Query to fetch symbol list
	const { data: symbolList = [] } = useSymbolList(selectedAccountId ?? 0);

	const symbolOptions = useMemo(
		() =>
			symbolList.map((symbol) => ({
				value: symbol.name,
				label: symbol.name,
			})),
		[symbolList],
	);

	// Create default variable config
	const createDefaultVariableConfig = (
		operation: VariableOperation,
	): VariableConfig => {
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

		// If there are connected target nodes, show confirmation dialog
		if (targetNodeIds.length > 0) {
			setPendingDeleteVariable(variableToDelete);
			setPendingVariableData({
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames,
			});
			setIsConfirmDialogOpen(true);
			return;
		}

		// No connected nodes, delete directly
		performDelete(index);
	};

	// Perform delete
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

		// Delete edges
		const sourceHandleId = variableToDelete.outputHandleId;
		const targetHandleId = variableToDelete.inputHandleId;
		const edges = getEdges();
		const remainingEdges = edges.filter(
			(edge) =>
				edge.sourceHandle !== sourceHandleId &&
				edge.targetHandle !== targetHandleId,
		);
		setEdges(remainingEdges);

		const updatedVariables = variableConfigs.filter(
			(_, i) => i !== targetIndex,
		);
		onVariableConfigsChange(updatedVariables);

		// Clean up delete-related state
		setPendingDeleteVariable(null);
		setIsConfirmDialogOpen(false);
		setPendingVariableData(null);
	};

	const handleConfirmDelete = () => {
		performDelete();
	};

	const handleCancelDelete = () => {
		// Close confirmation dialog and clean up state
		setIsConfirmDialogOpen(false);
		setPendingDeleteVariable(null);
		setPendingVariableData(null);
	};

	return (
		<div className="flex flex-col gap-2">
			<Label className="text-sm font-bold">
				{t("variableNode.variableConfig")}
			</Label>

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
						isSymbolSelectorDisabled={!selectedAccountId}
						getAvailableOperations={getAvailableOperations}
						getUpdateOperationLabel={getUpdateOperationLabel}
						allConfigs={variableConfigs}
					/>
				))}
			</div>

			{/* Add variable button */}
			<AddConfigButton onAddVariable={handleAddVariable} />

			{/* Confirm delete dialog */}
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
