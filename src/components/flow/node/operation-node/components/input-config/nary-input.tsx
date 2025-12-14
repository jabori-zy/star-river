import { useRef, useState, useEffect } from "react";
import type React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import type { InputSeriesConfig } from "@/types/operation";
import { type InputOption, InputOptionDisplay } from "./index";
import { NodeType } from "@/types/node";

interface NaryInputProps {
	inputs: InputSeriesConfig[];
	inputOptions: InputOption[];
	onChange: (inputs: InputSeriesConfig[]) => void;
	className?: string;
}

export const NaryInput: React.FC<NaryInputProps> = ({
	inputs,
	inputOptions,
	onChange,
	className,
}) => {
	// Generate stable unique keys for each input item
	const keyCounterRef = useRef(0);
	const [inputKeys, setInputKeys] = useState<number[]>(() =>
		inputs.map(() => keyCounterRef.current++),
	);

	// Sync keys when inputs length changes from outside
	useEffect(() => {
		if (inputs.length > inputKeys.length) {
			// New items added externally
			const newKeys = [...inputKeys];
			for (let i = inputKeys.length; i < inputs.length; i++) {
				newKeys.push(keyCounterRef.current++);
			}
			setInputKeys(newKeys);
		} else if (inputs.length < inputKeys.length) {
			// Items removed externally - keep first N keys
			setInputKeys(inputKeys.slice(0, inputs.length));
		}
	}, [inputs.length, inputKeys]);

	// Filter to show only Series options for Nary input
	const seriesOnlyOptions = inputOptions.filter(
		(opt) => opt.inputType === "Series",
	);

	// Generate unique key for each option using configId
	const getOptionKey = (option: InputOption) =>
		`${option.fromNodeId}-${option.configId}`;

	// Generate next config ID based on existing inputs
	const getNextConfigId = () => {
		if (inputs.length === 0) return 1;
		return Math.max(...inputs.map((input) => input.configId)) + 1;
	};

	// Handle series change for a specific input
	const handleSeriesChange = (index: number, value: string) => {
		const selectedOption = seriesOnlyOptions.find(
			(opt) => getOptionKey(opt) === value,
		);
		if (selectedOption) {
			const newInputs = [...inputs];
			newInputs[index] = {
				type: "Series",
				source: "Group",
				// Keep existing configId or generate new one based on max + 1
				configId: inputs[index]?.configId ?? getNextConfigId(),
				fromNodeType: selectedOption.fromNodeType,
				fromNodeId: selectedOption.fromNodeId,
				fromNodeName: selectedOption.fromNodeName,
				fromHandleId: selectedOption.fromHandleId,
				fromSeriesConfigId: selectedOption.configId,
				fromSeriesName: selectedOption.inputName ?? selectedOption.inputDisplayName,
				fromSeriesDisplayName: selectedOption.inputDisplayName,
			};
			onChange(newInputs);
		}
	};

	// Add new input
	const handleAddInput = () => {
		const newInput: InputSeriesConfig = {
			type: "Series",
			source: "Group",
			// Use incremental ID: max(existing IDs) + 1
			configId: getNextConfigId(),
			fromNodeType: NodeType.OperationStartNode,
			fromNodeId: "",
			fromNodeName: "",
			fromHandleId: "",
			fromSeriesConfigId: 0,
			fromSeriesName: "",
			fromSeriesDisplayName: "",
		};
		// Add new key for the new input
		setInputKeys([...inputKeys, keyCounterRef.current++]);
		onChange([...inputs, newInput]);
	};

	// Remove input
	const handleRemoveInput = (index: number) => {
		const newInputs = inputs.filter((_, i) => i !== index);
		// Remove corresponding key
		setInputKeys(inputKeys.filter((_, i) => i !== index));
		onChange(newInputs);
	};

	return (
		<div className={cn("space-y-3", className)}>
			<Label className="text-xs text-muted-foreground">Input Series</Label>

			{/* Input list */}
			<div className="space-y-2">
				{inputs.map((input, index) => {
					const currentValue = input.fromNodeId
						? `${input.fromNodeId}-${input.fromSeriesConfigId}`
						: "";

					return (
						<div
							key={inputKeys[index]}
							className="p-2 space-y-1"
						>
							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground">
									{index + 1}.
								</span>
								<Select
									value={currentValue}
									onValueChange={(value) => handleSeriesChange(index, value)}
								>
									<SelectTrigger className="flex-1">
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
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => handleRemoveInput(index)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							{input.fromNodeName && (
								<p className="text-xs text-muted-foreground pl-6 pt-1">
									From: {input.fromNodeName}
								</p>
							)}
						</div>
					);
				})}
			</div>

			{/* Add button */}
			<Button
				variant="outline"
				size="sm"
				className="w-full"
				onClick={handleAddInput}
			>
				<Plus className="h-4 w-4 mr-1" />
				Add Input
			</Button>
		</div>
	);
};

export default NaryInput;
