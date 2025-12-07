import type { TFunction } from "i18next";
import {
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";

// Variable type display name mapping (stores i18n keys)
const VARIABLE_TYPE_LABELS: Record<VariableValueType, string> = {
	[VariableValueType.NUMBER]: "strategy.variable.number",
	[VariableValueType.STRING]: "strategy.variable.string",
	[VariableValueType.BOOLEAN]: "strategy.variable.boolean",
	[VariableValueType.TIME]: "strategy.variable.time",
	[VariableValueType.ENUM]: "strategy.variable.enum",
	[VariableValueType.PERCENTAGE]: "strategy.variable.percentage",
};

// Variable type option configuration (receives translation function)
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
