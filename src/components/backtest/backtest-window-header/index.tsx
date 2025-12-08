import { Minus, Square, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import ConfirmBox from "@/components/confirm-box";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/store/use-platform";
import { useTranslation } from "react-i18next";

// Declare electron's require
const { ipcRenderer } = window.require
	? window.require("electron")
	: { ipcRenderer: null };

// Extend CSSProperties type to support WebKit drag properties
declare module "react" {
	interface CSSProperties {
		WebkitAppRegion?: "drag" | "no-drag";
	}
}

interface BacktestWindowHeaderProps {
	strategyName: string;
	onQuit: () => Promise<boolean>;
}

// Window control
function WindowControl({ onQuit }: { onQuit: () => Promise<boolean> }) {
	const { t } = useTranslation();
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
				// Call the passed callback function
				const canClose = await onQuit();
				if (canClose) {
					// Close window
					ipcRenderer.invoke("close-window");
				}
			} catch (error) {
				console.error("处理退出确认失败:", error);
				// Close window even if error occurs
				ipcRenderer.invoke("close-window");
			}
		}
	};

	return (
		<div className="flex items-center gap-0.5">
			{/* Minimize */}
			<Button variant="ghost" size="icon" onClick={handleMinimize}>
				<Minus className="w-3 h-3" />
			</Button>
			{/* Maximize */}
			<Button variant="ghost" size="icon" onClick={handleMaximize}>
				<Square className="w-3 h-3" />
			</Button>
			{/* Close - wrapped with confirmation box */}
			<ConfirmBox
				title={t("common.confirmQuit")}
				description={t("desktop.backtestPage.confirmQuitDescription")}
				confirmText={t("common.confirm")}
				cancelText={t("common.cancel")}
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
	const { isMac } = usePlatform();
	const [isFullScreen, setIsFullScreen] = useState(false);

	useEffect(() => {
		if (!ipcRenderer) return;

		const handleFullscreenChange = (_: unknown, fullScreen: boolean) => {
			setIsFullScreen(fullScreen);
		};

		ipcRenderer.on("fullscreen-change", handleFullscreenChange);
		return () => {
			ipcRenderer.removeListener("fullscreen-change", handleFullscreenChange);
		};
	}, []);

	return (
		<header className="flex sticky h-8 w-full items-center bg-background">
			<div
				className="flex w-full items-center justify-between gap-2 pl-4"
				style={{ WebkitAppRegion: "drag" }}
			>
				{/* macOS: add left padding to avoid system traffic light buttons */}
				<div
					className={cn(isMac && !isFullScreen && "pl-[70px]")}
					style={{ WebkitAppRegion: "no-drag" }}
				>
					<h1 className="text-lg font-bold">{strategyName}</h1>
				</div>
				{/* Windows only: render custom window controls */}
				{!isMac && (
					<div
						className="flex items-center gap-2"
						style={{ WebkitAppRegion: "no-drag" }}
					>
						<WindowControl onQuit={onQuit} />
					</div>
				)}
			</div>
		</header>
	);
};

export default BacktestWindowHeader;
