import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	InputTypeSelector,
	OperationSelector,
	InputConfigComponent,
	WindowConfig,
	FillingMethodSelector,
	OutputConfig,
} from "@/components/flow/node/operation-node/components";
import type {
	InputArrayType,
	Operation,
	InputConfig,
	InputSeriesConfig,
	WindowConfig as WindowConfigType,
	FillingMethod,
} from "@/types/operation";
import { getOperationMeta } from "@/types/operation/operation-meta";
import { mockSeriesOptions, mockDefaultConfig } from "./mock-data";

export default function TestOperationConfiger() {
	// State for all configuration
	const [inputArrayType, setInputArrayType] = useState<InputArrayType>(
		mockDefaultConfig.inputArrayType
	);
	const [operation, setOperation] = useState<Operation>(
		mockDefaultConfig.operation
	);
	const [inputConfig, setInputConfig] = useState<InputConfig | null>(
		mockDefaultConfig.inputConfig
	);
	const [input1, setInput1] = useState<InputConfig | null>(null);
	const [input2, setInput2] = useState<InputConfig | null>(null);
	const [inputs, setInputs] = useState<InputSeriesConfig[]>([]);
	const [windowConfig, setWindowConfig] = useState<WindowConfigType>(
		mockDefaultConfig.windowConfig
	);
	const [fillingMethod, setFillingMethod] = useState<FillingMethod>(
		mockDefaultConfig.fillingMethod
	);
	const [outputDisplayName, setOutputDisplayName] = useState<string>(
		getOperationMeta("Mean", "Unary")?.defaultOutputDisplayName ?? "Mean"
	);

	// Reset input config when input type changes
	const handleInputTypeChange = (type: InputArrayType) => {
		setInputArrayType(type);
		// Reset inputs
		setInputConfig(null);
		setInput1(null);
		setInput2(null);
		setInputs([]);
		// Reset operation to default for new type
		if (type === "Unary") {
			setOperation({ type: "Mean" });
			setOutputDisplayName(getOperationMeta("Mean", "Unary")?.defaultOutputDisplayName ?? "Mean");
		} else if (type === "Binary") {
			setOperation({ type: "Add" });
			setOutputDisplayName(getOperationMeta("Add", "Binary")?.defaultOutputDisplayName ?? "Add");
		} else {
			setOperation({ type: "Sum" });
			setOutputDisplayName(getOperationMeta("Sum", "Nary")?.defaultOutputDisplayName ?? "Sum (N-ary)");
		}
	};

	// Handle operation change - update displayName to default from metadata
	const handleOperationChange = (op: Operation) => {
		setOperation(op);
		const meta = getOperationMeta(op.type, inputArrayType);
		setOutputDisplayName(meta?.defaultOutputDisplayName ?? op.type);
	};

	// Convert series options for input config component
	const seriesOptions = mockSeriesOptions.map((opt) => ({
		nodeId: opt.nodeId,
		nodeName: opt.nodeName,
		seriesId: opt.seriesId,
		seriesName: opt.seriesName,
		displayName: opt.displayName,
		handleId: opt.handleId,
	}));

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold">Operation Node Configer Test</h1>
				<p className="text-muted-foreground mt-1">
					Test page for operation node configuration components
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Configuration Panel */}
				<Card>
					<CardHeader>
						<CardTitle>Configuration</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Input Type */}
						<InputTypeSelector
							value={inputArrayType}
							onChange={handleInputTypeChange}
						/>

						<Separator />

						{/* Input Config */}
						<InputConfigComponent
							inputArrayType={inputArrayType}
							inputConfig={inputConfig}
							input1={input1}
							input2={input2}
							inputs={inputs}
							seriesOptions={seriesOptions}
							onChange={setInputConfig}
							onChangeInput1={setInput1}
							onChangeInput2={setInput2}
							onChangeInputs={setInputs}
						/>

						<Separator />

						{/* Operation */}
						<OperationSelector
							inputArrayType={inputArrayType}
							operation={operation}
							onChange={handleOperationChange}
						/>

						

						<Separator />

						{/* Window Config */}
						<WindowConfig
							windowConfig={windowConfig}
							onChange={setWindowConfig}
						/>

						<Separator />

						{/* Filling Method */}
						<FillingMethodSelector
							value={fillingMethod}
							onChange={setFillingMethod}
						/>

						<Separator />

						{/* Output Config */}
						<OutputConfig
							operationType={operation.type}
							inputArrayType={inputArrayType}
							displayName={outputDisplayName}
							onDisplayNameChange={setOutputDisplayName}
						/>
					</CardContent>
				</Card>

				{/* Preview Panel */}
				<Card>
					<CardHeader>
						<CardTitle>Configuration Preview</CardTitle>
					</CardHeader>
					<CardContent>
						<pre className="bg-gray-50 p-4 rounded-md text-xs overflow-auto max-h-[600px]">
							{JSON.stringify(
								{
									inputArrayType,
									operation,
									inputConfig:
										inputArrayType === "Unary"
											? inputConfig
											: inputArrayType === "Binary"
												? { input1, input2 }
												: { inputs },
									windowConfig,
									fillingMethod,
									output: {
										type: getOperationMeta(operation.type, inputArrayType)?.output ?? "Series",
										displayName: outputDisplayName,
									},
								},
								null,
								2
							)}
						</pre>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
