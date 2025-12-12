import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { OutputConfig } from "@/types/node/group/operation-group";

// Output option from source OperationNode
export interface OutputOption {
	sourceNodeId: string;
	sourceNodeName: string;
	outputType: "Series" | "Scalar";
	sourceHandleId: string;
	displayName: string;
}

interface OutputConfigItemProps {
	config: OutputConfig;
	availableOutputs: OutputOption[];
	usedSourceIds: Set<string>; // Already used source IDs (nodeId|handleId)
	onSelectSource: (configId: number, option: OutputOption) => void;
	onDisplayNameBlur: (configId: number, displayName: string) => void;
	onDelete: (configId: number) => void;
}

const OutputConfigItem: React.FC<OutputConfigItemProps> = ({
	config,
	availableOutputs,
	usedSourceIds,
	onSelectSource,
	onDisplayNameBlur,
	onDelete,
}) => {
	const isScalar = config.type === "Scalar";
	const hasSource = config.sourceNodeId !== "";

	// Get display name based on config type
	const configDisplayName = isScalar
		? config.scalarDisplayName
		: config.seriesDisplayName;

	// Local state for display name input
	const [localDisplayName, setLocalDisplayName] = useState(configDisplayName);

	// Sync local state when config changes from outside
	useEffect(() => {
		setLocalDisplayName(configDisplayName);
	}, [configDisplayName]);

	// Handle display name blur - save to node data
	const handleDisplayNameBlur = () => {
		if (localDisplayName !== configDisplayName) {
			onDisplayNameBlur(config.configId, localDisplayName);
		}
	};

	// Handle source selection
	const handleSourceChange = (value: string) => {
		const option = availableOutputs.find(
			(o) => `${o.sourceNodeId}|${o.sourceHandleId}` === value,
		);
		if (option) {
			onSelectSource(config.configId, option);
		}
	};

	// Current selected value for dropdown
	const currentSourceValue = hasSource
		? `${config.sourceNodeId}|${config.sourceHandleId}`
		: "";

	return (
		<div className="flex flex-col gap-2.5 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
			{/* Header with title and delete button */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h4 className="text-sm font-semibold text-gray-700">
						Output {config.configId}
					</h4>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 gap-1"
					onClick={() => onDelete(config.configId)}
				>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			</div>

			{/* Source selector */}
			<div className="flex flex-col gap-1.5">
				<Label className="text-xs font-medium text-gray-600">Source</Label>
				<Select value={currentSourceValue} onValueChange={handleSourceChange}>
					<SelectTrigger className="h-8 text-xs">
						<SelectValue placeholder="Select output source" />
					</SelectTrigger>
					<SelectContent>
						{availableOutputs.length === 0 ? (
							<div className="py-2 text-center text-sm text-muted-foreground">
								No available outputs
							</div>
						) : (
							availableOutputs.map((option) => {
								const optionKey = `${option.sourceNodeId}|${option.sourceHandleId}`;
								const isUsedByOther =
									usedSourceIds.has(optionKey) && optionKey !== currentSourceValue;

								return (
									<SelectItem
										key={optionKey}
										value={optionKey}
										className="text-xs"
										disabled={isUsedByOther}
									>
										<div
											className={cn(
												"flex items-center gap-2",
												isUsedByOther && "opacity-50",
											)}
										>
											<span>{option.displayName}</span>
											<Badge
												variant="outline"
												className={cn(
													"text-[10px] px-1.5 py-0",
													option.outputType === "Scalar"
														? "border-blue-500 text-blue-400"
														: "border-orange-500 text-orange-400",
												)}
											>
												{option.outputType}
											</Badge>
											<span className="text-gray-400">
												from {option.sourceNodeName}
											</span>
										</div>
									</SelectItem>
								);
							})
						)}
					</SelectContent>
				</Select>
			</div>

			{/* Display name input - only show when source is selected */}
			{hasSource && (
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
			)}
		</div>
	);
};

// Main OutputConfiger component props
interface OutputConfigerProps {
	availableOutputs: OutputOption[];
	outputConfigs: OutputConfig[];
	onAddConfig: () => void;
	onSelectSource: (configId: number, option: OutputOption) => void;
	onUpdateDisplayName: (configId: number, displayName: string) => void;
	onRemoveConfig: (configId: number) => void;
	className?: string;
}

export const OutputConfiger: React.FC<OutputConfigerProps> = ({
	availableOutputs = [],
	outputConfigs = [],
	onAddConfig,
	onSelectSource,
	onUpdateDisplayName,
	onRemoveConfig,
	className,
}) => {
	const configs = outputConfigs ?? [];

	// Calculate used source IDs (sources that are already configured)
	const usedSourceIds = useMemo(() => {
		const ids = new Set<string>();
		for (const config of configs) {
			if (config.sourceNodeId) {
				ids.add(`${config.sourceNodeId}|${config.sourceHandleId}`);
			}
		}
		return ids;
	}, [configs]);

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			{/* Header with add button */}
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-gray-700">
					Output
				</h3>
				<Button
					variant="outline"
					size="sm"
					className="text-xs gap-1 text-green-600 border-green-300 hover:bg-green-50"
					onClick={onAddConfig}
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{/* Config list */}
			<div className="flex flex-col gap-3">
				{configs.map((config) => (
					<OutputConfigItem
						key={config.configId}
						config={config}
						availableOutputs={availableOutputs}
						usedSourceIds={usedSourceIds}
						onSelectSource={onSelectSource}
						onDisplayNameBlur={onUpdateDisplayName}
						onDelete={onRemoveConfig}
					/>
				))}
			</div>

			{/* Empty state */}
			{configs.length === 0 && (
				<div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
					<p className="text-sm">No output parameters</p>
					<p className="text-xs mt-1">Click + to add output</p>
				</div>
			)}
		</div>
	);
};

export default OutputConfiger;
