import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getTriggerTypeInfo } from "@/components/flow/node/variable-node/variable-node-utils";
import type { TriggerType } from "@/types/node/variable-node";
import { useTranslation } from "react-i18next";

interface TriggerTypeConfigProps {
	triggerType: TriggerType;
	onTriggerTypeChange: (value: TriggerType) => void;
	availableTriggers?: TriggerType[]; // 可选：指定可用的触发类型，不指定则显示全部
	idPrefix?: string;
}

const TRIGGER_TYPES: TriggerType[] = ["condition", "timer", "dataflow"];

const TriggerTypeConfig: React.FC<TriggerTypeConfigProps> = ({
	triggerType,
	onTriggerTypeChange,
	availableTriggers,
	idPrefix = "trigger",
}) => {
	// 如果指定了 availableTriggers，则只显示指定的触发类型；否则显示全部
	const displayTypes = availableTriggers || TRIGGER_TYPES;
	const { t } = useTranslation();

	return (
		<div className="space-y-1">
			<Label className="text-sm font-medium">{t("variableNode.triggerType")}</Label>
			<div className="flex items-center space-x-6 pt-1">
				{displayTypes.map((type) => {
					const typeInfo = getTriggerTypeInfo(type, t);
					const IconComponent = typeInfo.icon;
					const triggerId = `${idPrefix}-${type}-trigger`;

					return (
						<div key={type} className="flex items-center space-x-2">
							<Checkbox
								id={triggerId}
								checked={triggerType === type}
								onCheckedChange={(checked) => {
									if (checked) {
										onTriggerTypeChange(type);
									}
								}}
							/>
							<Label
								htmlFor={triggerId}
								className="text-sm cursor-pointer flex items-center"
							>
								<IconComponent className={`h-3.5 w-3.5 mr-1 ${typeInfo.color}`} />
								{typeInfo.label}
							</Label>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default TriggerTypeConfig;
