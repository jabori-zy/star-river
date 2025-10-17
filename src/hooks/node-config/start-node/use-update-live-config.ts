import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { useStartNodeDataStore } from "@/store/node/use-start-node-data-store";
import type {
	CustomVariable,
	SelectedAccount,
	StrategyLiveConfig,
} from "@/types/strategy";

// 接口定义
interface UseLiveConfigProps {
	initialConfig?: StrategyLiveConfig; // 实盘配置
	nodeId?: string; // 节点ID，用于同步节点数据
}

// 自定义hook
export const useLiveConfig = ({
	initialConfig,
	nodeId,
}: UseLiveConfigProps) => {
	// 获取ReactFlow实例
	const { setNodes } = useReactFlow();

	// 获取全局状态store的方法和数据
	const {
		liveConfig: config,
		setLiveConfig: setGlobalLiveConfig,
		setDefaultLiveConfig: setGlobalDefaultLiveConfig,
		updateLiveAccounts: updateGlobalLiveAccounts,
		updateLiveVariables: updateGlobalLiveVariables,
	} = useStartNodeDataStore();

	// 初始化配置（仅在首次使用时设置）
	useEffect(() => {
		if (!config && initialConfig) {
			setGlobalLiveConfig(initialConfig);
		}
	}, [config, initialConfig, setGlobalLiveConfig]);

	// 设置默认实盘配置
	const setDefaultLiveConfig = useCallback(() => {
		setGlobalDefaultLiveConfig();
	}, [setGlobalDefaultLiveConfig]);

	// 监听全局配置变化，同步到节点
	useEffect(() => {
		if (nodeId && config) {
			setNodes((nodes) =>
				nodes.map((node) =>
					node.id === nodeId
						? {
								...node,
								data: {
									...node.data,
									liveConfig: config,
								},
							}
						: node,
				),
			);
		}
	}, [config, nodeId, setNodes]);

	// 更新实盘账户 - 只更新全局状态，同步通过 useEffect 完成
	const updateSelectedAccounts = useCallback(
		(accounts: SelectedAccount[]) => {
			updateGlobalLiveAccounts(accounts);
		},
		[updateGlobalLiveAccounts],
	);

	// 更新实盘变量 - 只更新全局状态，同步通过 useEffect 完成
	const updateVariables = useCallback(
		(variables: CustomVariable[]) => {
			updateGlobalLiveVariables(variables);
		},
		[updateGlobalLiveVariables],
	);

	return {
		config,
		setDefaultLiveConfig,
		updateSelectedAccounts,
		updateVariables,
	};
};
