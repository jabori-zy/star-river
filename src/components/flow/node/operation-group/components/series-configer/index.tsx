import { Plus, Trash2 } from "lucide-react";
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
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import { cn } from "@/lib/utils";
import type {
	OperationConfig,
	ScalarConfig,
	SeriesConfig,
} from "@/types/node/group/operation-group";

type ConfigType = "Series" | "Scalar";

// Single config item props
interface OperationConfigItemProps {
	variableItemList: VariableItem[];
	config: OperationConfig;
	onDisplayNameBlur: (configId: number, displayName: string) => void;
	onNodeChange: (configId: number, nodeId: string) => void;
	onVariableChange: (
		configId: number,
		nodeId: string,
		handleId: string,
		varName: string,
		varDisplayName: string,
	) => void;
	onScalarValueChange: (configId: number, value: number) => void;
	onTypeChange: (configId: number, newType: ConfigType) => void;
	onDelete: (configId: number) => void;
}

const OperationConfigItem: React.FC<OperationConfigItemProps> = ({
	variableItemList,
	config,
	onDisplayNameBlur,
	onNodeChange,
	onVariableChange,
	onScalarValueChange,
	onTypeChange,
	onDelete,
}) => {
	const { t } = useTranslation();
	const isScalar = config.type === "Scalar";

	// Local state for display name input (only save on blur)
	const [localDisplayName, setLocalDisplayName] = useState(
		isScalar ? config.scalarDisplayName : config.seriesDisplayName,
	);

	// Local state for scalar value input
	const [localScalarValue, setLocalScalarValue] = useState(
		isScalar ? config.scalarValue.toString() : "0",
	);

	// Get display name based on config type
	const configDisplayName = isScalar
		? (config as ScalarConfig).scalarDisplayName
		: (config as SeriesConfig).seriesDisplayName;

	// Get scalar value (only valid for Scalar type)
	const configScalarValue = isScalar ? (config as ScalarConfig).scalarValue : 0;

	// Sync local state when config changes from outside
	useEffect(() => {
		setLocalDisplayName(configDisplayName);
	}, [configDisplayName]);

	useEffect(() => {
		if (isScalar) {
			setLocalScalarValue(configScalarValue.toString());
		}
	}, [isScalar, configScalarValue]);

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

	// Get variables for selected node (only for Series type)
	const getSelectedNodeVariables = useCallback(() => {
		if (isScalar) return [];
		const seriesConfig = config as SeriesConfig;
		const selectedNode = variableItemList.find(
			(item) => item.nodeId === seriesConfig.fromNodeId,
		);
		return selectedNode?.variables || [];
	}, [variableItemList, isScalar, config]);

	// Render variable options
	const renderVariableContent = useCallback(() => {
		if (isScalar) return null;
		const seriesConfig = config as SeriesConfig;
		const variables = getSelectedNodeVariables();
		const options = renderVariableOptions({
			variables,
			localNodeId: seriesConfig.fromNodeId,
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
	}, [getSelectedNodeVariables, isScalar, config, generateOptionValue, t]);

	// Handle display name blur - save to node data
	const handleDisplayNameBlur = () => {
		const currentDisplayName = isScalar
			? (config as ScalarConfig).scalarDisplayName
			: (config as SeriesConfig).seriesDisplayName;
		if (localDisplayName !== currentDisplayName) {
			onDisplayNameBlur(config.configId, localDisplayName);
		}
	};

	// Handle scalar value blur
	const handleScalarValueBlur = () => {
		if (!isScalar) return;
		const numValue = Number.parseFloat(localScalarValue);
		if (!Number.isNaN(numValue) && numValue !== (config as ScalarConfig).scalarValue) {
			onScalarValueChange(config.configId, numValue);
		}
	};

	// Handle node selection (only for Series type)
	const handleNodeChange = (nodeId: string) => {
		if (!isScalar) {
			onNodeChange(config.configId, nodeId);
		}
	};

	// Handle variable selection (only for Series type)
	const handleVariableChange = (value: string) => {
		if (isScalar) return;
		const [nodeId, handleId, variable, variableName] = value.split("|");
		onVariableChange(
			config.configId,
			nodeId,
			handleId,
			variable,
			variableName || variable,
		);
	};

	// Get current variable value for selector (only for Series type)
	const currentVariableValue = useMemo(() => {
		if (isScalar) return "";
		const seriesConfig = config as SeriesConfig;
		if (seriesConfig.fromHandleId && seriesConfig.fromSeriesName) {
			return generateOptionValue(
				seriesConfig.fromNodeId,
				seriesConfig.fromHandleId,
				seriesConfig.fromSeriesName,
				seriesConfig.fromSeriesDisplayName || seriesConfig.fromSeriesName,
			);
		}
		return "";
	}, [config, isScalar, generateOptionValue]);

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
				</Label>
				<Input
					value={localDisplayName}
					onChange={(e) => setLocalDisplayName(e.target.value)}
					onBlur={handleDisplayNameBlur}
					placeholder={isScalar ? "Enter scalar name" : "Enter series name"}
					className="h-8 text-xs"
				/>
			</div>

			{/* Conditional content based on type */}
			{isScalar ? (
				// Scalar value input
				<div className="flex flex-col gap-1.5">
					<Label className="text-xs font-medium text-gray-600">
						Scalar Value
					</Label>
					<Input
						type="number"
						value={localScalarValue}
						onChange={(e) => setLocalScalarValue(e.target.value)}
						onBlur={handleScalarValueBlur}
						placeholder="Enter scalar value"
						className="h-8 text-xs"
					/>
				</div>
			) : (
				// Variable selector (Node + Variable in ButtonGroup)
				<div className="flex flex-col gap-1.5">
					<Label className="text-xs font-medium text-gray-600">
						Source Series
					</Label>
					<ButtonGroup className="w-full">
						{/* Node selector */}
						<Select
							value={(config as SeriesConfig).fromNodeId}
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
								{variableItemList.length === 0 ? (
									<div className="py-2 text-center text-sm text-muted-foreground">
										No available nodes
									</div>
								) : (
									variableItemList.map((item) => (
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
							disabled={!(config as SeriesConfig).fromNodeId}
						>
							<SelectTrigger
								className={cn(
									"h-8 text-xs font-normal min-w-24 flex-1 bg-white hover:bg-gray-100 border-gray-300 transition-colors",
									!(config as SeriesConfig).fromNodeId &&
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

// Main operation configer component
interface OperationConfigerProps {
	variableItemList: VariableItem[];
	operationConfigs: OperationConfig[];
	onAddConfig: () => void;
	onUpdateDisplayName: (configId: number, displayName: string) => void;
	onUpdateNode: (configId: number, nodeId: string) => void;
	onUpdateVariable: (
		configId: number,
		nodeId: string,
		handleId: string,
		varName: string,
		varDisplayName: string,
	) => void;
	onUpdateScalarValue: (configId: number, value: number) => void;
	onTypeChange: (configId: number, newType: ConfigType) => void;
	onRemoveConfig: (configId: number) => void;
	className?: string;
}

export const OperationConfiger: React.FC<OperationConfigerProps> = ({
	variableItemList = [],
	operationConfigs = [],
	onAddConfig,
	onUpdateDisplayName,
	onUpdateNode,
	onUpdateVariable,
	onUpdateScalarValue,
	onTypeChange,
	onRemoveConfig,
	className,
}) => {
	const configs = operationConfigs ?? [];

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-gray-700">
					Input Parameters
				</h3>
				<Button
					variant="outline"
					size="sm"
					className="text-xs gap-1 text-purple-600 border-purple-300 hover:bg-purple-50"
					onClick={onAddConfig}
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{/* Config list */}
			<div className="flex flex-col gap-3">
				{configs.map((config) => (
					<OperationConfigItem
						key={config.configId}
						variableItemList={variableItemList}
						config={config}
						onDisplayNameBlur={onUpdateDisplayName}
						onNodeChange={onUpdateNode}
						onVariableChange={onUpdateVariable}
						onScalarValueChange={onUpdateScalarValue}
						onTypeChange={onTypeChange}
						onDelete={onRemoveConfig}
					/>
				))}
			</div>

			{/* Empty state */}
			{configs.length === 0 && (
				<div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
					<p className="text-sm">No input parameters</p>
					<p className="text-xs mt-1">Click to add parameter</p>
				</div>
			)}
		</div>
	);
};

// Keep backward compatibility export
export const SeriesConfiger = OperationConfiger;

export default OperationConfiger;
