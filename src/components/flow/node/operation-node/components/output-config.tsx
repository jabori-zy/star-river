import type React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { InputArrayType, InputConfig } from "@/types/operation";
import {
	isScalarInput,
	isScalarValueInput,
	isGroupScalarValueInput,
} from "@/types/operation";
import { getOperationMeta } from "@/types/operation/operation-meta";

// Check if input is any scalar type (Scalar, CustomScalarValue from self, or CustomScalarValue from Group)
const isAnyScalarType = (input: InputConfig | null | undefined): boolean => {
	if (!input) return false;
	return isScalarInput(input) || isScalarValueInput(input) || isGroupScalarValueInput(input);
};

interface OutputConfigProps {
	operationType: string;
	inputArrayType: InputArrayType;
	displayName: string;
	onDisplayNameChange: (displayName: string) => void;
	// For Binary operations - if both inputs are scalar, output should be scalar
	binaryInput1?: InputConfig | null;
	binaryInput2?: InputConfig | null;
	className?: string;
}

export const OutputConfig: React.FC<OutputConfigProps> = ({
	operationType,
	inputArrayType,
	displayName,
	onDisplayNameChange,
	binaryInput1,
	binaryInput2,
	className,
}) => {
	const meta = getOperationMeta(operationType, inputArrayType);

	// Determine output type:
	// For Binary operations with supportScalarInput=true, if both inputs are scalar, output is scalar
	let outputType: "Series" | "Scalar" = meta?.output ?? "Series";

	if (inputArrayType === "Binary" && meta?.supportScalarInput) {
		const bothInputsAreScalar = isAnyScalarType(binaryInput1) && isAnyScalarType(binaryInput2);
		if (bothInputsAreScalar) {
			outputType = "Scalar";
		}
	}

	return (
		<div className={cn("space-y-4", className)}>
			<Label className="text-sm font-medium">Output</Label>

			{/* Output Type - Badge display */}
			<div className="flex flex-row items-center gap-2">
				<Label className="text-xs text-muted-foreground">Output Type</Label>
				<div>
					<Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 ", outputType === "Series" ? "border-orange-500 text-orange-400" : "border-blue-500 text-blue-400")}>
						{outputType}
					</Badge>
				</div>
			</div>

			{/* Display Name - Editable */}
			<div className="space-y-2">
				<Label className="text-xs text-muted-foreground">Output Name</Label>
				<Input
					value={displayName}
					onChange={(e) => onDisplayNameChange(e.target.value)}
					placeholder="Enter output name"
					className="w-full"
				/>
			</div>
		</div>
	);
};

export default OutputConfig;
