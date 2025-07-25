import React, { useState, useRef, useCallback, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NodeListPanel from "./node-list-panel";

const SHOW_PANEL_TIME = 200;

// 添加节点按钮组件
const AddNodeButton: React.FC = () => {
	const [showPanel, setShowPanel] = useState(false);
	const [isPinned, setIsPinned] = useState(false);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// 处理按钮鼠标进入
	const handleButtonMouseEnter = useCallback(() => {
		// 清除之前的定时器
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}

		// 设置延迟显示
		hoverTimeoutRef.current = setTimeout(() => {
			setShowPanel(true);
		}, SHOW_PANEL_TIME);
	}, []);

	// 处理整个控制区域鼠标离开
	const handleControlAreaMouseLeave = useCallback(() => {
		// 清除显示定时器
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}

		// 如果没有被点击常驻，则隐藏面板
		if (!isPinned) {
			setShowPanel(false);
		}
	}, [isPinned]);

	// 处理面板区域鼠标进入
	const handlePanelMouseEnter = useCallback(() => {
		// 清除可能存在的隐藏定时器
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}
		// 确保面板显示
		setShowPanel(true);
	}, []);

	// 处理点击
	const handleClick = useCallback(() => {
		// 清除悬停定时器
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}

		// 立即显示面板并设置为常驻
		setShowPanel(true);
		setIsPinned(true);
	}, []);

	// 处理面板关闭
	const handleClosePanel = useCallback(() => {
		setShowPanel(false);
		setIsPinned(false);
	}, []);

	// 清理定时器
	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className="relative" onMouseLeave={handleControlAreaMouseLeave}>
			{/* 添加节点按钮 */}
			<div className="relative" onMouseEnter={handleButtonMouseEnter}>
				<Button
					variant="ghost"
					size="icon"
					className="w-8 h-8 p-0 bg-white text-xs"
					onClick={handleClick}
				>
					<Plus className="w-6 h-6" />
				</Button>
			</div>

			{/* 节点列表面板 - 绝对定位到按钮旁边 */}
			{showPanel && (
				<div
					className="absolute left-full top-[-124px] ml-3 z-10"
					onMouseEnter={handlePanelMouseEnter}
				>
					<NodeListPanel />
					{/* 常驻状态下的关闭按钮 */}
					{isPinned && (
						<button
							onClick={handleClosePanel}
							className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600 text-sm"
							title="关闭面板"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>
			)}

			{/* 不可见的连接区域，填补按钮和面板之间的间隙 */}
			{showPanel && (
				<div
					className="absolute left-full top-0 w-3 h-8 z-0"
					onMouseEnter={handlePanelMouseEnter}
				/>
			)}
		</div>
	);
};

export default AddNodeButton;
