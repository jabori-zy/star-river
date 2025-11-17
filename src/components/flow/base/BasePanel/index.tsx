import { type PanelProps, useReactFlow } from "@xyflow/react";
import { GripVertical } from "lucide-react";
import {
	type ReactElement,
	memo,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import BasePanelHeader from "./header";
import TradeModeSwitcher, {
	type SettingPanelProps,
} from "./trade-mode-switcher";
import { getNodeIconName, getNodeDefaultColor, NodeType } from "@/types/node";
import { NodeData } from "@/types/node";
interface BasePanelProps extends PanelProps {
	id: string; // 节点id
	setSelectedNodeId: (id: string | undefined) => void;
	children: ReactElement; // 面板内容
	tradeMode: string; // 交易模式
	settingPanel: SettingPanelProps; // 设置面板
}

const BasePanel: React.FC<BasePanelProps> = ({
	id,
	setSelectedNodeId,
	settingPanel,
}) => {
	const panelRef = useRef<HTMLDivElement>(null);
	// 获取ReactFlow实例
	const { updateNodeData, setNodes, getNode } = useReactFlow();
	const node = getNode(id);
	const nodeData = node?.data as NodeData;
	const nodeType = node?.type;
	const nodeConfig = nodeData?.nodeConfig;
	// 面板标题
	const [panelTitle, setPanelTitle] = useState(nodeData?.nodeName || "未命名节点");

	// 是否显示面板
	const [isShow, setIsShow] = useState(true);

	// 是否在编辑标题
	const [isEditingTitle, setIsEditingTitle] = useState(false);


	// 监听data.nodeName变化，更新面板标题
	useEffect(() => {
		// 只有在不是编辑状态时才同步外部数据变化
		if (!isEditingTitle) {
			setPanelTitle(nodeData?.nodeName || "未命名节点");
		}
	}, [nodeData, isEditingTitle]);

	// 自定义的标题更新函数，同时更新节点数据
	const handleSetTitle = useCallback(
		(newTitle: string) => {
			setPanelTitle(newTitle);
			// 允许空值在编辑过程中存在，但保存时如果为空则设为默认值
			// 注意：这里直接保存用户输入的值，包括空字符串
			updateNodeData(id || "", {
				nodeName: newTitle,
			});
		},
		[id, updateNodeData],
	);

	// 关闭面板处理函数
	const handleClosePanel = useCallback(
		() => {
			setNodes((nodes) => nodes.map((node) => ({
				...node,
				selected: node.id === id ? false : node.selected,
			})));
			setIsShow(false);
			setSelectedNodeId(undefined);
		},
		[id, setNodes, setSelectedNodeId],
	);

	// 面板宽度状态
	const panelWidthRef = useRef(400);
	const startXRef = useRef(0);
	const startWidthRef = useRef(0);
	const isResizingRef = useRef(false);

	const applyPanelWidth = useCallback((width: number) => {
		panelWidthRef.current = width;
		if (panelRef.current) {
			panelRef.current.style.width = `${width}px`;
		}
	}, []);

	// 最小和最大宽度
	const MIN_WIDTH = 375;
	const MAX_WIDTH = 600;

	// 开始拖拽缩放
	const handleResizeMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizingRef.current) return;

			const deltaX = startXRef.current - e.clientX;
			const newWidth = Math.max(
				MIN_WIDTH,
				Math.min(MAX_WIDTH, startWidthRef.current + deltaX),
			);
			applyPanelWidth(newWidth);
		},
		[applyPanelWidth, MAX_WIDTH, MIN_WIDTH],
	);

	const handleResizeEnd = useCallback(() => {
		if (!isResizingRef.current) return;
		isResizingRef.current = false;
		document.removeEventListener("mousemove", handleResizeMove);
		document.removeEventListener("mouseup", handleResizeEnd);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	}, [handleResizeMove]);

	const handleResizeStart = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			if (isResizingRef.current) return;
			isResizingRef.current = true;
			startXRef.current = e.clientX;
			startWidthRef.current = panelWidthRef.current;

			document.addEventListener("mousemove", handleResizeMove);
			document.addEventListener("mouseup", handleResizeEnd);
			document.body.style.cursor = "ew-resize";
			document.body.style.userSelect = "none";
		},
		[handleResizeMove, handleResizeEnd],
	);

	useEffect(() => {
		return () => {
			document.removeEventListener("mousemove", handleResizeMove);
			document.removeEventListener("mouseup", handleResizeEnd);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [handleResizeMove, handleResizeEnd]);

	useEffect(() => {
		applyPanelWidth(panelWidthRef.current);
	}, [applyPanelWidth]);

	return (
		// 是否显示面板
		id && isShow && (
			// 面板容器
			<div
				ref={panelRef}
				className="absolute right-4 top-4 bottom-4 z-50 flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
				style={{
					width: `${panelWidthRef.current}px`,
				}}
			>
				{/* 左侧拖拽区域 */}
				<div
					className="absolute left-0 top-0 w-2 h-full flex items-center justify-center group"
					style={{
						zIndex: 10,
					}}
				>
					{/* 拖拽图标 */}
					{/* 
                    opacity-0 透明度为0
                    group-hover:opacity-100 悬停时透明度为100
                    transition-opacity 过渡效果
                    cursor-ew-resize 鼠标样式为可拖拽
                    p-1 内边距
                    rounded 圆角
                    bg-gray-100 背景颜色
                    */}
					<div
						className="flex items-center w-10 h-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize p-1 rounded bg-gray-100 hover:bg-gray-400"
						onMouseDown={handleResizeStart}
					>
						<GripVertical size={14} className="text-black-500" />
					</div>
				</div>

				{/* 标题区域 - 固定高度 */}
				<div className="flex-shrink-0 p-2 pb-0">
					{nodeConfig && (
						<BasePanelHeader
							id={id}
							title={panelTitle}
							setTitle={handleSetTitle}
							isEditingTitle={isEditingTitle}
							setIsEditingTitle={setIsEditingTitle}
							onClosePanel={handleClosePanel}
							icon={nodeConfig.iconName || getNodeIconName(nodeType as NodeType)} 
							iconBackgroundColor={nodeConfig.iconBackgroundColor || getNodeDefaultColor(nodeType as NodeType)}
							/>
					)}
				</div>

				{/* 交易模式切换器 - 弹性高度 */}
				<div className="flex-1 min-h-0 p-2 pt-4">
					<TradeModeSwitcher
						id={id}
						settingPanel={settingPanel} />
				</div>
				{/* <div className="w-full mt-2">
                    <BasePanelFooter 
                        tradeMode={tradeMode}
                        onLiveModeSave={onLiveModeSave}
                        onBacktestModeSave={onBacktestModeSave}
                        onSimulationModeSave={onSimulationModeSave}
                        onCancel={onCancel}
                    />
                </div> */}
			</div>
		)
	);
};

export default memo(BasePanel);
