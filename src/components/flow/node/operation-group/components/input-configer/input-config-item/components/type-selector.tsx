import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { TypeSelectorProps } from "../types";

export const TypeSelector: React.FC<TypeSelectorProps> = ({
	configId,
	isScalar,
	onTypeChange,
}) => {
	return (
		<div className="flex flex-col gap-1.5">
			<Label className="text-xs font-medium text-gray-600">Input Type</Label>
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-1.5">
					<Checkbox
						id={`type-series-${configId}`}
						checked={!isScalar}
						onCheckedChange={() => onTypeChange(configId, "Series")}
						className="h-3.5 w-3.5"
					/>
					<Label
						htmlFor={`type-series-${configId}`}
						className="text-xs text-gray-600 cursor-pointer"
					>
						Series
					</Label>
				</div>
				<div className="flex items-center gap-1.5">
					<Checkbox
						id={`type-scalar-${configId}`}
						checked={isScalar}
						onCheckedChange={() => onTypeChange(configId, "Scalar")}
						className="h-3.5 w-3.5"
					/>
					<Label
						htmlFor={`type-scalar-${configId}`}
						className="text-xs text-gray-600 cursor-pointer"
					>
						Scalar
					</Label>
				</div>
			</div>
		</div>
	);
};
