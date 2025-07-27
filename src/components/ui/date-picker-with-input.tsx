import { CalendarDate } from "@internationalized/date";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Button,
	DatePicker,
	type DateValue,
	Dialog,
	Group,
	Popover,
} from "react-aria-components";

import { Calendar } from "@/components/ui/calendar-rac";
import { DateInput } from "@/components/ui/datefield-rac";

interface DatePickerWithInputProps {
	label?: string;
	value?: string;
	onChange?: (date: string) => void;
	ariaLabel?: string; // 新增可選的 aria-label 屬性
}

export default function DatePickerWithInput({
	value = "",
	onChange,
	ariaLabel = "选择日期", // 默認的 aria-label
}: DatePickerWithInputProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		value ? new Date(value) : undefined,
	);

	// 将Date转换为CalendarDate
	const getCalendarDate = (
		date: Date | undefined,
	): CalendarDate | undefined => {
		if (!date) return undefined;
		return new CalendarDate(
			date.getFullYear(),
			date.getMonth() + 1,
			date.getDate(),
		);
	};

	// 当外部value改变时更新内部state
	useEffect(() => {
		if (value) {
			const newDate = new Date(value);
			// 检查日期是否有效
			if (!isNaN(newDate.getTime())) {
				setSelectedDate(newDate);
			} else {
				console.error("Invalid date format:", value);
			}
		} else {
			setSelectedDate(undefined);
		}
	}, [value]);

	// 处理日期变化，接收CalendarDate | null类型
	const handleDateChange = (date: CalendarDate | null) => {
		if (date && onChange) {
			// 格式化为 YYYY-MM-DD
			const formattedDate = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
			onChange(formattedDate);

			// 更新内部状态
			setSelectedDate(new Date(date.year, date.month - 1, date.day));
		}
	};

	// 创建一个函数类型转换器，避免使用any
	type DatePickerOnChangeType = Parameters<typeof DatePicker>[0]["onChange"];
	const typedHandleDateChange =
		handleDateChange as unknown as DatePickerOnChangeType;

	// 处理日历组件的日期选择
	const handleCalendarSelect = (value: DateValue) => {
		// 确保是CalendarDate类型
		if (value instanceof CalendarDate) {
			handleDateChange(value);
		}
	};

	// Calendar组件的onChange类型转换
	type CalendarOnChangeType = Parameters<typeof Calendar>[0]["onChange"];
	const typedCalendarSelect =
		handleCalendarSelect as unknown as CalendarOnChangeType;

	// 阻止事件冒泡
	const preventPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation();
	};

	return (
		<div
			onClick={preventPropagation}
			onKeyDown={preventPropagation}
			onMouseDown={preventPropagation}
			className="relative"
		>
			<DatePicker
				className="*:not-first:mt-2"
				value={getCalendarDate(selectedDate)}
				onChange={typedHandleDateChange}
				aria-label={ariaLabel}
			>
				{/* <Label className="text-foreground text-sm font-medium">{label}</Label> */}
				<div className="flex">
					<Group className="w-full">
						<DateInput className="pe-9" />
					</Group>
					<Button className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
						<CalendarIcon size={16} />
					</Button>
				</div>
				<Popover
					className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-lg border shadow-lg outline-hidden"
					offset={4}
				>
					<Dialog className="max-h-[inherit] overflow-auto p-2">
						<div onClick={preventPropagation} onMouseDown={preventPropagation}>
							<Calendar
								value={getCalendarDate(selectedDate)}
								onChange={typedCalendarSelect}
							/>
						</div>
					</Dialog>
				</Popover>
			</DatePicker>
		</div>
	);
}
