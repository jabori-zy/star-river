import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { useCallback } from "react";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import type {
	OperationConfig,
	OperationGroupData,
	ScalarConfig,
	SeriesConfig,
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
		(config): config is SeriesConfig => config.type === "Series",
	);
	const scalarConfigs = operationConfigs.filter(
		(config): config is ScalarConfig => config.type === "Scalar",
	);

	/**
	 * Generic update function: use Immer to simplify nested updates
	 */
	const updateOperationConfigs = useCallback(
		(updater: (draft: OperationConfig[]) => void) => {
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
		return `${id}_default_output_${getNextConfigId()}`;
	}, [id, getNextConfigId]);

	// ==================== Generic Operation Config Updates ====================

	/**
	 * Set all operation configs
	 */
	const setOperationConfigs = useCallback(
		(configs: OperationConfig[]) => {
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
		(configs: SeriesConfig[]) => {
			updateNodeData(id, { inputConfigs: [...scalarConfigs, ...configs] });
		},
		[id, updateNodeData, scalarConfigs],
	);

	/**
	 * Add a new series config
	 */
	const addSeriesConfig = useCallback(
		(seriesConfig: Omit<SeriesConfig, "configId" | "outputHandleId">) => {
			updateOperationConfigs((draft) => {
				const newConfig: SeriesConfig = {
					...seriesConfig,
					configId: getNextConfigId(),
					outputHandleId: getOutputHandleId(),
				};
				draft.push(newConfig);
			});
		},
		[updateOperationConfigs, getNextConfigId, getOutputHandleId],
	);

	/**
	 * Update a series config by index (within series configs only)
	 */
	const updateSeriesConfig = useCallback(
		(index: number, seriesConfig: SeriesConfig) => {
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
		(configId: number, updates: Partial<SeriesConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Series",
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as SeriesConfig;
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
		(configs: ScalarConfig[]) => {
			updateNodeData(id, { inputConfigs: [...seriesConfigs, ...configs] });
		},
		[id, updateNodeData, seriesConfigs],
	);

	/**
	 * Add a new scalar config
	 */
	const addScalarConfig = useCallback(
		(scalarConfig: Omit<ScalarConfig, "configId">) => {
			updateOperationConfigs((draft) => {
				const newConfig: ScalarConfig = {
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
		(index: number, scalarConfig: ScalarConfig) => {
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
		(configId: number, updates: Partial<ScalarConfig>) => {
			updateOperationConfigs((draft) => {
				const index = draft.findIndex(
					(c) => c.configId === configId && c.type === "Scalar",
				);
				if (index !== -1) {
					draft[index] = { ...draft[index], ...updates } as ScalarConfig;
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
	 * Clear all scalar configs (keeps series configs)
	 */
	const clearScalarConfigs = useCallback(() => {
		updateNodeData(id, { inputConfigs: seriesConfigs });
	}, [id, updateNodeData, seriesConfigs]);

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

		// Scalar configs
		scalarConfigs,
		setScalarConfigs,
		addScalarConfig,
		updateScalarConfig,
		updateScalarConfigById,
		removeScalarConfig,
		removeScalarConfigById,
		updateScalarDisplayName,
		updateScalarValue,
		clearScalarConfigs,
	};
};
