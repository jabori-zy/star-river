import { TbFileImport } from "react-icons/tb";
import type React from "react";
import { getTriggerTypeInfo } from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	type GetVariableConfig,
	getConditionTriggerConfig,
	getDataFlowTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import {
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";
import { useTranslation } from "react-i18next";
import {
	generateBooleanHint,
	generateEnumHint,
	generateNumberHint,
	generateStringHint,
	generateTimeHint,
	generatePercentageHint,
} from "../../../hint-generators";

interface GetVarConfigItemProps {
	config: GetVariableConfig;
}

const GetVarConfigItem: React.FC<GetVarConfigItemProps> = ({ config }) => {
	const { t, i18n } = useTranslation();
	const language = i18n.language;
	const effectiveTriggerType =
		getEffectiveTriggerType(config) ?? "condition";

	const triggerCase = getConditionTriggerConfig(config) ?? null;

	const typeInfo = getTriggerTypeInfo(effectiveTriggerType, t);
	const TriggerIcon = typeInfo.icon;

	const timerConfig = getTimerTriggerConfig(config);
	const dataflowConfig = getDataFlowTriggerConfig(config);

	// 根据变量类型选择对应的生成器
	const getHintGenerator = (varValueType?: VariableValueType) => {
		if (!varValueType) return generateNumberHint;

		const generatorMap = {
			[VariableValueType.BOOLEAN]: generateBooleanHint,
			[VariableValueType.ENUM]: generateEnumHint,
			[VariableValueType.NUMBER]: generateNumberHint,
			[VariableValueType.STRING]: generateStringHint,
			[VariableValueType.TIME]: generateTimeHint,
			[VariableValueType.PERCENTAGE]: generatePercentageHint,
		};

		return generatorMap[varValueType] || generateNumberHint;
	};

	const hint = getHintGenerator(config.varValueType)({
		t,
		language,
		varOperation: "get",
		variableDisplayName: config.varDisplayName,
		conditionTrigger: triggerCase,
		timerTrigger: timerConfig,
		dataflowTrigger: dataflowConfig,
		symbol: ("symbol" in config ? config.symbol : null) || undefined,
	});

	const VarTypeIcon = getVariableValueTypeIcon(config.varValueType);
	const varTypeIconColor = getVariableValueTypeIconColor(config.varValueType);

	return (
		<div className="flex-1 space-y-1">
			<Tooltip>
				<TooltipTrigger asChild>
					{/* 第一行：图标 + 操作标题 + 触发方式 */}
					<div className="flex items-center gap-2 pb-2">
						<TbFileImport className="h-4 w-4 text-blue-600 flex-shrink-0" />
						<span className="text-sm font-medium">{t("variableNode.getVariable")}</span>
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
					{hint || config.varDisplayName}
				</div>
			</div>
		</div>
	);
};

export default GetVarConfigItem;
