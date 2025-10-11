import { Minus, Square, X } from "lucide-react";
import type React from "react";
import ConfirmBox from "@/components/confirm-box";
import { Button } from "@/components/ui/button";

// 声明electron的require
const { ipcRenderer } = window.require
	? window.require("electron")
	: { ipcRenderer: null };

// 扩展CSSProperties类型以支持WebKit拖拽属性
declare module "react" {
	interface CSSProperties {
		WebkitAppRegion?: "drag" | "no-drag";
	}
}

interface BacktestWindowHeaderProps {
	strategyName: string;
	onQuit: () => Promise<boolean>;
}

// 窗口控制
function WindowControl({ onQuit }: { onQuit: () => Promise<boolean> }) {
	const handleMinimize = () => {
		if (ipcRenderer) {
			ipcRenderer.invoke("minimize-window");
		}
	};

	const handleMaximize = () => {
		if (ipcRenderer) {
			ipcRenderer.invoke("maximize-window");
		}
	};

	const handleConfirmQuit = async () => {
		if (ipcRenderer) {
			try {
				// 调用传入的回调函数
				const canClose = await onQuit();
				if (canClose) {
					// 关闭窗口
					ipcRenderer.invoke("close-window");
				}
			} catch (error) {
				console.error("处理退出确认失败:", error);
				// 发生错误时也关闭窗口
				ipcRenderer.invoke("close-window");
			}
		}
	};

	return (
		<div className="flex items-center gap-0.5">
			{/* 最小化 */}
			<Button variant="ghost" size="icon" onClick={handleMinimize}>
				<Minus className="w-3 h-3" />
			</Button>
			{/* 最大化 */}
			<Button variant="ghost" size="icon" onClick={handleMaximize}>
				<Square className="w-3 h-3" />
			</Button>
			{/* 关闭 - 使用确认框包装 */}
			<ConfirmBox
				title="确认关闭"
				description="确认关闭回测窗口吗？这将停止当前策略运行，所有未保存的更改可能会丢失。"
				confirmText="确认"
				cancelText="取消"
				onConfirm={handleConfirmQuit}
			>
				<Button variant="ghost" size="icon" className="hover:text-red-400">
					<X className="w-3 h-3" />
				</Button>
			</ConfirmBox>
		</div>
	);
}

const BacktestWindowHeader: React.FC<BacktestWindowHeaderProps> = ({
	strategyName,
	onQuit,
}) => {
	return (
		<header className="flex sticky h-10 w-full items-center bg-background">
			<div
				className="flex w-full items-center justify-between gap-2 pl-4"
				style={{ WebkitAppRegion: "drag" }}
			>
				<div style={{ WebkitAppRegion: "no-drag" }}>
					<h1 className="text-lg font-bold">{strategyName}</h1>
				</div>
				<div
					className="flex items-center gap-2"
					style={{ WebkitAppRegion: "no-drag" }}
				>
					<WindowControl onQuit={onQuit} />
				</div>
			</div>
		</header>
	);
};

export default BacktestWindowHeader;
