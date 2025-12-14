import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type {
	OperationInputConfig,
	OperationGroupData,
	OperationInputScalarValueConfig,
	OperationInputGroupScalarValueConfig,
	OperationInputSeriesConfig,
	OperationInputScalarConfig,
	OperationOutputConfig,
	OutputSeriesConfig,
	OutputScalarConfig,
	WindowConfig,
	FillingMethod,
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

	// All scalar configs (Scalar from Node/Group, CustomScalarValue from self/Group)
	const scalarConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarValueConfig | OperationInputGroupScalarValueConfig | OperationInputScalarConfig =>
			config.type === "Scalar" || config.type === "CustomScalarValue",
	);

	// Custom scalar value configs (self-defined value, source: null)
	const scalarValueConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarValueConfig =>
			config.type === "CustomScalarValue" && config.source === null,
	);

	// Custom scalar value configs from parent Group
	const groupScalarValueConfigs = operationConfigs.filter(
		(config): config is OperationInputGroupScalarValueConfig =>
			config.type === "CustomScalarValue" && config.source === "Group",
	);

	// Scalar configs from upstream node (has variable name)
	const scalarNodeConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarConfig =>
			config.type === "Scalar" && config.source === "Node",
	);

	// Scalar configs from parent Group (has variable name)
	const scalarGroupConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarConfig =>
			config.type === "Scalar" && config.source === "Group",
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

	// ==================== Scalar Config Updates ====================

	/**
	 * Set all scalar configs (replaces only scalar configs, keeps series configs)
	 */
	const setScalarConfigs = useCallback(
		(configs: OperationInputScalarValueConfig[]) => {
			updateNodeData(id, { inputConfigs: [...seriesConfigs, ...configs] });
		},
		[id, updateNodeData, seriesConfigs],
	);

	/**
	 * Add a new scalar config
	 */
	const addScalarConfig = useCallback(
		(scalarConfig: Omit<OperationInputScalarValueConfig, "configId">) => {
			updateOperationConfigs((draft) => {
				const newConfig: OperationInputScalarValueConfig = {
					...scalarConfig,
					configId: getNextConfigId(),
				};
				draft.push(newConfig);
			});
		},
		[updateOperationConfigs, getNextConfigId],
	);

	/**
	 * Update a scalar config by index (within scalar configs only)
	 */
	const updateScalarConfig = useCallback(
		(index: number, scalarConfig: OperationInputScalarValueConfig) => {
			if (index >= 0 && index < scalarConfigs.length) {
				const targetConfigId = scalarConfigs[index].configId;
				updateOperationConfigs((draft) => {
					const globalIndex = draft.findIndex(
						(c) => c.configId === targetConfigId,
					);
					if (globalIndex !== -1) {
						draft[globalIndex] = scalarConfig;
					}
				});
			}
		},
		[updateOperationConfigs, scalarConfigs],
	);

	/**
	 * Update a scalar config by configId
	 */
	const updateScalarConfigById = useCallback(
		(configId: number, updates: Partial<OperationInputScalarValueConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "CustomScalarValue" && c.source === null,
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as OperationInputScalarValueConfig;
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Remove a scalar config by index (within scalar configs only)
	 */
	const removeScalarConfig = useCallback(
		(index: number) => {
			if (index >= 0 && index < scalarConfigs.length) {
				const targetConfigId = scalarConfigs[index].configId;
				removeOperationConfigById(targetConfigId);
			}
		},
		[scalarConfigs, removeOperationConfigById],
	);

	/**
	 * Remove a scalar config by configId
	 */
	const removeScalarConfigById = useCallback(
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
	 * Update scalar input name
	 */
	const updateScalarInputName = useCallback(
		(configId: number, inputName: string) => {
			updateScalarConfigById(configId, { inputName });
		},
		[updateScalarConfigById],
	);

	/**
	 * Update scalar value
	 */
	const updateScalarValue = useCallback(
		(configId: number, value: number) => {
			updateScalarConfigById(configId, { scalarValue: value });
		},
		[updateScalarConfigById],
	);

	/**
	 * Clear all scalar value configs (keeps series and scalar node configs)
	 */
	const clearScalarValueConfigs = useCallback(() => {
		updateNodeData(id, { inputConfigs: [...seriesConfigs, ...scalarNodeConfigs] });
	}, [id, updateNodeData, seriesConfigs, scalarNodeConfigs]);

	// ==================== Scalar Node Config Updates ====================

	/**
	 * Add a new scalar node config (from upstream node)
	 */
	const addScalarNodeConfig = useCallback(
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
	 * Update a scalar node config by configId
	 */
	const updateScalarNodeConfigById = useCallback(
		(configId: number, updates: Partial<OperationInputScalarConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Scalar" && c.source === "Node",
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as OperationInputScalarConfig;
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Remove a scalar node config by configId
	 */
	const removeScalarNodeConfigById = useCallback(
		(configId: number) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Scalar" && c.source === "Node",
				);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Update scalar node input name
	 */
	const updateScalarNodeInputName = useCallback(
		(configId: number, inputName: string) => {
			updateScalarNodeConfigById(configId, { inputName });
		},
		[updateScalarNodeConfigById],
	);

	/**
	 * Clear all scalar node configs (keeps series and scalar value configs)
	 */
	const clearScalarNodeConfigs = useCallback(() => {
		updateNodeData(id, { inputConfigs: [...seriesConfigs, ...scalarValueConfigs, ...groupScalarValueConfigs] });
	}, [id, updateNodeData, seriesConfigs, scalarValueConfigs, groupScalarValueConfigs]);

	// ==================== Group Scalar Value Config Updates ====================

	/**
	 * Add a new group scalar value config (from parent Group's custom scalar)
	 */
	const addGroupScalarValueConfig = useCallback(
		(config: Omit<OperationInputGroupScalarValueConfig, "configId">) => {
			updateOperationConfigs((draft) => {
				const newConfig: OperationInputGroupScalarValueConfig = {
					...config,
					configId: getNextConfigId(),
				};
				draft.push(newConfig);
			});
		},
		[updateOperationConfigs, getNextConfigId],
	);

	/**
	 * Update a group scalar value config by configId
	 */
	const updateGroupScalarValueConfigById = useCallback(
		(configId: number, updates: Partial<OperationInputGroupScalarValueConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "CustomScalarValue" && c.source === "Group",
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as OperationInputGroupScalarValueConfig;
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Remove a group scalar value config by configId
	 */
	const removeGroupScalarValueConfigById = useCallback(
		(configId: number) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "CustomScalarValue" && c.source === "Group",
				);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Update group scalar value input name
	 */
	const updateGroupScalarValueInputName = useCallback(
		(configId: number, inputName: string) => {
			updateGroupScalarValueConfigById(configId, { inputName });
		},
		[updateGroupScalarValueConfigById],
	);

	/**
	 * Clear all group scalar value configs
	 */
	const clearGroupScalarValueConfigs = useCallback(() => {
		updateNodeData(id, { inputConfigs: [...seriesConfigs, ...scalarValueConfigs, ...scalarNodeConfigs, ...scalarGroupConfigs] });
	}, [id, updateNodeData, seriesConfigs, scalarValueConfigs, scalarNodeConfigs, scalarGroupConfigs]);

	// ==================== Scalar Group Config Updates ====================

	/**
	 * Add a new scalar group config (from parent Group's scalar with variable name)
	 */
	const addScalarGroupConfig = useCallback(
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
	 * Update a scalar group config by configId
	 */
	const updateScalarGroupConfigById = useCallback(
		(configId: number, updates: Partial<OperationInputScalarConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Scalar" && c.source === "Group",
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as OperationInputScalarConfig;
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Remove a scalar group config by configId
	 */
	const removeScalarGroupConfigById = useCallback(
		(configId: number) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Scalar" && c.source === "Group",
				);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Update scalar group input name
	 */
	const updateScalarGroupInputName = useCallback(
		(configId: number, inputName: string) => {
			updateScalarGroupConfigById(configId, { inputName });
		},
		[updateScalarGroupConfigById],
	);

	/**
	 * Clear all scalar group configs
	 */
	const clearScalarGroupConfigs = useCallback(() => {
		updateNodeData(id, { inputConfigs: [...seriesConfigs, ...scalarValueConfigs, ...scalarNodeConfigs, ...groupScalarValueConfigs] });
	}, [id, updateNodeData, seriesConfigs, scalarValueConfigs, scalarNodeConfigs, groupScalarValueConfigs]);

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
		(config: Omit<OutputSeriesConfig, "configId" | "outputHandleId">) => {
			const configId = getNextOutputConfigId();
			updateOutputConfigs((draft) => {
				const newConfig: OutputSeriesConfig = {
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
		(config: Omit<OutputScalarConfig, "configId" | "outputHandleId">) => {
			const configId = getNextOutputConfigId();
			updateOutputConfigs((draft) => {
				const newConfig: OutputScalarConfig = {
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

		// All scalar configs (both Value and Node source)
		scalarConfigs,

		// Scalar value configs (source: Value)
		scalarValueConfigs,
		setScalarConfigs,
		addScalarConfig,
		updateScalarConfig,
		updateScalarConfigById,
		removeScalarConfig,
		removeScalarConfigById,
		updateScalarInputName,
		updateScalarValue,
		clearScalarValueConfigs,

		// Scalar node configs (source: Node)
		scalarNodeConfigs,
		addScalarNodeConfig,
		updateScalarNodeConfigById,
		removeScalarNodeConfigById,
		updateScalarNodeInputName,
		clearScalarNodeConfigs,

		// Group scalar value configs (CustomScalarValue from parent Group)
		groupScalarValueConfigs,
		addGroupScalarValueConfig,
		updateGroupScalarValueConfigById,
		removeGroupScalarValueConfigById,
		updateGroupScalarValueInputName,
		clearGroupScalarValueConfigs,

		// Scalar group configs (Scalar with variable name from parent Group)
		scalarGroupConfigs,
		addScalarGroupConfig,
		updateScalarGroupConfigById,
		removeScalarGroupConfigById,
		updateScalarGroupInputName,
		clearScalarGroupConfigs,

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
