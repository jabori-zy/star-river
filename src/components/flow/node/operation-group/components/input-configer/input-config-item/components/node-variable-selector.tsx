import { ButtonGroup } from "@/components/ui/button-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { NodeVariableSelectorProps } from "../types";

export const NodeVariableSelector: React.FC<NodeVariableSelectorProps> = ({
	nodeList,
	fromNodeId,
	currentVariableValue,
	onNodeChange,
	onVariableChange,
	renderVariableContent,
	emptyNodeMessage = "No available nodes",
}) => {
	const isNodeSelected = Boolean(fromNodeId);

	return (
		<ButtonGroup className="w-full">
			{/* Node selector */}
			<Select value={fromNodeId} onValueChange={onNodeChange}>
				<SelectTrigger
					className={cn(
						"h-8 text-xs font-normal min-w-24 flex-1 bg-white hover:bg-gray-100 border-gray-300 transition-colors",
					)}
				>
					<SelectValue placeholder="Select Node" className="truncate" />
				</SelectTrigger>
				<SelectContent className="max-h-80">
					{nodeList.length === 0 ? (
						<div className="py-2 text-center text-sm text-muted-foreground">
							{emptyNodeMessage}
						</div>
					) : (
						nodeList.map((item) => (
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
				onValueChange={onVariableChange}
				disabled={!isNodeSelected}
			>
				<SelectTrigger
					className={cn(
						"h-8 text-xs font-normal min-w-24 flex-1 bg-white hover:bg-gray-100 border-gray-300 transition-colors",
						!isNodeSelected && "opacity-50 cursor-not-allowed hover:bg-white",
					)}
				>
					<SelectValue placeholder="Select Variable" className="truncate" />
				</SelectTrigger>
				<SelectContent className="max-h-80">
					{renderVariableContent()}
				</SelectContent>
			</Select>
		</ButtonGroup>
	);
};
