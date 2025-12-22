import type React from "react";
import { useCallback } from "react";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
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

interface OutputNameInputProps {
	value: string;
	onChange: (value: string) => void;
}

// Only allow uppercase/lowercase letters, underscore, and hyphen
const OUTPUT_NAME_PATTERN = /^[a-zA-Z_-]*$/;

export const OutputNameInput: React.FC<OutputNameInputProps> = ({
	value,
	onChange,
}) => {
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			// Only accept valid characters
			if (OUTPUT_NAME_PATTERN.test(newValue)) {
				onChange(newValue);
			}
		},
		[onChange],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			// Block space key
			if (e.key === " ") {
				e.preventDefault();
			}
		},
		[],
	);

	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium">Output Name</Label>
			<InputGroup>
				<InputGroupInput
					placeholder="Enter output name"
					value={value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
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
						<TooltipContent>
							<p>Only support letters, "_" and "-"</p>
						</TooltipContent>
					</Tooltip>
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
};

export default OutputNameInput;
