import { Plus } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OutputConfigItem } from "./output-config-item";
import type { OutputConfigerProps } from "./types";

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

			{/* Add button at bottom */}
			{configs.length > 0 && (
				<Button
					variant="outline"
					size="sm"
					className="w-full text-xs gap-1 text-green-600 border-green-300 hover:bg-green-50 border-dashed"
					onClick={onAddConfig}
				>
					<Plus className="h-4 w-4" />
					Add output config
				</Button>
			)}
		</div>
	);
};

export default OutputConfiger;

// Re-export types
export type { OutputOption, OutputConfigItemProps, OutputConfigerProps } from "./types";
