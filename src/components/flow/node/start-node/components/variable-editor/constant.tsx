import {
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";
import type { TFunction } from "i18next";

// 变量类型显示名称映射（存储多语言 key）
const VARIABLE_TYPE_LABELS: Record<VariableValueType, string> = {
	[VariableValueType.NUMBER]: "strategy.variable.number",
	[VariableValueType.STRING]: "strategy.variable.string",
	[VariableValueType.BOOLEAN]: "strategy.variable.boolean",
	[VariableValueType.TIME]: "strategy.variable.time",
	[VariableValueType.ENUM]: "strategy.variable.enum",
	[VariableValueType.PERCENTAGE]: "strategy.variable.percentage",
};

// 变量类型选项配置（接收翻译函数）
export const getVariableTypeOptions = (t: TFunction) => {
	return Object.values(VariableValueType).map((type) => {
		const IconComponent = getVariableValueTypeIcon(type);
		const colorClass = getVariableValueTypeIconColor(type);

		return {
			value: type,
			label: (
				<div className="flex items-center">
					<IconComponent className={`h-4 w-4 mr-2 ${colorClass}`} />
					<span>{t(VARIABLE_TYPE_LABELS[type])}</span>
				</div>
			),
		};
	});
};
