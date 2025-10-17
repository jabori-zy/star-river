import { TbFileImport } from "react-icons/tb";
import type React from "react";
import {
	generateGetHint,
	getTriggerCaseLabel,
	getTriggerTypeInfo,
} from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import {
	type GetVariableConfig,
	getConditionTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";

interface GetVarConfigItemProps {
	config: GetVariableConfig;
}

const GetVarConfigItem: React.FC<GetVarConfigItemProps> = ({ config }) => {
	const effectiveTriggerType =
		getEffectiveTriggerType(config) ?? "condition";

	const triggerCase = getConditionTriggerConfig(config) ?? null;
	const triggerNodeName = triggerCase?.fromNodeName;
	const triggerCaseLabel = getTriggerCaseLabel(triggerCase);

	const typeInfo = getTriggerTypeInfo(effectiveTriggerType);
	const TriggerIcon = typeInfo.icon;

	const timerConfig = getTimerTriggerConfig(config);

	const hint = generateGetHint(config.varDisplayName, {
		varValueType: config.varValueType,
		triggerNodeName,
		triggerCaseLabel: triggerCaseLabel || undefined,
		timerConfig: effectiveTriggerType === "timer" ? timerConfig : undefined,
		symbol: ("symbol" in config ? config.symbol : null) || undefined,
	});

	return (
		<div className="flex-1 space-y-1">
			{/* 第一行：图标 + 操作标题 + 触发方式 */}
			<div className="flex items-center gap-2">
				<TbFileImport className="h-4 w-4 text-blue-600 flex-shrink-0" />
				<span className="text-sm font-medium">获取变量</span>
				<Badge className={`h-5 text-[10px] ${typeInfo.badgeColor}`}>
					<TriggerIcon className="h-3 w-3 mr-1" />
					{typeInfo.label}
				</Badge>
			</div>

			{/* 第二行：详细信息 */}
			<div className="flex items-center gap-2 flex-wrap">
				<div className="text-xs text-muted-foreground">
					{hint || config.varDisplayName}
				</div>
			</div>
		</div>
	);
};

export default GetVarConfigItem;
