import { Settings, X } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { VariableConfig } from "@/types/node/variable-node";
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
	// 根据操作类型渲染对应的配置项组件
	const renderConfigContent = () => {
		switch (config.varOperation) {
			case "get":
				return <GetVarConfigItem config={config} />;
			case "update":
				return <UpdateVarConfigItem config={config} />;
			case "reset":
				return <ResetVarConfigItem config={config} />;
			default:
				return null;
		}
	};

	return (
		<div className="flex items-center justify-between p-2 border rounded-md bg-background group">
			{/* 配置内容 */}
			{renderConfigContent()}

			{/* 操作按钮 */}
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
