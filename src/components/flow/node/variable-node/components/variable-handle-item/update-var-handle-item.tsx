import { Position } from "@xyflow/react";
import { TbEdit } from "react-icons/tb";
import type React from "react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { 
	getTriggerTypeInfo,
} from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UpdateVariableConfig } from "@/types/node/variable-node/variable-config-types";
import { getEffectiveTriggerType, getDataFlowTriggerConfig } from "@/types/node/variable-node";
import {
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
} from "@/types/variable";
import { generateTriggerConditionText, generateUpdateOperationNodeText } from "./utils";
import { useTranslation } from "react-i18next";

interface UpdateVarHandleItemProps {
	id: string;
	variableConfig: UpdateVariableConfig;
}

export const UpdateVarHandleItem: React.FC<UpdateVarHandleItemProps> = ({
	id,
	variableConfig,
}) => {
	const { t } = useTranslation();
	const effectiveTriggerType =
		getEffectiveTriggerType(variableConfig) ?? "condition";

	const typeInfo = getTriggerTypeInfo(effectiveTriggerType, t);
	const TriggerIcon = typeInfo.icon;

	const triggerConditionText = generateTriggerConditionText(variableConfig, t);

	// 获取数据流触发配置（用于 max/min 操作的特殊显示）
	const dataflowTrigger = getDataFlowTriggerConfig(variableConfig);

	// 生成操作文本
	const operationText = generateUpdateOperationNodeText(
		variableConfig.varDisplayName,
		variableConfig.updateOperationType,
		variableConfig.updateOperationValue,
		effectiveTriggerType,
		t,
		dataflowTrigger,
		
	);

	const VarTypeIcon = getVariableValueTypeIcon(variableConfig.varValueType);
	const varTypeIconColor = getVariableValueTypeIconColor(variableConfig.varValueType);

	return (
		<div className="relative">
			<div className="flex items-center justify-between gap-2 pr-2 pl-1 mb-1 relative ">
				<div className="flex items-center gap-1">
					<TbEdit className="h-3 w-3 text-green-600 flex-shrink-0" />
					<span className="text-xs font-bold text-muted-foreground">
						{t("variableNode.update")}
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
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="flex flex-col gap-1 flex-1">
					<div className="flex items-start gap-2 pb-1">
						<span className="text-sm font-medium break-words">
							{variableConfig.varDisplayName}
						</span>
						<Badge className={`h-5 text-[10px] ${typeInfo.badgeColor} flex-shrink-0`}>
							<TriggerIcon className="h-3 w-3" />
							{typeInfo.label}
						</Badge>
					</div>

					{triggerConditionText && (
						<div className="text-xs text-muted-foreground">
							{triggerConditionText}
						</div>
					)}

					{operationText && (
						<div className="text-xs text-muted-foreground">
							{t("variableNode.op")}: {operationText}
						</div>
					)}

				</div>
		</TooltipTrigger>
		<TooltipContent side="top">
			<div className="flex items-center gap-1">
				<VarTypeIcon className={`text-sm ${varTypeIconColor}`} />
				<p>{variableConfig.varName}</p>
			</div>
		</TooltipContent>
	</Tooltip>
		<div className="text-xs text-muted-foreground font-bold pl-2">
			<Badge variant="outline" className="border-gray-400">
				{t("variableNode.var")} {variableConfig.configId}
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
