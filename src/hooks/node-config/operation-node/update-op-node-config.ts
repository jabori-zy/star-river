import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type { OperationNodeData, OperationInputConfig } from "@/types/node/operation-node";
import type {
	InputArrayType,
	Operation,
	InputConfig,
	InputSeriesConfig,
	OutputConfig,
	WindowConfig,
	FillingMethod,
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
	 * Clear input config
	 */
	const clearInputConfig = useCallback(() => {
		updateNodeData(id, { inputConfig: null });
	}, [id, updateNodeData]);

	// Helper to get Binary input1 from current config
	const getBinaryInput1 = (): InputConfig | null => {
		if (nodeData?.inputConfig?.type === "Binary") {
			return nodeData.inputConfig.input1;
		}
		return null;
	};

	// Helper to get Binary input2 from current config
	const getBinaryInput2 = (): InputConfig | null => {
		if (nodeData?.inputConfig?.type === "Binary") {
			return nodeData.inputConfig.input2;
		}
		return null;
	};

	// Helper to get Nary inputs from current config
	const getNaryInputs = (): InputSeriesConfig[] => {
		if (nodeData?.inputConfig?.type === "Nary") {
			return nodeData.inputConfig.inputs;
		}
		return [];
	};

	// Helper to get Unary input from current config
	const getUnaryInput = (): InputSeriesConfig | null => {
		if (nodeData?.inputConfig?.type === "Unary") {
			return nodeData.inputConfig.input;
		}
		return null;
	};

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
	 * Clear output config
	 */
	const clearOutputConfig = useCallback(() => {
		updateNodeData(id, { outputConfig: null });
	}, [id, updateNodeData]);

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
		clearInputConfig,
		// Helper getters for input config
		getUnaryInput,
		getBinaryInput1,
		getBinaryInput2,
		getNaryInputs,

		// Output Config
		setOutputConfig,
		clearOutputConfig,

		// Window Config
		setWindowConfig,
		setWindowSize,
		setWindowType,

		// Filling Method
		setFillingMethod,
	};
};
