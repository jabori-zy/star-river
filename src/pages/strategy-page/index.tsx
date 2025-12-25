import { useQueryClient } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { useNavigationGuard } from "@/hooks/use-navigation-guard";
import { useGetStrategyRunState } from "@/service/backtest-strategy/strategy-run-state";
import { useGetStrategyById } from "@/service/strategy-management/get-strategy-by-id";
import { strategyKeys } from "@/service/strategy-management/query-keys";
import { useUpdateStrategy } from "@/service/strategy-management/update-strategy";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { Strategy, StrategyRunState } from "@/types/strategy";
import { BacktestStrategyRunState } from "@/types/strategy/backtest-strategy";
import { openBacktestWindow } from "@/utils/open-backtest-window";
import { WorkFlow } from "./components/flow";
import type { OperationType } from "./components/strategy-control/type";
import { StrategyLoadingDialog } from "./components/strategy-loading-dialog";

export default function StrategyPage() {
	const location = useLocation();
	const queryClient = useQueryClient();
	const { t } = useTranslation();
	// Get strategy ID from route state
	const strategyId = location.state?.strategyId;

	// ✅ Use local state to manage strategy data
	const [strategy, setStrategy] = useState<Strategy | null>(null);
	// Initial state is saved, remain saved after strategy loading completes, only change to unsaved when user edits
	const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
		"saved",
	);
	const { tradingMode, setTradingMode } = useTradingModeStore();
	const [showLoadingDialog, setShowLoadingDialog] = useState(false);
	const [dialogTitle, setDialogTitle] = useState(
		t("desktop.strategyWorkflowPage.loadingStrategy"),
	);
	const [strategyRunState, setStrategyRunState] = useState<StrategyRunState>(
		BacktestStrategyRunState.Stopped,
	);

	// ✅ Ref to store save function from WorkFlow
	const saveHandlerRef = useRef<(() => void) | null>(null);

	// ✅ Use React Query Hook to get strategy (renamed to queryStrategy to avoid conflict)
	const {
		data: queryStrategy,
		isLoading,
		error,
	} = useGetStrategyById(strategyId, {
		enabled: !!strategyId && strategyId >= 0,
	});

	// ✅ Use React Query Hook to get strategy run state
	// Default config: staleTime=0, refetchOnMount=true, refetchOnWindowFocus=true
	// Ensure always getting latest state when page refreshes or window focuses
	const { data: apiRunState } = useGetStrategyRunState(strategyId, {
		enabled: !!strategyId && strategyId > 0,
	});

	// ✅ Use useUpdateStrategy hook (with toast for manual save)
	const { mutate: updateStrategy, isPending } = useUpdateStrategy({
		meta: {
			successMessage: t("apiMessage.strategySavedSuccess"),
			showSuccessToast: true,
			errorMessage: t("apiMessage.strategySavedError"),
			showErrorToast: true,
		},
		onSuccess: (updatedStrategy) => {
			setStrategy(updatedStrategy);
			setSaveStatus("saved");
		},
		onError: () => {
			// When save fails, maintain unsaved state
			setSaveStatus("unsaved");
		},
	});

	// ✅ Auto update strategy (without toast for auto save)
	const { mutate: autoUpdateStrategy, isPending: isAutoSavePending } =
		useUpdateStrategy({
			meta: {
				showSuccessToast: false,
				showErrorToast: false,
			},
			onSuccess: (updatedStrategy) => {
				setStrategy(updatedStrategy);
				setSaveStatus("saved");
			},
			onError: () => {
				setSaveStatus("unsaved");
			},
		});

	// Monitor isPending state to update saveStatus
	useEffect(() => {
		if (isPending || isAutoSavePending) {
			setSaveStatus("saving");
		}
	}, [isPending, isAutoSavePending]);

	// ✅ When React Query data updates, sync to local state
	useEffect(() => {
		if (queryStrategy) {
			setStrategy(queryStrategy);
			setTradingMode(queryStrategy.tradeMode);
			// When loading strategy for the first time, set to saved state
			setSaveStatus("saved");
		}
	}, [queryStrategy, setTradingMode]);

	// ✅ Sync run state from API to local state (for initialization)
	useEffect(() => {
		if (apiRunState) {
			setStrategyRunState(apiRunState);
		}
	}, [apiRunState]);

	const handleStrategyChange = useCallback((updates: Partial<Strategy>) => {
		setStrategy((prev) => (prev ? { ...prev, ...updates } : null));
		setSaveStatus("unsaved");
	}, []);

	const handleSaveStatusChange = useCallback(
		(saveStatus: "saved" | "unsaved" | "saving") => {
			setSaveStatus(saveStatus);
		},
		[],
	);

	const handleOperationSuccess = useCallback(
		(operationType: OperationType) => {
			setDialogTitle(
				operationType === "init"
					? t("desktop.strategyWorkflowPage.loadingStrategy", {
							strategyName: strategy?.name || "",
						})
					: t("desktop.strategyWorkflowPage.stoppingStrategy", {
							strategyName: strategy?.name || "",
						}),
			);
			setShowLoadingDialog(true);
		},
		[t, strategy?.name],
	);

	const handleCloseLoadingDialog = useCallback(() => {
		setShowLoadingDialog(false);
	}, []);

	const handleStrategyStateChange = useCallback(
		(state: StrategyRunState) => {
			setStrategyRunState(state);

			// Only refresh cache in terminal states
			if (
				[
					BacktestStrategyRunState.Ready,
					BacktestStrategyRunState.Stopped,
					BacktestStrategyRunState.Error,
				].includes(state as BacktestStrategyRunState)
			) {
				queryClient.invalidateQueries({
					queryKey: strategyKeys.detail(strategyId),
				});
			}
		},
		[queryClient, strategyId],
	);

	const handleOpenBacktestWindow = useCallback(
		async (strategyId: number, strategyName: string) => {
			try {
				await openBacktestWindow(strategyId, strategyName);
				// Close dialog after success
				setShowLoadingDialog(false);
			} catch (error) {
				// Error has been handled in utility function
			}
		},
		[],
	);

	// ✅ Callback for WorkFlow to register its save handler
	const registerSaveHandler = useCallback((handler: () => void) => {
		saveHandlerRef.current = handler;
	}, []);

	// ✅ Navigation guard save callback
	const handleNavigationGuardSave = useCallback(() => {
		if (saveHandlerRef.current) {
			saveHandlerRef.current();
		}
	}, []);

	// ✅ Navigation guard for unsaved changes
	const navigationGuardTitle = useMemo(
		() => t("desktop.strategyWorkflowPage.unsavedChangesTitle"),
		[t],
	);
	const navigationGuardDescription = useMemo(
		() => t("desktop.strategyWorkflowPage.unsavedChangesDescription"),
		[t],
	);

	useNavigationGuard({
		id: "strategy",
		hasUnsavedChanges: saveStatus === "unsaved",
		title: navigationGuardTitle,
		description: navigationGuardDescription,
		onSave: handleNavigationGuardSave,
	});

	// Handle loading state
	if (isLoading) {
		return (
			<div className="h-screen flex flex-col items-center justify-center bg-background">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="mt-4 text-sm text-muted-foreground">加载策略中...</p>
			</div>
		);
	}

	// Handle error state
	if (error) {
		return (
			<div className="h-screen flex flex-col items-center justify-center bg-background">
				<div className="text-center space-y-2">
					<p className="text-lg font-semibold text-destructive">加载策略失败</p>
					<p className="text-sm text-muted-foreground">{error.message}</p>
				</div>
			</div>
		);
	}

	// Handle case when strategy doesn't exist
	if (!strategy) {
		return (
			<div className="h-screen flex flex-col items-center justify-center bg-background">
				<p className="text-muted-foreground">未找到策略</p>
			</div>
		);
	}

	return (
		<div className="h-screen flex flex-col bg-background overflow-hidden">
			<ReactFlowProvider>
				<WorkFlow
					strategy={strategy}
					saveStatus={saveStatus}
					handleStrategyChange={handleStrategyChange}
					updateStrategy={updateStrategy}
					autoUpdateStrategy={autoUpdateStrategy}
					tradeMode={tradingMode}
					handleSaveStatusChange={handleSaveStatusChange}
					strategyRunState={strategyRunState}
					onOperationSuccess={handleOperationSuccess}
					onRegisterSaveHandler={registerSaveHandler}
				/>
				<StrategyLoadingDialog
					title={dialogTitle}
					open={showLoadingDialog}
					strategyId={strategyId || 0}
					strategyName={strategy?.name || ""}
					onOpenChange={handleCloseLoadingDialog}
					onStrategyStateChange={handleStrategyStateChange}
					onOpenBacktestWindow={handleOpenBacktestWindow}
				/>
			</ReactFlowProvider>
		</div>
	);
}
