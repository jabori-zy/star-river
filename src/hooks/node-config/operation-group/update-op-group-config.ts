import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type {
	OperationInputConfig,
	OperationGroupData,
	OperationInputScalarValueConfig,
	OperationInputSeriesConfig,
	OperationInputScalarConfig,
	OperationOutputConfig,
	OutputSeriesConfig,
	OutputScalarConfig,
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

	// All scalar configs (both Value and Node source)
	const scalarConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarValueConfig | OperationInputScalarConfig =>
			config.type === "Scalar",
	);

	// Scalar configs from direct value input
	const scalarValueConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarValueConfig =>
			config.type === "Scalar" && config.source === "Value",
	);

	// Scalar configs from upstream node
	const scalarNodeConfigs = operationConfigs.filter(
		(config): config is OperationInputScalarConfig =>
			config.type === "Scalar" && config.source === "Node",
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
	 * Update series display name
	 */
	const updateSeriesDisplayName = useCallback(
		(configId: number, displayName: string) => {
			updateSeriesConfigById(configId, { seriesDisplayName: displayName });
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
					(c) => c.configId === configId && c.type === "Scalar",
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
					(c) => c.configId === configId && c.type === "Scalar",
				);
				if (index !== -1) {
					draft.splice(index, 1);
				}
			});
		},
		[updateOperationConfigs],
	);

	/**
	 * Update scalar display name
	 */
	const updateScalarDisplayName = useCallback(
		(configId: number, displayName: string) => {
			updateScalarConfigById(configId, { scalarDisplayName: displayName });
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
	 * Update scalar node display name
	 */
	const updateScalarNodeDisplayName = useCallback(
		(configId: number, displayName: string) => {
			updateScalarNodeConfigById(configId, { scalarDisplayName: displayName });
		},
		[updateScalarNodeConfigById],
	);

	/**
	 * Clear all scalar node configs (keeps series and scalar value configs)
	 */
	const clearScalarNodeConfigs = useCallback(() => {
		updateNodeData(id, { inputConfigs: [...seriesConfigs, ...scalarValueConfigs] });
	}, [id, updateNodeData, seriesConfigs, scalarValueConfigs]);

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
	 * Update output display name
	 */
	const updateOutputDisplayName = useCallback(
		(configId: number, displayName: string) => {
			updateOutputConfigs((draft) => {
				const index = draft.findIndex((c) => c.configId === configId);
				if (index !== -1) {
					const config = draft[index];
					if (config.type === "Series") {
						(config as OutputSeriesConfig).seriesDisplayName = displayName;
					} else {
						(config as OutputScalarConfig).scalarDisplayName = displayName;
					}
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
		updateSeriesDisplayName,
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
		updateScalarDisplayName,
		updateScalarValue,
		clearScalarValueConfigs,

		// Scalar node configs (source: Node)
		scalarNodeConfigs,
		addScalarNodeConfig,
		updateScalarNodeConfigById,
		removeScalarNodeConfigById,
		updateScalarNodeDisplayName,
		clearScalarNodeConfigs,

		// Output configs
		outputConfigs,
		setOutputConfigs,
		addOutputSeriesConfig,
		addOutputScalarConfig,
		updateOutputConfigById,
		removeOutputConfigById,
		updateOutputDisplayName,
		clearOutputConfigs,
	};
};
