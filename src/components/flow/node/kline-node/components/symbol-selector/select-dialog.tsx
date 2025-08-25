import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverTrigger,
} from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon, Check } from "lucide-react";
import type { SelectedSymbol } from "@/types/node/kline-node";
import { getSymbolList, getSupportKlineInterval } from "@/service/market";
import type { MarketSymbol } from "@/types/market";

// Non-portal SelectContent to avoid focus conflicts in Dialog
const DialogSelectContent: React.FC<React.ComponentProps<typeof SelectPrimitive.Content>> = ({
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

// Non-portal PopoverContent to avoid focus conflicts in Dialog
const DialogPopoverContent: React.FC<React.ComponentProps<typeof PopoverPrimitive.Content>> = ({
	className,
	children,
	side = "bottom",
	sideOffset = 0,
	...props
}) => {
	return (
		<PopoverPrimitive.Content
			side={side}
			sideOffset={sideOffset}
			className={cn(
				"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-0 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				className
			)}
			{...props}
		>
			{children}
		</PopoverPrimitive.Content>
	);
};

// Time interval value to label mapping
const INTERVAL_LABEL_MAP: Record<string, string> = {
	"1m": "1 Minute",
	"2m": "2 Minutes",
	"3m": "3 Minutes",
	"4m": "4 Minutes",
	"5m": "5 Minutes",
	"6m": "6 Minutes",
	"10m": "10 Minutes",
	"12m": "12 Minutes",
	"15m": "15 Minutes",
	"20m": "20 Minutes",
	"30m": "30 Minutes",
	"1h": "1 Hour",
	"2h": "2 Hours",
	"3h": "3 Hours",
	"4h": "4 Hours",
	"6h": "6 Hours",
	"8h": "8 Hours",
	"12h": "12 Hours",
	"1d": "1 Day",
	"1w": "1 Week",
	"1M": "1 Month",
};

interface SymbolSelectDialogProps {
    accountId: number | undefined;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingSymbol?: SelectedSymbol;
	symbolName: string;
	symbolInterval: string;
	nameError: string;
	onSymbolNameChange: (value: string) => void;
	onSymbolIntervalChange: (value: string) => void;
	onSave: () => void;
}

export const SymbolSelectDialog: React.FC<SymbolSelectDialogProps> = ({
    accountId,
	isOpen,
	onOpenChange,
	editingSymbol,
	symbolName,
	symbolInterval,
	nameError,
	onSymbolNameChange,
	onSymbolIntervalChange,
	onSave,
}) => {

    const [symbolList, setSymbolList] = useState<MarketSymbol[]>([]);
    const [supportKlineInterval, setSupportKlineInterval] = useState<string[]>([]);
	const [symbolComboboxOpen, setSymbolComboboxOpen] = useState(false);

    useEffect(() => {
        if (accountId && isOpen) {
            getSymbolList(accountId).then((data) => {
                setSymbolList(data);
            });
            getSupportKlineInterval(accountId).then((data) => {
                console.log(data);
                setSupportKlineInterval(data);
            });
        }
    }, [accountId, isOpen]);

	// Close combobox when dialog closes
	useEffect(() => {
		if (!isOpen) {
			setSymbolComboboxOpen(false);
		}
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{editingSymbol ? "Edit Symbol" : "Add Symbol"}
					</DialogTitle>
					<DialogDescription>
						Add trading symbols and their corresponding time intervals to get K-line data.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="symbol-name" className="text-right">
							Symbol
						</Label>
						<div className="col-span-3">
							<Popover open={symbolComboboxOpen} onOpenChange={setSymbolComboboxOpen}>
								<PopoverTrigger asChild>
									<Button
										id="symbol-name"
										variant="outline"
										aria-expanded={symbolComboboxOpen}
										className={cn(
											"w-full justify-between",
											nameError ? "border-red-500" : ""
										)}
									>
										{symbolName
											? symbolList.find((symbol) => symbol.name === symbolName)?.name
											: "Select Symbol"}
										<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<DialogPopoverContent className="w-[var(--radix-popover-trigger-width)]">
									<Command>
										<CommandInput placeholder="Search symbol" />
										<CommandList>
											<CommandEmpty>No symbol found.</CommandEmpty>
											<CommandGroup>
												{symbolList.map((symbol) => (
													<CommandItem
														key={symbol.name}
														value={symbol.name}
														onSelect={(currentValue) => {
															onSymbolNameChange(currentValue === symbolName ? "" : currentValue);
															setSymbolComboboxOpen(false);
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																symbolName === symbol.name ? "opacity-100" : "opacity-0"
															)}
														/>
														{symbol.name}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</DialogPopoverContent>
							</Popover>
							{nameError && (
								<p className="text-xs text-red-500">{nameError}</p>
							)}
						</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="symbol-interval" className="text-right">
							Interval
						</Label>
						<div className="col-span-3">
							<Select
								value={symbolInterval}
								onValueChange={onSymbolIntervalChange}
							>
								<SelectTrigger id="symbol-interval">
									<SelectValue placeholder="Select Interval" />
								</SelectTrigger>
								<DialogSelectContent>
									{supportKlineInterval.map((interval) => (
										<SelectItem key={interval} value={interval}>
											<div className="flex items-center">
												<span>{INTERVAL_LABEL_MAP[interval] || interval}</span>
											</div>
										</SelectItem>
									))}
								</DialogSelectContent>
							</Select>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={onSave}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};