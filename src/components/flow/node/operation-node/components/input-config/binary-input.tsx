import type React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { InputConfig } from "@/types/operation";
import { type InputOption, InputOptionDisplay } from "./index";
import { useState } from "react";
import { CircleAlert } from "lucide-react";

interface BinaryInputProps {
	input1: InputConfig | null;
	input2: InputConfig | null;
	seriesOptions: InputOption[];
	onChangeInput1: (config: InputConfig | null) => void;
	onChangeInput2: (config: InputConfig | null) => void;
	supportScalarInput?: boolean;
	className?: string;
}

// Single input selector component
const InputSelector: React.FC<{
	label: string;
	inputConfig: InputConfig | null;
	inputOptions: InputOption[];
	onChange: (config: InputConfig | null) => void;
	supportScalarInput?: boolean;
}> = ({ label, inputConfig, inputOptions, onChange, supportScalarInput = true }) => {
	// Track if user wants to use scalar value instead of series
	const [useScalarValue, setUseScalarValue] = useState(
		inputConfig?.type === "Scalar" && inputConfig.source === "Value",
	);
	const [scalarValue, setScalarValue] = useState(
		inputConfig?.type === "Scalar" ? inputConfig.scalarValue?.toString() : "0",
	);

	// Filter options based on supportScalarInput
	const filteredOptions = supportScalarInput
		? inputOptions
		: inputOptions.filter((opt) => opt.inputType === "Series");

	// Generate unique key for each option
	const getOptionKey = (option: InputOption) =>
		`${option.fromNodeId}-${option.fromHandleId}`;

	// Get current selected value
	const getCurrentValue = () => {
		if (!inputConfig) return "";
		if (inputConfig.type === "Series") {
			return `${inputConfig.fromNodeId}-${inputConfig.fromHandleId}`;
		}
		if (inputConfig.type === "Scalar" && inputConfig.source === "Node") {
			return `${inputConfig.fromNodeId}-${inputConfig.fromHandleId}`;
		}
		return "";
	};

	const handleInputChange = (value: string) => {
		const selectedOption = filteredOptions.find(
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
			} else {
				// Scalar from node
				onChange({
					type: "Scalar",
					source: "Node",
					scalarId: selectedOption.configId,
					scalarDisplayName: selectedOption.inputDisplayName,
					scalarValue: selectedOption.inputValue ?? 0,
					fromNodeType: selectedOption.fromNodeType,
					fromNodeId: selectedOption.fromNodeId,
					fromNodeName: selectedOption.fromNodeName,
					fromHandleId: selectedOption.fromHandleId,
				});
			}
		}
	};

	const handleScalarValueChange = (checked: boolean) => {
		setUseScalarValue(checked);
		if (checked) {
			// Switch to scalar value input
			const numValue = Number.parseFloat(scalarValue) || 0;
			onChange({
				type: "Scalar",
				source: "Value",
				scalarValue: numValue,
			});
		} else {
			// Clear selection
			onChange(null);
		}
	};

	const handleScalarInputChange = (value: string) => {
		setScalarValue(value);
	};

	const handleScalarInputBlur = () => {
		const numValue = Number.parseFloat(scalarValue) || 0;
		onChange({
			type: "Scalar",
			source: "Value",
			scalarValue: numValue,
		});
	};

	return (
		<div className="space-y-2 pt-2">
			<div className="flex items-center justify-between">
				<Label className="text-xs font-medium">{label}</Label>
				{supportScalarInput && (
					<div className="flex items-center gap-1.5">
						<Checkbox
							id={`scalar-toggle-${label}`}
							checked={useScalarValue}
							onCheckedChange={handleScalarValueChange}
							className="h-3.5 w-3.5"
						/>
						<Label
							htmlFor={`scalar-toggle-${label}`}
							className="text-xs text-gray-500 cursor-pointer"
						>
							Custom Scalar
						</Label>
					</div>
				)}
			</div>

			{useScalarValue ? (
				<Input
					type="number"
					value={scalarValue}
					onChange={(e) => handleScalarInputChange(e.target.value)}
					onBlur={handleScalarInputBlur}
					placeholder="Enter value"
					className="h-8 text-sm"
				/>
			) : (
				<div className="space-y-1">
					<Select value={getCurrentValue()} onValueChange={handleInputChange}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select input source" />
						</SelectTrigger>
						<SelectContent className="max-h-80">
							{filteredOptions.length === 0 ? (
								<div className="py-2 text-center text-sm text-muted-foreground">
									No available inputs
								</div>
							) : (
								filteredOptions.map((option) => (
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
					{inputConfig && "fromNodeName" in inputConfig && inputConfig.fromNodeName && (
						<p className="text-xs text-muted-foreground pt-1">
							From: {inputConfig.fromNodeName}
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export const BinaryInput: React.FC<BinaryInputProps> = ({
	input1,
	input2,
	seriesOptions,
	onChangeInput1,
	onChangeInput2,
	supportScalarInput = true,
	className,
}) => {
	// Check if exactly one input is scalar (the other is series)
	const hasOneScalarInput =
		(input1?.type === "Scalar" && input2?.type === "Series") ||
		(input1?.type === "Series" && input2?.type === "Scalar");

	return (
		<>
			<div className={cn("space-y-3 border rounded-md p-2", className)}>
				<InputSelector
					label="Input 1"
					inputConfig={input1}
					inputOptions={seriesOptions}
					onChange={onChangeInput1}
					supportScalarInput={supportScalarInput}
				/>
				<InputSelector
					label="Input 2"
					inputConfig={input2}
					inputOptions={seriesOptions}
					onChange={onChangeInput2}
					supportScalarInput={supportScalarInput}
				/>
			</div>
			{hasOneScalarInput && (
				<p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
					<CircleAlert className="h-3.5 w-3.5" />
					Each element in the Series will be calculated with the Scalar value.
				</p>
			)}
		</>
	);
};

export default BinaryInput;
