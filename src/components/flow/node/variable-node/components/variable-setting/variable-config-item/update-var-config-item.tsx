import { TbEdit } from "react-icons/tb";
import type React from "react";
import {
	generateDataflowHint,
	generateUpdateHint,
	getTriggerCaseLabel,
	getTriggerTypeInfo,
} from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import type {
	DataFlowTrigger,
	UpdateVariableConfig,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getDataFlowTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";

interface UpdateVarConfigItemProps {
	config: UpdateVariableConfig;
}

const UpdateVarConfigItem: React.FC<UpdateVarConfigItemProps> = ({ config }) => {
	const effectiveTriggerType =
		getEffectiveTriggerType(config) ?? "condition";

	const triggerCase = getConditionTriggerConfig(config) ?? null;

	const typeInfo = getTriggerTypeInfo(effectiveTriggerType);
	const TriggerIcon = typeInfo.icon;

	// 生成详细提示信息
	const generateHintContent = () => {
		if (effectiveTriggerType === "dataflow") {
			// 数据流模式：显示上游节点变量信息
			const dataflowValue =
				getDataFlowTriggerConfig(config) as DataFlowTrigger | undefined;
			if (!dataflowValue) return null;
			return generateDataflowHint(
				config.varDisplayName, 
				{
					fromNodeName: dataflowValue.fromNodeName,
					fromNodeType: dataflowValue.fromNodeType,
					fromVarConfigId: dataflowValue.fromVarConfigId,
					fromVarDisplayName:
						dataflowValue.fromVarDisplayName || dataflowValue.fromVar,
				},
				config.updateOperationType, // 传递操作类型以支持 max/min 的特殊显示
			);
		}

		// 条件触发或定时触发模式
		return generateUpdateHint(config.varDisplayName, config.updateOperationType, {
			varValueType: config.varValueType,
			value:
				typeof config.updateOperationValue === "string" ||
				typeof config.updateOperationValue === "number" ||
				typeof config.updateOperationValue === "boolean"
					? String(config.updateOperationValue)
					: undefined,
			selectedValues: Array.isArray(config.updateOperationValue)
				? config.updateOperationValue
				: undefined,
			triggerConfig: {
				triggerType: effectiveTriggerType,
				conditionTrigger: triggerCase,
				timerTrigger: getTimerTriggerConfig(config),
				dataflowTrigger: getDataFlowTriggerConfig(config),
			},
		});
	};

	return (
		<div className="flex-1 space-y-1">
			{/* 第一行：图标 + 操作标题 + 触发方式 + 操作类型 */}
			<div className="flex items-center gap-2 pb-2">
				<TbEdit className="h-4 w-4 text-green-600 flex-shrink-0" />
				<span className="text-sm font-medium">更新变量</span>
				<Badge className={`h-5 text-[10px] ${typeInfo.badgeColor}`}>
					<TriggerIcon className="h-3 w-3 mr-1" />
					{typeInfo.label}
				</Badge>
			</div>

			{/* 第二行：详细信息 */}
			<div className="flex items-center gap-2 flex-wrap">
				<div className="text-xs text-muted-foreground">
					{generateHintContent()}
				</div>
			</div>
		</div>
	);
};

export default UpdateVarConfigItem;
