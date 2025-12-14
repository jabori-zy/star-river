import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OutputConfigItemProps } from "./types";

export const OutputConfigItem: React.FC<OutputConfigItemProps> = ({
	config,
	availableOutputs,
	usedSourceIds,
	onSelectSource,
	onDisplayNameBlur,
	onDelete,
}) => {
	const isScalar = config.type === "Scalar";
	const hasSource = config.sourceNodeId !== "";

	// Get display name based on config type
	const configDisplayName = config.outputName;

	// Local state for display name input
	const [localDisplayName, setLocalDisplayName] = useState(configDisplayName);

	// Track if the name field has been touched (for validation)
	const [isInputName, setIsInputName] = useState(false);

	// Check if name is empty or only whitespace
	const isNameEmpty = localDisplayName.trim() === "";

	// Sync local state when config changes from outside
	useEffect(() => {
		setLocalDisplayName(configDisplayName);
	}, [configDisplayName]);

	// Handle display name blur - save to node data
	const handleDisplayNameBlur = () => {
		setIsInputName(true);
		if (localDisplayName !== configDisplayName) {
			onDisplayNameBlur(config.configId, localDisplayName);
		}
	};

	// Handle source selection
	const handleSourceChange = (value: string) => {
		const option = availableOutputs.find(
			(o) => `${o.sourceNodeId}|${o.sourceHandleId}` === value,
		);
		if (option) {
			onSelectSource(config.configId, option);
		}
	};

	// Current selected value for dropdown
	const currentSourceValue = hasSource
		? `${config.sourceNodeId}|${config.sourceHandleId}`
		: "";

	return (
		<div className="flex flex-col gap-2.5 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
			{/* Header with title and delete button */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h4 className="text-sm font-semibold text-gray-700">
						Output {config.configId}
					</h4>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 gap-1"
					onClick={() => onDelete(config.configId)}
				>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			</div>

			{/* Source selector */}
			<div className="flex flex-col gap-1.5">
				<Label className="text-xs font-medium text-gray-600">Source</Label>
				<Select value={currentSourceValue} onValueChange={handleSourceChange}>
					<SelectTrigger className="h-8 text-xs">
						<SelectValue placeholder="Select output source" />
					</SelectTrigger>
					<SelectContent>
						{availableOutputs.length === 0 ? (
							<div className="py-2 text-center text-sm text-muted-foreground">
								No available outputs
							</div>
						) : (
							availableOutputs.map((option) => {
								const optionKey = `${option.sourceNodeId}|${option.sourceHandleId}`;
								const isUsed =
									usedSourceIds.has(optionKey) && optionKey !== currentSourceValue;

								return (
									<SelectItem
										key={optionKey}
										value={optionKey}
										className="text-xs"
										disabled={isUsed}
									>
										<div
											className={cn(
												"flex items-center gap-2",
												isUsed && "opacity-50",
											)}
										>
											<span>{option.displayName}</span>
											<Badge
												variant="outline"
												className={cn(
													"text-[10px] px-1.5 py-0",
													option.outputType === "Scalar"
														? "border-blue-500 text-blue-400"
														: "border-orange-500 text-orange-400",
												)}
											>
												{option.outputType}
											</Badge>
										</div>
									</SelectItem>
								);
							})
						)}
					</SelectContent>
				</Select>
			</div>

			{/* Display name input - only show when source is selected */}
			{hasSource && (
				<div className="flex flex-col gap-1.5">
					<Label className="text-xs font-medium text-gray-600">
						{isScalar ? "Scalar Name" : "Series Name"}
						<span className="text-red-500 ml-0.5">*</span>
					</Label>
					<Input
						value={localDisplayName}
						onChange={(e) => setLocalDisplayName(e.target.value)}
						onBlur={handleDisplayNameBlur}
						placeholder={isScalar ? "Enter scalar name" : "Enter series name"}
						className={cn(
							"h-8 text-xs",
							isInputName && isNameEmpty && "border-red-500 focus-visible:ring-red-500",
						)}
					/>
					{isInputName && isNameEmpty && (
						<span className="text-xs text-red-500">
							{isScalar ? "Scalar name is required" : "Series name is required"}
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default OutputConfigItem;
