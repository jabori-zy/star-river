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

// PopoverContent with Portal to ensure dropdown floats above content
const SelectPopoverContent: React.FC<
	React.ComponentProps<typeof PopoverPrimitive.Content>
> = ({ className, children, side = "bottom", sideOffset = 4, ...props }) => {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				side={side}
				sideOffset={sideOffset}
				className={cn(
					"z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-0 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
					className,
				)}
				{...props}
			>
				{children}
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	);
};

export interface SelectWithSearchOption {
	value: string;
	label: string | React.ReactNode;
	searchText?: string; // Optional search text for plain text search
}

interface SelectWithSearchProps {
	options: SelectWithSearchOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string | null;
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
	const [searchTerm, setSearchTerm] = useState("");

	const selectedOption = options.find((option) => option.value === value);

	// Extract plain text for search
	const getSearchText = (option: SelectWithSearchOption): string => {
		if (option.searchText) {
			return option.searchText;
		}
		if (typeof option.label === "string") {
			return option.label;
		}
		// If label is a React node, use value as search text
		return option.value;
	};

	// Filter options
	const filteredOptions = options.filter((option) => {
		if (!searchTerm) return true;
		return getSearchText(option)
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
	});

	// Reset search term when closed
	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			setSearchTerm("");
		}
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
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
					<span className="truncate flex-1 text-left">
						{selectedOption?.label || placeholder}
					</span>
					<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<SelectPopoverContent className="w-(--radix-popover-trigger-width)">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={searchTerm}
						onValueChange={setSearchTerm}
					/>
					<CommandList>
						{filteredOptions.length === 0 ? (
							<CommandEmpty>{emptyMessage}</CommandEmpty>
						) : (
							<CommandGroup>
								{filteredOptions.map((option) => (
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
												"h-4 w-4 shrink-0",
												value === option.value ? "opacity-100" : "opacity-0",
											)}
										/>
										<div className="flex-1 truncate">{option.label}</div>
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</SelectPopoverContent>
		</Popover>
	);
};
