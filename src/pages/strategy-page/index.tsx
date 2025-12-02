import { useQueryClient } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
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
	// 从路由状态获取策略 ID
	const strategyId = location.state?.strategyId;

	// ✅ 使用本地 state 管理策略数据
	const [strategy, setStrategy] = useState<Strategy | null>(null);
	// 初始状态为 saved，当策略加载完成后保持 saved，只有用户编辑时才变为 unsaved
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

	// ✅ 使用 React Query Hook 获取策略（重命名为 queryStrategy 避免冲突）
	const {
		data: queryStrategy,
		isLoading,
		error,
	} = useGetStrategyById(strategyId, {
		enabled: !!strategyId && strategyId >= 0,
	});

	// ✅ 使用 React Query Hook 获取策略运行状态
	// 默认配置: staleTime=0, refetchOnMount=true, refetchOnWindowFocus=true
	// 确保页面刷新和窗口聚焦时始终获取最新状态
	const { data: apiRunState } = useGetStrategyRunState(strategyId, {
		enabled: !!strategyId && strategyId > 0,
	});

	// ✅ 使用 useUpdateStrategy hook
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
			// 保存失败时，保持 unsaved 状态
			setSaveStatus("unsaved");
		},
	});

	// 监听 isPending 状态来更新 saveStatus
	useEffect(() => {
		if (isPending) {
			setSaveStatus("saving");
		}
	}, [isPending]);

	// ✅ 当 React Query 数据更新时，同步到本地 state
	useEffect(() => {
		if (queryStrategy) {
			setStrategy(queryStrategy);
			setTradingMode(queryStrategy.tradeMode);
			// 首次加载策略时，设置为 saved 状态
			setSaveStatus("saved");
		}
	}, [queryStrategy, setTradingMode]);

	// ✅ 从 API 获取的运行状态同步到本地 state（初始化用）
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

			// 只在终态时刷新缓存
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
				// 成功后关闭对话框
				setShowLoadingDialog(false);
			} catch (error) {
				// 错误已在工具函数中处理
			}
		},
		[],
	);

	// 处理加载状态
	if (isLoading) {
		return (
			<div className="h-screen flex flex-col items-center justify-center bg-background">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="mt-4 text-sm text-muted-foreground">加载策略中...</p>
			</div>
		);
	}

	// 处理错误状态
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

	// 处理策略不存在的情况
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
					tradeMode={tradingMode}
					handleSaveStatusChange={handleSaveStatusChange}
					strategyRunState={strategyRunState}
					onOperationSuccess={handleOperationSuccess}
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
