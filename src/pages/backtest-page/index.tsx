import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
// import { stopStrategy } from "@/service/strategy"; // Commented out - no longer stops strategy

import { useBacktestChartConfigStore } from "@/store/use-backtest-chart-config-store";
import { useBacktestStrategyControlStore } from "@/store/use-backtest-strategy-control-store";
import BacktestWindowHeader from "../../components/backtest/backtest-window-header";
import ChartContainer from "./components/chart-container";
// import useBacktestStrategySSE from "../../hooks/sse/use-backtest-strategy-sse";
import StrategyDashboard, {
	type StrategyDashboardRef,
} from "./components/strategy-dashboard";
import { calculateDashboardSize, getDashboardPanelConfig } from "./utils";

export default function BacktestPage() {
	const navigate = useNavigate();
	const params = useParams<{ strategyId: string }>();
	const [searchParams] = useSearchParams();
	const strategyName = searchParams.get("strategyName") || "";

	// Use zustand stores
	const {
		chartConfig,
		isLoading,
		configLoaded,
		strategyId,
		setStrategyId,
		loadChartConfig,
	} = useBacktestChartConfigStore();

	// Subscribe to required states and methods separately
	const isRunning = useBacktestStrategyControlStore((state) => state.isRunning);
	const onStop = useBacktestStrategyControlStore((state) => state.onStop);
	const setControlStrategyId = useBacktestStrategyControlStore(
		(state) => state.setStrategyId,
	);
	const startEventListening = useBacktestStrategyControlStore(
		(state) => state.startEventListening,
	);
	const stopEventListening = useBacktestStrategyControlStore(
		(state) => state.stopEventListening,
	);

	// Get strategyId from URL parameters
	const getStrategyIdFromParams = useCallback((): number | null => {
		if (params.strategyId) {
			const id = parseInt(params.strategyId, 10);
			return !Number.isNaN(id) && id > 0 ? id : null;
		}
		return null;
	}, [params]);

	const [activeTab, setActiveTab] = useState<string | undefined>(undefined); // Currently selected tab
	const [lastActiveTab, setLastActiveTab] = useState<string | undefined>(
		undefined,
	); // Previously selected tab
	const [isDashboardExpanded, setIsDashboardExpanded] =
		useState<boolean>(false); // Whether dashboard is in expanded state
	const [expandTrigger, setExpandTrigger] = useState<"tab" | "drag" | null>(
		null,
	); // Expand trigger method
	const dashboardPanelRef = useRef<ImperativePanelHandle>(null); // Dashboard panel reference
	const chartContainerPanelRef = useRef<ImperativePanelHandle>(null); // Chart container panel reference
	const strategyDashboardRef = useRef<StrategyDashboardRef>(null); // Strategy panel reference
	const isValidStrategyId = strategyId !== null;

	// Calculate minimum height percentage for control bar
	const initialSize = calculateDashboardSize();
	const [dashboardMinSize, setDashboardMinSize] = useState<number>(initialSize);
	const [dashboardCollapsedSize, setDashboardCollapsedSize] =
		useState<number>(initialSize);
	const [dashboardDefaultSize, setDashboardDefaultSize] =
		useState<number>(initialSize);

	// Update strategyId in store when URL parameters change
	useEffect(() => {
		const urlStrategyId = getStrategyIdFromParams();
		if (urlStrategyId !== strategyId) {
			setStrategyId(urlStrategyId);
			setControlStrategyId(urlStrategyId);
		}
	}, [
		getStrategyIdFromParams,
		setStrategyId,
		setControlStrategyId,
		strategyId,
	]);

	// Reload configuration when strategyId changes
	useEffect(() => {
		if (strategyId) {
			loadChartConfig(strategyId);
		}
	}, [strategyId, loadChartConfig]);

	// Window size monitoring
	useEffect(() => {
		const handleResize = () => {
			// Get new panel configuration
			const config = getDashboardPanelConfig();

			// Set new sizes
			setDashboardMinSize(config.minSize);
			setDashboardCollapsedSize(config.collapsedSize);
			setDashboardDefaultSize(config.defaultSize);

			// If panel exists and is not expanded, ensure its size is correct
			if (dashboardPanelRef.current && !isDashboardExpanded) {
				const currentSize = dashboardPanelRef.current.getSize();

				// Force adjustment to exact minimum size to ensure it fits the bottom
				if (Math.abs(currentSize - config.minSize) > 0.1) {
					dashboardPanelRef.current.resize(config.minSize);
				}
			}
		};

		// Initial calculation
		handleResize();

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Clean up event listener
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [isDashboardExpanded]);

	// Listen for kline playback completion
	useEffect(() => {
		if (isRunning) {
			startEventListening();
		} else {
			stopEventListening();
		}

		// Clean up on component unmount
		return () => {
			stopEventListening();
		};
	}, [isRunning, startEventListening, stopEventListening]);

	// Handle quit confirmation
	const handleQuit = async () => {
		try {
			// Commented out stop strategy logic - only close window, don't stop strategy
			// if (strategyId) {
			// 	console.log("Stopping strategy...");
			// 	await stopStrategy(strategyId);
			// 	console.log("Strategy stopped");
			// }
			return true; // Return true to indicate window can be closed
		} catch (error) {
			console.error("Failed to close window:", error);
			return true; // Close window even if failed
		}
	};

	// If no valid strategyId is provided, display error page
	if (!isValidStrategyId) {
		return (
			<div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
				<Alert variant="destructive" className="max-w-md mb-4">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Missing or invalid strategy ID parameter. Please start backtest correctly from strategy page
					</AlertDescription>
				</Alert>
				<Button
					variant="outline"
					onClick={() => navigate("/")}
					className="flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Return to Strategy List
				</Button>
			</div>
		);
	}

	// Display during configuration loading
	if (isLoading || !configLoaded) {
		return (
			<div className="h-screen flex flex-col overflow-hidden bg-gray-100">
				<BacktestWindowHeader
					strategyName={strategyName || `Strategy ${strategyId}`}
					onQuit={handleQuit}
				/>
				<div className="flex items-center justify-center h-full">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-8 w-8 animate-spin" />
						<p className="text-muted-foreground">Loading chart configuration...</p>
					</div>
				</div>
			</div>
		);
	}

	// Handle data cleanup on stop
	const handleClearData = () => {
		strategyDashboardRef.current?.clearOrderRecords();
		strategyDashboardRef.current?.clearPositionRecords();
		strategyDashboardRef.current?.clearTransactionRecords();
		strategyDashboardRef.current?.clearRunningLogs();
		strategyDashboardRef.current?.clearVariableEvents();
		strategyDashboardRef.current?.clearPerformanceData();
	};

	// Handle panel expansion
	const handlePanelExpand = () => {
		setIsDashboardExpanded(true);

		// If no trigger identifier (drag expand) and there's a previous tab, restore it
		if (expandTrigger === "drag" && lastActiveTab) {
			setActiveTab(lastActiveTab);
		}

		if (expandTrigger === "drag" && !lastActiveTab) {
			setActiveTab("profit");
		}

		// Reset trigger identifier
		setExpandTrigger(null);
	};

	// Handle panel collapse
	const handleOnPanelCollapse = () => {
		setIsDashboardExpanded(false);
		setLastActiveTab(activeTab);
		setActiveTab(undefined);
		setExpandTrigger(null);
	};

	// Handle tab switching
	const handleTabChange = (value: string) => {
		setActiveTab(value); // Set currently selected tab

		// Only need to expand when dashboard is not expanded and tab is clicked
		if (!isDashboardExpanded && dashboardPanelRef.current) {
			setExpandTrigger("tab"); // Mark as tab-triggered expansion
			const minExpandedSize = 50; // Minimum size after expansion
			dashboardPanelRef.current.resize(minExpandedSize);
		}
		// Reset trigger identifier
		setExpandTrigger(null);
	};

	// Handle collapse button click
	const handleCollapsePanel = () => {
		if (dashboardPanelRef.current) {
			setLastActiveTab(activeTab); // Save current tab before collapsing
			dashboardPanelRef.current.collapse(); // Collapse to minimum size, will trigger onCollapse callback
		}
	};

	const handlePanelPointerUp = () => setExpandTrigger(null);
	const handlePanelPointerDown = () => setExpandTrigger("drag");

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-gray-100">
			<div className="flex-shrink-0 border-b ">
				<BacktestWindowHeader
					strategyName={strategyName || `Strategy ${strategyId}`}
					onQuit={handleQuit}
				/>
			</div>

			{/* Backtest window content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				<PanelGroup direction="vertical" className="flex-1">
					<Panel
						defaultSize={100 - dashboardDefaultSize}
						minSize={30}
						ref={chartContainerPanelRef}
					>
						<div className="h-full  bg-white overflow-hidden">
							<ChartContainer
								strategyChartConfig={chartConfig}
								strategyId={strategyId}
							/>
						</div>
					</Panel>
					<PanelResizeHandle
						className="h-1 hover:bg-gray-400"
						onPointerUp={handlePanelPointerUp}
						onPointerDown={handlePanelPointerDown}
					/>
					<Panel
						defaultSize={dashboardDefaultSize}
						minSize={dashboardMinSize}
						ref={dashboardPanelRef}
						collapsedSize={dashboardCollapsedSize}
						collapsible={true}
						onExpand={handlePanelExpand}
						onCollapse={handleOnPanelCollapse}
					>
						<div className="h-full bg-white border-l border-t border-r border-border shadow-md flex flex-col overflow-hidden">
							<StrategyDashboard
								ref={strategyDashboardRef}
								strategyId={strategyId}
								onStop={() => onStop(handleClearData)}
								onCollapsePanel={handleCollapsePanel}
								onTabChange={handleTabChange}
								activeTab={activeTab}
								isDashboardExpanded={isDashboardExpanded}
							/>
						</div>
					</Panel>
				</PanelGroup>
			</div>
		</div>
	);
}
