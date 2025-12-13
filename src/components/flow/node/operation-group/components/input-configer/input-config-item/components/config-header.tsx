import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConfigHeaderProps } from "../types";

export const ConfigHeader: React.FC<ConfigHeaderProps> = ({
	configId,
	type,
	onDelete,
}) => {
	return (
		<div className="flex items-center justify-between">
			<h4 className="text-sm font-semibold text-gray-700">
				{type} {configId}
			</h4>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 gap-1"
				onClick={() => onDelete(configId)}
			>
				<Trash2 className="h-3.5 w-3.5" />
			</Button>
		</div>
	);
};
