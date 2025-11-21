import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useGetStrategyById } from "@/service/strategy-management/get-strategy-by-id";
import { useUpdateStrategy } from "@/service/strategy-management/update-strategy";
import { strategyKeys } from "@/service/strategy-management/query-keys";
import type { Strategy } from "@/types/strategy";
import { ReactFlowProvider } from "@xyflow/react";
import useTradingModeStore from "@/store/use-trading-mode-store";
import { WorkFlow } from "./components/flow";
import { StrategyLoadingDialog } from "./components/strategy-loading-dialog";
import { StrategyRunState } from "@/types/strategy";
import { BacktestStrategyRunStatus } from "@/types/strategy/backtest-strategy";
import type { OperationType } from "./components/strategy-control/type";
import { openBacktestWindow } from "@/utils/open-backtest-window";

export default function StrategyPage() {
	const location = useLocation();
	const queryClient = useQueryClient();

	// 从路由状态获取策略 ID
	const strategyId = location.state?.strategyId;

	// ✅ 使用本地 state 管理策略数据
	const [strategy, setStrategy] = useState<Strategy | null>(null);
	// 初始状态为 saved，当策略加载完成后保持 saved，只有用户编辑时才变为 unsaved
	const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
	const { tradingMode, setTradingMode } = useTradingModeStore();
	const [showLoadingDialog, setShowLoadingDialog] = useState(false);
	const [dialogTitle, setDialogTitle] = useState("加载策略");
	const [strategyRunState, setStrategyRunState] = useState<StrategyRunState>(strategy?.status || BacktestStrategyRunStatus.Stopped);

	// ✅ 使用 React Query Hook 获取策略（重命名为 queryStrategy 避免冲突）
	const { data: queryStrategy, isLoading, error } = useGetStrategyById(strategyId, {
		enabled: !!strategyId && strategyId >= 0,
	});

	// ✅ 使用 useUpdateStrategy hook
	const { mutate: updateStrategy, isPending } = useUpdateStrategy({
		meta: {
			successMessage: "策略保存成功",
			showSuccessToast: true,
			errorMessage: "策略保存失败",
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
			console.log('queryStrategy', queryStrategy);
			setStrategy(queryStrategy);
			setTradingMode(queryStrategy.tradeMode);
			console.log('queryStrategy.status', queryStrategy.status);
			setStrategyRunState(queryStrategy.status);
			// 首次加载策略时，设置为 saved 状态
			setSaveStatus("saved");
		}
	}, [queryStrategy, setTradingMode]);


	const handleStrategyChange = useCallback((updates: Partial<Strategy>) => {
		setStrategy(prev => prev ? { ...prev, ...updates } : null);
		setSaveStatus("unsaved");
	}, []);


	const handleSaveStatusChange = useCallback((saveStatus: "saved" | "unsaved" | "saving") => {
		setSaveStatus(saveStatus);
	}, []);

	const handleOperationSuccess = useCallback((operationType: OperationType) => {
		setDialogTitle(operationType === 'init' ? '加载策略' : '停止策略');
		setShowLoadingDialog(true);
	}, []);

	const handleCloseLoadingDialog = useCallback(() => {
		setShowLoadingDialog(false);
	}, []);

	const handleStrategyStateChange = useCallback((state: StrategyRunState) => {
		setStrategyRunState(state);

		// 只在终态时刷新缓存
		if ([
			BacktestStrategyRunStatus.Ready,
			BacktestStrategyRunStatus.Stopped,
			BacktestStrategyRunStatus.Failed,
			BacktestStrategyRunStatus.Error
		].includes(state as BacktestStrategyRunStatus)) {
			queryClient.invalidateQueries({
				queryKey: strategyKeys.detail(strategyId)
			});
		}
	}, [setStrategyRunState, queryClient, strategyId]);

	const handleOpenBacktestWindow = useCallback(async (strategyId: number) => {
		try {
			await openBacktestWindow(strategyId);
			// 成功后关闭对话框
			setShowLoadingDialog(false);
		} catch (error) {
			// 错误已在工具函数中处理
		}
	}, []);


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
					onOpenChange={handleCloseLoadingDialog}
					onStrategyStateChange={handleStrategyStateChange}
					onOpenBacktestWindow={handleOpenBacktestWindow}
				/>
			</ReactFlowProvider>
		</div>
	);
}
