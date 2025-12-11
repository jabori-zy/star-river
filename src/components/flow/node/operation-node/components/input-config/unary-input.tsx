import type React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { InputSeriesConfig } from "@/types/operation";
import { type InputOption, InputOptionDisplay } from "./index";

interface UnaryInputProps {
	inputConfig: InputSeriesConfig | null;
	seriesOptions: InputOption[];
	onChange: (config: InputSeriesConfig | null) => void;
	className?: string;
}

export const UnaryInput: React.FC<UnaryInputProps> = ({
	inputConfig,
	seriesOptions,
	onChange,
	className,
}) => {
	// Generate unique key for each option
	const getOptionKey = (option: InputOption) =>
		`${option.fromNodeId}-${option.fromHandleId}`;

	// Get current selected value
	const currentValue = inputConfig
		? `${inputConfig.fromNodeId}-${inputConfig.fromHandleId}`
		: "";


	const handleInputChange = (value: string) => {
		const selectedOption = seriesOptions.find(
			(opt) => getOptionKey(opt) === value,
		);
		if (selectedOption) {
			if (selectedOption.inputType === "Series") {
				onChange({
					type: "Series",
					seriesId: selectedOption.configId,
					seriesDisplayName: selectedOption.inputDisplayName,
					fromNodeType: selectedOption.fromNodeType,
					fromNodeId: selectedOption.fromNodeId,
					fromNodeName: selectedOption.fromNodeName,
					fromHandleId: selectedOption.fromHandleId,
				});
			}
			// Note: Unary operations typically only accept Series input
		}
	};

	// Filter to show only Series options for Unary input
	const seriesOnlyOptions = seriesOptions.filter(
		(opt) => opt.inputType === "Series",
	);

	return (
		<div className={cn("space-y-3", className)}>
			{/* Source Series Select */}
			<div className="space-y-1">
				{/* <Label className="text-xs text-muted-foreground">Source Series</Label> */}
				<Select value={currentValue} onValueChange={handleInputChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select source series" />
					</SelectTrigger>
					<SelectContent className="max-h-80">
						{seriesOnlyOptions.length === 0 ? (
							<div className="py-2 text-center text-sm text-muted-foreground">
								No available series
							</div>
						) : (
							seriesOnlyOptions.map((option) => (
								<SelectItem
									key={getOptionKey(option)}
									value={getOptionKey(option)}
								>
									<InputOptionDisplay option={option} />
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>
				{inputConfig?.fromNodeName && (
					<p className="text-xs text-muted-foreground pt-1">
						From: {inputConfig.fromNodeName}
					</p>
				)}
			</div>
		</div>
	);
};

export default UnaryInput;
