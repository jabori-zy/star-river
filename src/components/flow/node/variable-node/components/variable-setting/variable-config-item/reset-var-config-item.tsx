import { Clock, Filter } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import type { ResetVariableConfig } from "@/types/node/variable-node";

interface ResetVarConfigItemProps {
	config: ResetVariableConfig;
	showOnlyTrigger?: boolean;
	showOnlyDetails?: boolean;
}

const ResetVarConfigItem: React.FC<ResetVarConfigItemProps> = ({
	config,
	showOnlyTrigger = false,
	showOnlyDetails = false,
}) => {
	const getTriggerTypeBadge = () => {
		if (config.varTriggerType === "timer") {
			// reset 操作没有 timerConfig，所以这里只显示文本
			return (
				<Badge className="h-5 text-[10px] bg-blue-100 text-blue-800">
					<Clock className="h-3 w-3 mr-1" />
					定时触发
				</Badge>
			);
		} else if (config.varTriggerType === "condition") {
			return (
				<Badge className="h-5 text-[10px] bg-orange-100 text-orange-800">
					<Filter className="h-3 w-3 mr-1" />
					条件触发
				</Badge>
			);
		} else {
			// dataflow 模式
			return (
				<Badge className="h-5 text-[10px] bg-emerald-100 text-emerald-800">
					<Clock className="h-3 w-3 mr-1" />
					数据流
				</Badge>
			);
		}
	};

	// 只显示触发方式
	if (showOnlyTrigger) {
		return <>{getTriggerTypeBadge()}</>;
	}

	// 只显示详细信息
	if (showOnlyDetails) {
		return (
			<div className="text-xs text-muted-foreground">
				{config.varName} → {String(config.varInitialValue)}
			</div>
		);
	}

	// 默认显示所有内容
	return (
		<>
			{getTriggerTypeBadge()}
			<div className="text-xs text-muted-foreground">
				{config.varName} → {String(config.varInitialValue)}
			</div>
		</>
	);
};

export default ResetVarConfigItem;
