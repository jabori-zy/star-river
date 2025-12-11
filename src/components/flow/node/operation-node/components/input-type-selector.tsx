import type React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { InputArrayType } from "@/types/operation";

interface InputTypeSelectorProps {
	value: InputArrayType;
	onChange: (value: InputArrayType) => void;
	className?: string;
}

const inputTypeOptions: { value: InputArrayType; label: string }[] = [
	{ value: "Unary", label: "Unary" },
	{ value: "Binary", label: "Binary" },
	{ value: "Nary", label: "N-ary" },
];

export const InputTypeSelector: React.FC<InputTypeSelectorProps> = ({
	value,
	onChange,
	className,
}) => {
	return (
		<div className={cn("space-y-2", className)}>
			<Label className="text-sm font-medium">Input Type</Label>
			<RadioGroup
				value={value}
				onValueChange={(val) => onChange(val as InputArrayType)}
				className="flex gap-4"
			>
				{inputTypeOptions.map((option) => (
					<div key={option.value} className="flex items-center space-x-2">
						<RadioGroupItem value={option.value} id={`input-type-${option.value}`} />
						<Label
							htmlFor={`input-type-${option.value}`}
							className="text-sm font-normal cursor-pointer"
						>
							{option.label}
						</Label>
					</div>
				))}
			</RadioGroup>
		</div>
	);
};

export default InputTypeSelector;
