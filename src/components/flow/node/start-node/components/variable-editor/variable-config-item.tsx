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
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
} from "@/types/variable";
import { formatVariableValue } from "../utils";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();
	const IconComponent = getVariableValueTypeIcon(variable.varValueType);
	const colorClass = getVariableValueTypeIconColor(variable.varValueType);
	const formattedInitialValue = formatVariableValue(
		variable.initialValue,
		variable.varValueType,
	);
	const formattedCurrentValue = formatVariableValue(
		variable.varValue,
		variable.varValueType,
	);

	return (
		<div className="flex items-center justify-between p-2 border rounded-md bg-background group">
			<div className="flex flex-col gap-1 min-w-0 flex-1">
				<TooltipProvider delayDuration={300}>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-2 cursor-pointer">
								<IconComponent className={`h-4 w-4 shrink-0 ${colorClass}`} />
								<span className="font-medium text-sm">
									{variable.varDisplayName}
								</span>
							</div>
						</TooltipTrigger>
						<TooltipContent side="top" align="start">
							<p className="text-xs">{variable.varName}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<div className="flex items-start gap-2 text-xs text-gray-600 ml-6">
					<div className="flex flex-wrap items-start gap-x-4 gap-y-1 min-w-0 flex-1">
						<div className="flex items-start gap-1">
							<span className="shrink-0">{t("startNode.initialValue")}:</span>
							<span className="font-medium break-all">
								{formattedInitialValue}
							</span>
						</div>
						<div className="flex items-start gap-1">
							<span className="shrink-0">{t("startNode.currentValue")}:</span>
							<span className="font-medium break-all">
								{formattedCurrentValue}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-1 shrink-0 self-center">
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
