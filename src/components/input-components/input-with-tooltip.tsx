import type React from "react";
import { HelpCircle } from "lucide-react";
import {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
	InputGroupButton,
} from "@/components/ui/input-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface InputWithTooltipProps {
	value: string;
	onChange: (value: string) => void;
	onBlur?: (value: string) => void;
	placeholder?: string;
	tooltipContent: React.ReactNode;
	type?: "text" | "number";
	min?: number;
	max?: number;
}

export const InputWithTooltip: React.FC<InputWithTooltipProps> = ({
	value,
	onChange,
	onBlur,
	placeholder,
	tooltipContent,
	type = "text",
	min,
	max,
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;

		if (type === "number") {
			// Allow empty string for clearing input
			if (newValue === "") {
				onChange(newValue);
				return;
			}

			// Only allow integers
			if (!/^\d+$/.test(newValue)) {
				return;
			}

			const numValue = Number.parseInt(newValue, 10);

			// Check min constraint
			if (min !== undefined && numValue < min) {
				return;
			}

			// Check max constraint
			if (max !== undefined && numValue > max) {
				return;
			}
		}

		onChange(newValue);
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (onBlur) {
			onBlur(e.target.value);
		}
	};

	return (
		<div className="space-y-2">
			<InputGroup>
				<InputGroupInput
					placeholder={placeholder}
					value={value}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
				<InputGroupAddon align="inline-end">
					<Tooltip>
						<TooltipTrigger asChild>
							<InputGroupButton
								variant="ghost"
								aria-label="Help"
								size="icon-xs"
							>
								<HelpCircle />
							</InputGroupButton>
						</TooltipTrigger>
						<TooltipContent>{tooltipContent}</TooltipContent>
					</Tooltip>
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
};

export default InputWithTooltip;
