import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Non-portal PopoverContent to avoid focus conflicts in Dialog
const DialogPopoverContent: React.FC<
	React.ComponentProps<typeof PopoverPrimitive.Content>
> = ({ className, children, side = "bottom", sideOffset = 0, ...props }) => {
	return (
		<PopoverPrimitive.Content
			side={side}
			sideOffset={sideOffset}
			className={cn(
				"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-0 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		>
			{children}
		</PopoverPrimitive.Content>
	);
};

export interface SelectWithSearchOption {
	value: string;
	label: string;
}

interface SelectWithSearchProps {
	options: SelectWithSearchOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
	disabled?: boolean;
	id?: string;
	error?: boolean;
}

export const SelectWithSearch: React.FC<SelectWithSearchProps> = ({
	options,
	value,
	onValueChange,
	placeholder = "Select option",
	searchPlaceholder = "Search...",
	emptyMessage = "No option found.",
	className,
	disabled = false,
	id,
	error = false,
}) => {
	const [open, setOpen] = useState(false);

	const selectedOption = options.find((option) => option.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"w-full justify-between",
						error ? "border-red-500" : "",
						className,
					)}
				>
					{selectedOption?.label || placeholder}
					<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<DialogPopoverContent className="w-[var(--radix-popover-trigger-width)]">
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyMessage}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={(currentValue) => {
										onValueChange(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogPopoverContent>
		</Popover>
	);
};
