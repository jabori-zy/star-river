import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type {
	OperationInputConfig,
	OperationGroupData,
	OperationCustomScalarValueConfig,
	OperationParentGroupScalarValueConfig,
	OperationInputSeriesConfig,
	OperationInputScalarConfig,
	OperationOutputConfig,
	OperationOutputSeriesConfig,
	OperationOutputScalarConfig,
	WindowConfig,
	FillingMethod,
	InputSource,
} from "@/types/node/group/operation-group";

interface UseUpdateOpGroupConfigProps {
	id: string; // Node ID
}

export const useUpdateOpGroupConfig = ({ id }: UseUpdateOpGroupConfigProps) => {
	const { updateNodeData } = useReactFlow();
	const { getNodeData } = useStrategyWorkflow();

	const nodeData = getNodeData(id) as OperationGroupData | undefined;
	const operationConfigs = nodeData?.inputConfigs ?? [];

	// Filter configs by type
	const seriesConfigs = operationConfigs.filter(
		(config): config is OperationInputSeriesConfig => config.type === "Series",
	);

	// All scalar configs (Scalar from any source, CustomScalarValue from self/ParentGroup)
	const scalarConfigs = operationConfigs.filter(
		(config): config is OperationCustomScalarValueConfig | OperationParentGroupScalarValueConfig | OperationInputScalarConfig =>
			config.type === "Scalar" || config.type === "CustomScalarValue",
	);

	// Custom scalar value configs (self-defined value, source: null)
	const scalarValueConfigs = operationConfigs.filter(
		(config): config is OperationCustomScalarValueConfig =>
			config.type === "CustomScalarValue" && config.source === null,
	);

	// Custom scalar value configs from parent Group (source: ParentGroup)
	const parentGroupScalarValueConfigs = operationConfigs.filter(
		(config): config is OperationParentGroupScalarValueConfig =>
			config.type === "CustomScalarValue" && config.source === "ParentGroup",
	);

	// Scalar configs from outer node (KlineNode, IndicatorNode, VariableNode)
	const scalarOuterNodeConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarConfig =>
			config.type === "Scalar" && config.source === "OuterNode",
	);

	// Scalar configs from OperationNode
	const scalarOperationNodeConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarConfig =>
			config.type === "Scalar" && config.source === "OperationNode",
	);

	// Scalar configs from parent Group (has variable name)
	const scalarParentGroupConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarConfig =>
			config.type === "Scalar" && config.source === "ParentGroup",
	);

	// Scalar configs from child OperationGroup
	const scalarChildGroupConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarConfig =>
			config.type === "Scalar" && config.source === "ChildGroup",
	);

	/**
	 * Generic update function: use Immer to simplify nested updates
	 */
	const updateOperationConfigs = useCallback(
		(updater: (draft: OperationInputConfig[]) => void) => {
			const currentConfigs = operationConfigs;
			const newConfigs = produce(currentConfigs, updater);
			updateNodeData(id, { inputConfigs: newConfigs });
		},
		[operationConfigs, id, updateNodeData],
	);

	/**
	 * Generate next config ID
	 */
	const getNextConfigId = useCallback(() => {
		return operationConfigs.length > 0
			? Math.max(...operationConfigs.map((c) => c.configId)) + 1
			: 1;
	}, [operationConfigs]);

	const getOutputHandleId = useCallback(() => {
		return `${id}_default_output`;
	}, [id]);

	// ==================== Generic Operation Config Updates ====================

	/**
	 * Set all operation configs
	 */
	const setOperationConfigs = useCallback(
		(configs: OperationInputConfig[]) => {
			updateNodeData(id, { inputConfigs: configs });
		},
		[id, updateNodeData],
	);

	/**
	 * Remove an operation config by configId
	 */
	const removeOperationConfigById = useCallback(
		(configId: number) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex((c) => c.configId === configId);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Clear all operation configs
	 */
	const clearOperationConfigs = useCallback(() => {
		updateNodeData(id, { inputConfigs: [] });
	}, [id, updateNodeData]);

	// ==================== Series Config Updates ====================

	/**
	 * Set all series configs (replaces only series configs, keeps scalar configs)
	 */
	const setSeriesConfigs = useCallback(
		(configs: OperationInputSeriesConfig[]) => {
			updateNodeData(id, { inputConfigs: [...scalarConfigs, ...configs] });
		},
		[id, updateNodeData, scalarConfigs],
	);

	/**
	 * Add a new series config
	 */
	const addSeriesConfig = useCallback(
		(seriesConfig: Omit<OperationInputSeriesConfig, "configId" | "outputHandleId">) => {
			updateOperationConfigs((draft) => {
				const newConfig: OperationInputSeriesConfig = {
					...seriesConfig,
					configId: getNextConfigId(),
				};
				draft.push(newConfig);
			});
		},
		[updateOperationConfigs, getNextConfigId],
	);

	/**
	 * Update a series config by index (within series configs only)
	 */
	const updateSeriesConfig = useCallback(
		(index: number, seriesConfig: OperationInputSeriesConfig) => {
			if (index >= 0 && index < seriesConfigs.length) {
				const targetConfigId = seriesConfigs[index].configId;
				updateOperationConfigs((draft) => {
					const globalIndex = draft.findIndex(
						(c) => c.configId === targetConfigId,
					);
					if (globalIndex !== -1) {
						draft[globalIndex] = seriesConfig;
					}
				});
			}
		},
		[updateOperationConfigs, seriesConfigs],
	);

	/**
	 * Update a series config by configId
	 */
	const updateSeriesConfigById = useCallback(
		(configId: number, updates: Partial<OperationInputSeriesConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Series",
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as OperationInputSeriesConfig;
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Remove a series config by index (within series configs only)
	 */
	const removeSeriesConfig = useCallback(
		(index: number) => {
			if (index >= 0 && index < seriesConfigs.length) {
				const targetConfigId = seriesConfigs[index].configId;
				removeOperationConfigById(targetConfigId);
			}
		},
		[seriesConfigs, removeOperationConfigById],
	);

	/**
	 * Remove a series config by configId
	 */
	const removeSeriesConfigById = useCallback(
		(configId: number) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Series",
				);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Update series input name
	 */
	const updateSeriesInputName = useCallback(
		(configId: number, inputName: string) => {
			updateSeriesConfigById(configId, { inputName });
		},
		[updateSeriesConfigById],
	);

	/**
	 * Clear all series configs (keeps scalar configs)
	 */
	const clearSeriesConfigs = useCallback(() => {
		updateNodeData(id, { inputConfigs: scalarConfigs });
	}, [id, updateNodeData, scalarConfigs]);

	// ==================== Scalar Value Config Updates (self-defined) ====================

	/**
	 * Set all scalar value configs (replaces only scalar value configs, keeps others)
	 */
	const setScalarValueConfigs = useCallback(
		(configs: OperationCustomScalarValueConfig[]) => {
			const otherConfigs = operationConfigs.filter(
				(c) => !(c.type === "CustomScalarValue" && c.source === null)
			);
			updateNodeData(id, { inputConfigs: [...otherConfigs, ...configs] });
		},
		[id, updateNodeData, operationConfigs],
	);

	/**
	 * Add a new scalar value config (self-defined)
	 */
	const addScalarValueConfig = useCallback(
		(scalarConfig: Omit<OperationCustomScalarValueConfig, "configId">) => {
			updateOperationConfigs((draft) => {
				const newConfig: OperationCustomScalarValueConfig = {
					...scalarConfig,
					configId: getNextConfigId(),
				};
				draft.push(newConfig);
			});
		},
		[updateOperationConfigs, getNextConfigId],
	);

	/**
	 * Update a scalar value config by configId
	 */
	const updateScalarValueConfigById = useCallback(
		(configId: number, updates: Partial<OperationCustomScalarValueConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "CustomScalarValue" && c.source === null,
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as OperationCustomScalarValueConfig;
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Remove a scalar value config by configId
	 */
	const removeScalarValueConfigById = useCallback(
		(configId: number) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "CustomScalarValue" && c.source === null,
				);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Update scalar input name (for self-defined scalar value)
	 */
	const updateScalarInputName = useCallback(
		(configId: number, inputName: string) => {
			updateScalarValueConfigById(configId, { inputName });
		},
		[updateScalarValueConfigById],
	);

	/**
	 * Update scalar value
	 */
	const updateScalarValue = useCallback(
		(configId: number, value: number) => {
			updateScalarValueConfigById(configId, { scalarValue: value });
		},
		[updateScalarValueConfigById],
	);

	/**
	 * Clear all scalar value configs
	 */
	const clearScalarValueConfigs = useCallback(() => {
		const otherConfigs = operationConfigs.filter(
			(c) => !(c.type === "CustomScalarValue" && c.source === null)
		);
		updateNodeData(id, { inputConfigs: otherConfigs });
	}, [id, updateNodeData, operationConfigs]);

	// ==================== Parent Group Scalar Value Config Updates ====================

	/**
	 * Add a new parent group scalar value config
	 */
	const addParentGroupScalarValueConfig = useCallback(
		(config: Omit<OperationParentGroupScalarValueConfig, "configId">) => {
			updateOperationConfigs((draft) => {
				const newConfig: OperationParentGroupScalarValueConfig = {
					...config,
					configId: getNextConfigId(),
				};
				draft.push(newConfig);
			});
		},
		[updateOperationConfigs, getNextConfigId],
	);

	/**
	 * Update a parent group scalar value config by configId
	 */
	const updateParentGroupScalarValueConfigById = useCallback(
		(configId: number, updates: Partial<OperationParentGroupScalarValueConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "CustomScalarValue" && c.source === "ParentGroup",
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as OperationParentGroupScalarValueConfig;
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Remove a parent group scalar value config by configId
	 */
	const removeParentGroupScalarValueConfigById = useCallback(
		(configId: number) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "CustomScalarValue" && c.source === "ParentGroup",
				);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Update parent group scalar value input name
	 */
	const updateParentGroupScalarValueInputName = useCallback(
		(configId: number, inputName: string) => {
			updateParentGroupScalarValueConfigById(configId, { inputName });
		},
		[updateParentGroupScalarValueConfigById],
	);

	/**
	 * Clear all parent group scalar value configs
	 */
	const clearParentGroupScalarValueConfigs = useCallback(() => {
		const otherConfigs = operationConfigs.filter(
			(c) => !(c.type === "CustomScalarValue" && c.source === "ParentGroup")
		);
		updateNodeData(id, { inputConfigs: otherConfigs });
	}, [id, updateNodeData, operationConfigs]);

	// ==================== Scalar Config Updates (by source) ====================

	/**
	 * Add a new scalar config with specified source
	 */
	const addScalarConfig = useCallback(
		(config: Omit<OperationInputScalarConfig, "configId">) => {
			updateOperationConfigs((draft) => {
				const newConfig: OperationInputScalarConfig = {
					...config,
					configId: getNextConfigId(),
				};
				draft.push(newConfig);
			});
		},
		[updateOperationConfigs, getNextConfigId],
	);

	/**
	 * Update a scalar config by configId and source
	 */
	const updateScalarConfigById = useCallback(
		(configId: number, source: InputSource, updates: Partial<OperationInputScalarConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Scalar" && c.source === source,
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as OperationInputScalarConfig;
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Remove a scalar config by configId and source
	 */
	const removeScalarConfigById = useCallback(
		(configId: number, source: InputSource) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Scalar" && c.source === source,
				);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOperationConfigs],
	);

	// Convenience methods for specific sources

	/**
	 * Update scalar config from outer node
	 */
	const updateScalarOuterNodeConfigById = useCallback(
		(configId: number, updates: Partial<OperationInputScalarConfig>) => {
			updateScalarConfigById(configId, "OuterNode", updates);
		},
		[updateScalarConfigById],
	);

	/**
	 * Update scalar config from OperationNode
	 */
	const updateScalarOperationNodeConfigById = useCallback(
		(configId: number, updates: Partial<OperationInputScalarConfig>) => {
			updateScalarConfigById(configId, "OperationNode", updates);
		},
		[updateScalarConfigById],
	);

	/**
	 * Update scalar config from parent group
	 */
	const updateScalarParentGroupConfigById = useCallback(
		(configId: number, updates: Partial<OperationInputScalarConfig>) => {
			updateScalarConfigById(configId, "ParentGroup", updates);
		},
		[updateScalarConfigById],
	);

	/**
	 * Update scalar config from child group
	 */
	const updateScalarChildGroupConfigById = useCallback(
		(configId: number, updates: Partial<OperationInputScalarConfig>) => {
			updateScalarConfigById(configId, "ChildGroup", updates);
		},
		[updateScalarConfigById],
	);

	/**
	 * Update scalar input name by source
	 */
	const updateScalarConfigInputName = useCallback(
		(configId: number, source: InputSource, inputName: string) => {
			updateScalarConfigById(configId, source, { inputName });
		},
		[updateScalarConfigById],
	);

	// ==================== Output Config Updates ====================

	const outputConfigs = nodeData?.outputConfigs ?? [];

	/**
	 * Generic update function for output configs
	 */
	const updateOutputConfigs = useCallback(
		(updater: (draft: OperationOutputConfig[]) => void) => {
			const currentConfigs = outputConfigs;
			const newConfigs = produce(currentConfigs, updater);
			updateNodeData(id, { outputConfigs: newConfigs });
		},
		[outputConfigs, id, updateNodeData],
	);

	/**
	 * Generate next output config ID
	 */
	const getNextOutputConfigId = useCallback(() => {
		return outputConfigs.length > 0
			? Math.max(...outputConfigs.map((c) => c.configId)) + 1
			: 1;
	}, [outputConfigs]);


	/**
	 * Set all output configs
	 */
	const setOutputConfigs = useCallback(
		(configs: OperationOutputConfig[]) => {
			updateNodeData(id, { outputConfigs: configs });
		},
		[id, updateNodeData],
	);

	/**
	 * Add a new output series config
	 */
	const addOutputSeriesConfig = useCallback(
		(config: Omit<OperationOutputSeriesConfig, "configId" | "outputHandleId">) => {
			const configId = getNextOutputConfigId();
			updateOutputConfigs((draft) => {
				const newConfig: OperationOutputSeriesConfig = {
					...config,
					configId,
					outputHandleId: getOutputHandleId(),
				};
				draft.push(newConfig);
			});
		},
		[updateOutputConfigs, getNextOutputConfigId, getOutputHandleId],
	);

	/**
	 * Add a new output scalar config
	 */
	const addOutputScalarConfig = useCallback(
		(config: Omit<OperationOutputScalarConfig, "configId" | "outputHandleId">) => {
			const configId = getNextOutputConfigId();
			updateOutputConfigs((draft) => {
				const newConfig: OperationOutputScalarConfig = {
					...config,
					configId,
					outputHandleId: getOutputHandleId(),
				};
				draft.push(newConfig);
			});
		},
		[updateOutputConfigs, getNextOutputConfigId, getOutputHandleId],
	);

	/**
	 * Update an output config by configId
	 */
	const updateOutputConfigById = useCallback(
		(configId: number, updates: Partial<OperationOutputConfig>) => {
			updateOutputConfigs((draft) => {
				const index = draft.findIndex((c) => c.configId === configId);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as OperationOutputConfig;
				}
			});
		},
		[updateOutputConfigs],
	);

	/**
	 * Remove an output config by configId
	 */
	const removeOutputConfigById = useCallback(
		(configId: number) => {
			updateOutputConfigs((draft) => {
				const index = draft.findIndex((c) => c.configId === configId);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOutputConfigs],
	);

	/**
	 * Update output name
	 */
	const updateOutputName = useCallback(
		(configId: number, outputName: string) => {
			updateOutputConfigs((draft) => {
				const index = draft.findIndex((c) => c.configId === configId);
				if (index !== -1) {
					draft[index].outputName = outputName;
				}
			});
		},
		[updateOutputConfigs],
	);

	/**
	 * Clear all output configs
	 */
	const clearOutputConfigs = useCallback(() => {
		updateNodeData(id, { outputConfigs: [] });
	}, [id, updateNodeData]);

	// ==================== Window Config ====================

	const inputWindow = nodeData?.inputWindow;

	/**
	 * Set input window config
	 */
	const setInputWindow = useCallback(
		(config: WindowConfig) => {
			updateNodeData(id, { inputWindow: config });
		},
		[id, updateNodeData],
	);

	// ==================== Filling Method ====================

	const fillingMethod = nodeData?.fillingMethod;

	/**
	 * Set filling method
	 */
	const setFillingMethod = useCallback(
		(method: FillingMethod) => {
			updateNodeData(id, { fillingMethod: method });
		},
		[id, updateNodeData],
	);

	return {
		// All configs
		operationConfigs,
		setOperationConfigs,
		removeOperationConfigById,
		clearOperationConfigs,

		// Series configs
		seriesConfigs,
		setSeriesConfigs,
		addSeriesConfig,
		updateSeriesConfig,
		updateSeriesConfigById,
		removeSeriesConfig,
		removeSeriesConfigById,
		updateSeriesInputName,
		clearSeriesConfigs,

		// All scalar configs (combined)
		scalarConfigs,

		// Scalar value configs (self-defined, source: null)
		scalarValueConfigs,
		setScalarValueConfigs,
		addScalarValueConfig,
		updateScalarValueConfigById,
		removeScalarValueConfigById,
		updateScalarInputName,
		updateScalarValue,
		clearScalarValueConfigs,

		// Parent group scalar value configs (CustomScalarValue, source: ParentGroup)
		parentGroupScalarValueConfigs,
		addParentGroupScalarValueConfig,
		updateParentGroupScalarValueConfigById,
		removeParentGroupScalarValueConfigById,
		updateParentGroupScalarValueInputName,
		clearParentGroupScalarValueConfigs,

		// Scalar configs by source
		scalarOuterNodeConfigs,
		scalarOperationNodeConfigs,
		scalarParentGroupConfigs,
		scalarChildGroupConfigs,

		// Generic scalar config operations
		addScalarConfig,
		updateScalarConfigById,
		removeScalarConfigById,
		updateScalarConfigInputName,

		// Convenience methods for specific sources
		updateScalarOuterNodeConfigById,
		updateScalarOperationNodeConfigById,
		updateScalarParentGroupConfigById,
		updateScalarChildGroupConfigById,

		// Output configs
		outputConfigs,
		setOutputConfigs,
		addOutputSeriesConfig,
		addOutputScalarConfig,
		updateOutputConfigById,
		removeOutputConfigById,
		updateOutputName,
		clearOutputConfigs,

		// Window config
		inputWindow,
		setInputWindow,

		// Filling method
		fillingMethod,
		setFillingMethod,
	};
};
