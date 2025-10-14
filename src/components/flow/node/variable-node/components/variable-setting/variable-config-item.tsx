import { Clock, Filter, Settings, X } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	type VariableConfig,
	type UpdateOperationType,
} from "@/types/node/variable-node";

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
	const getTriggerTypeBadge = (triggerType: "condition" | "timer") => {
		if (triggerType === "timer") {
			// 只有 get 操作才有 timerConfig
			const timerConfig = config.varOperation === "get" ? config.timerConfig : undefined;
			return (
				<Badge className="h-5 text-[10px] bg-blue-100 text-blue-800">
					<Clock className="h-3 w-3 mr-1" />
					{timerConfig
						? `${timerConfig.interval}${
								timerConfig.unit === "second"
									? "s"
									: timerConfig.unit === "minute"
										? "m"
										: timerConfig.unit === "hour"
											? "h"
											: "d"
							}`
						: "定时触发"}
				</Badge>
			);
		} else {
			return (
				<Badge className="h-5 text-[10px] bg-orange-100 text-orange-800">
					<Filter className="h-3 w-3 mr-1" />
					条件触发
				</Badge>
			);
		}
	};

	// 获取更新操作类型的显示文本
	const getUpdateOperationText = (type: UpdateOperationType): string => {
		const labels: Record<UpdateOperationType, string> = {
			set: "=",
			add: "+=",
			subtract: "-=",
			multiply: "*=",
			divide: "/=",
			max: "max",
			min: "min",
			toggle: "toggle",
		};
		return labels[type];
	};

	return (
		<div className="flex items-center justify-between p-2 border rounded-md bg-background group">
			<div className="flex items-center gap-2">
				{config.varOperation === "get" ? (
					<>
						{config.symbol ? (
							<Badge variant="outline" className="h-5 px-1">
								{config.symbol}
							</Badge>
						) : (
							<Badge variant="outline" className="h-5 px-1">
								不限制交易对
							</Badge>
						)}
						{getTriggerTypeBadge(config.varTriggerType)}
						<div className="text-xs text-muted-foreground">
							{config.varDisplayName}
						</div>
					</>
				) : (
					<>
						<Badge variant="outline" className="h-5 px-1 bg-purple-100 text-purple-800">
							更新变量
						</Badge>
						<Badge variant="outline" className="h-5 px-1 bg-green-100 text-green-800">
							{getUpdateOperationText(config.updateOperationType)}
						</Badge>
						<div className="text-xs text-muted-foreground">
							{config.updateOperationType === "toggle"
								? `${config.varName} (切换)`
								: `${config.varName} = ${String(config.varValue)}`}
						</div>
					</>
				)}
			</div>
			<div className="flex items-center gap-1">
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
