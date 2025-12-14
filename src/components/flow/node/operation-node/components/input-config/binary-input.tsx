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
import type {
	InputConfig,
	InputSeriesConfig,
	InputScalarConfig,
	InputScalarValueConfig,
	InputGroupScalarValueConfig,
} from "@/types/operation";
import {
	isSeriesInput,
	isScalarInput,
	isScalarValueInput,
	isGroupScalarValueInput,
} from "@/types/operation";
import { type InputOption, InputOptionDisplay } from "./index";
import { useState, useEffect } from "react";
import { CircleAlert } from "lucide-react";

interface BinaryInputProps {
	input1: InputConfig | null;
	input2: InputConfig | null;
	inputOptions: InputOption[];
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
	configId: number;
}> = ({ label, inputConfig, inputOptions, onChange, supportScalarInput = true, configId }) => {
	// Track if user wants to use custom scalar value
	const [useCustomScalar, setUseCustomScalar] = useState(
		inputConfig !== null && isScalarValueInput(inputConfig),
	);
	const [scalarValue, setScalarValue] = useState(() => {
		if (inputConfig && isScalarValueInput(inputConfig)) {
			return inputConfig.scalarValue.toString();
		}
		return "0";
	});

	// Sync state when inputConfig changes externally
	useEffect(() => {
		if (inputConfig && isScalarValueInput(inputConfig)) {
			setUseCustomScalar(true);
			setScalarValue(inputConfig.scalarValue.toString());
		} else {
			setUseCustomScalar(false);
		}
	}, [inputConfig]);

	// Filter options based on supportScalarInput
	const filteredOptions = supportScalarInput
		? inputOptions
		: inputOptions.filter((opt) => opt.inputType === "Series");

	// Generate unique key for each option using configId
	const getOptionKey = (option: InputOption) =>
		`${option.fromNodeId}-${option.configId}-${option.inputType}`;

	// Get current selected value based on input type
	const getCurrentValue = (): string => {
		if (!inputConfig) return "";

		if (isSeriesInput(inputConfig)) {
			return `${inputConfig.fromNodeId}-${inputConfig.fromSeriesConfigId}-Series`;
		}
		if (isScalarInput(inputConfig)) {
			return `${inputConfig.fromNodeId}-${inputConfig.fromScalarConfigId}-Scalar`;
		}
		if (isGroupScalarValueInput(inputConfig)) {
			return `${inputConfig.fromNodeId}-${inputConfig.fromScalarConfigId}-CustomScalarValue`;
		}
		// isScalarValueInput - custom value, no selection
		return "";
	};

	const handleInputChange = (value: string) => {
		const selectedOption = filteredOptions.find(
			(opt) => getOptionKey(opt) === value,
		);
		if (!selectedOption) return;

		if (selectedOption.inputType === "Series") {
			const config: InputSeriesConfig = {
				type: "Series",
				source: "Group",
				configId,
				fromNodeType: selectedOption.fromNodeType,
				fromNodeId: selectedOption.fromNodeId,
				fromNodeName: selectedOption.fromNodeName,
				fromHandleId: selectedOption.fromHandleId,
				fromSeriesConfigId: selectedOption.configId,
				fromSeriesName: selectedOption.inputName ?? selectedOption.inputDisplayName,
				fromSeriesDisplayName: selectedOption.inputDisplayName,
			};
			onChange(config);
		} else if (selectedOption.inputType === "Scalar") {
			const config: InputScalarConfig = {
				type: "Scalar",
				source: "Group",
				configId,
				fromNodeType: selectedOption.fromNodeType,
				fromNodeId: selectedOption.fromNodeId,
				fromNodeName: selectedOption.fromNodeName,
				fromHandleId: selectedOption.fromHandleId,
				fromScalarConfigId: selectedOption.configId,
				fromScalarName: selectedOption.inputName ?? selectedOption.inputDisplayName,
				fromScalarDisplayName: selectedOption.inputDisplayName,
			};
			onChange(config);
		} else if (selectedOption.inputType === "CustomScalarValue") {
			// CustomScalarValue from upstream (OperationStartNode)
			const config: InputGroupScalarValueConfig = {
				type: "CustomScalarValue",
				source: "Group",
				configId,
				fromNodeType: selectedOption.fromNodeType,
				fromNodeId: selectedOption.fromNodeId,
				fromNodeName: selectedOption.fromNodeName,
				fromHandleId: selectedOption.fromHandleId,
				fromScalarConfigId: selectedOption.configId,
				fromScalarDisplayName: selectedOption.inputDisplayName,
				fromScalarValue: selectedOption.inputValue ?? 0,
			};
			onChange(config);
		}
	};

	const handleCustomScalarChange = (checked: boolean) => {
		setUseCustomScalar(checked);
		if (checked) {
			// Switch to custom scalar value input
			const numValue = Number.parseFloat(scalarValue) || 0;
			const config: InputScalarValueConfig = {
				type: "CustomScalarValue",
				source: null,
				configId,
				scalarValue: numValue,
			};
			onChange(config);
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
		const config: InputScalarValueConfig = {
			type: "CustomScalarValue",
			source: null,
			configId,
			scalarValue: numValue,
		};
		onChange(config);
	};

	return (
		<div className="space-y-2 pt-2">
			<div className="flex items-center justify-between">
				<Label className="text-xs font-medium">{label}</Label>
				{supportScalarInput && (
					<div className="flex items-center gap-1.5">
						<Checkbox
							id={`scalar-toggle-${label}`}
							checked={useCustomScalar}
							onCheckedChange={handleCustomScalarChange}
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

			{useCustomScalar ? (
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

// Check if input is any scalar type
const isAnyScalarType = (input: InputConfig | null): boolean => {
	if (!input) return false;
	return isScalarInput(input) || isScalarValueInput(input) || isGroupScalarValueInput(input);
};

export const BinaryInput: React.FC<BinaryInputProps> = ({
	input1,
	input2,
	inputOptions,
	onChangeInput1,
	onChangeInput2,
	supportScalarInput = true,
	className,
}) => {
	// Check if exactly one input is scalar (the other is series)
	const hasOneScalarInput =
		(isAnyScalarType(input1) && isSeriesInput(input2)) ||
		(isSeriesInput(input1) && isAnyScalarType(input2));

	return (
		<>
			<div className={cn("space-y-3 border rounded-md p-2", className)}>
				<InputSelector
					label="Input 1"
					inputConfig={input1}
					inputOptions={inputOptions}
					onChange={onChangeInput1}
					supportScalarInput={supportScalarInput}
					configId={1}
				/>
				<InputSelector
					label="Input 2"
					inputConfig={input2}
					inputOptions={inputOptions}
					onChange={onChangeInput2}
					supportScalarInput={supportScalarInput}
					configId={2}
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
