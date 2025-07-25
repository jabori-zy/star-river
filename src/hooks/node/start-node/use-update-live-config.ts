import { useCallback, useEffect } from "react";
import {
	StrategyLiveConfig,
	SelectedAccount,
	StrategyVariable,
} from "@/types/strategy";
import { useStartNodeDataStore } from "@/store/use-start-node-data-store";
import { useReactFlow } from "@xyflow/react";

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

	// 更新实盘账户 - 同时更新节点数据
	const updateSelectedAccounts = useCallback(
		(accounts: SelectedAccount[]) => {
			updateGlobalLiveAccounts(accounts);

			// 如果提供了nodeId，同步更新节点数据
			if (nodeId) {
				setTimeout(() => {
					setNodes((nodes) =>
						nodes.map((node) =>
							node.id === nodeId
								? {
										...node,
										data: {
											...node.data,
											liveConfig: {
												...(node.data.liveConfig || {}),
												selectedAccounts: accounts,
											},
										},
									}
								: node,
						),
					);
				}, 0);
			}
		},
		[updateGlobalLiveAccounts, nodeId, setNodes],
	);

	// 更新实盘变量 - 同时更新节点数据
	const updateVariables = useCallback(
		(variables: StrategyVariable[]) => {
			updateGlobalLiveVariables(variables);

			// 如果提供了nodeId，同步更新节点数据
			if (nodeId) {
				setTimeout(() => {
					setNodes((nodes) =>
						nodes.map((node) =>
							node.id === nodeId
								? {
										...node,
										data: {
											...node.data,
											liveConfig: {
												...(node.data.liveConfig || {}),
												variables,
											},
										},
									}
								: node,
						),
					);
				}, 0);
			}
		},
		[updateGlobalLiveVariables, nodeId, setNodes],
	);

	return {
		config,
		setDefaultLiveConfig,
		updateSelectedAccounts,
		updateVariables,
	};
};
