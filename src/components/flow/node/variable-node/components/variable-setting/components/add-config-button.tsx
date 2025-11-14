import { PlusIcon } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	getVariableOperationIcon,
	getVariableOperationIconColor,
	getVariableOperationDisplayName,
	type VariableOperation,
} from "@/types/node/variable-node";
import { useTranslation } from "react-i18next";

interface AddConfigButtonProps {
	onAddVariable: (operation: VariableOperation) => void;
}

const AddConfigButton: React.FC<AddConfigButtonProps> = ({ onAddVariable }) => {
	const { t } = useTranslation();
	const operations: VariableOperation[] = ["get", "update", "reset"];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="h-8 w-full flex items-center justify-center gap-2 border-dashed"
				>
					<PlusIcon className="w-4 h-4" />
					<span className="text-sm">{t("variableNode.clickAddVariable")}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" className="w-full">
				{operations.map((operation) => {
					const Icon = getVariableOperationIcon(operation);
					const iconColor = getVariableOperationIconColor(operation);
					const displayName = getVariableOperationDisplayName(operation, t);

					return (
						<DropdownMenuItem
							key={operation}
							onClick={() => onAddVariable(operation)}
							className="flex items-center gap-2 cursor-pointer"
						>
							<Icon className={`h-4 w-4 ${iconColor}`} />
							<span>{displayName}</span>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default AddConfigButton;
