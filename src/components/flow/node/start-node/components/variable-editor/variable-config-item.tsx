import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	type CustomVariable,
	getVariableTypeIcon,
	getVariableTypeIconColor,
} from "@/types/variable";
import { formatVariableValue } from "../utils";

interface VariableItemProps {
	variable: CustomVariable;
	onEdit: (variable: CustomVariable) => void;
	onDelete: (name: string) => void;
}

export const VariableItem = ({
	variable,
	onEdit,
	onDelete,
}: VariableItemProps) => {
	const IconComponent = getVariableTypeIcon(variable.varValueType);
	const colorClass = getVariableTypeIconColor(variable.varValueType);
	const formattedValue = formatVariableValue(
		variable.varValue,
		variable.varValueType,
	);

	return (
		<div className="flex items-center justify-between p-2 border rounded-md bg-background group">
			<div className="flex items-center gap-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<IconComponent className={`h-4 w-4 mr-1 ${colorClass}`} />
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-xs">{variable.varName}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<span className="font-medium">{variable.varDisplayName}</span>
                
			</div>
			<div className="flex items-center gap-1">
            <div className="pr-4 text-sm">{formattedValue}</div>
				<div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={() => onEdit(variable)}
					>
						<Settings className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-destructive"
						onClick={() => onDelete(variable.varName)}
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>
	);
};
