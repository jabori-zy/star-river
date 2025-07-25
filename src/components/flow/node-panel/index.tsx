import { useState, useEffect, useMemo, memo } from "react";
import { useReactFlow } from "@xyflow/react";
import BasePanel from "@/components/flow/base/BasePanel";
import { Play } from "lucide-react";
import { PanelComponentMap } from "./constants";
import { NodeData, NodeType } from "@/types/node/index";

/**
 * 所有节点的面板。根据选择的节点，在同一个面板中，切换不同节点的面板
 * 参考dify框架的实现方式，使用映射表来管理不同节点的设置面板
 */
const NodePanel: React.FC = () => {
	// 获取节点实例
	const { getNodes } = useReactFlow();
	// 当前选中的节点id
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	// 当前选中的节点类型
	const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
	// 当前选中的节点数据
	const [selectedNodeData, setSelectedNodeData] = useState<NodeData | null>(
		null,
	);
	// 是否显示面板
	const [isShow, setIsShow] = useState(false);

	// 监听节点选择状态变化
	useEffect(() => {
		const checkSelectedNodes = () => {
			const nodes = getNodes();
			const selectedNode = nodes.find((node) => node.selected);
			// console.log("selectedNode", selectedNode?.id);

			// 如果选中的节点存在，则设置节点id和类型，并显示面板
			if (selectedNode) {
				setSelectedNodeId(selectedNode.id);
				setSelectedNodeType(selectedNode.type || null);
				setSelectedNodeData(selectedNode.data as NodeData);
				setIsShow(true);
			} else {
				setSelectedNodeId(null);
				setSelectedNodeType(null);
				setSelectedNodeData(null);
				setIsShow(false);
			}
		};

		// 立即检查一次
		checkSelectedNodes();

		// 设置定时器定期检查
		const interval = setInterval(checkSelectedNodes, 400);

		return () => clearInterval(interval);
	}, [getNodes]);

	// 使用useMemo优化性能，获取当前节点的设置面板配置
	const currentPanelConfig = useMemo(() => {
		// console.log("selectedNodeType", selectedNodeType);
		if (!selectedNodeType) {
			// 返回默认设置面板
			return {
				icon: Play,
				iconBackgroundColor: "bg-red-400",
				liveModeSettingPanel: (
					<div className="p-4">
						<div className="text-sm text-gray-500">请选择一个支持的节点</div>
					</div>
				),
				backtestModeSettingPanel: (
					<div className="p-4">
						<div className="text-sm text-gray-500">请选择一个支持的节点</div>
					</div>
				),
				simulationModeSettingPanel: (
					<div className="p-4">
						<div className="text-sm text-gray-500">请选择一个支持的节点</div>
					</div>
				),
			};
		}

		const nodePanelConfig = PanelComponentMap[selectedNodeType as NodeType];
		if (nodePanelConfig) {
			return nodePanelConfig;
		}

		// 如果节点类型不在映射表中，返回默认面板
		return {
			icon: Play,
			iconBackgroundColor: "bg-red-400",
			liveModeSettingPanel: (
				<div className="p-4">
					<div className="text-sm text-gray-500">该节点类型暂不支持设置</div>
				</div>
			),
			backtestModeSettingPanel: (
				<div className="p-4">
					<div className="text-sm text-gray-500">该节点类型暂不支持设置</div>
				</div>
			),
			simulationModeSettingPanel: (
				<div className="p-4">
					<div className="text-sm text-gray-500">该节点类型暂不支持设置</div>
				</div>
			),
		};
	}, [selectedNodeType]);

	return (
		<BasePanel
			key={selectedNodeId} // 使用selectedNodeId作为key，强制重新渲染
			id={selectedNodeId || ""}
			data={selectedNodeData || ({} as NodeData)}
			settingPanel={currentPanelConfig}
			isShow={isShow}
			setIsShow={setIsShow}
			tradeMode="live" // 默认交易模式
		>
			<div>
				{selectedNodeId ? (
					<div className="text-sm text-gray-600">
						当前选中节点: {selectedNodeId}
						<br />
						节点类型: {selectedNodeType}
					</div>
				) : (
					<div className="text-sm text-gray-500">请选择一个节点以查看设置</div>
				)}
			</div>
		</BasePanel>
	);
};

export default memo(NodePanel);
