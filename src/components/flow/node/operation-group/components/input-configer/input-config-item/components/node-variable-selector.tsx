// import { useTranslation } from "react-i18next";
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
	// const { t } = useTranslation();
	const isNodeSelected = Boolean(fromNodeId);

	return (
		<div className="flex flex-col gap-2 w-full p-2 rounded-md border border-gray-200">
			{/* Node selector group */}
			<div className="flex flex-col gap-1">
				<span className="text-xs text-gray-500 font-medium">
					Node
				</span>
				<Select value={fromNodeId} onValueChange={onNodeChange}>
					<SelectTrigger
						className={cn(
							"h-8 text-xs font-normal min-w-24 w-full bg-transparent hover:bg-gray-100 border-gray-300 transition-colors",
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
			</div>

			{/* Variable selector group */}
			<div className="flex flex-col gap-1">
				<span className="text-xs text-gray-500 font-medium">
					Variable
				</span>
				<Select
					value={currentVariableValue}
					onValueChange={onVariableChange}
					disabled={!isNodeSelected}
				>
					<SelectTrigger
						className={cn(
							"h-8 text-xs font-normal min-w-24 w-full bg-transparent hover:bg-gray-100 border-gray-300 transition-colors",
							!isNodeSelected && "opacity-50 cursor-not-allowed hover:bg-white",
						)}
					>
						<SelectValue placeholder="Select Variable" className="truncate" />
					</SelectTrigger>
					<SelectContent className="max-h-80">
						{renderVariableContent()}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};
