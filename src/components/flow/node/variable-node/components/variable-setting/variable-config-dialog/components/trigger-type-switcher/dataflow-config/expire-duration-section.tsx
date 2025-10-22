import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TimerUnit } from "@/types/node/variable-node";
import { getTimeUnitOptions } from "../trigger-type-switcher-utils";
import type { ExpireDurationSectionProps } from "./types";

export const ExpireDurationSection: React.FC<ExpireDurationSectionProps> = ({
	expireDuration,
	onExpireDurationChange,
}) => {
	const { t } = useTranslation();
	const timeUnitOptions = getTimeUnitOptions(t);

	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">
				{t("variableNode.dataflowConfig.expireDuration")}
			</Label>
			<div className="flex justify-start items-center gap-2">
				<Input
					type="number"
					min="1"
					value={String(expireDuration.duration)}
					onChange={(e) =>
						onExpireDurationChange({
							...expireDuration,
							duration: Number(e.target.value) || 1,
						})
					}
					className="h-8 flex-1 min-w-0"
				/>
				<SelectInDialog
					value={expireDuration.unit}
					onValueChange={(value) =>
						onExpireDurationChange({
							...expireDuration,
							unit: value as TimerUnit,
						})
					}
					options={timeUnitOptions}
					className="h-8 w-auto flex-shrink-0"
				/>
			</div>
		</div>
	);
};

