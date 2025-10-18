import { TbRefresh } from "react-icons/tb";
import type React from "react";
import {
	generateResetHint,
	getTriggerTypeInfo,
} from "@/components/flow/node/variable-node/variable-node-utils";
import { formatVariableValue } from "@/components/flow/node/start-node/components/utils";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ResetVariableConfig } from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getDataFlowTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import {
	getVariableTypeIcon,
	getVariableTypeIconColor,
} from "@/types/variable";

interface ResetVarConfigItemProps {
	config: ResetVariableConfig;
}

const ResetVarConfigItem: React.FC<ResetVarConfigItemProps> = ({ config }) => {
	const effectiveTriggerType =
		getEffectiveTriggerType(config) ?? "condition";

	const triggerCase = getConditionTriggerConfig(config) ?? null;

	const typeInfo = getTriggerTypeInfo(effectiveTriggerType);
	const TriggerIcon = typeInfo.icon;

	const formattedValue = formatVariableValue(
		config.varInitialValue,
		config.varValueType,
	);

	const hint = generateResetHint(config.varDisplayName, {
		varValueType: config.varValueType,
		value: formattedValue,
		selectedValues: Array.isArray(config.varInitialValue)
			? config.varInitialValue
			: undefined,
		triggerConfig: {
			triggerType: effectiveTriggerType,
			conditionTrigger: triggerCase,
			timerTrigger: getTimerTriggerConfig(config),
			dataflowTrigger: getDataFlowTriggerConfig(config),
		},
	});

	const VarTypeIcon = getVariableTypeIcon(config.varValueType);
	const varTypeIconColor = getVariableTypeIconColor(config.varValueType);

	return (
		<div className="flex-1 space-y-1">
			<Tooltip>
				<TooltipTrigger asChild>
					{/* 第一行：图标 + 操作标题 + 触发方式 */}
					<div className="flex items-center gap-2 pb-2">
						<TbRefresh className="h-4 w-4 text-orange-600 flex-shrink-0" />
						<span className="text-sm font-medium">重置变量</span>
						<Badge className={`h-5 text-[10px] ${typeInfo.badgeColor}`}>
							<TriggerIcon className="h-3 w-3" />
							{typeInfo.label}
						</Badge>
					</div>
			</TooltipTrigger>
			<TooltipContent side="top">
				<div className="flex items-center gap-1">
					<VarTypeIcon className={`text-sm ${varTypeIconColor}`} />
					<p>{config.varName}</p>
				</div>
			</TooltipContent>
		</Tooltip>

			{/* 第二行：详细信息 */}
			<div className="flex items-center gap-2 flex-wrap">
				<div className="text-xs text-muted-foreground">
					{hint || `${config.varDisplayName} → ${formattedValue}`}
				</div>
			</div>
		</div>
	);
};

export default ResetVarConfigItem;
