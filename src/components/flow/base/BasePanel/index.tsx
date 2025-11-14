import { type PanelProps, useReactFlow } from "@xyflow/react";
import { GripVertical } from "lucide-react";
import {
	type ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type { NodeData } from "@/types/node/index";
import BasePanelHeader from "./header";
import TradeModeSwitcher, {
	type SettingPanelProps,
} from "./trade-mode-switcher";

interface BasePanelProps extends PanelProps {
	id: string | undefined; // 节点id
	data: NodeData | undefined; // 节点数据
	setSelectedNodeId: (id: string | undefined) => void;
	children: ReactElement; // 面板内容
	tradeMode: string; // 交易模式
	settingPanel: SettingPanelProps; // 设置面板
}

const BasePanel: React.FC<BasePanelProps> = ({
	id,
	data,
	setSelectedNodeId,
	settingPanel,
}) => {
	const panelRef = useRef<HTMLDivElement>(null);
	// 获取ReactFlow实例
	const { updateNodeData, setNodes } = useReactFlow();

	// 面板标题
	const [panelTitle, setPanelTitle] = useState(data?.nodeName || "未命名节点");

	// 是否显示面板
	const [isShow, setIsShow] = useState(true);

	// 是否在编辑标题
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	// 是否展示面板 - 与外部的isShow状态同步
	// const [isShowPanel, setIsShowPanel] = useState(isShow);

	// 监听外部isShow变化，同步内部状态
	// useEffect(() => {
	// 	setIsShowPanel(isShow);
	// }, [isShow]);

	// 监听data.nodeName变化，更新面板标题
	useEffect(() => {
		// 只有在不是编辑状态时才同步外部数据变化
		if (!isEditingTitle) {
			setPanelTitle(data?.nodeName || "未命名节点");
		}
	}, [data?.nodeName, isEditingTitle]);

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
			console.log("handleClosePanel", id);
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
	const [panelWidth, setPanelWidth] = useState(400);
	const [isResizing, setIsResizing] = useState(false);
	const [startX, setStartX] = useState(0);
	const [startWidth, setStartWidth] = useState(0);

	// 最小和最大宽度
	const MIN_WIDTH = 375;
	const MAX_WIDTH = 600;

	// 开始拖拽缩放
	const handleResizeStart = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			setIsResizing(true);
			setStartX(e.clientX);
			setStartWidth(panelWidth);
		},
		[panelWidth],
	);

	// 处理拖拽缩放
	const handleResizeMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return;

			const deltaX = startX - e.clientX; // 注意这里是减法，因为左拖拽时X减小但宽度增大
			const newWidth = Math.max(
				MIN_WIDTH,
				Math.min(MAX_WIDTH, startWidth + deltaX),
			);
			setPanelWidth(newWidth);
		},
		[isResizing, startX, startWidth],
	);

	// 结束拖拽缩放
	const handleResizeEnd = useCallback(() => {
		setIsResizing(false);
	}, []);

	// 添加全局鼠标事件监听
	useEffect(() => {
		if (isResizing) {
			document.addEventListener("mousemove", handleResizeMove);
			document.addEventListener("mouseup", handleResizeEnd);
			document.body.style.cursor = "ew-resize";
			document.body.style.userSelect = "none";
		}

		return () => {
			document.removeEventListener("mousemove", handleResizeMove);
			document.removeEventListener("mouseup", handleResizeEnd);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isResizing, handleResizeMove, handleResizeEnd]);

	return (
		// 是否显示面板
		id && isShow && (
			// 面板容器
			<div
				ref={panelRef}
				className="absolute right-4 top-4 bottom-4 z-50 flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
				style={{
					width: `${panelWidth}px`,
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
					<BasePanelHeader
						title={panelTitle}
						setTitle={handleSetTitle}
						isEditingTitle={isEditingTitle}
						setIsEditingTitle={setIsEditingTitle}
						onClosePanel={handleClosePanel}
						icon={settingPanel.icon}
						iconBackgroundColor={settingPanel.iconBackgroundColor}
					/>
				</div>

				{/* 交易模式切换器 - 弹性高度 */}
				<div className="flex-1 min-h-0 p-2 pt-4">
					<TradeModeSwitcher
						id={id}
						data={data}
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

export default BasePanel;
