import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import {
	renderNodeOptions,
	renderVariableOptions,
} from "@/components/flow/node/node-utils";
import SeriesIndexDropdown from "@/components/flow/node/shared/series-index-dropdown";
import { ButtonGroup } from "@/components/ui/button-group";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import type { NodeType } from "@/types/node/index";
import type { SelectedIndicator } from "@/types/node/indicator-node";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type {
	UpdateVarValueOperation,
	VariableConfig,
} from "@/types/node/variable-node";
import { getUpdateOperationLabel } from "@/types/node/variable-node/variable-operation-types";
import { VariableValueType } from "@/types/variable";
import {
	generateBooleanHint,
	generateEnumHint,
	generateNumberHint,
	generatePercentageHint,
	generateStringHint,
	generateTimeHint,
} from "../../../hint-generators";
import type { OperationOutputConfig, OperationInputConfig } from "@/types/node/group/operation-group";

interface DataFlowSelectorProps {
	variableItemList: VariableItem[];
	selectedNodeId: string | null;
	selectedHandleId: string | null;
	selectedVariable: string | null;
	selectedVariableName: string | null;
	selectedSeriesIndex?: number; // Series index for time series data
	updateOperationType: UpdateVarValueOperation;
	availableOperations: UpdateVarValueOperation[];
	targetVariableType?: VariableValueType; // Target variable type, used to filter dataflow variables
	targetVariableDisplayName?: string; // Target variable display name, used for hint text
	onNodeChange: (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => void;
	onVariableChange: (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		variableValueType: VariableValueType,
	) => void;
	onSeriesIndexChange?: (seriesIndex: number) => void; // Series index change callback
	onOperationTypeChange: (operationType: UpdateVarValueOperation) => void;
}

// Type guards - used to determine variable types
const isVariableConfig = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig | OperationOutputConfig | OperationInputConfig,
): variable is VariableConfig => {
	return "varOperation" in variable;
};

const isSelectedIndicator = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig | OperationOutputConfig | OperationInputConfig,
): variable is SelectedIndicator => {
	return (
		"value" in variable && "configId" in variable && "indicatorType" in variable
	);
};

const isSelectedSymbol = (
	variable: SelectedIndicator | SelectedSymbol | VariableConfig | OperationOutputConfig | OperationInputConfig,
): variable is SelectedSymbol => {
	return (
		"symbol" in variable && "interval" in variable && "configId" in variable
	);
};

const DataFlowSelector: React.FC<DataFlowSelectorProps> = ({
	variableItemList,
	selectedNodeId,
	selectedHandleId,
	selectedVariable,
	selectedVariableName,
	selectedSeriesIndex,
	updateOperationType,
	availableOperations,
	targetVariableType,
	targetVariableDisplayName,
	onNodeChange,
	onVariableChange,
	onSeriesIndexChange,
	onOperationTypeChange,
}) => {
	const [localNodeId, setLocalNodeId] = useState<string>(selectedNodeId || "");
	const [variableString, setVariableString] = useState<string>("");
	const [seriesIndex, setSeriesIndex] = useState<number>(selectedSeriesIndex ?? 0);
	const { t, i18n } = useTranslation();
	const language = i18n.language;

	// Generate option value, format: nodeId|handleId|variable|variableName
	const generateOptionValue = useCallback(
		(
			nodeId: string,
			handleId: string,
			variable: string | number,
			variableName?: string | null,
		) => {
			if (variableName) {
				return `${nodeId}|${handleId}|${variable}|${variableName}`;
			}
			return `${nodeId}|${handleId}||${variable}`;
		},
		[],
	);

	// Sync node selection state
	useEffect(() => {
		setLocalNodeId(selectedNodeId || "");
	}, [selectedNodeId]);

	// Sync variable selection state
	useEffect(() => {
		if (selectedNodeId && selectedHandleId && selectedVariable) {
			const variableString = generateOptionValue(
				selectedNodeId,
				selectedHandleId,
				selectedVariable,
				selectedVariableName,
			);
			setVariableString(variableString);
		} else {
			setVariableString("");
		}
	}, [
		selectedNodeId,
		selectedHandleId,
		selectedVariable,
		selectedVariableName,
		generateOptionValue,
	]);

	// Sync series index state
	useEffect(() => {
		setSeriesIndex(selectedSeriesIndex ?? 0);
	}, [selectedSeriesIndex]);

	// Handle node selection
	const handleNodeChange = (nodeId: string) => {
		const nodeType = variableItemList.find(
			(item) => item.nodeId === nodeId,
		)?.nodeType;
		const nodeName =
			variableItemList.find((item) => item.nodeId === nodeId)?.nodeName || "";
		setLocalNodeId(nodeId);
		setVariableString(""); // Clear variable selection
		onNodeChange(nodeId, nodeType || null, nodeName);
	};

	// Handle variable selection
	const handleVariableChange = (variableValue: string) => {
		const [nodeId, outputHandleId, variable, variableName] =
			variableValue.split("|");

		const selectedNode = variableItemList.find(
			(item) => item.nodeId === nodeId,
		);
		const selectedVar = selectedNode?.variables.find(
			(v) => 'outputHandleId' in v && v.outputHandleId === outputHandleId,
		);

		let variableId = 0;
		let variableValueType = VariableValueType.NUMBER; // Default to NUMBER type

		if (selectedVar) {
			variableId = selectedVar.configId;

			// Get varValueType based on variable type
			if (isVariableConfig(selectedVar)) {
				// Variable node: get from config
				variableValueType = selectedVar.varValueType;
			} else if (
				isSelectedIndicator(selectedVar) ||
				isSelectedSymbol(selectedVar)
			) {
				// Indicator node and Kline node: both are NUMBER type
				variableValueType = VariableValueType.NUMBER;
			}
		}

		setVariableString(variableValue);
		onVariableChange(
			variableId,
			outputHandleId,
			variable,
			variableName || variable,
			variableValueType,
		);
	};

	// Get variable list of selected node
	const getSelectedNodeVariables = () => {
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === localNodeId,
		);
		return selectedNode?.variables || [];
	};

	// Get seriesLength of selected node
	const getSelectedNodeSeriesLength = useCallback(() => {
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === localNodeId,
		);
		return selectedNode?.seriesLength;
	}, [variableItemList, localNodeId]);

	// Handle series index change
	const handleSeriesIndexChange = (newSeriesIndex: number) => {
		setSeriesIndex(newSeriesIndex);
		onSeriesIndexChange?.(newSeriesIndex);
	};

	// Filter node list: only keep nodes with valid variables
	const getFilteredNodeList = useCallback(() => {
		// console.log("variableItemList", variableItemList);
		if (!targetVariableType) {
			return variableItemList;
		}

		return variableItemList.filter((item) => {
			// Check if the node has any variable matching the target type
			const hasValidVariable = item.variables.some((v) => {
				// Indicator node and Kline node are both NUMBER type
				if (isSelectedIndicator(v) || isSelectedSymbol(v)) {
					return targetVariableType === VariableValueType.NUMBER;
				}
				// Variable node filters based on its specific type
				if (isVariableConfig(v)) {
					return v.varValueType === targetVariableType;
				}
				return false;
			});

			return hasValidVariable;
		});
	}, [variableItemList, targetVariableType]);

	const filteredNodeList = getFilteredNodeList();
	const hasNoNodes = filteredNodeList.length === 0;

	// Check if currently selected node is in the filtered list
	const isSelectedNodeInFilteredList = filteredNodeList.some(
		(item) => item.nodeId === localNodeId,
	);

	// If current selected node is not in filtered list, use empty string as value
	const nodeSelectValue = isSelectedNodeInFilteredList ? localNodeId : "";

	// Select corresponding generator based on variable type
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

	// Generate hint text
	const generateHintText = (): React.ReactNode => {
		if (
			!selectedNodeId ||
			!selectedHandleId ||
			!selectedVariable ||
			!selectedVariableName
		) {
			return null;
		}

		const selectedNode = variableItemList.find(
			(item) => item.nodeId === selectedNodeId,
		);
		if (!selectedNode) {
			return null;
		}

		const fromNodeName = selectedNode.nodeName;
		const fromNodeType = selectedNode.nodeType;
		const fromVarDisplayName = selectedVariableName;

		// Get variable config ID and variable type
		const selectedVar = selectedNode.variables.find(
			(v) => 'outputHandleId' in v && v.outputHandleId === selectedHandleId,
		);
		if (!selectedVar) {
			return null;
		}
		const fromVarConfigId = selectedVar.configId;

		// Get variable value type
		let fromVarValueType: VariableValueType;
		if (isVariableConfig(selectedVar)) {
			fromVarValueType = selectedVar.varValueType;
		} else if (
			isSelectedIndicator(selectedVar) ||
			isSelectedSymbol(selectedVar)
		) {
			fromVarValueType = VariableValueType.NUMBER;
		} else {
			fromVarValueType = VariableValueType.NUMBER;
		}

		// Use new hint generator
		return getHintGenerator(targetVariableType)({
			t,
			language,
			varOperation: "update",
			operationType: updateOperationType,
			variableDisplayName: targetVariableDisplayName,
			dataflowTrigger: {
				fromNodeType,
				fromNodeId: selectedNodeId,
				fromNodeName,
				fromHandleId: selectedHandleId,
				fromVar: selectedVariable,
				fromVarDisplayName,
				fromVarValueType,
				fromVarConfigId,
				expireDuration: { unit: "hour", duration: 1 },
				errorPolicy: {},
			},
		});
	};

	return (
		<div className="flex flex-col gap-2">
			{/* Row 1: Operator selector + Node selector */}
			<ButtonGroup className="w-full">
				{/* Operator selector */}
				<SelectInDialog
					value={updateOperationType}
					onValueChange={(value: string) => {
						onOperationTypeChange(value as UpdateVarValueOperation);
					}}
					options={availableOperations.map((op) => ({
						value: op,
						label: getUpdateOperationLabel(op, t),
					}))}
					className="w-[70px] h-8"
				/>

				{/* Node selector */}
				<SelectInDialog
					value={nodeSelectValue}
					onValueChange={handleNodeChange}
					placeholder={
						hasNoNodes
							? t("variableNode.dataflowSelector.noNodes")
							: t("variableNode.dataflowSelector.chooseNode")
					}
					options={renderNodeOptions(filteredNodeList)}
					disabled={hasNoNodes}
					className="h-8 text-xs font-normal min-w-20 flex-1"
				/>
			</ButtonGroup>

			{/* Row 2: Variable selector + Series index selector */}
			<ButtonGroup className="w-full">
				{/* Variable selector */}
				<SelectInDialog
					value={variableString}
					onValueChange={handleVariableChange}
					placeholder={
						hasNoNodes
							? t("variableNode.dataflowSelector.noVariables")
							: t("variableNode.dataflowSelector.chooseVariable")
					}
					disabled={!localNodeId || hasNoNodes}
					className="h-8 text-xs font-normal min-w-20 flex-1"
				>
					{renderVariableOptions({
						variables: getSelectedNodeVariables(),
						localNodeId,
						generateOptionValue,
						t,
						whitelistValueType: targetVariableType || null,
					})}
				</SelectInDialog>

				{/* Series index selector */}
				<SeriesIndexDropdown
					seriesLength={getSelectedNodeSeriesLength()}
					value={seriesIndex}
					onChange={handleSeriesIndexChange}
					disabled={!localNodeId || !variableString}
				/>
			</ButtonGroup>

			{/* Hint text */}
			{generateHintText() && (
				<p className="text-xs text-muted-foreground">{generateHintText()}</p>
			)}
		</div>
	);
};

export default DataFlowSelector;
