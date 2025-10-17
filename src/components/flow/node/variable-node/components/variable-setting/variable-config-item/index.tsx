import { Settings, X } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
	getVariableOperationDisplayName,
	getVariableOperationIcon,
	getVariableOperationIconColor,
	type VariableConfig,
} from "@/types/node/variable-node";
import GetVarConfigItem from "./get-var-config-item";
import ResetVarConfigItem from "./reset-var-config-item";
import UpdateVarConfigItem from "./update-var-config-item";

interface VariableConfigItemProps {
	config: VariableConfig;
	index: number;
	onEdit: (index: number) => void;
	onDelete: (index: number) => void;
}

const VariableConfigItem: React.FC<VariableConfigItemProps> = ({
	config,
	index,
	onEdit,
	onDelete,
}) => {
	const Icon = getVariableOperationIcon(config.varOperation);
	const iconColor = getVariableOperationIconColor(config.varOperation);
	const displayName = getVariableOperationDisplayName(config.varOperation);

	return (
		<div className="flex items-start justify-between p-2 border rounded-md bg-background group">
			<div className="flex-1 space-y-1">
				{/* 第一行：图标 + 操作标题 + 触发方式 */}
				<div className="flex items-center gap-2">
					<Icon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
					<span className="text-sm font-medium">{displayName}</span>
					{config.varOperation === "get" ? (
						<GetVarConfigItem config={config} showOnlyTrigger />
					) : config.varOperation === "update" ? (
						<UpdateVarConfigItem config={config} showOnlyTrigger />
					) : (
						<ResetVarConfigItem config={config} showOnlyTrigger />
					)}
				</div>

				{/* 第二行：其他详细信息 */}
				<div className="flex items-center gap-2 flex-wrap">
					{config.varOperation === "get" ? (
						<GetVarConfigItem config={config} showOnlyDetails />
					) : config.varOperation === "update" ? (
						<UpdateVarConfigItem config={config} showOnlyDetails />
					) : (
						<ResetVarConfigItem config={config} showOnlyDetails />
					)}
				</div>
			</div>

			<div className="flex items-center gap-1 ml-2">
				<div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={() => onEdit(index)}
					>
						<Settings className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-destructive"
						onClick={() => onDelete(index)}
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default VariableConfigItem;
