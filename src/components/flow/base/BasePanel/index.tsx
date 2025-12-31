import { type PanelProps, useReactFlow } from "@xyflow/react";
import { GripVertical } from "lucide-react";
import {
	memo,
	type ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	getNodeDefaultColor,
	getNodeIconName,
	type NodeData,
	type NodeType,
} from "@/types/node";
import BasePanelHeader from "./header";
import TradeModeSwitcher, {
	type SettingPanelProps,
} from "./trade-mode-switcher";

interface BasePanelProps extends PanelProps {
	id: string; // Node id
	setSelectedNodeId: (id: string | undefined) => void;
	children: ReactElement; // Panel content
	tradeMode: string; // Trading mode
	settingPanel: SettingPanelProps; // Settings panel
}

const BasePanel: React.FC<BasePanelProps> = ({
	id,
	setSelectedNodeId,
	settingPanel,
}) => {
	const panelRef = useRef<HTMLDivElement>(null);
	// Get ReactFlow instance
	const { updateNodeData, setNodes, getNode } = useReactFlow();
	const node = getNode(id);
	const nodeData = node?.data as NodeData;
	const nodeType = node?.type;
	const nodeConfig = nodeData?.nodeConfig;
	// Panel title
	const [panelTitle, setPanelTitle] = useState(
		nodeData?.nodeName || "未命名节点",
	);

	// Whether to show panel
	const [isShow, setIsShow] = useState(true);

	// Whether editing title
	const [isEditingTitle, setIsEditingTitle] = useState(false);

	// Listen for data.nodeName changes, update panel title
	useEffect(() => {
		// Only sync external data changes when not in edit mode
		if (!isEditingTitle) {
			setPanelTitle(nodeData?.nodeName || "未命名节点");
		}
	}, [nodeData, isEditingTitle]);

	// Custom title update function, also updates node data
	const handleSetTitle = useCallback(
		(newTitle: string) => {
			setPanelTitle(newTitle);
			// Allow empty values during editing, but set to default if empty when saving
			// Note: This directly saves user input values, including empty strings
			updateNodeData(id || "", {
				nodeName: newTitle,
			});
		},
		[id, updateNodeData],
	);

	// Close panel handler function
	const handleClosePanel = useCallback(() => {
		setNodes((nodes) =>
			nodes.map((node) => ({
				...node,
				selected: node.id === id ? false : node.selected,
			})),
		);
		setIsShow(false);
		setSelectedNodeId(undefined);
	}, [id, setNodes, setSelectedNodeId]);

	// Panel width state
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

	// Minimum and maximum width
	const MIN_WIDTH = 375;
	const MAX_WIDTH = 600;

	// Start drag resize
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
		// Whether to show panel
		id &&
		isShow && (
			// Panel container
			<div
				ref={panelRef}
				className="absolute right-4 top-4 bottom-4 z-50 flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
				style={{
					width: `${panelWidthRef.current}px`,
				}}
			>
				{/* Left drag area */}
				<div
					className="absolute left-0 top-0 w-2 h-full flex items-center justify-center group"
					style={{
						zIndex: 10,
					}}
				>
					{/* Drag icon */}
					{/*
                    opacity-0 - opacity is 0
                    group-hover:opacity-100 - opacity is 100 on hover
                    transition-opacity - transition effect
                    cursor-ew-resize - cursor style for draggable
                    p-1 - padding
                    rounded - rounded corners
                    bg-gray-100 - background color
                    */}
					<div
						className="flex items-center w-10 h-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize p-1 rounded bg-gray-100 hover:bg-gray-400"
						onMouseDown={handleResizeStart}
					>
						<GripVertical size={14} className="text-black-500" />
					</div>
				</div>

				{/* Title area - fixed height */}
				<div className="shrink-0 p-2 pb-0">
					{nodeConfig && (
						<BasePanelHeader
							id={id}
							title={panelTitle}
							setTitle={handleSetTitle}
							isEditingTitle={isEditingTitle}
							setIsEditingTitle={setIsEditingTitle}
							onClosePanel={handleClosePanel}
							icon={
								nodeConfig.iconName || getNodeIconName(nodeType as NodeType)
							}
							iconBackgroundColor={
								nodeConfig.iconBackgroundColor ||
								getNodeDefaultColor(nodeType as NodeType)
							}
						/>
					)}
				</div>

				{/* Trade mode switcher - flexible height */}
				<div className="flex-1 min-h-0 p-2 pt-4">
					<TradeModeSwitcher id={id} settingPanel={settingPanel} />
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
