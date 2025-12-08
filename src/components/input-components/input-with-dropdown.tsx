import { ChevronDownIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export interface DropdownOption {
	value: string;
	label: string;
}

export interface InputWithDropdownProps {
	type?: "text" | "number";
	value: string | number | null;
	onChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	min?: number;
	step?: number;
	disabled?: boolean;
	dropdownValue: string;
	dropdownOptions: DropdownOption[];
	onDropdownChange: (value: string) => void;
	className?: string;
}

export const InputWithDropdown: React.FC<InputWithDropdownProps> = ({
	type = "text",
	value,
	onChange,
	onBlur,
	placeholder,
	min,
	step,
	disabled = false,
	dropdownValue,
	dropdownOptions,
	onDropdownChange,
	className,
}) => {
	const selectedLabel =
		dropdownOptions.find((o) => o.value === dropdownValue)?.label ||
		dropdownValue;

	return (
		<InputGroup className={cn(className)}>
			<InputGroupInput
				type={type}
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				min={min}
				step={step}
				disabled={disabled}
				onBlur={onBlur}
			/>
			<InputGroupAddon align="inline-end">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<InputGroupButton
							variant="ghost"
							className="text-xs"
							disabled={disabled}
						>
							{selectedLabel}
							<ChevronDownIcon className="size-3" />
						</InputGroupButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{dropdownOptions.map((option) => (
							<DropdownMenuItem
								key={option.value}
								onClick={() => onDropdownChange(option.value)}
							>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</InputGroupAddon>
		</InputGroup>
	);
};
