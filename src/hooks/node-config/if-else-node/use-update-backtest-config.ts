import { useReactFlow } from "@xyflow/react";
import { useCallback, useState, useEffect } from "react";
import {
	type CaseItem,
	type IfElseNodeBacktestConfig,
	LogicalSymbol,
} from "@/types/node/if-else-node";

interface UseUpdateBacktestConfigProps {
	id: string;
	initialConfig?: IfElseNodeBacktestConfig;
}

export const useUpdateBacktestConfig = ({
	id,
	initialConfig,
}: UseUpdateBacktestConfigProps) => {
	const { updateNodeData } = useReactFlow();

	// 统一的状态管理
	const [config, setConfig] = useState<IfElseNodeBacktestConfig | undefined>(
		initialConfig,
	);

	// 监听 config 变化，同步到 ReactFlow
	useEffect(() => {
		if (config) {
			updateNodeData(id, {
				backtestConfig: config,
			});
		}
	}, [config, id, updateNodeData]);

	// 通用的更新函数
	const updateConfig = useCallback(
		(
			updater: (
				prev: IfElseNodeBacktestConfig | undefined,
			) => IfElseNodeBacktestConfig,
		) => {
			setConfig((prevConfig) => updater(prevConfig));
		},
		[],
	);

	// 默认配置值
	const getDefaultConfig = useCallback(
		(prev?: IfElseNodeBacktestConfig): IfElseNodeBacktestConfig => ({
			cases: prev?.cases || [
				{
					caseId: 1,
					logicalSymbol: LogicalSymbol.AND,
					conditions: [],
					outputHandleId: `${id}_output_1`,
				},
			],
			...prev,
		}),
		[id],
	);

	// 通用的字段更新方法
	const updateField = useCallback(
		<K extends keyof IfElseNodeBacktestConfig>(
			field: K,
			value: IfElseNodeBacktestConfig[K],
		) => {
			updateConfig((prev) => ({
				...getDefaultConfig(prev),
				[field]: value,
			}));
		},
		[updateConfig, getDefaultConfig],
	);

	// 设置默认回测配置
	const setDefaultBacktestConfig = useCallback(() => {
		const defaultConfig = getDefaultConfig();
		updateField("cases", defaultConfig.cases);
	}, [updateField, getDefaultConfig]);

	// 更新所有案例
	const updateCases = useCallback(
		(cases: CaseItem[]) => {
			updateField("cases", cases);
		},
		[updateField],
	);

	// 删除案例
	const removeCase = useCallback(
		(caseId: number) => {
			updateConfig((prev) => ({
				...getDefaultConfig(prev),
				cases: (prev?.cases || []).filter((c) => c.caseId !== caseId),
			}));
		},
		[updateConfig, getDefaultConfig],
	);

	// 更新指定案例
	const updateCase = useCallback(
		(updatedCase: Partial<CaseItem>) => {
			updateConfig((prev) => {
				const currentCases = prev?.cases || [];

				// 如果配置为空且要更新的case有完整信息，则添加为新case
				if (currentCases.length === 0 && updatedCase.caseId) {
					const newConfig = {
						...getDefaultConfig(prev),
						cases: [updatedCase as CaseItem],
					};
					return newConfig;
				}

				// 查找是否存在匹配的case
				const caseExists = currentCases.some(
					(c) => c.caseId === updatedCase.caseId,
				);

				if (!caseExists && updatedCase.caseId) {
					// 如果case不存在，添加新case
					const newConfig = {
						...getDefaultConfig(prev),
						cases: [...currentCases, updatedCase as CaseItem],
					};
					return newConfig;
				} else {
					// 如果case存在，更新它
					const newConfig = {
						...getDefaultConfig(prev),
						cases: currentCases.map((c) =>
							c.caseId === updatedCase.caseId ? { ...c, ...updatedCase } : c,
						),
					};
					return newConfig;
				}
			});
		},
		[updateConfig, getDefaultConfig],
	);

	return {
		// 状态
		config,

		// 基础配置方法
		setDefaultBacktestConfig,
		updateCases,

		removeCase,
		updateCase,
	};
};
