import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { renderVariableOptions } from "@/components/flow/node/node-utils";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
	InputScalarValueConfig,
	InputScalarConfig,
	InputSeriesConfig,
} from "@/types/node/group/operation-group";
import type { VariableConfig } from "@/types/node/variable-node";
import { VariableValueType } from "@/types/variable";
import { NodeType } from "@/types/node";
import type { InputConfigItemProps } from "./types";

export const InputConfigItem: React.FC<InputConfigItemProps> = ({
	variableItemList,
	config,
	onDisplayNameBlur,
	onNodeChange,
	onVariableChange,
	onScalarValueChange,
	onTypeChange,
	onScalarSourceChange,
	onDelete,
}) => {
	const { t } = useTranslation();
	const isScalar = config.type === "Scalar";
	const isCustomScalar = isScalar && config.source === "Value";
	const isScalarFromNode = isScalar && config.source === "Node";

	// Filter node list by node type
	// Scalar mode: only show VariableNode
	const scalarNodeList = useMemo(
		() => variableItemList.filter((item) => item.nodeType === NodeType.VariableNode),
		[variableItemList],
	);

	// Series mode: exclude VariableNode (show IndicatorNode, KlineNode, etc.)
	const seriesNodeList = useMemo(
		() => variableItemList.filter((item) => item.nodeType !== NodeType.VariableNode),
		[variableItemList],
	);

	// Local state for display name input (only save on blur)
	const [localDisplayName, setLocalDisplayName] = useState(
		isScalar ? config.scalarDisplayName : config.seriesDisplayName,
	);

	// Local state for scalar value input (only for custom scalar)
	const [localScalarValue, setLocalScalarValue] = useState(
		isCustomScalar ? (config as InputScalarValueConfig).scalarValue.toString() : "0",
	);

	// Track if the name field has been touched (for validation)
	const [isInputName, setIsInputName] = useState(false);

	// Check if name is empty or only whitespace
	const isNameEmpty = localDisplayName.trim() === "";

	// Get display name based on config type
	const configDisplayName = isScalar
		? (config as InputScalarValueConfig).scalarDisplayName
		: (config as InputSeriesConfig).seriesDisplayName;

	// Get scalar value (only valid for custom Scalar type with source: Value)
	const configScalarValue = isCustomScalar
		? (config as InputScalarValueConfig).scalarValue
		: 0;

	// Sync local state when config changes from outside
	useEffect(() => {
		setLocalDisplayName(configDisplayName);
	}, [configDisplayName]);

	useEffect(() => {
		if (isCustomScalar) {
			setLocalScalarValue(configScalarValue.toString());
		}
	}, [isCustomScalar, configScalarValue]);

	// Generate option value for variable selector
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

	// Get variables for selected node (for Series type or Scalar from Node)
	// For VariableNode, only NUMBER type variables are allowed
	const getSelectedNodeVariables = useCallback(
		(nodeId: string) => {
			const selectedNode = variableItemList.find(
				(item) => item.nodeId === nodeId,
			);
			if (!selectedNode) return [];

			// If the node is a VariableNode, filter to only include NUMBER type variables
			if (selectedNode.nodeType === NodeType.VariableNode) {
				return selectedNode.variables.filter((variable) => {
					const varConfig = variable as VariableConfig;
					return varConfig.varValueType === VariableValueType.NUMBER;
				});
			}

			return selectedNode.variables;
		},
		[variableItemList],
	);

	// Get current fromNodeId based on config type
	const getCurrentFromNodeId = useCallback(() => {
		if (config.type === "Series") {
			return (config as InputSeriesConfig).fromNodeId;
		}
		if (isScalarFromNode) {
			return (config as InputScalarConfig).fromNodeId;
		}
		return "";
	}, [config, isScalarFromNode]);

	// Render variable options for Series or Scalar from Node
	const renderVariableContent = useCallback(() => {
		const fromNodeId = getCurrentFromNodeId();
		if (!fromNodeId) return null;

		const variables = getSelectedNodeVariables(fromNodeId);
		const options = renderVariableOptions({
			variables,
			localNodeId: fromNodeId,
			generateOptionValue,
			t,
		});

		if (!options || options.length === 0) {
			return (
				<div className="py-2 text-center text-sm text-muted-foreground">
					No available variables
				</div>
			);
		}

		return options;
	}, [getCurrentFromNodeId, getSelectedNodeVariables, generateOptionValue, t]);

	// Handle display name blur - save to node data
	const handleDisplayNameBlur = () => {
		setIsInputName(true);
		const currentDisplayName = isScalar
			? (config as InputScalarValueConfig).scalarDisplayName
			: (config as InputSeriesConfig).seriesDisplayName;
		if (localDisplayName !== currentDisplayName) {
			onDisplayNameBlur(config.configId, localDisplayName);
		}
	};

	// Handle scalar value blur (only for custom scalar)
	const handleScalarValueBlur = () => {
		if (!isCustomScalar) return;
		const numValue = Number.parseFloat(localScalarValue);
		if (!Number.isNaN(numValue) && numValue !== (config as InputScalarValueConfig).scalarValue) {
			onScalarValueChange(config.configId, numValue);
		}
	};

	// Handle node selection (for Series type or Scalar from Node)
	const handleNodeChange = (nodeId: string) => {
		if (!isCustomScalar) {
			onNodeChange(config.configId, nodeId);
		}
	};

	// Handle variable selection (for Series type or Scalar from Node)
	const handleVariableChange = (value: string) => {
		if (isCustomScalar) return;
		const [nodeId, handleId, variable, variableName] = value.split("|");
		console.log("🔍 Variable change:", { nodeId, handleId, variable, variableName });
		onVariableChange(
			config.configId,
			nodeId,
			handleId,
			variable,
			variableName || variable,
		);
	};

	// Get current variable value for selector (for Series type or Scalar from Node)
	const currentVariableValue = useMemo(() => {
		if (config.type === "Series") {
			const seriesConfig = config as InputSeriesConfig;
			if (seriesConfig.fromHandleId && seriesConfig.fromSeriesName) {
				return generateOptionValue(
					seriesConfig.fromNodeId,
					seriesConfig.fromHandleId,
					seriesConfig.fromSeriesName,
					seriesConfig.fromSeriesDisplayName,
				);
			}
		}
		if (isScalarFromNode) {
			const scalarNodeConfig = config as InputScalarConfig;
			if (scalarNodeConfig.fromHandleId && scalarNodeConfig.fromScalarName) {
				return generateOptionValue(
					scalarNodeConfig.fromNodeId,
					scalarNodeConfig.fromHandleId,
					scalarNodeConfig.fromScalarName,
					scalarNodeConfig.fromScalarDisplayName,
				);
			}
		}
		return "";
	}, [config, isScalarFromNode, generateOptionValue]);

	return (
		<div className="flex flex-col gap-2.5 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
			{/* Header with title and delete button */}
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-semibold text-gray-700">
					{isScalar ? "Scalar" : "Series"} {config.configId}
				</h4>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 gap-1"
					onClick={() => onDelete(config.configId)}
				>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			</div>

			{/* Input Type selector */}
			<div className="flex flex-col gap-1.5">
				<Label className="text-xs font-medium text-gray-600">Input Type</Label>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5">
						<Checkbox
							id={`type-series-${config.configId}`}
							checked={!isScalar}
							onCheckedChange={() => onTypeChange(config.configId, "Series")}
							className="h-3.5 w-3.5"
						/>
						<Label
							htmlFor={`type-series-${config.configId}`}
							className="text-xs text-gray-600 cursor-pointer"
						>
							Series
						</Label>
					</div>
					<div className="flex items-center gap-1.5">
						<Checkbox
							id={`type-scalar-${config.configId}`}
							checked={isScalar}
							onCheckedChange={() => onTypeChange(config.configId, "Scalar")}
							className="h-3.5 w-3.5"
						/>
						<Label
							htmlFor={`type-scalar-${config.configId}`}
							className="text-xs text-gray-600 cursor-pointer"
						>
							Scalar
						</Label>
					</div>
				</div>
			</div>

			{/* Display name input */}
			<div className="flex flex-col gap-1.5">
				<Label className="text-xs font-medium text-gray-600">
					{isScalar ? "Scalar Name" : "Series Name"}
					<span className="text-red-500 ml-0.5">*</span>
				</Label>
				<Input
					value={localDisplayName}
					onChange={(e) => setLocalDisplayName(e.target.value)}
					onBlur={handleDisplayNameBlur}
					placeholder={isScalar ? "Enter scalar name" : "Enter series name"}
					className={cn(
						"h-8 text-xs",
						isInputName && isNameEmpty && "border-red-500 focus-visible:ring-red-500",
					)}
				/>
				{isInputName && isNameEmpty && (
					<span className="text-xs text-red-500">
						{isScalar ? "Scalar name is required" : "Series name is required"}
					</span>
				)}
			</div>

			{/* Conditional content based on type */}
			{isScalar ? (
				// Scalar input section
				<div className="flex flex-col gap-1.5">
					{/* Label with Custom Scalar checkbox */}
					<div className="flex items-center justify-between">
						<Label className="text-xs font-medium text-gray-600">
							{isCustomScalar ? "Scalar Value" : "Source Scalar"}
						</Label>
						<div className="flex items-center gap-1.5">
							<Checkbox
								id={`custom-scalar-${config.configId}`}
								checked={isCustomScalar}
								onCheckedChange={(checked) =>
									onScalarSourceChange(config.configId, checked ? "Value" : "Node")
								}
								className="h-3.5 w-3.5"
							/>
							<Label
								htmlFor={`custom-scalar-${config.configId}`}
								className="text-xs text-gray-600 cursor-pointer"
							>
								Custom Scalar
							</Label>
						</div>
					</div>

					{/* Conditional: Custom value input or Node selector */}
					{isCustomScalar ? (
						// Custom scalar value input
						<Input
							type="number"
							value={localScalarValue}
							onChange={(e) => setLocalScalarValue(e.target.value)}
							onBlur={handleScalarValueBlur}
							placeholder="Enter scalar value"
							className="h-8 text-xs"
						/>
					) : (
						// Node/Variable selector for scalar from upstream node
						<ButtonGroup className="w-full">
							{/* Node selector - only show VariableNode for Scalar */}
							<Select
								value={getCurrentFromNodeId()}
								onValueChange={handleNodeChange}
							>
								<SelectTrigger
									className={cn(
										"h-8 text-xs font-normal min-w-24 flex-1 bg-white hover:bg-gray-100 border-gray-300 transition-colors",
									)}
								>
									<SelectValue placeholder="Select Node" className="truncate" />
								</SelectTrigger>
								<SelectContent className="max-h-80">
									{scalarNodeList.length === 0 ? (
										<div className="py-2 text-center text-sm text-muted-foreground">
											No available variable nodes
										</div>
									) : (
										scalarNodeList.map((item) => (
											<SelectItem
												key={item.nodeId}
												value={item.nodeId}
												className="text-sm font-normal py-2 px-3"
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

							{/* Variable selector */}
							<Select
								value={currentVariableValue}
								onValueChange={handleVariableChange}
								disabled={!getCurrentFromNodeId()}
							>
								<SelectTrigger
									className={cn(
										"h-8 text-xs font-normal min-w-24 flex-1 bg-white hover:bg-gray-100 border-gray-300 transition-colors",
										!getCurrentFromNodeId() &&
											"opacity-50 cursor-not-allowed hover:bg-white",
									)}
								>
									<SelectValue
										placeholder="Select Variable"
										className="truncate"
									/>
								</SelectTrigger>
								<SelectContent className="max-h-80">
									{renderVariableContent()}
								</SelectContent>
							</Select>
						</ButtonGroup>
					)}
				</div>
			) : (
				// Series: Variable selector (Node + Variable in ButtonGroup)
				<div className="flex flex-col gap-1.5">
					<Label className="text-xs font-medium text-gray-600">
						Source Series
					</Label>
					<ButtonGroup className="w-full">
						{/* Node selector - exclude VariableNode for Series */}
						<Select
							value={(config as InputSeriesConfig).fromNodeId}
							onValueChange={handleNodeChange}
						>
							<SelectTrigger
								className={cn(
									"h-8 text-xs font-normal min-w-24 flex-1 bg-white hover:bg-gray-100 border-gray-300 transition-colors",
								)}
							>
								<SelectValue placeholder="Select Node" className="truncate" />
							</SelectTrigger>
							<SelectContent className="max-h-80">
								{seriesNodeList.length === 0 ? (
									<div className="py-2 text-center text-sm text-muted-foreground">
										No available nodes
									</div>
								) : (
									seriesNodeList.map((item) => (
										<SelectItem
											key={item.nodeId}
											value={item.nodeId}
											className="text-sm font-normal py-2 px-3"
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

						{/* Variable selector */}
						<Select
							value={currentVariableValue}
							onValueChange={handleVariableChange}
							disabled={!(config as InputSeriesConfig).fromNodeId}
						>
							<SelectTrigger
								className={cn(
									"h-8 text-xs font-normal min-w-24 flex-1 bg-white hover:bg-gray-100 border-gray-300 transition-colors",
									!(config as InputSeriesConfig).fromNodeId &&
										"opacity-50 cursor-not-allowed hover:bg-white",
								)}
							>
								<SelectValue
									placeholder="Select Variable"
									className="truncate"
								/>
							</SelectTrigger>
							<SelectContent className="max-h-80">
								{renderVariableContent()}
							</SelectContent>
						</Select>
					</ButtonGroup>
				</div>
			)}
		</div>
	);
};

export default InputConfigItem;
