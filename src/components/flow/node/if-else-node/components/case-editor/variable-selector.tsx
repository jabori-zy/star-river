import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	isSelectedIndicator,
	isSelectedSymbol,
	isVariableConfig,
	renderVariableOptions as renderVariableOptionsUtil,
} from "@/components/flow/node/node-utils";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import { cn } from "@/lib/utils";
import type { Variable } from "@/types/node/if-else-node";
import type { NodeType } from "@/types/node/index";
import { VariableValueType } from "@/types/variable";
import SeriesIndexDropdown from "@/components/flow/node/shared/series-index-dropdown";

interface VariableSelectorProps {
	variableItemList: VariableItem[];
	variable: Variable | null;
	onNodeChange: (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => void; // Node selection callback
	onVariableChange: (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		varValueType: VariableValueType,
		shape: "Scalar" | "Series",
	) => void; // Variable selection callback
	onSeriesIndexChange?: (seriesIndex: number) => void; // Series index change callback
	whitelistValueType?: VariableValueType | null; // Optional: whitelist - only keep specified type
	blacklistValueType?: VariableValueType | null; // Optional: blacklist - exclude specified type
	excludeVariable?: {
		// Optional: exclude specific variable (to avoid variable comparing with itself)
		nodeId: string;
		outputHandleId: string;
		varName: string | number;
	} | null;
}

const VariableSelector: React.FC<VariableSelectorProps> = ({
	variableItemList,
	variable,
	onNodeChange,
	onVariableChange,
	onSeriesIndexChange,
	whitelistValueType,
	blacklistValueType,
	excludeVariable,
}) => {
	const [selectedNodeId, setSelectedNodeId] = useState<string>(
		variable?.nodeId || "",
	);
	const [variableString, setVariableString] = useState<string>("");
	const [seriesIndex, setSeriesIndex] = useState<number>(
		variable?.seriesIndex ?? 0,
	);
	const { t } = useTranslation();
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

	// Check if a node has available variables
	const nodeHasAvailableVariables = useCallback(
		(nodeId: string) => {
			const node = variableItemList.find((item) => item.nodeId === nodeId);
			if (!node) return false;

			const options = renderVariableOptionsUtil({
				variables: node.variables,
				localNodeId: nodeId,
				generateOptionValue,
				t,
				whitelistValueType,
				blacklistValueType,
				excludeVariable,
			});
			return options && options.length > 0;
		},
		[
			variableItemList,
			generateOptionValue,
			t,
			whitelistValueType,
			blacklistValueType,
			excludeVariable,
		],
	);

	// Get filtered node list (only includes nodes with available variables)
	const filteredVariableItemList = useMemo(() => {
		return variableItemList.filter((item) =>
			nodeHasAvailableVariables(item.nodeId),
		);
	}, [variableItemList, nodeHasAvailableVariables]);

	// Synchronize local state when the incoming variable changes
	useEffect(() => {
		if (variable) {
			// Update selected node ID
			setSelectedNodeId(variable.nodeId || "");

			// Update variable string
			if (variable.nodeId && variable.outputHandleId && variable.varName) {
				// Note: varName is variable here, varDisplayName is variableName
				const variableString = generateOptionValue(
					variable.nodeId,
					variable.outputHandleId,
					variable.varName,
					variable.varDisplayName,
				);
				setVariableString(variableString);
			} else {
				setVariableString("");
			}

			// Update series index
			setSeriesIndex(variable.seriesIndex ?? 0);
		} else {
			// If variable is null, clear state
			setSelectedNodeId("");
			setVariableString("");
			setSeriesIndex(0);
		}
	}, [variable, generateOptionValue]);

	// Clear selection when filter changes cause currently selected node to be filtered out
	useEffect(() => {
		if (selectedNodeId && !nodeHasAvailableVariables(selectedNodeId)) {
			setSelectedNodeId("");
			setVariableString("");
			onNodeChange("", null, "");
		}
	}, [selectedNodeId, nodeHasAvailableVariables, onNodeChange]);

	// Handle node selection
	const handleNodeChange = (nodeId: string) => {
		const nodeType = variableItemList.find(
			(item) => item.nodeId === nodeId,
		)?.nodeType;
		// console.log("🔍 Node selection:", {
		// 	nodeId,
		// 	nodeName: variableItemList.find((item) => item.nodeId === nodeId)
		// 		?.nodeName,
		// 	nodeType: variableItemList.find((item) => item.nodeId === nodeId)
		// 		?.nodeType,
		// });
		setSelectedNodeId(nodeId);
		// Clear current selection
		onNodeChange(
			nodeId,
			nodeType || null,
			variableItemList.find((item) => item.nodeId === nodeId)?.nodeName || "",
		);
	};

	// Handle variable selection
	const handleVariableChange = (variableValue: string) => {
		const [nodeId, outputHandleId, variable, variableName] =
			variableValue.split("|");
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === nodeId,
		);
		// For OperationGroup outputs, match by outputName since multiple outputs share same outputHandleId
		const selectedVar = selectedNode?.variables.find((v) => {
			if ('outputHandleId' in v && v.outputHandleId === outputHandleId) {
				// For OperationGroup/OperationNode outputs, also match by outputName
				if ('outputName' in v) {
					return v.outputName === variable;
				}
				return true;
			}
			return false;
		});

		let variableId = 0;
		let varValueType = VariableValueType.NUMBER; // Default to NUMBER type
		let shape: "Scalar" | "Series" = "Series"; // Default to Series

		if (selectedVar) {
			variableId = selectedVar.configId;

			// Get varValueType based on variable type
			if (isVariableConfig(selectedVar)) {
				// Variable node: get from configuration
				varValueType = selectedVar.varValueType;
			} else if (
				isSelectedIndicator(selectedVar) ||
				isSelectedSymbol(selectedVar)
			) {
				// Indicator node and K-line node: both are NUMBER type
				varValueType = VariableValueType.NUMBER;
			}

			// Determine shape: OperationGroup/OperationNode outputs can be Scalar
			if ('type' in selectedVar && selectedVar.type === "Scalar") {
				shape = "Scalar";
			}
		}

		setVariableString(variableValue);
		onVariableChange(
			variableId,
			outputHandleId,
			variable,
			variableName || variable,
			varValueType,
			shape,
		);
	};

	// Get variable list of selected node
	const getSelectedNodeVariables = () => {
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === selectedNodeId,
		);
		return selectedNode?.variables || [];
	};

	// Get seriesLength of selected node
	const getSelectedNodeSeriesLength = useCallback(() => {
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === selectedNodeId,
		);
		return selectedNode?.seriesLength;
	}, [variableItemList, selectedNodeId]);

	// Check if the selected variable is a Scalar shape
	// Use the variable.shape property directly from props
	const isSelectedVariableScalar = useCallback(() => {
		return variable?.shape === "Scalar";
	}, [variable?.shape]);

	// Handle series index change
	const handleSeriesIndexChange = (newSeriesIndex: number) => {
		setSeriesIndex(newSeriesIndex);
		onSeriesIndexChange?.(newSeriesIndex);
	};

	// Check if currently selected node has available variables
	const hasAvailableVariables = () => {
		const variables = getSelectedNodeVariables();
		const options = renderVariableOptionsUtil({
			variables,
			localNodeId: selectedNodeId,
			generateOptionValue,
			t,
			whitelistValueType,
			blacklistValueType,
			excludeVariable,
		});
		return options && options.length > 0;
	};

	// Render variable options or empty state prompt
	const renderVariableContent = () => {
		const variables = getSelectedNodeVariables();
		const options = renderVariableOptionsUtil({
			variables,
			localNodeId: selectedNodeId,
			generateOptionValue,
			t,
			whitelistValueType,
			blacklistValueType,
			excludeVariable,
		});
		// If no available variables, display prompt message
		if (!options || options.length === 0) {
			return (
				<div className="py-2 text-center text-sm text-muted-foreground">
					{t("ifElseNode.noAvailableVariables")}
				</div>
			);
		}

		return options;
	};

	// Get variable selector placeholder
	const getVariablePlaceholder = () => {
		if (!selectedNodeId) {
			return t("ifElseNode.selectVariable");
		}
		return hasAvailableVariables()
			? t("ifElseNode.selectVariable")
			: t("ifElseNode.noAvailableVariables");
	};

	return (
		<div className="flex flex-col gap-2 w-full p-2 rounded-md border border-gray-200">
			{/* Node selector group */}
			<div className="flex flex-col gap-1">
				<span className="text-xs text-gray-500 font-medium">
					{t("node.node")}
				</span>
				<Select value={selectedNodeId} onValueChange={handleNodeChange}>
					<SelectTrigger
						className={cn(
							"h-8 text-xs font-normal bg-transparent hover:bg-gray-100 border-gray-300 transition-colors shadow-none!",
						)}
					>
						<SelectValue
							placeholder={t("ifElseNode.selectNode")}
							className="truncate"
						/>
					</SelectTrigger>
					<SelectContent className="max-h-80">
						{filteredVariableItemList.length === 0 ? (
							<div className="py-2 text-center text-sm text-muted-foreground">
								{t("ifElseNode.noAvailableNodes")}
							</div>
						) : (
							filteredVariableItemList.map((item) => (
								<SelectItem
									key={item.nodeId}
									value={item.nodeId}
									className="text-xs font-normal py-2 px-3"
									textValue={item.nodeName}
								>
									<div className="flex items-center gap-1">
										<span className="font-medium text-gray-900">
											{item.nodeName}
										</span>
									</div>
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>
			</div>

			{/* Variable selector group */}
			<div className="flex flex-col gap-1">
				<span className="text-xs text-gray-500 font-medium">
					{t("node.variable")}
				</span>
				<ButtonGroup className="w-full">
					<Select
						value={variableString}
						onValueChange={handleVariableChange}
						disabled={!selectedNodeId}
					>
						<SelectTrigger
							className={cn(
								"h-8 text-xs font-normal flex-1 bg-transparent hover:bg-gray-100 border-gray-300 transition-colors shadow-none!",
								!selectedNodeId &&
									"opacity-50 cursor-not-allowed hover:bg-transparent shadow-none!",
							)}
						>
							<SelectValue
								placeholder={getVariablePlaceholder()}
								className="truncate"
							/>
						</SelectTrigger>
						<SelectContent className="max-h-80">
							{renderVariableContent()}
						</SelectContent>
					</Select>

					{/* Series index selector - only render when seriesLength exists and variable is not Scalar */}
					{!isSelectedVariableScalar() && (
						<SeriesIndexDropdown
							seriesLength={getSelectedNodeSeriesLength()}
							value={seriesIndex}
							onChange={handleSeriesIndexChange}
							disabled={!selectedNodeId || !variableString}
						/>
					)}
				</ButtonGroup>
			</div>
		</div>
	);
};

export default VariableSelector;
