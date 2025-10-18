import { Position } from "@xyflow/react";
import { TbRefresh } from "react-icons/tb";
import type React from "react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { formatVariableValue } from "@/components/flow/node/start-node/components/utils";
import { getTriggerTypeInfo } from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import type { ResetVariableConfig } from "@/types/node/variable-node/variable-config-types";
import {
	getEffectiveTriggerType,
} from "@/types/node/variable-node";
import {
	generateTriggerConditionText,
} from "./utils";

interface ResetVarHandleItemProps {
	id: string;
	variableConfig: ResetVariableConfig;
}

export const ResetVarHandleItem: React.FC<ResetVarHandleItemProps> = ({
	id,
	variableConfig,
}) => {
	const effectiveTriggerType = getEffectiveTriggerType(variableConfig) ?? "condition";

	const typeInfo = getTriggerTypeInfo(effectiveTriggerType);
	const TriggerIcon = typeInfo.icon;

	const formattedValue = formatVariableValue(
		variableConfig.varInitialValue,
		variableConfig.varValueType,
	);

	const triggerConditionText = generateTriggerConditionText(variableConfig);

	return (
		<div className="relative">
			<div className="flex items-center justify-between gap-2 pr-2 pl-1 mb-1 relative ">
				<div className="flex items-center gap-1">
					<TbRefresh className="h-3 w-3 text-orange-600 flex-shrink-0" />
					<span className="text-xs font-bold text-muted-foreground">
						重置变量
					</span>
				</div>
				<BaseHandle
					id={`${id}_input_${variableConfig.configId}`}
					type="target"
					position={Position.Left}
					handleColor="!bg-black"
					className="-translate-x-2 -translate-y-3"
				/>
			</div>

		<div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative">
			<div className="flex flex-col gap-1 flex-1">
			<div className="flex items-start gap-2 pb-1">
				<span className="text-sm font-medium break-words">
					{variableConfig.varDisplayName}
				</span>
				<Badge className={`h-5 text-[10px] ${typeInfo.badgeColor} flex-shrink-0`}>
					<TriggerIcon className="h-3 w-3 mr-1" />
					{typeInfo.label}
				</Badge>
			</div>

				{triggerConditionText && (
					<div className="text-xs text-muted-foreground">
						{triggerConditionText}
					</div>
				)}

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span>重置为: {formattedValue}</span>
				</div>
			</div>
			<div className="text-xs text-muted-foreground font-bold">
				<Badge variant="outline" className="border-gray-400">
					变量 {variableConfig.configId}
				</Badge>
			</div>
		</div>
			<BaseHandle
				id={`${id}_output_${variableConfig.configId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black"
				className="translate-x-2 translate-y-7"
			/>
		</div>
	);
};
