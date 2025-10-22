import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";
import {
	Select,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DIALOG_SELECT_EVENT = "dialog-select:open";

// SelectContent that stays inside the dialog container to avoid focus conflicts
export const DialogSelectContent: React.FC<
	React.ComponentProps<typeof SelectPrimitive.Content>
> = ({ className, children, position = "popper", ...props }) => {
	return (
		<SelectPrimitive.Content
			className={cn(
				"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md pointer-events-auto",
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
export const DialogSelectTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof SelectPrimitive.Trigger>
>(({ className, children, onPointerDown, ...props }, ref) => {
	return (
		<SelectPrimitive.Trigger
			ref={ref}
			className={cn(
				"flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 hover:bg-accent hover:text-accent-foreground transition-colors",
				className,
			)}
			onPointerDown={(event) => {
				onPointerDown?.(event);
				// Prevent the dialog from closing when clicking the trigger
				event.stopPropagation();
			}}
			{...props}
		>
			{children}
		</SelectPrimitive.Trigger>
	);
});

DialogSelectTrigger.displayName = "DialogSelectTrigger";

// Interface for SelectInDialog component props
export interface SelectInDialogProps {
	value: string;
	onValueChange: (value: string) => void;
	onOpenChange?: (open: boolean) => void;
	placeholder?: string;
	options?: Array<{
		value: string;
		label: React.ReactNode;
	}>;
	disabled?: boolean;
	className?: string;
	id?: string;
	emptyMessage?: React.ReactNode;
	children?: React.ReactNode;
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
	children,
	onOpenChange,
}) => {
	const [open, setOpen] = React.useState(false);
	const selectId = React.useId();
	const onOpenChangeRef = React.useRef(onOpenChange);
	const [portalContainer, setPortalContainer] =
		React.useState<HTMLElement | null>(null);

	React.useEffect(() => {
		onOpenChangeRef.current = onOpenChange;
	}, [onOpenChange]);

	React.useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const handleSelectOpen = (event: Event) => {
			const { detail } = event as CustomEvent<string>;
			if (detail !== selectId) {
				setOpen(false);
				onOpenChangeRef.current?.(false);
			}
		};

		window.addEventListener(DIALOG_SELECT_EVENT, handleSelectOpen);
		return () => {
			window.removeEventListener(DIALOG_SELECT_EVENT, handleSelectOpen);
		};
	}, [selectId]);

	React.useEffect(() => {
		if (disabled && open) {
			setOpen(false);
			onOpenChangeRef.current?.(false);
		}
	}, [disabled, open]);

	const handleOpenChange = React.useCallback(
		(nextOpen: boolean) => {
			if (nextOpen && typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent(DIALOG_SELECT_EVENT, { detail: selectId }),
				);
			}

			setOpen(nextOpen);
			onOpenChangeRef.current?.(nextOpen);
		},
		[selectId],
	);

	const handleTriggerPointerDown = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			if (disabled) {
				event.preventDefault();
				return;
			}

			if (open) {
				// 手动收起下拉内容，确保再次点击触发器时可以关闭
				event.preventDefault();
				handleOpenChange(false);
			}
		},
		[disabled, open, handleOpenChange],
	);

	const setTriggerNode = React.useCallback((node: HTMLButtonElement | null) => {
		if (node) {
			const dialogContent = node.closest<HTMLElement>(
				"[data-slot='dialog-content']",
			);
			setPortalContainer(dialogContent ?? null);
		} else {
			setPortalContainer(null);
		}
	}, []);

	const renderContent = React.useCallback(
		() => (
			<DialogSelectContent>
				{children ? (
					children
				) : options && options.length > 0 ? (
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
		),
		[children, emptyMessage, options],
	);

	return (
		<Select
			value={value}
			onValueChange={onValueChange}
			open={open}
			onOpenChange={handleOpenChange}
			disabled={disabled}
		>
			<DialogSelectTrigger
				id={id}
				className={className}
				onPointerDown={handleTriggerPointerDown}
				ref={setTriggerNode}
			>
				<SelectValue placeholder={placeholder} />
				<ChevronDownIcon className="h-4 w-4 opacity-50" />
			</DialogSelectTrigger>
			{portalContainer ? (
				<SelectPrimitive.Portal container={portalContainer}>
					<div className="pointer-events-none absolute inset-0 z-50">
						{renderContent()}
					</div>
				</SelectPrimitive.Portal>
			) : (
				renderContent()
			)}
		</Select>
	);
};

// Export individual components for flexible usage
export {
	Select,
	SelectItem,
	SelectValue,
	SelectSeparator,
	SelectGroup,
	SelectLabel,
};
