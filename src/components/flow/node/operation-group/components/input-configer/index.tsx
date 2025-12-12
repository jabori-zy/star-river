import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InputConfigItem } from "./input-config-item";
import type { OperationConfigerProps } from "./types";

export const OperationConfiger: React.FC<OperationConfigerProps> = ({
	variableItemList = [],
	operationConfigs = [],
	onAddConfig,
	onUpdateDisplayName,
	onUpdateNode,
	onUpdateVariable,
	onUpdateScalarValue,
	onTypeChange,
	onScalarSourceChange,
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
					<InputConfigItem
						key={config.configId}
						variableItemList={variableItemList}
						config={config}
						onDisplayNameBlur={onUpdateDisplayName}
						onNodeChange={onUpdateNode}
						onVariableChange={onUpdateVariable}
						onScalarValueChange={onUpdateScalarValue}
						onTypeChange={onTypeChange}
						onScalarSourceChange={onScalarSourceChange}
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

// Re-export types
export type {
	ConfigType,
	ScalarSource,
	InputConfigItemProps,
	OperationConfigerProps,
} from "./types";
