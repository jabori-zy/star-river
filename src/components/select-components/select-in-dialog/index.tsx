import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";

// Non-portal SelectContent to avoid focus conflicts in Dialog
export const DialogSelectContent: React.FC<React.ComponentProps<typeof SelectPrimitive.Content>> = ({
	className,
	children,
	position = "popper",
	...props
}) => {
	return (
		<SelectPrimitive.Content
			className={cn(
				"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md",
				position === "popper" &&
					"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
				className,
			)}
			position={position}
			{...props}
		>
			<SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
				<ChevronUpIcon className="size-4" />
			</SelectPrimitive.ScrollUpButton>
			<SelectPrimitive.Viewport
				className={cn(
					"p-1",
					position === "popper" &&
						"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
				)}
			>
				{children}
			</SelectPrimitive.Viewport>
			<SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
				<ChevronDownIcon className="size-4" />
			</SelectPrimitive.ScrollDownButton>
		</SelectPrimitive.Content>
	);
};

// Custom SelectTrigger to avoid dialog close conflicts
export const DialogSelectTrigger: React.FC<React.ComponentProps<typeof SelectPrimitive.Trigger>> = ({
	className,
	children,
	...props
}) => {
	return (
		<SelectPrimitive.Trigger
			className={cn(
				"flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 hover:bg-accent hover:text-accent-foreground transition-colors",
				className,
			)}
			onPointerDown={(e) => {
				// Prevent the dialog from closing when clicking the trigger
				e.stopPropagation();
			}}
			{...props}
		>
			{children}
		</SelectPrimitive.Trigger>
	);
};

// Interface for SelectInDialog component props
export interface SelectInDialogProps {
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	options: Array<{
		value: string;
		label: React.ReactNode;
	}>;
	disabled?: boolean;
	className?: string;
	id?: string;
	emptyMessage?: React.ReactNode;
}

// Complete SelectInDialog component that can be used directly in dialogs
export const SelectInDialog: React.FC<SelectInDialogProps> = ({
	value,
	onValueChange,
	placeholder = "Select option",
	options,
	disabled = false,
	className,
	id,
	emptyMessage,
}) => {
	return (
		<Select
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
		>
			<DialogSelectTrigger id={id} className={className}>
				<SelectValue placeholder={placeholder} />
				<ChevronDownIcon className="h-4 w-4 opacity-50" />
			</DialogSelectTrigger>
			<DialogSelectContent>
				{options.length > 0 ? (
					options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))
				) : emptyMessage ? (
					<div className="px-2 py-1.5 text-sm text-muted-foreground">
						{emptyMessage}
					</div>
				) : null}
			</DialogSelectContent>
		</Select>
	);
};

// Export individual components for flexible usage
export { Select, SelectItem, SelectValue };
