import { useReactFlow } from "@xyflow/react";
import { useCallback, useMemo } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { OperationNodeData, OperationInputConfig } from "@/types/node/operation-node";
import type {
	InputArrayType,
	Operation,
	InputConfig,
	InputSeriesConfig,
	InputScalarConfig,
	InputScalarValueConfig,
	InputGroupScalarValueConfig,
	OutputConfig,
	OutputSeriesConfig,
	OutputScalarConfig,
	WindowConfig,
	FillingMethod,
} from "@/types/operation";
import {
	isSeriesInput,
	isScalarInput,
	isScalarValueInput,
	isGroupScalarValueInput,
	isSeriesOutput,
	isScalarOutput,
} from "@/types/operation";

interface UseUpdateOpNodeConfigProps {
	id: string; // Node ID
}

export const useUpdateOpNodeConfig = ({ id }: UseUpdateOpNodeConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as OperationNodeData | undefined;

	// ==================== Input Array Type ====================

	/**
	 * Set input array type (Unary, Binary, Nary)
	 */
	const setInputArrayType = useCallback(
		(inputArrayType: InputArrayType) => {
			updateNodeData(id, { inputArrayType });
		},
		[id, updateNodeData],
	);

	// ==================== Operation ====================

	/**
	 * Set operation type and params
	 */
	const setOperation = useCallback(
		(operation: Operation) => {
			updateNodeData(id, { operation });
		},
		[id, updateNodeData],
	);

	/**
	 * Update operation params partially
	 */
	const updateOperation = useCallback(
		(operation: Partial<Operation>) => {
			if (!nodeData?.operation) return;
			updateNodeData(id, {
				operation: { ...nodeData.operation, ...operation },
			});
		},
		[id, nodeData?.operation, updateNodeData],
	);

	// ==================== Input Config ====================

	/**
	 * Set full input config (Unary, Binary, or Nary)
	 */
	const setInputConfig = useCallback(
		(inputConfig: OperationInputConfig | null) => {
			updateNodeData(id, { inputConfig });
		},
		[id, updateNodeData],
	);

	/**
	 * Set Unary input config
	 */
	const setUnaryInput = useCallback(
		(input: InputSeriesConfig | null) => {
			if (input) {
				updateNodeData(id, {
					inputConfig: { type: "Unary", input },
				});
			} else {
				updateNodeData(id, { inputConfig: null });
			}
		},
		[id, updateNodeData],
	);

	/**
	 * Set Binary input1
	 */
	const setBinaryInput1 = useCallback(
		(input1: InputConfig | null) => {
			const currentConfig = nodeData?.inputConfig;
			const currentInput2 =
				currentConfig?.type === "Binary" ? currentConfig.input2 : null;

			// Set input1, preserve current input2 (can be null)
			updateNodeData(id, {
				inputConfig: { type: "Binary", input1, input2: currentInput2 },
			});
		},
		[id, nodeData?.inputConfig, updateNodeData],
	);

	/**
	 * Set Binary input2
	 */
	const setBinaryInput2 = useCallback(
		(input2: InputConfig | null) => {
			const currentConfig = nodeData?.inputConfig;
			const currentInput1 =
				currentConfig?.type === "Binary" ? currentConfig.input1 : null;

			// Set input2, preserve current input1 (can be null)
			updateNodeData(id, {
				inputConfig: { type: "Binary", input1: currentInput1, input2 },
			});
		},
		[id, nodeData?.inputConfig, updateNodeData],
	);

	/**
	 * Set Nary inputs
	 */
	const setNaryInputs = useCallback(
		(inputs: InputSeriesConfig[]) => {
			updateNodeData(id, {
				inputConfig: { type: "Nary", inputs },
			});
		},
		[id, updateNodeData],
	);

	/**
	 * Add a series input to Nary config
	 */
	const addNaryInput = useCallback(
		(input: InputSeriesConfig) => {
			const currentConfig = nodeData?.inputConfig;
			const currentInputs =
				currentConfig?.type === "Nary" ? currentConfig.inputs : [];
			updateNodeData(id, {
				inputConfig: { type: "Nary", inputs: [...currentInputs, input] },
			});
		},
		[id, nodeData?.inputConfig, updateNodeData],
	);

	/**
	 * Remove a series input from Nary config by configId
	 */
	const removeNaryInput = useCallback(
		(configId: number) => {
			const currentConfig = nodeData?.inputConfig;
			if (currentConfig?.type !== "Nary") return;
			const newInputs = currentConfig.inputs.filter(
				(input) => input.configId !== configId,
			);
			updateNodeData(id, {
				inputConfig: { type: "Nary", inputs: newInputs },
			});
		},
		[id, nodeData?.inputConfig, updateNodeData],
	);

	/**
	 * Update a series input in Nary config by configId
	 */
	const updateNaryInput = useCallback(
		(configId: number, input: InputSeriesConfig) => {
			const currentConfig = nodeData?.inputConfig;
			if (currentConfig?.type !== "Nary") return;
			const newInputs = currentConfig.inputs.map((i) =>
				i.configId === configId ? input : i,
			);
			updateNodeData(id, {
				inputConfig: { type: "Nary", inputs: newInputs },
			});
		},
		[id, nodeData?.inputConfig, updateNodeData],
	);

	/**
	 * Clear input config
	 */
	const clearInputConfig = useCallback(() => {
		updateNodeData(id, { inputConfig: null });
	}, [id, updateNodeData]);

	// ==================== Input Config Helpers ====================

	// Helper to get Unary input from current config
	const getUnaryInput = useCallback((): InputSeriesConfig | null => {
		if (nodeData?.inputConfig?.type === "Unary") {
			return nodeData.inputConfig.input;
		}
		return null;
	}, [nodeData?.inputConfig]);

	// Helper to get Binary input1 from current config
	const getBinaryInput1 = useCallback((): InputConfig | null => {
		if (nodeData?.inputConfig?.type === "Binary") {
			return nodeData.inputConfig.input1;
		}
		return null;
	}, [nodeData?.inputConfig]);

	// Helper to get Binary input2 from current config
	const getBinaryInput2 = useCallback((): InputConfig | null => {
		if (nodeData?.inputConfig?.type === "Binary") {
			return nodeData.inputConfig.input2;
		}
		return null;
	}, [nodeData?.inputConfig]);

	// Helper to get Nary inputs from current config
	const getNaryInputs = useCallback((): InputSeriesConfig[] => {
		if (nodeData?.inputConfig?.type === "Nary") {
			return nodeData.inputConfig.inputs;
		}
		return [];
	}, [nodeData?.inputConfig]);

	// ==================== Input Type Filters ====================

	/**
	 * Get all series inputs from current config
	 */
	const getSeriesInputs = useMemo((): InputSeriesConfig[] => {
		const config = nodeData?.inputConfig;
		if (!config) return [];

		if (config.type === "Unary") {
			return [config.input];
		}
		if (config.type === "Binary") {
			const result: InputSeriesConfig[] = [];
			if (config.input1 && isSeriesInput(config.input1)) {
				result.push(config.input1);
			}
			if (config.input2 && isSeriesInput(config.input2)) {
				result.push(config.input2);
			}
			return result;
		}
		if (config.type === "Nary") {
			return config.inputs;
		}
		return [];
	}, [nodeData?.inputConfig]);

	/**
	 * Get all scalar inputs from current config (type: "Scalar")
	 */
	const getScalarInputs = useMemo((): InputScalarConfig[] => {
		const config = nodeData?.inputConfig;
		if (!config || config.type !== "Binary") return [];

		const result: InputScalarConfig[] = [];
		if (config.input1 && isScalarInput(config.input1)) {
			result.push(config.input1);
		}
		if (config.input2 && isScalarInput(config.input2)) {
			result.push(config.input2);
		}
		return result;
	}, [nodeData?.inputConfig]);

	/**
	 * Get all custom scalar value inputs (type: "CustomScalarValue", source: null)
	 */
	const getScalarValueInputs = useMemo((): InputScalarValueConfig[] => {
		const config = nodeData?.inputConfig;
		if (!config || config.type !== "Binary") return [];

		const result: InputScalarValueConfig[] = [];
		if (config.input1 && isScalarValueInput(config.input1)) {
			result.push(config.input1);
		}
		if (config.input2 && isScalarValueInput(config.input2)) {
			result.push(config.input2);
		}
		return result;
	}, [nodeData?.inputConfig]);

	/**
	 * Get all group custom scalar value inputs (type: "CustomScalarValue", source: "Group")
	 */
	const getGroupScalarValueInputs = useMemo((): InputGroupScalarValueConfig[] => {
		const config = nodeData?.inputConfig;
		if (!config || config.type !== "Binary") return [];

		const result: InputGroupScalarValueConfig[] = [];
		if (config.input1 && isGroupScalarValueInput(config.input1)) {
			result.push(config.input1);
		}
		if (config.input2 && isGroupScalarValueInput(config.input2)) {
			result.push(config.input2);
		}
		return result;
	}, [nodeData?.inputConfig]);

	/**
	 * Get all scalar-type inputs (Scalar + CustomScalarValue)
	 */
	const getAllScalarInputs = useMemo((): (InputScalarConfig | InputScalarValueConfig | InputGroupScalarValueConfig)[] => {
		return [...getScalarInputs, ...getScalarValueInputs, ...getGroupScalarValueInputs];
	}, [getScalarInputs, getScalarValueInputs, getGroupScalarValueInputs]);

	// ==================== Output Config ====================

	/**
	 * Set output config
	 */
	const setOutputConfig = useCallback(
		(outputConfig: OutputConfig | null) => {
			updateNodeData(id, { outputConfig });
		},
		[id, updateNodeData],
	);

	/**
	 * Set series output config
	 */
	const setSeriesOutput = useCallback(
		(config: Omit<OutputSeriesConfig, "type">) => {
			updateNodeData(id, {
				outputConfig: { type: "Series", ...config },
			});
		},
		[id, updateNodeData],
	);

	/**
	 * Set scalar output config
	 */
	const setScalarOutput = useCallback(
		(config: Omit<OutputScalarConfig, "type">) => {
			updateNodeData(id, {
				outputConfig: { type: "Scalar", ...config },
			});
		},
		[id, updateNodeData],
	);

	/**
	 * Update output display name
	 */
	const updateOutputDisplayName = useCallback(
		(displayName: string) => {
			const config = nodeData?.outputConfig;
			if (!config) return;

			if (isSeriesOutput(config)) {
				updateNodeData(id, {
					outputConfig: { ...config, seriesDisplayName: displayName },
				});
			} else if (isScalarOutput(config)) {
				updateNodeData(id, {
					outputConfig: { ...config, scalarDisplayName: displayName },
				});
			}
		},
		[id, nodeData?.outputConfig, updateNodeData],
	);

	/**
	 * Clear output config
	 */
	const clearOutputConfig = useCallback(() => {
		updateNodeData(id, { outputConfig: null });
	}, [id, updateNodeData]);

	// ==================== Output Config Helpers ====================

	/**
	 * Check if output is series type
	 */
	const isOutputSeries = useMemo((): boolean => {
		return nodeData?.outputConfig ? isSeriesOutput(nodeData.outputConfig) : false;
	}, [nodeData?.outputConfig]);

	/**
	 * Check if output is scalar type
	 */
	const isOutputScalar = useMemo((): boolean => {
		return nodeData?.outputConfig ? isScalarOutput(nodeData.outputConfig) : false;
	}, [nodeData?.outputConfig]);

	/**
	 * Get output display name
	 */
	const getOutputDisplayName = useMemo((): string => {
		const config = nodeData?.outputConfig;
		if (!config) return "";
		if (isSeriesOutput(config)) {
			return config.seriesDisplayName;
		}
		if (isScalarOutput(config)) {
			return config.scalarDisplayName;
		}
		return "";
	}, [nodeData?.outputConfig]);

	// ==================== Window Config ====================

	/**
	 * Set window config
	 */
	const setWindowConfig = useCallback(
		(windowConfig: WindowConfig) => {
			updateNodeData(id, { windowConfig });
		},
		[id, updateNodeData],
	);

	/**
	 * Update window size (handles both rolling and expanding types)
	 */
	const setWindowSize = useCallback(
		(size: number) => {
			if (!nodeData?.windowConfig) return;
			if (nodeData.windowConfig.windowType === "rolling") {
				updateNodeData(id, {
					windowConfig: { windowType: "rolling", windowSize: size },
				});
			} else {
				updateNodeData(id, {
					windowConfig: { windowType: "expanding", initialWindowSize: size },
				});
			}
		},
		[id, nodeData?.windowConfig, updateNodeData],
	);

	/**
	 * Update window type (rolling or expanding), converting field names
	 */
	const setWindowType = useCallback(
		(windowType: "rolling" | "expanding") => {
			if (!nodeData?.windowConfig) return;
			// Get current size value
			const currentSize =
				nodeData.windowConfig.windowType === "rolling"
					? nodeData.windowConfig.windowSize
					: nodeData.windowConfig.initialWindowSize;
			// Create new config with converted field name
			if (windowType === "rolling") {
				updateNodeData(id, {
					windowConfig: { windowType: "rolling", windowSize: currentSize },
				});
			} else {
				updateNodeData(id, {
					windowConfig: { windowType: "expanding", initialWindowSize: currentSize },
				});
			}
		},
		[id, nodeData?.windowConfig, updateNodeData],
	);

	/**
	 * Get current window size
	 */
	const getWindowSize = useMemo((): number => {
		if (!nodeData?.windowConfig) return 0;
		return nodeData.windowConfig.windowType === "rolling"
			? nodeData.windowConfig.windowSize
			: nodeData.windowConfig.initialWindowSize;
	}, [nodeData?.windowConfig]);

	// ==================== Filling Method ====================

	/**
	 * Set filling method
	 */
	const setFillingMethod = useCallback(
		(fillingMethod: FillingMethod) => {
			updateNodeData(id, { fillingMethod });
		},
		[id, updateNodeData],
	);

	return {
		// Data
		nodeData,
		inputArrayType: nodeData?.inputArrayType,
		operation: nodeData?.operation,
		inputConfig: nodeData?.inputConfig,
		outputConfig: nodeData?.outputConfig,
		windowConfig: nodeData?.windowConfig,
		fillingMethod: nodeData?.fillingMethod,

		// Input Array Type
		setInputArrayType,

		// Operation
		setOperation,
		updateOperation,

		// Input Config
		setInputConfig,
		setUnaryInput,
		setBinaryInput1,
		setBinaryInput2,
		setNaryInputs,
		addNaryInput,
		removeNaryInput,
		updateNaryInput,
		clearInputConfig,

		// Input Config Helpers
		getUnaryInput,
		getBinaryInput1,
		getBinaryInput2,
		getNaryInputs,

		// Input Type Filters
		getSeriesInputs,
		getScalarInputs,
		getScalarValueInputs,
		getGroupScalarValueInputs,
		getAllScalarInputs,

		// Output Config
		setOutputConfig,
		setSeriesOutput,
		setScalarOutput,
		updateOutputDisplayName,
		clearOutputConfig,

		// Output Config Helpers
		isOutputSeries,
		isOutputScalar,
		getOutputDisplayName,

		// Window Config
		setWindowConfig,
		setWindowSize,
		setWindowType,
		getWindowSize,

		// Filling Method
		setFillingMethod,
	};
};
