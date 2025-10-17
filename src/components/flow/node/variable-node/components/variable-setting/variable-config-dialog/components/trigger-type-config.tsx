import { Clock, Filter, Workflow } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type TriggerType = "condition" | "timer" | "dataflow";

interface TriggerTypeConfigProps {
	triggerType: TriggerType;
	onTriggerTypeChange: (value: TriggerType) => void;
	availableTriggers?: TriggerType[]; // 可选：指定可用的触发类型，不指定则显示全部
	idPrefix?: string;
}

const TRIGGER_OPTIONS = [
	{
		type: "condition" as const,
		icon: Filter,
		label: "条件触发",
		color: "text-orange-500",
	},
	{
		type: "timer" as const,
		icon: Clock,
		label: "定时触发",
		color: "text-blue-500",
	},
	{
		type: "dataflow" as const,
		icon: Workflow,
		label: "数据流触发",
		color: "text-blue-500",
	},
];

const TriggerTypeConfig: React.FC<TriggerTypeConfigProps> = ({
	triggerType,
	onTriggerTypeChange,
	availableTriggers,
	idPrefix = "trigger",
}) => {
	// 如果指定了 availableTriggers，则只显示指定的触发类型；否则显示全部
	const displayOptions = availableTriggers
		? TRIGGER_OPTIONS.filter((option) =>
				availableTriggers.includes(option.type),
			)
		: TRIGGER_OPTIONS;

	return (
		<div className="space-y-1">
			<Label className="text-sm font-medium">触发方式</Label>
			<div className="flex items-center space-x-6 pt-1">
				{displayOptions.map((option) => {
					const IconComponent = option.icon;
					const triggerId = `${idPrefix}-${option.type}-trigger`;

					return (
						<div key={option.type} className="flex items-center space-x-2">
							<Checkbox
								id={triggerId}
								checked={triggerType === option.type}
								onCheckedChange={(checked) => {
									if (checked) {
										onTriggerTypeChange(option.type);
									}
								}}
							/>
							<Label
								htmlFor={triggerId}
								className="text-sm cursor-pointer flex items-center"
							>
								<IconComponent className={`h-3.5 w-3.5 mr-1 ${option.color}`} />
								{option.label}
							</Label>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default TriggerTypeConfig;
