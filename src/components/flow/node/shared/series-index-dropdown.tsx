import { ChevronDownIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SeriesIndexDropdownProps {
	seriesLength?: number;
	value?: number;
	onChange: (value: number) => void;
	disabled?: boolean;
}

const SeriesIndexDropdown: React.FC<SeriesIndexDropdownProps> = ({
	seriesLength,
	value = 0,
	onChange,
	disabled = false,
}) => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");

	// Calculate the first (oldest) index - must be before useCallback
	const firstIndex = seriesLength ? -(seriesLength - 1) : 0;

	// Get display text for current value - must be before conditional return
	const getDisplayText = useCallback(() => {
		if (value === 0) {
			return t("node.seriesIndex.latest");
		}
		if (value === -1) {
			return t("node.seriesIndex.previous");
		}
		if (value === firstIndex) {
			return t("node.seriesIndex.first");
		}
		return `[${value}]`;
	}, [value, firstIndex, t]);

	// If no seriesLength, don't render
	if (!seriesLength || seriesLength <= 0) {
		return null;
	}

	// Handle quick select
	const handleQuickSelect = (newValue: number) => {
		onChange(newValue);
		setOpen(false);
	};

	// Max value for input (positive integer, will be negated when applied)
	const maxInputValue = seriesLength - 1;

	// Handle input change - only allow positive integers within range
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		// Allow empty string
		if (val === "") {
			setInputValue("");
			return;
		}
		// Only allow positive integers
		const num = Number.parseInt(val, 10);
		if (!Number.isNaN(num) && num >= 0 && num <= maxInputValue) {
			setInputValue(String(num));
		}
	};

	// Handle input key down
	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			const num = Number.parseInt(inputValue, 10);
			if (!Number.isNaN(num) && num >= 0 && num <= maxInputValue) {
				onChange(-num); // Negate the value
				setInputValue("");
				setOpen(false);
			}
		}
	};

	// Handle input blur - apply the value
	const handleInputBlur = () => {
		const num = Number.parseInt(inputValue, 10);
		if (!Number.isNaN(num) && num >= 0 && num <= maxInputValue) {
			onChange(-num); // Negate the value
			setInputValue("");
		}
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"h-8 px-2 text-xs font-normal min-w-16 bg-transparent hover:bg-gray-200 border-gray-300 transition-colors",
						disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
					)}
					disabled={disabled}
				>
					<span className="truncate">{getDisplayText()}</span>
					<ChevronDownIcon className="h-3 w-3 ml-1" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={() => handleQuickSelect(0)}
						className={cn("text-xs", value === 0 && "bg-accent")}
					>
						{t("node.seriesIndex.latest")}
						<span className="ml-auto text-muted-foreground">[0]</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => handleQuickSelect(-1)}
						className={cn("text-xs", value === -1 && "bg-accent")}
					>
						{t("node.seriesIndex.previous")}
						<span className="ml-auto text-muted-foreground">[-1]</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<div className="px-2 py-1.5 flex items-center gap-1">
					<span className="text-xs text-muted-foreground">-</span>
					<Input
						type="number"
						placeholder={`0 ~ ${maxInputValue}`}
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleInputKeyDown}
						onBlur={handleInputBlur}
						min={0}
						max={maxInputValue}
						className="h-7 text-xs flex-1"
					/>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={() => handleQuickSelect(firstIndex)}
						className={cn("text-xs", value === firstIndex && "bg-accent")}
					>
						{t("node.seriesIndex.first")}
						<span className="ml-auto text-muted-foreground">[{firstIndex}]</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default SeriesIndexDropdown;
