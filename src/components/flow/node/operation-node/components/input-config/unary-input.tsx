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
	inputOptions: InputOption[];
	onChange: (config: InputSeriesConfig | null) => void;
	className?: string;
}

export const UnaryInput: React.FC<UnaryInputProps> = ({
	inputConfig,
	inputOptions,
	onChange,
	className,
}) => {
	// Filter to show only Series options for Unary input
	const seriesOnlyOptions = inputOptions.filter(
		(opt) => opt.inputType === "Series",
	);

	// Generate unique key for each option using configId
	const getOptionKey = (option: InputOption) =>
		`${option.fromNodeId}-${option.configId}`;

	// Get current selected value
	const currentValue = inputConfig
		? `${inputConfig.fromNodeId}-${inputConfig.fromSeriesConfigId}`
		: "";

	const handleInputChange = (value: string) => {
		const selectedOption = seriesOnlyOptions.find(
			(opt) => getOptionKey(opt) === value,
		);
		if (selectedOption && selectedOption.inputType === "Series") {
			onChange({
				type: "Series",
				source: "Group",
				configId: inputConfig?.configId ?? Date.now(),
				seriesDisplayName: selectedOption.inputDisplayName,
				fromNodeType: selectedOption.fromNodeType,
				fromNodeId: selectedOption.fromNodeId,
				fromNodeName: selectedOption.fromNodeName,
				fromHandleId: selectedOption.fromHandleId,
				fromSeriesConfigId: selectedOption.configId,
				fromSeriesName: selectedOption.inputName ?? selectedOption.inputDisplayName,
				fromSeriesDisplayName: selectedOption.inputDisplayName,
			});
		}
	};

	return (
		<div className={cn("space-y-3", className)}>
			{/* Source Series Select */}
			<div className="space-y-1">
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
