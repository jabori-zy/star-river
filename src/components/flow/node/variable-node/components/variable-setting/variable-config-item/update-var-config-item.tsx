import { Filter, Workflow } from "lucide-react";
import type React from "react";
import {
	generateUpdateHint,
	getTriggerCaseLabel,
} from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import type {
	TriggerDataFlow,
	UpdateOperationType,
	UpdateVariableConfig,
} from "@/types/node/variable-node";

interface UpdateVarConfigItemProps {
	config: UpdateVariableConfig;
	showOnlyTrigger?: boolean;
	showOnlyDetails?: boolean;
}

const UpdateVarConfigItem: React.FC<UpdateVarConfigItemProps> = ({
	config,
	showOnlyTrigger = false,
	showOnlyDetails = false,
}) => {
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
			append: "append",
			remove: "remove",
			clear: "clear",
		};
		return labels[type];
	};

	const getTriggerTypeBadge = () => {
		if (config.varTriggerType === "condition") {
			return (
				<Badge className="h-5 text-[10px] bg-orange-100 text-orange-800">
					<Filter className="h-3 w-3 mr-1" />
					条件触发
				</Badge>
			);
		} else {
			return (
				<Badge className="h-5 text-[10px] bg-emerald-100 text-emerald-800">
					<Workflow className="h-3 w-3 mr-1" />
					数据流触发
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
		// 数据流模式显示上游节点信息
		if (config.varTriggerType === "dataflow") {
			const dataflowValue = config.updateOperationValue as TriggerDataFlow;
			return (
				<div className="text-xs text-muted-foreground">
					{config.varDisplayName} ={" "}
					{dataflowValue.fromVarDisplayName || dataflowValue.fromVar}
				</div>
			);
		}

		// 条件触发模式显示提示信息
		// 获取触发信息
		const triggerCase = config.triggerCase;
		const triggerNodeName = triggerCase?.fromNodeName;
		const triggerCaseLabel = getTriggerCaseLabel(triggerCase);

		const hint = generateUpdateHint(
			config.varDisplayName,
			config.updateOperationType,
			{
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
				triggerNodeName: triggerNodeName,
				triggerCaseLabel: triggerCaseLabel || undefined,
			},
		);

		return <div className="text-xs text-muted-foreground">{hint}</div>;
	}

	// 默认显示所有内容
	return (
		<>
			{getTriggerTypeBadge()}
			<Badge variant="outline" className="h-5 px-1 bg-green-100 text-green-800">
				{getUpdateOperationText(config.updateOperationType)}
			</Badge>
			<div className="text-xs text-muted-foreground">
				{config.varTriggerType === "dataflow"
					? // 数据流模式：显示上游节点变量信息
						(() => {
							const dataflowValue =
								config.updateOperationValue as TriggerDataFlow;
							return `${config.varDisplayName} = ${dataflowValue.fromVarDisplayName || dataflowValue.fromVar}`;
						})()
					: // 条件触发模式：显示普通值或切换
						config.updateOperationType === "toggle"
						? `${config.varDisplayName} (切换)`
						: `${config.varDisplayName} = ${String(config.updateOperationValue)}`}
			</div>
		</>
	);
};

export default UpdateVarConfigItem;
