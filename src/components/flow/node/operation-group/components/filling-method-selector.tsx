import type React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FillingMethod } from "@/types/node/group/operation-group";

interface FillingMethodSelectorProps {
	value: FillingMethod;
	onChange: (value: FillingMethod) => void;
	className?: string;
}

const fillingMethodOptions: { value: FillingMethod; label: string; description: string }[] = [
	{ value: "FFill", label: "Forward Fill", description: "Fill with previous value" },
	{ value: "BFill", label: "Backward Fill", description: "Fill with next value" },
	{ value: "Zero", label: "Zero Fill", description: "Fill with zero" },
	{ value: "Mean", label: "Mean Fill", description: "Fill with mean value" },
];

export const FillingMethodSelector: React.FC<FillingMethodSelectorProps> = ({
	value,
	onChange,
	className,
}) => {
	return (
		<div className={cn("space-y-2", className)}>
			<Label className="text-sm font-medium">Filling Method</Label>
			<Select value={value} onValueChange={(val) => onChange(val as FillingMethod)}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select filling method">
						{fillingMethodOptions.find((opt) => opt.value === value)?.label}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{fillingMethodOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							<div className="flex flex-col">
								<span>{option.label}</span>
								<span className="text-xs text-muted-foreground">{option.description}</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export default FillingMethodSelector;
