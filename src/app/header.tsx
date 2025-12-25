import {
	ChevronLeft,
	ChevronRight,
	Minus,
	Settings,
	SidebarIcon,
	Square,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ConfirmBox from "@/components/confirm-box";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigationGuardStore } from "@/store/use-navigation-guard-store";
import { usePlatform } from "@/store/use-platform";
import useSidebarToggleStore from "@/store/use-sidebar-toggle-store";

// import type { useHeaderStore } from "@/store/use-header-store";

// Declare Electron's require
const { ipcRenderer } = window.require
	? window.require("electron")
	: { ipcRenderer: null };

// Extend CSSProperties type to support WebKit drag properties
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
	const location = useLocation();
	const getActiveGuard = useNavigationGuardStore((state) => state.getActiveGuard);
	const [showAlert, setShowAlert] = useState(false);
	const [pendingNavigation, setPendingNavigation] = useState<number | null>(null);
	const [activeGuard, setActiveGuard] = useState<ReturnType<typeof getActiveGuard>>(null);
	const [isSaving, setIsSaving] = useState(false);

	// Check if can go back (location.key is "default" for the initial page)
	const canGoBack = location.key !== "default";

	const handleNavigation = useCallback(
		(direction: number) => {
			const guard = getActiveGuard();
			if (guard) {
				setActiveGuard(guard);
				setPendingNavigation(direction);
				setShowAlert(true);
			} else {
				navigate(direction);
			}
		},
		[getActiveGuard, navigate],
	);

	const handleDiscardAndLeave = useCallback(() => {
		setShowAlert(false);
		if (pendingNavigation !== null) {
			navigate(pendingNavigation);
		}
		setPendingNavigation(null);
		setActiveGuard(null);
	}, [navigate, pendingNavigation]);

	const handleSaveAndLeave = useCallback(async () => {
		if (activeGuard?.onSave) {
			setIsSaving(true);
			try {
				await activeGuard.onSave();
				setShowAlert(false);
				if (pendingNavigation !== null) {
					navigate(pendingNavigation);
				}
			} finally {
				setIsSaving(false);
				setPendingNavigation(null);
				setActiveGuard(null);
			}
		}
	}, [activeGuard, navigate, pendingNavigation]);

	const handleCancel = useCallback(() => {
		setShowAlert(false);
		setPendingNavigation(null);
		setActiveGuard(null);
	}, []);

	return (
		<>
			<AlertDialog open={showAlert} onOpenChange={setShowAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{activeGuard?.title || t("common.unsavedChanges")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{activeGuard?.description || t("common.unsavedChangesDescription")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCancel}>
							{t("common.cancel")}
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-white hover:bg-destructive/90"
							onClick={handleDiscardAndLeave}
						>
							{t("common.discardAndLeave")}
						</AlertDialogAction>
						{activeGuard?.onSave && (
							<AlertDialogAction onClick={handleSaveAndLeave} disabled={isSaving}>
								{isSaving ? t("common.saving") : t("common.saveAndLeave")}
							</AlertDialogAction>
						)}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<div className="flex items-center gap-0.5">
				{/* Go back */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleNavigation(-1)}
							disabled={!canGoBack}
							className="w-6 h-6 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
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
							onClick={() => handleNavigation(1)}
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
		</>
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
		<div className="flex items-center gap-1">
			{/* Minimize */}
			<Button variant="ghost" size="icon" onClick={handleMinimize} className="w-6 h-6">
				<Minus className="w-4 h-4" />
			</Button>
			{/* Maximize */}
			<Button variant="ghost" size="icon" onClick={handleMaximize} className="w-6 h-6">
				<Square className="w-4 h-4" />
			</Button>
			{/* Close - wrapped with confirm dialog */}
			<ConfirmBox
				title={t("desktop.header.confirmQuit")}
				description={t("desktop.header.confirmQuitDescription")}
				confirmText={t("desktop.header.confirm")}
				cancelText={t("desktop.header.cancel")}
				onConfirm={handleConfirmQuit}
			>
				<Button variant="ghost" size="icon" className="w-6 h-6 hover:text-red-400">
					<X className="w-4 h-4" />
				</Button>
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
				<div className={cn("flex items-center gap-2", isMac && !isFullScreen && "pl-[70px]")}>
					<div className="flex items-center" style={{ WebkitAppRegion: "no-drag" }}>
						<SidebarTrigger />
					</div>
					<div className="flex items-center" style={{ WebkitAppRegion: "no-drag" }}>
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
						<div className="mr-2" style={{ WebkitAppRegion: "no-drag" }}>
							<WindowControl />
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
