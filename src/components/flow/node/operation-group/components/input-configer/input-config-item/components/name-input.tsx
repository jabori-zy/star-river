import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { NameInputProps } from "../types";

export const NameInput: React.FC<NameInputProps> = ({
	configId,
	isScalar,
	value,
	onChange,
	onBlur,
	showError,
}) => {
	const label = isScalar ? "Scalar Name" : "Series Name";
	const placeholder = isScalar ? "Enter scalar name" : "Enter series name";
	const errorMessage = isScalar
		? "Scalar name is required"
		: "Series name is required";

	return (
		<div className="flex flex-col gap-1.5">
			<Label className="text-xs font-medium text-gray-600">
				{label}
				<span className="text-red-500 ml-0.5">*</span>
			</Label>
			<Input
				id={`name-input-${configId}`}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				placeholder={placeholder}
				className={cn(
					"h-8 text-xs",
					showError && "border-red-500 focus-visible:ring-red-500",
				)}
			/>
			{showError && <span className="text-xs text-red-500">{errorMessage}</span>}
		</div>
	);
};
