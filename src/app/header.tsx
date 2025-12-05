import {
	ChevronLeft,
	ChevronRight,
	Minus,
	Settings,
	SidebarIcon,
	Square,
	X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import ConfirmBox from "@/components/confirm-box";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/store/use-platform";
import useSidebarToggleStore from "@/store/use-sidebar-toggle-store";

// import type { useHeaderStore } from "@/store/use-header-store";

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

// Sidebar trigger button
function SidebarTrigger() {
	const { t } = useTranslation();
	const { setOpen } = useSidebar();
	const { isSidebarOpen, setIsSidebarOpen } = useSidebarToggleStore();
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => {
						setOpen(!isSidebarOpen);
						setIsSidebarOpen(!isSidebarOpen);
					}}
					className="w-6 h-6 cursor-pointer"
				>
					<SidebarIcon />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				{t("desktop.header.toggleSidebar")}
			</TooltipContent>
		</Tooltip>
	);
}

// Navigation arrows
function RouteArrow() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	return (
		<div className="flex items-center gap-0.5">
			{/* Go back */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							navigate(-1);
						}}
						className="w-6 h-6 cursor-pointer"
					>
						<ChevronLeft />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					{t("desktop.header.goBack")}
				</TooltipContent>
			</Tooltip>
			{/* Go forward */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							navigate(1);
						}}
						className="w-6 h-6 cursor-pointer"
					>
						<ChevronRight />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					{t("desktop.header.goForward")}
				</TooltipContent>
			</Tooltip>
		</div>
	);
}

function AppTitle() {
	// const { centerContent } = useHeaderStore();

	return (
		<div className="flex items-center gap-2">
			{/* {centerContent ? (
				<div className="flex items-center">{centerContent}</div>
			) : ( */}
			<h1 className="text-md font-bold select-none cursor-default">
				Star River
			</h1>
			{/* )} */}
		</div>
	);
}

// Window controls (Windows only)
function WindowControl() {
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

	const handleConfirmQuit = () => {
		if (ipcRenderer) {
			ipcRenderer.invoke("close-window");
		}
	};

	return (
		<div className="flex items-center gap-0.5">
			{/* Minimize */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon" onClick={handleMinimize}>
						<Minus className="w-3 h-3" />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					{t("desktop.header.minimize")}
				</TooltipContent>
			</Tooltip>
			{/* Maximize */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon" onClick={handleMaximize}>
						<Square className="w-3 h-3" />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					{t("desktop.header.maximize")}
				</TooltipContent>
			</Tooltip>
			{/* Close - wrapped with confirm dialog */}
			<ConfirmBox
				title={t("desktop.header.confirmQuit")}
				description={t("desktop.header.confirmQuitDescription")}
				confirmText={t("desktop.header.confirm")}
				cancelText={t("desktop.header.cancel")}
				onConfirm={handleConfirmQuit}
			>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" className="hover:text-red-400">
							<X className="w-3 h-3" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						{t("desktop.header.close")}
					</TooltipContent>
				</Tooltip>
			</ConfirmBox>
		</div>
	);
}

// Settings button
function SettingsButton() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/setting")}
					className="w-6 h-6 cursor-pointer"
				>
					<Settings className="w-4 h-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				{t("desktop.header.settings")}
			</TooltipContent>
		</Tooltip>
	);
}

export function AppHeader() {
	const { isMac, isFullScreen } = usePlatform();
	// macOS 非全屏时需要左边距避开红绿灯按钮
	const needsTrafficLightPadding = isMac && !isFullScreen;

	return (
		<header
			className="flex sticky h-8 w-full items-center bg-background border-b border-gray-200"
			style={{ WebkitAppRegion: "drag" }}
		>
			<div
				className="grid w-full items-center gap-2 pl-4"
				style={{
					WebkitAppRegion: "drag",
					gridTemplateColumns: "1fr auto 1fr",
				}}
			>
				{/* macOS: add left padding to avoid system traffic light buttons (except in fullscreen) */}
				<div className={cn("flex items-center gap-2", needsTrafficLightPadding && "pl-[70px]")}>
					<div style={{ WebkitAppRegion: "no-drag" }}>
						<SidebarTrigger />
					</div>
					<div style={{ WebkitAppRegion: "no-drag" }}>
						<RouteArrow />
					</div>
				</div>
				<AppTitle />
				{/* Right side: Settings button + Windows window controls */}
				<div className="flex items-center gap-2 justify-end">
					<div style={{ WebkitAppRegion: "no-drag" }}>
						<SettingsButton />
					</div>
					{!isMac && (
						<div style={{ WebkitAppRegion: "no-drag" }}>
							<WindowControl />
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
