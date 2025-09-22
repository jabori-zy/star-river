import { RouterProvider } from "react-router";
import router from "./router";
import "./i18n";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import useSystemConfigStore from "./store/useSystemConfigStore";
import { useGlobalStrategyLoading } from "./hooks/useGlobalStrategyLoading";
import StrategyLoadingDialog from "./components/strategy-loading-dialog";
import useStrategyLoadingStore from "./store/useStrategyLoadingStore";
import { Settings } from "luxon";

function App() {
	const { loadSystemConfig, systemConfig } = useSystemConfigStore();
	const [isAppReady, setIsAppReady] = useState(false);
	const [lastSystemConfig, setLastSystemConfig] = useState<typeof systemConfig>(null);
	
	// 启用全局策略加载管理
	const { handleDialogClose } = useGlobalStrategyLoading();
	
	// 获取全局状态
	const { showDialog, logs, isLoading, isFailed, isRunning, isBacktesting, isStopping, isStopped, dialogTitle } = useStrategyLoadingStore();

	useEffect(() => {
		const initializeApp = async () => {
			try {
				// 加载系统配置
				await loadSystemConfig();
			} catch (error) {
				console.error("应用初始化失败:", error);
			} finally {
				setIsAppReady(true);
			}
		};

		initializeApp();
	}, [loadSystemConfig]);

	// 当系统配置加载完成后，应用时区设置到 Luxon
	useEffect(() => {
		if (systemConfig?.timezone) {
			Settings.defaultZone = systemConfig.timezone;
			// console.log("应用启动时设置 Luxon 时区:", systemConfig.timezone);
		}
	}, [systemConfig]);

	// 监听系统配置变化，如果配置发生变化则刷新页面
	useEffect(() => {
		// 如果是初次加载配置，只记录不刷新
		if (lastSystemConfig === null && systemConfig) {
			setLastSystemConfig(systemConfig);
			return;
		}

		// 如果配置发生了变化，刷新页面
		if (lastSystemConfig && systemConfig && 
			(lastSystemConfig.localization !== systemConfig.localization || 
			 lastSystemConfig.timezone !== systemConfig.timezone)) {
			console.log("系统配置发生变化，刷新页面...", {
				old: lastSystemConfig,
				new: systemConfig
			});
			
			// 如果在 Electron 环境中，通知所有回测窗口刷新
			if (window.require) {
				try {
					const electronModule = window.require("electron");
					if (electronModule?.ipcRenderer) {
						electronModule.ipcRenderer.invoke("refresh-all-backtest-windows");
					}
				} catch (error) {
					console.error("通知回测窗口刷新失败:", error);
				}
			}
			
			// 延迟一点时间让用户看到保存成功的提示
			setTimeout(() => {
				window.location.reload();
			}, 500);
		}
	}, [systemConfig, lastSystemConfig]);

	// 在系统配置加载完成前显示加载状态
	if (!isAppReady) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">正在加载系统配置...</div>
			</div>
		);
	}

	return (
		<>
			<RouterProvider router={router} />
			
			{/* 全局策略加载对话框 */}
			{showDialog && (
				<StrategyLoadingDialog
					open={showDialog}
					onOpenChange={handleDialogClose}
					logs={logs}
					title={dialogTitle}
					currentStage={
						isFailed ? "failed" : 
						isStopped ? "stopped" :
						isStopping ? "stopping" :
						isBacktesting || isRunning ? "completed" :
						isLoading ? "strategy-check" : "completed"
					}
				/>
			)}
			
			<Toaster
				position="top-center"
				toastOptions={{
					style: {
						textAlign: "center",
						padding: "12px 12px",
						maxWidth: "300px",
					},
					classNames: {
						toast: "flex justify-center items-center text-center",
					},
				}}
			/>
		</>
	);
}

export default App;
