import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectorOption {
	value: string;
	label: React.ReactNode;
}

export interface SelectorProps {
	options: SelectorOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	id?: string;
}

export const Selector: React.FC<SelectorProps> = ({
	options,
	value,
	onValueChange,
	placeholder = "Select option",
	className,
	disabled = false,
	id,
}) => {
	return (
		<Select value={value} onValueChange={onValueChange} disabled={disabled}>
			<SelectTrigger id={id} className={cn("w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
