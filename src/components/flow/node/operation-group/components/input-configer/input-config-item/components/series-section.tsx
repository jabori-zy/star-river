import { Label } from "@/components/ui/label";
import { NodeVariableSelector } from "./node-variable-selector";
import type { SeriesSectionProps } from "../types";

export const SeriesSection: React.FC<SeriesSectionProps> = ({
	fromNodeId,
	nodeList,
	currentVariableValue,
	onNodeChange,
	onVariableChange,
	renderVariableContent,
}) => {
	return (
		<div className="flex flex-col gap-1.5">
			<Label className="text-xs font-medium text-gray-600">Source Series</Label>
			<NodeVariableSelector
				nodeList={nodeList}
				fromNodeId={fromNodeId}
				currentVariableValue={currentVariableValue}
				onNodeChange={onNodeChange}
				onVariableChange={onVariableChange}
				renderVariableContent={renderVariableContent}
				emptyNodeMessage="No available nodes"
			/>
		</div>
	);
};
