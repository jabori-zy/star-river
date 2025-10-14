import {
	VariableValueType,
	getVariableTypeIcon,
	getVariableTypeIconColor,
} from "@/types/variable";

// 变量类型显示名称映射
const VARIABLE_TYPE_LABELS: Record<VariableValueType, string> = {
	[VariableValueType.NUMBER]: "数字",
	[VariableValueType.STRING]: "字符串",
	[VariableValueType.BOOLEAN]: "布尔",
};

// 变量类型选项配置
export const VARIABLE_TYPE_OPTIONS = Object.values(VariableValueType).map(
	(type) => {
		const IconComponent = getVariableTypeIcon(type);
		const colorClass = getVariableTypeIconColor(type);

		return {
			value: type,
			label: (
				<div className="flex items-center">
					<IconComponent className={`h-4 w-4 mr-2 ${colorClass}`} />
					<span>{VARIABLE_TYPE_LABELS[type]}</span>
				</div>
			),
		};
	},
);