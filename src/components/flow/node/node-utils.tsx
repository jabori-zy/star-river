import { DateTime } from "luxon";
import type React from "react";
import {
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
} from "@/components/dialog-components/select-in-dialog";
import { Badge } from "@/components/ui/badge";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import { NodeType } from "@/types/node/index";
import type { SelectedIndicator } from "@/types/node/indicator-node";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type {
	GetVariableConfig,
	VariableConfig,
} from "@/types/node/variable-node";
import {
	isScalarOutput,
	isSeriesOutput,
	isSeriesInput,
	isScalarInput,
	isScalarValueInput,
	isGroupScalarValueInput,
	type OperationOutputConfig,
	type OperationInputConfig,
} from "@/types/node/group/operation-group";
import {
	isSeriesOutput as isOperationNodeSeriesOutput,
	isScalarOutput as isOperationNodeScalarOutput,
	type OutputConfig as OperationNodeOutputConfig,
} from "@/types/node/operation-node";
import {
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";
import { cn } from "@/lib/utils";
import type { TFunction } from "i18next";

// Combined variable type
type AnyVariable = SelectedIndicator | SelectedSymbol | VariableConfig | OperationOutputConfig | OperationInputConfig | OperationNodeOutputConfig;

// Type guards
export const isSelectedIndicator = (
	variable: AnyVariable,
): variable is SelectedIndicator => {
	return (
		"value" in variable && "configId" in variable && "indicatorType" in variable
	);
};

export const isSelectedSymbol = (
	variable: AnyVariable,
): variable is SelectedSymbol => {
	return (
		"symbol" in variable && "interval" in variable && "configId" in variable
	);
};

export const isVariableConfig = (
	variable: AnyVariable,
): variable is VariableConfig => {
	return (
		"varOperation" in variable &&
		["get", "update", "reset"].includes(variable.varOperation)
	);
};

export const isOperationOutputConfig = (
	variable: AnyVariable,
): variable is OperationOutputConfig => {
	return isSeriesOutput(variable) || isScalarOutput(variable);
};

export const isOperationNodeOutputConfig = (
	variable: AnyVariable,
): variable is OperationNodeOutputConfig => {
	return isOperationNodeSeriesOutput(variable) || isOperationNodeScalarOutput(variable);
};

export const isOperationInputConfig = (
	variable: AnyVariable,
): variable is OperationInputConfig => {
	return isSeriesInput(variable) || isScalarInput(variable) || isScalarValueInput(variable) || isGroupScalarValueInput(variable);
};

interface RenderVariableOptionsParams {
	variables: AnyVariable[];
	localNodeId: string;
	generateOptionValue: (
		nodeId: string,
		handleId: string,
		variable: string | number,
		variableName?: string | null,
		configId?: number,
		varType?: string,
	) => string;
	t: TFunction;
	whitelistValueType?: VariableValueType | null; // Optional: whitelist - only keep specified type
	blacklistValueType?: VariableValueType | null; // Optional: blacklist - exclude specified type
	excludeVariable?: {
		// Optional: exclude specific variable (to avoid variable comparing with itself)
		nodeId: string;
		outputHandleId: string;
		varName: string | number;
	} | null;
}

/**
 * Render variable options with separators
 * Supports indicator nodes, K-line nodes and variable nodes
 */
export const renderVariableOptions = ({
	variables,
	localNodeId,
	generateOptionValue,
	t,
	whitelistValueType,
	blacklistValueType,
	excludeVariable,
}: RenderVariableOptionsParams): React.ReactNode[] | null => {
	if (variables.length === 0) return null;

	// Whitelist filtering: if whitelist type is specified, only keep variables of that type
	let filteredVariables = variables;
	if (whitelistValueType) {
		filteredVariables = variables.filter((v) => {
			// Indicator nodes and K-line nodes are both NUMBER type
			if (isSelectedIndicator(v) || isSelectedSymbol(v)) {
				return whitelistValueType === VariableValueType.NUMBER;
			}
			// Variable nodes filtered by their specific type
			if (isVariableConfig(v)) {
				return v.varValueType === whitelistValueType;
			}
			// OperationGroup and OperationNode outputs are NUMBER type (both Series and Scalar)
			if (isOperationOutputConfig(v) || isOperationNodeOutputConfig(v)) {
				return whitelistValueType === VariableValueType.NUMBER;
			}
			return false;
		});
	}

	// Blacklist filtering: if blacklist type is specified, exclude variables of that type
	if (blacklistValueType) {
		filteredVariables = filteredVariables.filter((v) => {
			// Indicator nodes and K-line nodes are both NUMBER type
			if (isSelectedIndicator(v) || isSelectedSymbol(v)) {
				return blacklistValueType !== VariableValueType.NUMBER;
			}
			// Variable nodes filtered by their specific type
			if (isVariableConfig(v)) {
				return v.varValueType !== blacklistValueType;
			}
			// OperationGroup and OperationNode outputs are NUMBER type (both Series and Scalar)
			if (isOperationOutputConfig(v) || isOperationNodeOutputConfig(v)) {
				return blacklistValueType !== VariableValueType.NUMBER;
			}
			return true;
		});
	}

	// If exclude variable is specified, filter further
	if (excludeVariable) {
		filteredVariables = filteredVariables.filter((v) => {
			// Check if this is the variable to exclude
			const shouldExclude =
				'outputHandleId' in v && 'outputHandleId' in excludeVariable && v.outputHandleId === excludeVariable.outputHandleId &&
				(() => {
					const excludeVarName = String(excludeVariable.varName);
					// For indicator nodes, check if it's the same variable field
					if (isSelectedIndicator(v)) {
						return Object.keys(v.value).some((key) => key === excludeVarName);
					}
					// For K-line nodes, check if it's the same field
					if (isSelectedSymbol(v)) {
						const klineFields = ["open", "high", "low", "close", "volume"];
						return klineFields.includes(excludeVarName);
					}
					// For variable nodes, check variable name
					if (isVariableConfig(v)) {
						return String(v.varName) === excludeVarName;
					}
					// For OperationGroup outputs, check display name
					if (isOperationOutputConfig(v)) {
						return v.outputName === excludeVarName;
					}
					// For OperationNode outputs, check display name
					if (isOperationNodeOutputConfig(v)) {
						return v.outputName === excludeVarName;
					}
					return false;
				})();

			return !shouldExclude;
		});
	}

	const indicators = filteredVariables.filter((v) =>
		isSelectedIndicator(v),
	) as SelectedIndicator[];
	const klineNodes = filteredVariables.filter((v) =>
		isSelectedSymbol(v),
	) as SelectedSymbol[];
	const variableConfigs = filteredVariables.filter((v) =>
		isVariableConfig(v),
	) as GetVariableConfig[];
	const operationOutputs = filteredVariables.filter((v) =>
		isOperationOutputConfig(v),
	) as OperationOutputConfig[];
	const operationNodeOutputs = filteredVariables.filter((v) =>
		isOperationNodeOutputConfig(v),
	) as OperationNodeOutputConfig[];
	const operationInputs = filteredVariables.filter((v) =>
		isSeriesInput(v) || isScalarInput(v) || isScalarValueInput(v) || isGroupScalarValueInput(v),
	) as OperationInputConfig[];

	const result: React.ReactNode[] = [];

	// Render indicator options
	if (indicators.length > 0) {
		// Indicator variables are all NUMBER type
		const TypeIconComponent = getVariableValueTypeIcon(
			VariableValueType.NUMBER,
		);
		const typeIconColor = getVariableValueTypeIconColor(
			VariableValueType.NUMBER,
		);

		const groupedByIndicatorId = indicators.reduce(
			(groups, variable) => {
				const key = variable.configId;
				if (!groups[key]) {
					groups[key] = [];
				}
				groups[key].push(variable);
				return groups;
			},
			{} as Record<number, SelectedIndicator[]>,
		);

		const indicatorIds = Object.keys(groupedByIndicatorId).map(Number).sort();

		indicatorIds.forEach((indicatorId, groupIndex) => {
			const variables = groupedByIndicatorId[indicatorId];
			const groupItems: React.ReactNode[] = [];

			variables.forEach((variable) => {
				const variableName = Object.keys(variable.value);
				variableName.forEach((varName) => {
					if (varName === "timestamp") {
						return;
					}
					groupItems.push(
						<SelectItem
							className="text-xs font-normal py-2"
							key={`${variable.outputHandleId}_${varName}`}
							value={generateOptionValue(
								localNodeId,
								variable.outputHandleId,
								varName,
								t(`indicator.indicatorValueField.${varName}`),
								variable.configId,
							)}
						>
							<div className="flex items-center w-full gap-1">
								<div className="flex items-center gap-0.5 flex-shrink-0">
									<TypeIconComponent className={`h-4 w-4 ${typeIconColor}`} />
									{/* <Badge
										variant="outline"
										className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
									>
										{variable.indicatorType}
									</Badge> */}
								</div>
								<span className="font-medium text-gray-900 flex-1 text-right truncate">
									{t(`indicator.indicatorValueField.${varName}`)}
								</span>
							</div>
						</SelectItem>,
					);
				});
			});

			result.push(
				<SelectGroup key={`indicator_group_${indicatorId}`}>
					<SelectLabel className="text-xs font-semibold text-blue-600 px-2 py-1.5">
						<div className="flex items-center gap-2">
							{t("indicatorNode.indicator")} {indicatorId}
							<Badge
								variant="outline"
								className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
							>
								{variables[0].indicatorType}
							</Badge>
						</div>
					</SelectLabel>
					{groupItems}
				</SelectGroup>,
			);

			if (groupIndex < indicatorIds.length - 1) {
				result.push(
					<SelectSeparator
						key={`separator_indicator_${indicatorId}`}
						className="my-1"
					/>,
				);
			}
		});
	}

	// Separator between indicators and K-lines
	if (indicators.length > 0 && klineNodes.length > 0) {
		result.push(
			<SelectSeparator key="separator_indicator_kline" className="my-1" />,
		);
	}

	// Render K-line options
	if (klineNodes.length > 0) {
		// K-line variables are all NUMBER type
		const TypeIconComponent = getVariableValueTypeIcon(
			VariableValueType.NUMBER,
		);
		const typeIconColor = getVariableValueTypeIconColor(
			VariableValueType.NUMBER,
		);

		const groupedByConfigId = klineNodes.reduce(
			(groups, variable) => {
				const key = variable.configId;
				if (!groups[key]) {
					groups[key] = [];
				}
				groups[key].push(variable);
				return groups;
			},
			{} as Record<number, SelectedSymbol[]>,
		);

		const configIds = Object.keys(groupedByConfigId).map(Number).sort();

		configIds.forEach((configId, groupIndex) => {
			const variables = groupedByConfigId[configId];
			const groupItems: React.ReactNode[] = [];

			variables.forEach((variable) => {
				const klineFields = ["open", "high", "low", "close", "volume"];

				klineFields.forEach((field) => {
					groupItems.push(
						<SelectItem
							className="text-xs font-normal py-2"
							key={`${variable.outputHandleId}_${field}`}
							value={generateOptionValue(
								localNodeId,
								variable.outputHandleId,
								field,
								t(`market.klineValueField.${field}`),
								variable.configId,
							)}
						>
							<div className="flex items-center w-full gap-1">
								<div className="flex items-center gap-0.5 flex-shrink-0">
									<TypeIconComponent className={`h-4 w-4 ${typeIconColor}`} />
									{/* <Badge
										variant="outline"
										className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
									>
										{variable.symbol}|{variable.interval}
									</Badge> */}
								</div>
								<span className="font-medium text-gray-900 flex-1 text-right truncate">
									{t(`market.klineValueField.${field}`)}
								</span>
							</div>
						</SelectItem>,
					);
				});
			});

			result.push(
				<SelectGroup key={`kline_group_${configId}`}>
					<SelectLabel className="text-xs font-semibold text-green-600 px-2 py-1.5">
						<div className="flex items-center gap-2">
							{t("klineNode.kline")} {configId}
							<Badge
								variant="outline"
								className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
							>
								{variables[0].symbol}|{variables[0].interval}
							</Badge>
						</div>
					</SelectLabel>
					{groupItems}
				</SelectGroup>,
			);

			if (groupIndex < configIds.length - 1) {
				result.push(
					<SelectSeparator
						key={`separator_kline_${configId}`}
						className="my-1"
					/>,
				);
			}
		});
	}

	// Separator between K-lines and variables
	if (
		(indicators.length > 0 || klineNodes.length > 0) &&
		variableConfigs.length > 0
	) {
		result.push(
			<SelectSeparator key="separator_kline_variable" className="my-1" />,
		);
	}

	// Render variable node options
	if (variableConfigs.length > 0) {
		const variableItems: React.ReactNode[] = [];

		variableConfigs.forEach((variable) => {
			// Get variable type icon and color
			const TypeIconComponent = getVariableValueTypeIcon(variable.varValueType);
			const typeIconColor = getVariableValueTypeIconColor(
				variable.varValueType,
			);

			variableItems.push(
				<SelectItem
					className="text-xs font-normal py-2 px-3"
					key={`${variable.outputHandleId}_${variable.varName}`}
					value={generateOptionValue(
						localNodeId,
						variable.outputHandleId,
						variable.varName,
						variable.varDisplayName,
						variable.configId,
					)}
				>
					<div className="flex items-center w-full gap-1">
						<div className="flex items-center gap-0.5 flex-shrink-0">
							<TypeIconComponent className={`h-4 w-4 ${typeIconColor}`} />
							{/* {"symbol" in variable && variable.symbol && (
								<Badge
									variant="outline"
									className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm"
								>
									{variable.symbol}
								</Badge>
							)} */}
						</div>
						<span className="text-xs text-gray-900 font-medium flex-1 text-right truncate">
							{variable.varDisplayName}
						</span>
					</div>
				</SelectItem>,
			);
		});

		result.push(
			<SelectGroup key="variable_group">{variableItems}</SelectGroup>,
		);
	}

	// Render OperationGroup output options
	if (operationOutputs.length > 0) {
		operationOutputs.forEach((output) => {
			const displayName = output.outputName;

			result.push(
				<SelectItem
					className="text-xs font-normal py-2 px-3"
					key={`${output.outputHandleId}_${displayName}`}
					value={generateOptionValue(
						localNodeId,
						output.outputHandleId,
						displayName,
						displayName,
						output.configId,
						output.type,
					)}
				>
					<div className="flex items-center w-full gap-2">
						<span className="text-xs text-gray-900 font-medium truncate">
							{displayName}
						</span>
						<Badge
							variant="outline"
							className={cn(
								"text-[10px] px-1.5 py-0",
								output.type === "Scalar"
									? "border-blue-500 text-blue-400"
									: "border-orange-500 text-orange-400",
							)}
						>
							{output.type}
						</Badge>
					</div>
				</SelectItem>,
			);
		});
	}

	// Render OperationNode output options
	if (operationNodeOutputs.length > 0) {
		operationNodeOutputs.forEach((output) => {
			const displayName = output.outputName;

			result.push(
				<SelectItem
					className="text-xs font-normal py-2 px-3"
					key={`op_node_${output.outputHandleId}_${displayName}`}
					value={generateOptionValue(
						localNodeId,
						output.outputHandleId,
						displayName,
						displayName,
						output.configId,
						output.type,
					)}
				>
					<div className="flex items-center w-full gap-2">
						<span className="text-xs text-gray-900 font-medium truncate">
							{displayName}
						</span>
						<Badge
							variant="outline"
							className={cn(
								"text-[10px] px-1.5 py-0",
								output.type === "Scalar"
									? "border-blue-500 text-blue-400"
									: "border-orange-500 text-orange-400",
							)}
						>
							{output.type}
						</Badge>
					</div>
				</SelectItem>,
			);
		});
	}

	// Render OperationGroup input options (from OperationStartNode)
	if (operationInputs.length > 0) {
		// Add separator if there are previous items
		if (result.length > 0) {
			result.push(
				<SelectSeparator key="separator_operation_input" className="my-1" />,
			);
		}
		// console.log("🔍 operationInputs", operationInputs);

		operationInputs.forEach((input) => {
			const displayName = input.inputName;

			// Determine if this is a scalar type (includes both "Scalar" and "CustomScalarValue")
			const isScalarType = input.type === "Scalar" || input.type === "CustomScalarValue";

			// Get scalar value for CustomScalarValue types
			const getScalarValue = () => {
				if (input.type === "CustomScalarValue") {
					if (input.source === null) {
						return input.scalarValue;
					}
					// source === "Group"
					return input.fromScalarValue;
				}
				return 0;
			};

			// Generate option value based on input type
			const getOptionValue = () => {
				if (input.type === "Series") {
					return generateOptionValue(
						localNodeId,
						`${localNodeId}_default_output`,
						displayName,
						displayName,
						input.configId,
						"Series",
					);
				}
				if (input.type === "Scalar") {
					// Scalar with variable name (from Node or Group)
					return generateOptionValue(
						localNodeId,
						`${localNodeId}_default_output`,
						input.fromScalarName,
						displayName,
						input.configId,
						"Scalar",
					);
				}
				if (input.type === "CustomScalarValue") {
					// CustomScalarValue (self-defined or from parent Group)
					const scalarValue = getScalarValue();
					return generateOptionValue(
						localNodeId,
						`${localNodeId}_default_output`,
						scalarValue,
						displayName,
						input.configId,
						"CustomScalarValue",
					);
				}
				return "";
			};

			// Get badge label
			const getBadgeLabel = () => {
				if (input.type === "Series") return "Series";
				return "Scalar";
			};

			result.push(
				<SelectItem
					className="text-xs font-normal py-2 px-3"
					key={`input_${input.configId}_${displayName}`}
					value={getOptionValue()}
				>
					<div className="flex items-center w-full gap-2">
						<span className="text-xs text-gray-900 font-medium truncate">
							{displayName}
						</span>
						<Badge
							variant="outline"
							className={cn(
								"text-[10px] px-1.5 py-0",
								isScalarType
									? "border-blue-500 text-blue-400"
									: "border-orange-500 text-orange-400",
							)}
						>
							{getBadgeLabel()}
						</Badge>
						{input.type === "CustomScalarValue" && (
							<span className="text-xs text-gray-900 font-medium truncate">
								({getScalarValue()})
							</span>
						)}
					</div>
				</SelectItem>,
			);
		});
	}

	return result;
};

/**
 * Render node options
 * Convert VariableItem list to SelectInDialog options format
 */
export const renderNodeOptions = (variableItemList: VariableItem[]) => {
	return variableItemList.map((item) => ({
		value: item.nodeId,
		label: (
			<div className="flex items-center gap-1">
				<span className="font-medium text-gray-900 truncate">
					{item.nodeName}
				</span>
			</div>
		),
	}));
};

export const formatDate = (date: Date | undefined): string => {
	if (!date) return "";
	return DateTime.fromJSDate(date).toFormat("yyyy-MM-dd HH:mm:ss ZZ") || "";
};

export const getNodeTypeLabel = (
	nodeType: NodeType | null,
	t: (key: string) => string,
) => {
	switch (nodeType) {
		case NodeType.KlineNode:
			return t("node.kline");
		case NodeType.IndicatorNode:
			return t("node.indicator");
		case NodeType.VariableNode:
			return t("node.variable");
		case NodeType.FuturesOrderNode:
			return t("node.order");
		default:
			return t("ifElseNode.config");
	}
};
