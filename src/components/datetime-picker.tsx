"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import * as React from "react";
import {
	PopoverInDialog,
	PopoverInDialogContent,
	PopoverInDialogTrigger,
} from "@/components/dialog-components/popover-in-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";

interface DateTimePicker24hProps {
	value?: Date;
	onChange?: (date: Date | undefined) => void;
	placeholder?: string;
	showSeconds?: boolean; // Whether to show seconds selector, default is false
	useDialogPopover?: boolean; // Whether to use non-Portal version inside Dialog
	className?: string; // Custom Button styles
}

export function DateTimePicker24h({
	value,
	onChange,
	placeholder,
	showSeconds = false,
	useDialogPopover = false,
	className,
}: DateTimePicker24hProps = {}) {
	const [date, setDate] = React.useState<Date | undefined>(value);
	const [isOpen, setIsOpen] = React.useState(false);

	// Set default placeholder based on whether seconds are shown
	const defaultPlaceholder = showSeconds
		? "YYYY/MM/DD HH:mm:ss"
		: "YYYY/MM/DD HH:mm";
	const actualPlaceholder = placeholder || defaultPlaceholder;

	// Sync external value changes
	React.useEffect(() => {
		setDate(value);
	}, [value]);

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDate(selectedDate);
			onChange?.(selectedDate);
		}
	};

	const handleTimeChange = (
		type: "hour" | "minute" | "second",
		value: string,
	) => {
		if (date) {
			const newDate = new Date(date);
			if (type === "hour") {
				newDate.setHours(parseInt(value));
			} else if (type === "minute") {
				newDate.setMinutes(parseInt(value));
			} else if (type === "second") {
				newDate.setSeconds(parseInt(value));
			}
			setDate(newDate);
			onChange?.(newDate);
		}
	};

	const PopoverRoot = useDialogPopover ? PopoverInDialog : Popover;
	const PopoverRootTrigger = useDialogPopover
		? PopoverInDialogTrigger
		: PopoverTrigger;
	const PopoverRootContent = useDialogPopover
		? PopoverInDialogContent
		: PopoverContent;

	return (
		<PopoverRoot open={isOpen} onOpenChange={setIsOpen}>
			<PopoverRootTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full text-left font-normal",
						!date && "text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon className="h-4 w-4" />
					{date ? (
						format(
							date,
							showSeconds ? "yyyy/MM/dd HH:mm:ss" : "yyyy/MM/dd HH:mm",
						)
					) : (
						<span>{actualPlaceholder}</span>
					)}
				</Button>
			</PopoverRootTrigger>
			<PopoverRootContent className="w-auto p-0">
				<div className="sm:flex">
					<Calendar
						mode="single"
						selected={date}
						onSelect={handleDateSelect}
						defaultMonth={date}
						showOutsideDays={false}
						captionLayout="dropdown"
					/>
					<div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
						<ScrollArea className="w-64 sm:w-auto">
							<div className="flex sm:flex-col p-2">
								{hours.reverse().map((hour) => (
									<Button
										key={hour}
										size="icon"
										variant={
											date && date.getHours() === hour ? "default" : "ghost"
										}
										className="sm:w-full shrink-0 aspect-square"
										onClick={() => handleTimeChange("hour", hour.toString())}
									>
										{hour}
									</Button>
								))}
							</div>
							<ScrollBar orientation="horizontal" className="sm:hidden" />
						</ScrollArea>
						<ScrollArea className="w-64 sm:w-auto">
							<div className="flex sm:flex-col p-2">
								{Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
									<Button
										key={minute}
										size="icon"
										variant={
											date && date.getMinutes() === minute ? "default" : "ghost"
										}
										className="sm:w-full shrink-0 aspect-square"
										onClick={() =>
											handleTimeChange("minute", minute.toString())
										}
									>
										{minute.toString().padStart(2, "0")}
									</Button>
								))}
							</div>
							<ScrollBar orientation="horizontal" className="sm:hidden" />
						</ScrollArea>
						{showSeconds && (
							<ScrollArea className="w-64 sm:w-auto">
								<div className="flex sm:flex-col p-2">
									{Array.from({ length: 60 }, (_, i) => i).map((second) => (
										<Button
											key={second}
											size="icon"
											variant={
												date && date.getSeconds() === second
													? "default"
													: "ghost"
											}
											className="sm:w-full shrink-0 aspect-square"
											onClick={() =>
												handleTimeChange("second", second.toString())
											}
										>
											{second.toString().padStart(2, "0")}
										</Button>
									))}
								</div>
								<ScrollBar orientation="horizontal" className="sm:hidden" />
							</ScrollArea>
						)}
					</div>
				</div>
			</PopoverRootContent>
		</PopoverRoot>
	);
}
