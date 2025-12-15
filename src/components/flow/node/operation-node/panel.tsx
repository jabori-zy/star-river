import type React from "react";
import { useState, useEffect, useCallback } from "react";

import { Separator } from "@/components/ui/separator";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import {
	InputTypeSelector,
	OperationSelector,
	InputConfigComponent,
	OutputConfig,
} from "@/components/flow/node/operation-node/components";
import { useUpdateOpNodeConfig } from "@/hooks/node-config/operation-node/update-op-node-config";
import { getOperationMeta } from "@/types/operation/operation-meta";
import type { Operation, InputArrayType, InputConfig } from "@/types/operation";
import {
	isScalarInput,
	isScalarValueInput,
	isGroupScalarValueInput,
} from "@/types/operation";
import { useReactFlow } from "@xyflow/react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { NodeType } from "@/types/node";
import type { OperationGroupData } from "@/types/node/group/operation-group";
import type { OperationNodeData } from "@/types/node/operation-node";
import type { InputOption } from "@/components/flow/node/operation-node/components/input-config";

// Check if input is any scalar type
const isAnyScalarType = (input: InputConfig | null | undefined): boolean => {
	if (!input) return false;
	return isScalarInput(input) || isScalarValueInput(input) || isGroupScalarValueInput(input);
};

export const OperationNodePanel: React.FC<SettingProps> = ({ id }) => {
	const {
		inputArrayType,
		operation,
		outputConfig,
		setInputArrayType,
		setOperation,
		setUnaryInput,
		setBinaryInput1,
		setBinaryInput2,
		setNaryInputs,
		getUnaryInput,
		getBinaryInput1,
		getBinaryInput2,
		getNaryInputs,
		setOutputConfig,
		clearInputConfig,
	} = useUpdateOpNodeConfig({ id });

	// Default values if node data is not available
	const currentInputArrayType = inputArrayType ?? "Unary";
	const currentOperation = operation ?? { type: "Mean" };
	
	// State to store input options
	const [inputOptions, setInputOptions] = useState<InputOption[]>([]);

	// get source nodes
	const { getSourceNodes } = useStrategyWorkflow();
	const { getNodes } = useReactFlow();

	// Compute source nodes and parent data outside useEffect
	const sourceNodes = getSourceNodes(id);
	const parentNodeId = getNodes().find((node) => node.id === id)?.parentId;
	const parentNodeData = parentNodeId
		? getNodes().find((node) => node.id === parentNodeId)?.data as OperationGroupData
		: null;

	useEffect(() => {
		if (!parentNodeData || !sourceNodes || sourceNodes.length === 0) return;

		const options: InputOption[] = [];

		sourceNodes.forEach((node) => {
			// Source is OperationStartNode - get inputConfigs from parent group
			if (node.type === NodeType.OperationStartNode) {
				const inputConfigs = parentNodeData?.inputConfigs ?? [];
				inputConfigs.forEach((config) => {
					if (config.type === "Series") {
						options.push({
							configId: config.configId,
							inputType: "Series",
							fromNodeId: node.id,
							fromNodeName: node.data?.nodeName,
							fromHandleId: `${node.id}_default_output`,
							fromNodeType: NodeType.OperationStartNode,
							inputDisplayName: config.inputName,
							inputName: config.inputName,
						});
					} else if (config.type === "Scalar") {
						// Scalar type with variable name from source
						options.push({
							configId: config.configId,
							inputType: "Scalar",
							fromNodeId: node.id,
							fromHandleId: `${node.id}_default_output`,
							fromNodeName: node.data?.nodeName,
							fromNodeType: NodeType.OperationStartNode,
							inputDisplayName: config.inputName,
							inputName: config.fromScalarName,
						});
					} else if (config.type === "CustomScalarValue") {
						// CustomScalarValue - self-defined or from parent group
						const inputValue = config.source === null
							? config.scalarValue
							: config.fromScalarValue;
						options.push({
							configId: config.configId,
							inputType: "CustomScalarValue",
							fromNodeId: node.id,
							fromHandleId: `${node.id}_default_output`,
							fromNodeName: node.data?.nodeName,
							fromNodeType: NodeType.OperationStartNode,
							inputDisplayName: config.inputName,
							inputValue: inputValue,
						});
					}
				});
			}
			// Source is another OperationNode - get outputConfig
			else if (node.type === NodeType.OperationNode) {
				const opNodeData = node.data as OperationNodeData;
				const outputCfg = opNodeData?.outputConfig;
				if (outputCfg) {
					if (outputCfg.type === "Series") {
						options.push({
							configId: outputCfg.configId,
							inputType: "Series",
							fromNodeId: node.id,
							fromNodeName: opNodeData?.nodeName,
							fromHandleId: outputCfg.outputHandleId,
							fromNodeType: NodeType.OperationNode,
							inputDisplayName: outputCfg.outputName,
							inputName: outputCfg.outputName,
						});
					} else {
						// Scalar output
						options.push({
							configId: outputCfg.configId,
							inputType: "Scalar",
							fromNodeId: node.id,
							fromNodeName: opNodeData?.nodeName,
							fromHandleId: outputCfg.outputHandleId,
							fromNodeType: NodeType.OperationNode,
							inputDisplayName: outputCfg.outputName,
							inputName: outputCfg.outputName,
						});
					}
				}
			}
			// Source is child OperationGroup - get outputConfigs
			else if (node.type === NodeType.OperationGroup) {
				const groupData = node.data as OperationGroupData;
				const outputConfigs = groupData?.outputConfigs ?? [];

				// Add each output from the child group as an input option
				outputConfigs.forEach((outputCfg) => {
					options.push({
						configId: outputCfg.configId,
						inputType: outputCfg.type,
						fromNodeId: node.id,
						fromNodeName: groupData?.nodeName,
						fromHandleId: outputCfg.outputHandleId,
						fromNodeType: NodeType.OperationGroup,
						inputDisplayName: outputCfg.outputName,
						inputName: outputCfg.outputName,
					});
				});
			}
		});

		setInputOptions(options);

	}, [sourceNodes, parentNodeData]);

	// Update output type when binary inputs change (both scalar -> scalar output)
	const binaryInput1 = getBinaryInput1();
	const binaryInput2 = getBinaryInput2();

	useEffect(() => {
		if (currentInputArrayType !== "Binary") return;

		const meta = getOperationMeta(currentOperation.type, currentInputArrayType);
		if (!meta?.supportScalarInput) return;

		const bothAreScalar = isAnyScalarType(binaryInput1) && isAnyScalarType(binaryInput2);
		const currentOutputType = outputConfig?.type ?? "Series";
		const expectedOutputType = bothAreScalar ? "Scalar" : (meta.output ?? "Series");

		// Only update if type changed
		if (currentOutputType !== expectedOutputType) {
			const displayName = outputConfig?.outputName ?? meta.defaultOutputDisplayName ?? currentOperation.type;

			if (expectedOutputType === "Scalar") {
				setOutputConfig({
					type: "Scalar",
					configId: 0,
					outputName: displayName,
					outputHandleId: `${id}_default_output`,
				});
			} else {
				setOutputConfig({
					type: "Series",
					configId: 0,
					outputName: displayName,
					outputHandleId: `${id}_default_output`,
				});
			}
		}
	}, [binaryInput1, binaryInput2, currentInputArrayType, currentOperation.type, id, outputConfig, setOutputConfig]);

	// Get output display name from outputConfig, return empty string if not configured
	const getOutputDisplayName = () => {
		if (outputConfig) {
			return outputConfig.outputName;
		}
		return "";
	};

	// Handle input type change
	const handleInputTypeChange = (type: InputArrayType) => {
		setInputArrayType(type);
		// Reset input config
		clearInputConfig();
		// Reset operation to default for new type
		let newOperation: Operation;
		if (type === "Unary") {
			newOperation = { type: "Mean" };
		} else if (type === "Binary") {
			newOperation = { type: "Add" };
		} else {
			newOperation = { type: "Sum" };
		}
		setOperation(newOperation);
		// Reset output config type if needed, but preserve existing outputName
		const meta = getOperationMeta(newOperation.type, type);
		const outputType = meta?.output ?? "Series";
		// Keep existing outputName if available, otherwise leave empty for user to fill
		const existingOutputName = outputConfig?.outputName ?? "";
		if (outputType === "Series") {
			setOutputConfig({
				type: "Series",
				configId: 0,
				outputHandleId: `${id}_default_output`,
				outputName: existingOutputName,
			});
		} else {
			setOutputConfig({
				type: "Scalar",
				configId: 0,
				outputHandleId: `${id}_default_output`,
				outputName: existingOutputName,
			});
		}
	};

	// Handle operation change
	const handleOperationChange = (op: Operation) => {
		setOperation(op);
		// Update output config type if needed, but preserve existing outputName
		const meta = getOperationMeta(op.type, currentInputArrayType);
		const outputType = meta?.output ?? "Series";
		// Keep existing outputName if available, otherwise leave empty for user to fill
		const existingOutputName = outputConfig?.outputName ?? "";
		if (outputType === "Series") {
			setOutputConfig({
				type: "Series",
				configId: 0,
				outputName: existingOutputName,
				outputHandleId: `${id}_default_output`,
			});
		} else {
			setOutputConfig({
				type: "Scalar",
				outputName: existingOutputName,
				configId: 0,
				outputHandleId: `${id}_default_output`,
			});
		}
	};

	// Determine output type considering binary inputs
	const getEffectiveOutputType = useCallback((): "Series" | "Scalar" => {
		const meta = getOperationMeta(currentOperation.type, currentInputArrayType);
		const baseOutputType = meta?.output ?? "Series";

		// For Binary operations with supportScalarInput=true, if both inputs are scalar, output is scalar
		if (currentInputArrayType === "Binary" && meta?.supportScalarInput) {
			const input1 = getBinaryInput1();
			const input2 = getBinaryInput2();
			if (isAnyScalarType(input1) && isAnyScalarType(input2)) {
				return "Scalar";
			}
		}

		return baseOutputType;
	}, [currentOperation.type, currentInputArrayType, getBinaryInput1, getBinaryInput2]);

	// Handle output display name change
	const handleOutputDisplayNameChange = (displayName: string) => {
		const outputType = getEffectiveOutputType();
		if (outputType === "Series") {
			setOutputConfig({
				type: "Series",
				configId: 0,
				outputName: displayName,
				outputHandleId: `${id}_default_output`,
			});
		} else {
			setOutputConfig({
				type: "Scalar",
				outputName: displayName,
				configId: 0,
				outputHandleId: `${id}_default_output`,
			});
		}
	};


	return (
		<div className="h-full overflow-y-auto bg-white p-4">
			<div className="flex flex-col gap-4">
				{/* Input Type */}
				<InputTypeSelector
					value={currentInputArrayType}
					onChange={handleInputTypeChange}
				/>


				<Separator />

				{/* Operation */}
				<OperationSelector
					inputArrayType={currentInputArrayType}
					operation={currentOperation}
					onChange={handleOperationChange}
					inputCount={currentInputArrayType === "Nary" ? getNaryInputs().length : undefined}
				/>

				<Separator />

				{/* Input Config */}
				<InputConfigComponent
					inputArrayType={currentInputArrayType}
					inputConfig={getUnaryInput()}
					input1={getBinaryInput1()}
					input2={getBinaryInput2()}
					inputs={getNaryInputs()}
					inputOptions={inputOptions}
					supportScalarInput={getOperationMeta(currentOperation.type, currentInputArrayType)?.supportScalarInput ?? true}
					onChange={setUnaryInput}
					onChangeInput1={setBinaryInput1}
					onChangeInput2={setBinaryInput2}
					onChangeInputs={setNaryInputs}
				/>

				<Separator />

				{/* Output Config */}
				<OutputConfig
					operationType={currentOperation.type}
					inputArrayType={currentInputArrayType}
					displayName={getOutputDisplayName()}
					onDisplayNameChange={handleOutputDisplayNameChange}
					binaryInput1={getBinaryInput1()}
					binaryInput2={getBinaryInput2()}
				/>
			</div>
		</div>
	);
};

export default OperationNodePanel;
